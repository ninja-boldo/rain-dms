import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { Client } from "pg";
import { documentsTable, pagesTable } from "./db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { Meilisearch } from "meilisearch";
import { syncIndex } from "./workers/IndexBuilder";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import fs from "fs";
import { QueueHandler } from "./workers/QueueConnector";
import { QueueNames } from "./utils/types/main";

const client = new Meilisearch({
  host: "http://127.0.0.1:7700",
  apiKey: "masterbenno",
});

const index = client.index("documents");

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL,
});

await pgClient.connect();

const db = drizzle(pgClient);
const queueHandler: QueueHandler = await QueueHandler.create()
const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

// --------------------
// Background sync
// --------------------
syncIndex().catch(console.error);

// --------------------
// Routes
// --------------------
app.get("/main_page", async (c) => {
  const pageIdx = Number(c.req.query("pageIdx") ?? 0);
  const limit = 50;
  const offset = pageIdx * limit;

  const res = await db
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
    .offset(offset);

  return c.json(res);
});

app.get("/search", async (c) => {
  const query = c.req.query("query");
  const limit = parseInt(c.req.query("limit") ?? "25")

  if (!query) {
    return c.json({ error: "Missing query" }, 400);
  }

  const res = await index.search(query, {
    limit: limit,
  });

  return c.json(res);
});

app.delete("/delete", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.text("Missing filepath", 400);

  const REQUIRED_DIR =
    "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms";

  const resolvedPath = path.resolve(filepath);
  const allowedBase = path.resolve(REQUIRED_DIR);
  if (!resolvedPath.startsWith(allowedBase)) return c.text("Forbidden", 403);
  if (!fs.existsSync(resolvedPath)) return c.text("File not found", 404);

  fs.unlinkSync(resolvedPath);

  return c.text("Deleted", 200);
});

app.get("/download/system_processed", async(c) => {
  const fileId = parseInt(c.req.param("file_id") ?? "-1");
  if(fileId === -1){
    throw new Error(`you gotta provide a valid file id and not ${fileId}`)
  }
  const pathRes = await db.select({filepath: documentsTable.filepath}).from(documentsTable).where(eq(documentsTable.file_id, fileId));
    const filepath = pathRes[0].filepath;

  if (!filepath) {
    return c.text("Missing filepath", 400);
  }

  const REQUIRED_DIR =
    "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms";

  const resolvedPath = path.resolve(filepath);
  const allowedBase = path.resolve(REQUIRED_DIR);

  if (!resolvedPath.startsWith(allowedBase)) {
    return c.text("Forbidden", 403);
  }

  if (!fs.existsSync(resolvedPath)) {
    return c.text("File not found", 404);
  }

  return new Response(fs.createReadStream(resolvedPath) as any, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(resolvedPath))}`,
    },
  });
});

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


app.get("/download/consume", async (c) => {
  const filepath = c.req.query("filepath");

  if (!filepath) {
    return c.text("Missing filepath", 400);
  }

  const REQUIRED_DIR =
    "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms";

  const resolvedPath = path.resolve(filepath);
  const allowedBase = path.resolve(REQUIRED_DIR);

  if (!resolvedPath.startsWith(allowedBase)) {
    return c.text("Forbidden", 403);
  }

  if (!fs.existsSync(resolvedPath)) {
    return c.text("File not found", 404);
  }

  return new Response(fs.createReadStream(resolvedPath) as any, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(resolvedPath))}`,
    },
  });
});

app.post("/upload/temp", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const value = body["file"];

  const files = Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : value instanceof File
      ? [value]
      : [];

  if (files.length === 0) {
    return c.text("At least one file is required", 400);
  }

  // Ensure the target directory exists
  const uploadDir = path.join(process.cwd(), "../temp");
  await mkdir(uploadDir, { recursive: true });

  const savedFiles = [];

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, Buffer.from(buffer));

    savedFiles.push({
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
    });
  }

  return c.json({
    count: savedFiles.length,
    files: savedFiles,
  });
});

app.post("/upload/consume", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const value = body["file"];

  const files = Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : value instanceof File
      ? [value]
      : [];

  if (files.length === 0) {
    return c.text("At least one file is required", 400);
  }

  // Ensure the target directory exists
  const uploadDir = path.join(process.cwd(), "../consume_files");
  await mkdir(uploadDir, { recursive: true });

  const savedFiles = [];

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, Buffer.from(buffer));

    savedFiles.push({
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
    });
  }

  return c.json({
    count: savedFiles.length,
    files: savedFiles,
  });
});

app.get("/stats", async (c) => {
  const res = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),

      lastHour: sql<number>`
        count(*) filter (
          where ${documentsTable.createdAt} >= now() - interval '1 hour'
        )
      `.mapWith(Number),

      last24Hours: sql<number>`
        count(*) filter (
          where ${documentsTable.createdAt} >= now() - interval '24 hours'
        )
      `.mapWith(Number),

      last7Days: sql<number>`
        count(*) filter (
          where ${documentsTable.createdAt} >= now() - interval '7 days'
        )
      `.mapWith(Number),
    })
    .from(documentsTable);

    const queueStatsPostOcr = queueHandler.getQueueStats(QueueNames.consumeOcrOutput)
    const queueStatsPreOcr = queueHandler.getQueueStats(QueueNames.startOcrQueue)
    

  return c.json({
    total_documents: res[0].total,
    added_last_1h: res[0].lastHour,
    added_last_24h: res[0].last24Hours,
    added_last_7d: res[0].last7Days,
    docs_per_minute: -1,
    ocr_queue_length: (await queueStatsPreOcr).messages,
    merge_queue_length: (await queueStatsPostOcr).messages,
    ocr_workers_active: (await queueStatsPreOcr).consumers,
    ocr_workers_total: (await queueStatsPreOcr).consumers,
    merge_workers_active: (await queueStatsPostOcr).consumers,
    merge_workers_total: (await queueStatsPostOcr).consumers,
    currently_processing: -1,
  });
});


export default app;