import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { Pool } from "pg";
import { documentsTable, pagesTable } from "./db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { Meilisearch } from "meilisearch";
import { syncIndex } from "./workers/IndexBuilder";
import { mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises"; 
import { Readable } from "node:stream";
import path from "node:path";
import fs from "fs";
import { QueueHandler } from "./workers/QueueConnector";
import { QueueNames, QueueStats } from "./utils/types/main";
import { isAllowedFile } from "./utils/utils";
import { bodyLimit } from "hono/body-limit";

const client = new Meilisearch({
  host: "http://127.0.0.1:7700",
  apiKey: process.env.MEILI_MASTER_KEY,
});

const index = client.index("documents");

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, 
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

const db = drizzle(pgPool);
const queueHandler: QueueHandler = await QueueHandler.create();
const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);

app.use(
  "*",
  bodyLimit({
    maxSize: 5 * 1024 * 1024 * 1024, 
    onError: (c) => {
      return c.json({ error: "File too large" }, 413);
    },
  }),
);

// --------------------
// Background sync
// --------------------
syncIndex().catch(console.error);

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down...`);
  await pgPool.end().catch(console.error);
  process.exit(0);
}
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

// --------------------
// ✅ FIX 3: Shared helper — stream a file to the client.
//    Attaches an error listener so that a disconnecting client
//    doesn't leave a dangling ReadStream with an open file descriptor.
// --------------------
function streamFile(
  resolvedPath: string,
  contentType: string,
  disposition: "inline" | "attachment",
): Response {
  const filename = path.basename(resolvedPath);
  const readStream = fs.createReadStream(resolvedPath);

  readStream.on("error", (err) => {
    console.error(`Stream error for ${resolvedPath}:`, err.message);
    readStream.destroy();
  });

  return new Response(readStream as any, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

async function saveFileToDisk(file: File, filePath: string): Promise<void> {
  console.log("making dir: ", path.dirname(filePath));
  await mkdir(path.dirname(filePath), { recursive: true });
  const webStream = file.stream();

  const nodeReadable = Readable.fromWeb(webStream as any);
  await pipeline(nodeReadable, createWriteStream(filePath));
}

// --------------------
// Routes
// --------------------

/*
 * GET /stats
 */
app.get("/stats", async (c) => {
  try {
    const res = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        lastHour:
          sql<number>`count(*) filter (where ${documentsTable.createdAt} >= now() - interval '1 hour')`.mapWith(
            Number,
          ),
        last24h:
          sql<number>`count(*) filter (where ${documentsTable.createdAt} >= now() - interval '24 hours')`.mapWith(
            Number,
          ),
        last7d:
          sql<number>`count(*) filter (where ${documentsTable.createdAt} >= now() - interval '7 days')`.mapWith(
            Number,
          ),
      })
      .from(documentsTable);

    const local = queueHandler.getLocalMetrics();

    let queueStatsPreOcr: QueueStats | null = null;
    let queueStatsPostOcr: QueueStats | null = null;
    try {
      queueStatsPreOcr = await queueHandler.getQueueStats(
        QueueNames.startOcrQueue,
      );
      queueStatsPostOcr = await queueHandler.getQueueStats(
        QueueNames.consumeOcrOutput,
      );
    } catch (e) {
      console.error("Queue stats (management API):", e);
    }

    const ocrQueueLen = queueStatsPreOcr?.messages ?? 0;
    const rate = local.pages_per_minute_30s ?? local.pages_per_minute_60s;
    const eta_seconds =
      ocrQueueLen > 0 && rate && rate > 0
        ? Math.round((ocrQueueLen / rate) * 60)
        : null;

    return c.json({
      total_documents: res[0].total,
      added_last_1h: res[0].lastHour,
      added_last_24h: res[0].last24h,
      added_last_7d: res[0].last7d,
      pages_per_minute_30s: local.pages_per_minute_30s,
      pages_per_minute_60s: local.pages_per_minute_60s,
      agent_downloads_per_minute_30s: local.agent_downloads_per_minute_30s,
      agent_downloads_per_minute_60s: local.agent_downloads_per_minute_60s,
      currently_processing: local.in_flight,
      eta_seconds,
      ocr_queue_length: queueStatsPreOcr?.messages ?? 0,
      merge_queue_length: queueStatsPostOcr?.messages ?? 0,
      ocr_workers_active: queueStatsPreOcr?.busyConsumers ?? -1,
      ocr_workers_total: queueStatsPreOcr?.consumers ?? -1,
      merge_workers_active: queueStatsPostOcr?.busyConsumers ?? -1,
      merge_workers_total: queueStatsPostOcr?.consumers ?? -1,
    });
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed stats" }, 500);
  }
});

/**
 * GET /workers
 */
app.get("/workers", async (c) => {
  try {
    const [ocrConsumers, mergeConsumers, channelStats] = await Promise.all([
      queueHandler.getConsumerDetails(QueueNames.startOcrQueue),
      queueHandler.getConsumerDetails(QueueNames.consumeOcrOutput),
      queueHandler.getChannelStats(),
    ]);

    const enrich = (
      consumers: Awaited<ReturnType<typeof queueHandler.getConsumerDetails>>,
    ) =>
      consumers.map((con) => {
        const key = `${con.peerHost}:${con.peerPort}`;
        const ch = channelStats[key] ?? {
          ackRate: 0,
          publishRate: 0,
          unacked: 0,
        };
        return { ...con, ...ch };
      });

    return c.json({ ocr: enrich(ocrConsumers), merge: enrich(mergeConsumers) });
  } catch (e: any) {
    return c.json({ error: e.message, ocr: [], merge: [] }, 503);
  }
});

/**
 * GET /queue-peek?target=ocr|merge&count=5
 */
app.get("/queue-peek", async (c) => {
  const target = c.req.query("target");
  const count = Math.min(parseInt(c.req.query("count") ?? "5"), 20);

  const results: { ocr?: any; merge?: any } = {};

  if (!target || target === "ocr") {
    try {
      results.ocr = await queueHandler.peekMessages(
        QueueNames.startOcrQueue,
        count,
      );
    } catch (e: any) {
      results.ocr = { error: e.message };
    }
  }
  if (!target || target === "merge") {
    try {
      results.merge = await queueHandler.peekMessages(
        QueueNames.consumeOcrOutput,
        count,
      );
    } catch (e: any) {
      results.merge = { error: e.message };
    }
  }

  return c.json(results);
});

/**
 * GET /main_page?pageIdx=0
 */
app.get("/main_page", async (c) => {
  const pageIdx = Number(c.req.query("pageIdx") ?? 0);
  const limit = 50;
  const offset = pageIdx * limit;

  const [countRes, res] = await Promise.all([
    db.select({ count: sql`count(*)`.mapWith(Number) }).from(documentsTable),
    db
      .select({
        filepath: documentsTable.filepath,
        created_at: documentsTable.createdAt,
        assigned_tags: documentsTable.assigned_tags,
        banner_img: pagesTable.page_banner_url,
      })
      .from(documentsTable)
      .innerJoin(pagesTable, eq(documentsTable.file_id, pagesTable.file_id))
      .where(eq(pagesTable.page_idx, 0))
      .orderBy(desc(documentsTable.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  c.header("X-Total-Count", String(countRes[0].count));
  return c.json(res);
});

/**
 * GET /search?query=...&filter=...
 */
app.get("/search", async (c) => {
  const rawQuery = c.req.query("query") || "";
  const limit = parseInt(c.req.query("limit") ?? "50");

  if (!rawQuery.trim() && !c.req.query("filter")) {
    return c.json({ error: "Missing query" }, 400);
  }

  const tagRegex = /tag:([^\s]+)/gi;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(rawQuery)) !== null) {
    tags.push(`assigned_tags = '${match[1]}'`);
  }

  const cleanQuery = rawQuery.replace(tagRegex, "").trim();
  let finalFilter: string[] = [...tags];

  const extraFilter = c.req.query("filter");
  if (extraFilter) {
    try {
      const parsed = JSON.parse(extraFilter);
      if (Array.isArray(parsed)) finalFilter = [...finalFilter, ...parsed];
    } catch {
      finalFilter.push(extraFilter);
    }
  }

  const res = await index.search(cleanQuery || " ", {
    limit,
    filter: finalFilter.length > 0 ? finalFilter : undefined,
    matchingStrategy: "all",
  });

  return c.json(res);
});

/**
 * GET /pages?filepath=...
 */
app.get("/pages", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.json({ error: "Missing filepath" }, 400);

  const res = await db
    .select({
      pageIdx: pagesTable.page_idx,
      banner_img: pagesTable.page_banner_url,
      ocr: pagesTable.ocr,
    })
    .from(pagesTable)
    .innerJoin(documentsTable, eq(pagesTable.file_id, documentsTable.file_id))
    .where(eq(documentsTable.filepath, filepath))
    .orderBy(asc(pagesTable.page_idx));

  return c.json({ pages: res });
});

/**
 * DELETE /delete/consume?filepath=...
 */
app.delete("/delete/consume", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.text("Missing filepath", 400);

  const REQUIRED_DIR = process.env.ROOT_DIR ?? "/var/dms";
  const resolvedPath = path.resolve(filepath);
  const allowedBase = path.resolve(REQUIRED_DIR);
  if (!resolvedPath.startsWith(allowedBase)) return c.text("Forbidden", 403);
  if (!fs.existsSync(resolvedPath)) return c.text("File not found", 404);

  fs.unlinkSync(resolvedPath);
  return c.text("Deleted", 200);
});

function getClientIp(c: any): string {
  const bunIp = c.env?.requestIP?.(c.req.raw)?.address;
  if (bunIp) return bunIp;

  return (
    c.req.header("x-real-ip") ||
    (c.req.header("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

/**
 * GET /download/consume?filepath=...&attachment=0|1
 */
app.get("/download/consume", async (c) => {
  let filepath = c.req.query("filepath");
  const attachment = c.req.query("attachment") === "1";

  if (!filepath) return c.text("Missing filepath", 400);

  const REQUIRED_DIR = process.env.ROOT_DIR ?? "/var/dms";
  const resolvedPath = path.resolve(filepath);
  const allowedBase = path.resolve(REQUIRED_DIR);
  if (!resolvedPath.startsWith(allowedBase)) return c.text("Forbidden", 403);
  if (!fs.existsSync(resolvedPath)) return c.text("File not found", 404);

  let contentType = "application/octet-stream";
  const lower = resolvedPath.toLowerCase();
  if (lower.endsWith(".pdf")) contentType = "application/pdf";
  else if (lower.endsWith(".png")) contentType = "image/png";
  else if (lower.match(/\.jpe?g$/)) contentType = "image/jpeg";

  const workerIp = getClientIp(c);
  const filename = path.basename(resolvedPath);
  let fileBytes = 0;
  try {
    fileBytes = fs.statSync(resolvedPath).size;
  } catch {
    /* non-fatal */
  }
  queueHandler.recordAgentDownload(workerIp, filename, fileBytes);

  // ✅ FIX 3: use shared streamFile helper (has error listener)
  return streamFile(
    resolvedPath,
    contentType,
    attachment ? "attachment" : "inline",
  );
});

/**
 * GET /worker-download-stats
 */
app.get("/worker-download-stats", async (c) => {
  const downloadStats = queueHandler.getWorkerDownloadStats();

  let activeWorkerIps: Set<string> = new Set();
  let workerUnacked: Map<string, number> = new Map();
  try {
    const [ocrConsumers, channelStats] = await Promise.all([
      queueHandler.getConsumerDetails(
        process.env.OCR_QUEUE_NAME ?? "ocr_queue",
      ),
      queueHandler.getChannelStats(),
    ]);
    for (const con of ocrConsumers) {
      activeWorkerIps.add(con.peerHost);
      const key = `${con.peerHost}:${con.peerPort}`;
      const ch = channelStats[key];
      if (ch) {
        workerUnacked.set(
          con.peerHost,
          (workerUnacked.get(con.peerHost) ?? 0) + ch.unacked,
        );
      }
    }
  } catch {
    /* management API unavailable */
  }

  const enriched = downloadStats.map((w) => ({
    ...w,
    isConnected: activeWorkerIps.has(w.ip),
    currentlyProcessing: workerUnacked.get(w.ip) ?? 0,
  }));

  return c.json({ workers: enriched });
});

/**
 * GET /download/system_processed?file_id=...
 */
app.get("/download/system_processed", async (c) => {
  const fileId = parseInt(c.req.query("file_id") ?? "-1");
  if (fileId === -1) return c.text("Invalid file_id", 400);

  const pathRes = await db
    .select({ filepath: documentsTable.filepath })
    .from(documentsTable)
    .where(eq(documentsTable.file_id, fileId));

  if (!pathRes.length || !pathRes[0].filepath) return c.text("Not found", 404);

  const filepath = pathRes[0].filepath;
  const REQUIRED_DIR = process.env.ROOT_DIR ?? "/var/dms";
  const resolvedPath = path.resolve(filepath);
  const allowedBase = path.resolve(REQUIRED_DIR);
  if (!resolvedPath.startsWith(allowedBase)) return c.text("Forbidden", 403);
  if (!fs.existsSync(resolvedPath)) return c.text("File not found", 404);

  return streamFile(resolvedPath, "application/octet-stream", "attachment");
});

async function handleUpload(c: any, uploadDir: string): Promise<Response> {
  const body = await c.req.parseBody({ all: true });
  const value = body["file"];

  const files = Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : value instanceof File
      ? [value]
      : [];

  if (files.length === 0) return c.text("At least one file is required", 400);

  await mkdir(uploadDir, { recursive: true });
  const validFiles = files.filter(isAllowedFile);
  if (validFiles.length === 0) return c.text("No valid files uploaded", 400);

  const savedFiles = [];
  for (const file of validFiles) {
    const filePath = path.join(uploadDir, file.name);

    await saveFileToDisk(file, filePath);
    savedFiles.push({
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
    });
  }

  return c.json({ count: savedFiles.length, files: savedFiles });
}

/**
 * POST /upload/temp
 */
app.post("/upload/temp", async (c) => {
  const uploadDir = path.join(process.cwd(), "../temp");
  await fs.mkdir(uploadDir, { recursive: true }, (err) => {
    if (err) throw err;
  });
  return handleUpload(c, uploadDir);
});

/**
 * POST /upload/consume
 */
app.post("/upload/consume", (c) => {
  const uploadDir = path.join(process.cwd(), "../consume_files");
  return handleUpload(c, uploadDir);
});

export default {
  port: 3000,
  fetch: app.fetch,
  maxRequestBodySize: 5 * 1024 * 1024 * 1024,
};
