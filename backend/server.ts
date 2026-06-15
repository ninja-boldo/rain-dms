import bcrypt from "bcryptjs";
import "dotenv/config";
import { asc, desc, eq, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { cors } from "hono/cors";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import { documentsTable, pagesTable, usersTable } from "./db/schema";
import { BucketNames, QueueNames, QueueStats } from "./utils/types/main";
import fs from "fs";
import {
  getQueueHandler as rawGetQueueHandler,
  isValidAuthUser,
  isValidAuthWorker,
  isValidAuth,
  getMainEncryptionKey,
  getConsumePath,
} from "./utils/utils";
import { getMeilisearch, syncIndex } from "./utils/IndexBuilder";
import {
  fileHashExistsServer,
  getFileEncKeyDb,
  getS3Url,
  usernameExistsServer,
} from "./workers/ocr/utils";
import { encryptTxt, passwordToKeyHex } from "./utils/cryptography";
import { QueueHandler } from "./utils/helperClasses/QueueConnector";
import path from "node:path";

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 15,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
const db = drizzle(pgPool);

interface CacheEntry {
  v: unknown;
  exp: number;
}
const _cache = new Map<string, CacheEntry>();

let sharedQueueHandler: QueueHandler | null = null;
async function getSharedQueue() {
  if (!sharedQueueHandler) {
    sharedQueueHandler = await rawGetQueueHandler();
  }
  return sharedQueueHandler;
}

async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T> {
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.exp) return hit.v as T;
  const v = await fn();
  _cache.set(key, { v, exp: Date.now() + ttlMs });
  return v;
}

function invalidate(...keys: string[]) {
  keys.forEach((k) => _cache.delete(k));
}

const app = new Hono();

let cachedS3Url: string | null = null;
async function resolveS3BaseUrl(
  forceNonLocalNoChecks: boolean = false,
): Promise<string> {
  const originalS3: string | null = cachedS3Url;
  if (!cachedS3Url) {
    cachedS3Url = await getS3Url(true, forceNonLocalNoChecks);
  }
  if (originalS3 !== cachedS3Url) {
    console.log(`now using ${cachedS3Url} instead of the old ${originalS3}`);
  }
  return cachedS3Url;
}

const mainBucket: string = "uploads";

const PublicEndpoints = [
  "/stats",
  "/worker-download-stats",
  "/auth/signin",
  "/auth/signup",
  "/auth/validate-jwt",
];

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down…`);
  await pgPool.end().catch(console.error);
  process.exit(0);
}
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Authorization",
      "username",
      "X-Username",
      "Content-Type",
      "Range",
    ],
    exposeHeaders: [
      "X-Total-Count",
      "X-Page-Count",
      "Content-Range",
      "Accept-Ranges",
      "Content-Disposition",
    ],
  }),
);

app.use("*", async (c, next) => {
  const reqId = crypto.randomUUID();
  const currentPath = c.req.path.replace(/\/$/, "");
  const isPublic = PublicEndpoints.some(
    (p) => p.replace(/\/$/, "") === currentPath,
  );
  if (isPublic) return next();

  const token = c.req.header("X-Auth-Token") ?? c.req.header("Authorization");
  const username = c.req.header("X-Username") ?? c.req.header("username");

  if (!token) {
    return c.json({ detail: "Missing Authorization header" }, 401);
  }

  try {
    const secret = process.env.CLUSTER_WORKER_SECRET ?? "";
    if (token.split(".").length === 3) {
      try {
        const decoded = jwt.verify(token, secret);
        if (
          decoded &&
          typeof decoded === "object" &&
          decoded.role === "worker"
        ) {
          return next();
        }
      } catch (jwtErr) {}
    }

    const isValid: boolean = await isValidAuth(db, token, username);
    if (isValid === true) {
      return next();
    }
    return c.json(
      {
        detail: "Authentication failed cause of invalid or expired credentials",
      },
      401,
    );
  } catch (err: any) {
    const jsonError = {
      reqId,
      message: err?.message,
      stack: err?.stack,
    };
    console.error("[AUTH_VALIDATE_JWT][ERROR]", JSON.stringify(jsonError));
    c.header("X-Auth-Error", JSON.stringify(jsonError));
    return c.json({ detail: "Authentication failed" }, 401);
  }
});

setTimeout(() => syncIndex().catch(console.error), 1000);

async function initDefaultUser() {
  const defaultUsername = process.env.DEFAULT_USERNAME;
  const defaultPassword = process.env.DEFAULT_PASSWORD;
  if (defaultUsername === undefined || defaultPassword === undefined) {
    throw Error(
      `you gotta set both DEFAULT_USERNAME(equals: ${defaultUsername}) and DEFAULT_PASSWORD(equals: ${defaultPassword})`,
    );
  }
  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const hexPassword: string = passwordToKeyHex(defaultPassword);
    const encrypted_key = await encryptTxt(getMainEncryptionKey(), hexPassword);
    await db
      .insert(usersTable)
      .values({
        username: defaultUsername,
        password_hash: hashedPassword,
        encrypted_key,
      })
      .onConflictDoUpdate({
        target: usersTable.username,
        set: {
          password_hash: hashedPassword,
          encrypted_key,
        },
      });
  } catch (err) {
    console.error("[DB Init Critical]:", err);
  }
}
setTimeout(() => initDefaultUser().catch(console.error), 1500);

app.all("/auth/validate-jwt", async (c) => {
  const reqId = crypto.randomUUID();

  const rawToken =
    c.req.header("X-Auth-Token") ?? c.req.header("Authorization") ?? null;

  const username =
    c.req.header("X-Username") ?? c.req.header("username") ?? null;

  const token = rawToken?.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

  console.log("[AUTH_VALIDATE_JWT]", {
    reqId,
    ip: c.req.header("x-real-ip") ?? c.req.header("x-forwarded-for"),
    method: c.req.method,
    url: c.req.url,
    hasToken: !!token,
    hasUsername: !!username,
    rawAuthHeader: rawToken ? "[present]" : "[missing]",
  });

  if (!token) {
    console.log("[AUTH_VALIDATE_JWT][FAIL]", {
      reqId,
      reason: "missing_token",
    });

    return c.json(
      { detail: "Missing Authorization / X-Auth-Token header", reqId },
      401,
    );
  }

  try {
    const isValidWorker = await isValidAuthWorker(token);

    if (isValidWorker === true) {
      console.log("[AUTH_VALIDATE_JWT][OK]", {
        reqId,
        role: "worker",
      });

      return c.json({ role: "worker" }, 200);
    }

    const isValidUser = await isValidAuthUser(db, token, username);

    if (isValidUser === true) {
      console.log("[AUTH_VALIDATE_JWT][OK]", {
        reqId,
        role: "user",
        username,
      });

      return c.json({ role: "user", username }, 200);
    }

    console.log("[AUTH_VALIDATE_JWT][FAIL]", {
      reqId,
      reason: "invalid_token",
    });

    return c.json({ detail: "Invalid or expired token", reqId }, 401);
  } catch (err: any) {
    const jsonError = {
      reqId,
      message: err?.message,
      stack: err?.stack,
    };
    console.error("[AUTH_VALIDATE_JWT][ERROR]", JSON.stringify(jsonError));
    c.header("X-Auth-Error", JSON.stringify(jsonError));

    return c.json(
      {
        detail: "Auth service crashed",
        reqId,
      },
      500,
    );
  }
});

app.post("/auth/signup", async (c) => {
  let bodyPayload: any = null;
  try {
    bodyPayload = await c.req.json();
    const { username, password } = bodyPayload;
    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hexPassword: string = passwordToKeyHex(password);
    const encrypted_key = await encryptTxt(getMainEncryptionKey(), hexPassword);

    await db.insert(usersTable).values({
      username,
      password_hash: hashedPassword,
      encrypted_key: encrypted_key,
    });
    return c.json({ message: "User created" }, 201);
  } catch (err: any) {
    if (err.code === "23505" || err.message?.includes("unique")) {
      return c.json({ error: "User already exists" }, 409);
    }
    return c.json({ error: "Failed to create user", debug: err.message }, 500);
  }
});

app.post("/auth/signin", async (c) => {
  let bodyPayload: any = null;
  try {
    bodyPayload = await c.req.json();
    const { username, password } = bodyPayload;
    if (!username || !password) {
      return c.json({ error: "Missing username or password" }, 400);
    }
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    if (!user.length) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user[0].password_hash,
    );
    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    const token = jwt.sign(
      {
        role: "user",
        userId: user[0].id,
      },
      user[0].password_hash,
    );
    return c.json({
      token: token,
      encrypted_encrytion_key: user[0].encrypted_key,
    }); // encrypted_encrytion_key is the key with which all the
    // file encryption keys are encrypted. while encrypted_encrytion_key is encrypted with the plain text password of the user
  } catch (err: any) {
    return c.json(
      { error: "Internal error during authentication", debug: err.message },
      500,
    );
  }
});

async function computeStats() {
  const [docRes, pageRes, extRes, sizeRes, biggestFilesRes, sparklineRes] =
    await Promise.all([
      db
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
          last30d:
            sql<number>`count(*) filter (where ${documentsTable.createdAt} >= now() - interval '30 days')`.mapWith(
              Number,
            ),
        })
        .from(documentsTable),

      db
        .select({
          totalPages: sql<number>`count(*)`.mapWith(Number),
          pagesWithOcr:
            sql<number>`count(*) filter (where ${pagesTable.ocr} is not null and ${pagesTable.ocr}::text != '{}')`.mapWith(
              Number,
            ),
        })
        .from(pagesTable),

      db
        .select({
          ext: sql<string>`lower(substring(${documentsTable.fileS3Key} from '\\.([^.]+)$'))`,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(documentsTable)
        .groupBy(
          sql`lower(substring(${documentsTable.fileS3Key} from '\\.([^.]+)$'))`,
        ),

      db
        .select({ totalPages: sql<number>`count(*)`.mapWith(Number) })
        .from(pagesTable)
        .then((r) => {
          const pageCount = r[0]?.totalPages ?? 0;
          return pageCount * 100 * 1024;
        }),

      db
        .select({
          filepath: documentsTable.fileS3Key,
          page_count: sql<number>`count(${pagesTable.page_idx})`.mapWith(
            Number,
          ),
        })
        .from(documentsTable)
        .innerJoin(pagesTable, eq(pagesTable.file_id, documentsTable.file_id))
        .groupBy(documentsTable.fileS3Key)
        .orderBy(sql`count(${pagesTable.page_idx}) desc`)
        .limit(20)
        .then((r) =>
          r.map((row) => ({
            ...row,
            size_bytes: (row.page_count ?? 0) * 100 * 1024,
          })),
        ),

      db
        .select({
          hour: sql<string>`date_trunc('hour', ${documentsTable.createdAt})`,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(documentsTable)
        .where(sql`${documentsTable.createdAt} >= now() - interval '24 hours'`)
        .groupBy(sql`date_trunc('hour', ${documentsTable.createdAt})`)
        .orderBy(sql`date_trunc('hour', ${documentsTable.createdAt})`)
        .then((r) => r.map((row) => row.count)),
    ]);

  const qh = await getSharedQueue();
  const local = qh.getLocalMetrics();

  let queueStatsPreOcr: QueueStats | null = null;
  let queueStatsPostOcr: QueueStats | null = null;
  let ocrConsumers: any[] = [];
  let mergeConsumers: any[] = [];

  try {
    [queueStatsPreOcr, queueStatsPostOcr, ocrConsumers, mergeConsumers] =
      await Promise.all([
        qh.getQueueStats(QueueNames.startOcrQueue),
        qh.getQueueStats(QueueNames.consumeOcrOutput),
        qh.getConsumerDetails(QueueNames.startOcrQueue),
        qh.getConsumerDetails(QueueNames.consumeOcrOutput),
      ]);
  } catch (e) {
    console.error("Queue stats error:", e);
  }

  const ocrQueueLen = queueStatsPreOcr?.messages ?? 0;
  const rate = local.pages_per_minute_30s ?? local.pages_per_minute_60s;
  const eta_seconds =
    ocrQueueLen > 0 && rate && rate > 0
      ? Math.round((ocrQueueLen / rate) * 60)
      : null;

  const byExtension: Record<string, number> = {};
  for (const row of extRes) if (row.ext) byExtension[row.ext] = row.count;

  const totalPages = pageRes[0]?.totalPages ?? 0;
  const pagesWithOcr = pageRes[0]?.pagesWithOcr ?? 0;
  const totalDocuments = docRes[0]?.total ?? 0;
  const totalSizeBytes = sizeRes ?? 0;
  const ocr_coverage_pct =
    totalPages > 0 ? Math.round((pagesWithOcr / totalPages) * 100) : null;
  const avg_pages_per_doc =
    totalDocuments > 0 ? totalPages / totalDocuments : null;

  // SESS: Deduping physical connections by unique host:port matching to prevent phantom counts
  const distinctOcrHosts = new Set(ocrConsumers.map((c) => c.peerHost)).size;
  const distinctMergeHosts = new Set(mergeConsumers.map((c) => c.peerHost))
    .size;

  return {
    total_documents: totalDocuments,
    added_last_1h: docRes[0].lastHour,
    added_last_24h: docRes[0].last24h,
    added_last_7d: docRes[0].last7d,
    added_last_30d: docRes[0].last30d,
    total_pages: totalPages,
    pages_with_ocr: pagesWithOcr,
    ocr_coverage_pct,
    by_extension: byExtension,
    ext_distribution: byExtension,
    total_size_bytes: totalSizeBytes,
    avg_pages_per_doc: avg_pages_per_doc,
    biggest_files: biggestFilesRes,
    sparkline: sparklineRes.length > 0 ? sparklineRes : undefined,
    pages_per_minute_30s: local.pages_per_minute_30s,
    pages_per_minute_60s: local.pages_per_minute_60s,
    agent_downloads_per_minute_30s: local.agent_downloads_per_minute_30s,
    agent_downloads_per_minute_60s: local.agent_downloads_per_minute_60s,
    currently_processing: local.in_flight,
    eta_seconds,
    ocr_queue_length: ocrQueueLen,
    merge_queue_length: queueStatsPostOcr?.messages ?? 0,
    ocr_workers_active:
      (queueStatsPreOcr?.busyConsumers ?? 0) > 0 ? distinctOcrHosts : 0,
    ocr_workers_total: distinctOcrHosts,
    merge_workers_active:
      (queueStatsPostOcr?.busyConsumers ?? 0) > 0 ? distinctMergeHosts : 0,
    merge_workers_total: distinctMergeHosts,
  };
}

async function computeWorkers() {
  const qh = await getSharedQueue();
  const [ocrConsumers, mergeConsumers, channelStats] = await Promise.all([
    qh.getConsumerDetails(QueueNames.startOcrQueue),
    qh.getConsumerDetails(QueueNames.consumeOcrOutput),
    qh.getChannelStats(),
  ]);

  const enrich = (
    consumers: Awaited<ReturnType<typeof qh.getConsumerDetails>>,
  ) => {
    // Only return the unique connections sorted by active profiles to mask temporary channels
    const uniqueMap = new Map<string, any>();
    for (const con of consumers) {
      const key = `${con.peerHost}:${con.peerPort}`;
      const ch = channelStats[key] ?? {
        ackRate: 0,
        publishRate: 0,
        unacked: 0,
      };
      if (!uniqueMap.has(con.peerHost) || ch.ackRate > 0) {
        uniqueMap.set(con.peerHost, {
          id: `${con.peerHost}:${con.peerPort}:${con.consumerTag}`,
          port: con.peerPort,
          tag: con.consumerTag,
          ack_per_sec: ch.ackRate,
          unacked: ch.unacked,
          prefetch: con.prefetchCount,
          consumer_tag: con.consumerTag,
          last_seen: undefined,
          ip: con.connectionName,
          peerHost: con.peerHost,
          peerPort: con.peerPort,
          active: ch.ackRate > 0 || ch.unacked > 0,
        });
      }
    }
    return Array.from(uniqueMap.values());
  };

  return { ocr: enrich(ocrConsumers), merge: enrich(mergeConsumers) };
}

async function computeWorkerDownloadStats() {
  const qh = await getSharedQueue();
  const local = qh.getLocalMetrics();
  const recordedStats = qh.getWorkerDownloadStats();
  const [ocrConsumers] = await Promise.all([
    qh.getConsumerDetails(QueueNames.startOcrQueue),
  ]);

  const uniqueHosts = Array.from(new Set(ocrConsumers.map((c) => c.peerHost)));
  const workers = uniqueHosts.map((host, idx) => {
    const targetCon = ocrConsumers.find((c) => c.peerHost === host);
    const key = `${host}:${targetCon?.peerPort ?? 5671}`;
    const historicalRecord = recordedStats.find(
      (s: any) => s.ip === host || s.ip === key,
    );

    return {
      id: key,
      tag: targetCon?.consumerTag ?? `worker-${idx + 1}`,
      downloads: historicalRecord ? historicalRecord.totalDownloads : 0,
      bytes: historicalRecord ? historicalRecord.totalBytes : 0,
      last_seen: historicalRecord ? historicalRecord.lastSeenAt : undefined,
      ip: host ? `${host}:${targetCon?.peerPort ?? 5671}` : undefined,
      recent_files: historicalRecord ? historicalRecord.recentFiles : [],
    };
  });

  const total =
    local.total_downloads ?? workers.reduce((sum, w) => sum + w.downloads, 0);
  const total_bytes = workers.reduce((sum, w) => sum + w.bytes, 0);

  return {
    workers,
    total,
    total_bytes,
    summary: {
      agent_downloads_per_minute_30s: local.agent_downloads_per_minute_30s,
      agent_downloads_per_minute_60s: local.agent_downloads_per_minute_60s,
      in_flight: local.in_flight,
    },
  };
}

app.get("/stats", async (c) => {
  try {
    return c.json(await withCache("stats", 4_000, computeStats));
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed stats" }, 500);
  }
});

app.get("/workers", async (c) => {
  try {
    return c.json(await withCache("workers", 4_000, computeWorkers));
  } catch (e: any) {
    return c.json({ error: e.message, ocr: [], merge: [] }, 503);
  }
});

app.get("/worker-download-stats", async (c) => {
  try {
    return c.json(
      await withCache("workerDownloadStats", 4_000, computeWorkerDownloadStats),
    );
  } catch (e: any) {
    return c.json({ workers: [], summary: {}, error: e.message });
  }
});

app.get("/dashboard", async (c) => {
  try {
    const compositeData = await withCache(
      "synchronized_dashboard_view",
      4_000,
      async () => {
        const [stats, workers, downloads] = await Promise.all([
          computeStats(),
          computeWorkers(),
          computeWorkerDownloadStats(),
        ]);
        return { stats, workers, downloads };
      },
    );
    return c.json(compositeData);
  } catch (e: any) {
    console.error("[dashboard combined]:", e);
    return c.json({ error: e.message }, 500);
  }
});

// COMPAT: This serves the missing endpoint requested by frontend layout polling grids
app.get("/queue-peek", async (c) => {
  try {
    const stats = await withCache("stats", 4_000, computeStats);
    return c.json({
      ocr_queue: { messages: stats.ocr_queue_length },
      merge_queue: { messages: stats.merge_queue_length },
    });
  } catch (e: any) {
    return c.json({ ocr_queue: { messages: 0 }, merge_queue: { messages: 0 } });
  }
});

app.get("/main_page", async (c) => {
  const pageIdx = Number(c.req.query("pageIdx") ?? 0);
  const tagFilter = c.req.query("tag");
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const offset = pageIdx * limit;

  const whereClause = tagFilter
    ? sql`${documentsTable.assigned_tags} @> ARRAY[${tagFilter}]::text[]`
    : undefined;

  const [countRes, pageCountRes, res] = await Promise.all([
    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(documentsTable)
      .where(whereClause),
    db.select({ count: sql`count(*)`.mapWith(Number) }).from(pagesTable),
    db
      .select({
        user_id: documentsTable.user_id,
        fileS3Key: documentsTable.fileS3Key,
        created_at: documentsTable.createdAt,
        assigned_tags: documentsTable.assigned_tags,
        banner_img: pagesTable.page_banner_url,
        spawned_time: documentsTable.spawnedInPipelineIso,
        encrypted_file_key: documentsTable.encryption_key,
        page_count: sql<number>`(
        select count(*) from ${pagesTable} p2
        where p2.file_id = ${documentsTable.file_id}
      )`.mapWith(Number),
      })
      .from(documentsTable)
      .innerJoin(pagesTable, eq(documentsTable.file_id, pagesTable.file_id))
      .where(and(eq(pagesTable.page_idx, 0), whereClause))
      .orderBy(desc(documentsTable.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  c.header("X-Total-Count", String(countRes[0].count));
  c.header("X-Page-Count", String(pageCountRes[0].count));

  const resModed = await Promise.all(
    res.map(async (file) => ({
      ...file,
      banner_img: `${await resolveS3BaseUrl(true)}/${BucketNames.bannerImgs}/${file.banner_img}`,
    })),
  );
  return c.json(resModed);
});

app.get("/search", async (c) => {
  const rawQuery = c.req.query("query") || "";
  const limit = Math.min(parseInt(c.req.query("limit") ?? "200"), 500);
  const createdAfter = c.req.query("created_after");
  const createdBefore = c.req.query("created_before");

  // Allow filter-only searches (no query text required)
  const hasFilter =
    !!c.req.query("filter") || !!createdAfter || !!createdBefore;
  if (!rawQuery.trim() && !hasFilter)
    return c.json({ error: "Missing query" }, 400);

  // Parse tag: operators
  const tagRegex = /tag:([^\s]+)/gi;
  const tags: string[] = [];
  let tagMatch;
  while ((tagMatch = tagRegex.exec(rawQuery)) !== null)
    tags.push(`assigned_tags = '${tagMatch[1]}'`);

  // Parse -exclude operators
  const excludeRegex = /-([^\s]+)/g;
  const excludedTerms: string[] = [];
  let excludeMatch;
  while ((excludeMatch = excludeRegex.exec(rawQuery)) !== null)
    excludedTerms.push(excludeMatch[1].toLowerCase());

  const cleanQuery = rawQuery
    .replace(tagRegex, "")
    .replace(excludeRegex, "")
    .trim();

  let finalFilter: string[] = [...tags];
  if (createdAfter)
    finalFilter.push(`created_at >= ${new Date(createdAfter).getTime()}`);
  if (createdBefore)
    finalFilter.push(`created_at <= ${new Date(createdBefore).getTime()}`);

  const extraFilter = c.req.query("filter");
  if (extraFilter) {
    try {
      const parsed = JSON.parse(extraFilter);
      if (Array.isArray(parsed)) finalFilter = [...finalFilter, ...parsed];
    } catch {
      finalFilter.push(extraFilter);
    }
  }

  const client = await getMeilisearch();
  const index = client.index("documents");

  // Main search + facet counts in parallel
  const [res, facetRes] = await Promise.all([
    index.search(cleanQuery || " ", {
      limit,
      filter: finalFilter.length > 0 ? finalFilter : undefined,
      matchingStrategy: "all",
      attributesToHighlight: ["searchable_text"],
      highlightPreTag: "__HL__",
      highlightPostTag: "__/HL__",
      attributesToCrop: ["searchable_text"],
      cropLength: 30,
    }),
    // Fetch tag facet counts (zero-hit search just for facets)
    index
      .search("", {
        limit: 0,
        facets: ["assigned_tags"],
        filter: finalFilter.length > 0 ? finalFilter : undefined,
      })
      .catch(() => null),
  ]);

  let hits = res.hits;
  if (excludedTerms.length > 0) {
    hits = hits.filter((doc: any) => {
      const searchable = JSON.stringify(doc).toLowerCase();
      return !excludedTerms.some((term) => searchable.includes(term));
    });
  }

  const distinctFiles = new Set(hits.map((h: any) => h.filepath)).size;
  return c.json({
    ...res,
    hits,
    estimatedTotalHits: hits.length,
    total_documents: distinctFiles,
    excludedTerms,
    cleanQuery,
    // Tag facet counts so the frontend can show tag clouds in the filter panel
    tag_facets: facetRes?.facetDistribution?.assigned_tags ?? {},
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
    .where(eq(documentsTable.fileS3Key, filepath))
    .orderBy(asc(pagesTable.page_idx));

  const resModed = await Promise.all(
    res.map(async (file) => ({
      ...file,
      banner_img: `${await resolveS3BaseUrl(true)}/${BucketNames.bannerImgs}/${file.banner_img}`,
    })),
  );
  return c.json({ pages: resModed, total: res.length, filepath });
});

app.get("/document", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.json({ error: "Missing filepath" }, 400);
  const res = await db
    .select({
      fileS3Key: documentsTable.fileS3Key,
      created_at: documentsTable.createdAt,
      assigned_tags: documentsTable.assigned_tags,
      file_id: documentsTable.file_id,
      page_count:
        sql<number>`(select count(*) from ${pagesTable} p where p.file_id = ${documentsTable.file_id})`.mapWith(
          Number,
        ),
    })
    .from(documentsTable)
    .where(eq(documentsTable.fileS3Key, filepath))
    .limit(1);
  if (!res.length) return c.json({ error: "Not found" }, 404);
  return c.json(res[0]);
});

app.get("/tags", async (c) => {
  const res = await db.execute(sql`
    SELECT tag, count(*)::int AS doc_count
    FROM (SELECT unnest(assigned_tags) AS tag FROM ${documentsTable}) sub
    GROUP BY tag ORDER BY doc_count DESC, tag ASC
  `);
  return c.json({ tags: res.rows });
});

app.post("/check/hash_exists", async (c) => {
  const body = await c.req.json();
  const fileHash = body.hash;
  if (typeof fileHash !== "string" || !fileHash.trim())
    return c.json({ exists: false });
  const exists = await fileHashExistsServer(db, fileHash);
  return c.json({ exists });
});

app.post("/internal/get_file_enc_key", async (c) => {
  const body = await c.req.json();
  const fileKey = body.fileKey;
  if (typeof fileKey !== "string" || !fileKey.trim()) {
    return c.json({ encKey: "unknown" }, 404);
  }
  const encKey: string | null = await getFileEncKeyDb(db, fileKey);
  if (encKey === null) {
    return c.json({ encrypted_encryption_key: null }, 404);
  } else {
    return c.json({ encrypted_encryption_key: encKey }, 200);
  }
});

app.post("/check/user_exists", async (c) => {
  const body = await c.req.json();
  const username = body.username;
  if (typeof username !== "string" || !username.trim())
    return c.json({ exists: false });
  const exists = await usernameExistsServer(db, username);
  return c.json({ exists });
});

app.post("/upload", async (c) => {
  const uploadDir = getConsumePath();
  const username =
    c.req.header("X-Username") ?? c.req.header("username") ?? "unknown";

  try {
    const form = await c.req.formData();
    const file = form.get("file") as File | null;
    const relativePath = (form.get("relativePath") as string | null) ?? "";

    if (!file) return c.json({ error: "No file in request" }, 400);

    const safeRelative = relativePath
      .replace(/\.\./g, "__") // prevent path traversal
      .replace(/^\/+/, ""); // no leading slash

    const targetPath = safeRelative
      ? path.join(uploadDir, username, safeRelative)
      : path.join(uploadDir, username, file.name);

    const targetDir = path.dirname(targetPath);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const buffer = await file.arrayBuffer();
    await fs.promises.writeFile(targetPath, Buffer.from(buffer));

    console.log("[UPLOAD] Saved", { targetPath, size: buffer.byteLength });
    return c.json({ ok: true, path: targetPath });
  } catch (err: any) {
    console.error("[UPLOAD] Error", err);
    return c.json({ error: "Upload failed", detail: err?.message }, 500);
  }
});

app.delete("/delete/consume", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.json({ error: "Missing filepath" }, 400);
  try {
    const doc = await db
      .select({ file_id: documentsTable.file_id })
      .from(documentsTable)
      .where(eq(documentsTable.fileS3Key, filepath))
      .limit(1);
    if (!doc.length) return c.json({ error: "Document not found" }, 404);
    const fileId = doc[0].file_id;
    await db.delete(pagesTable).where(eq(pagesTable.file_id, fileId));
    await db.delete(documentsTable).where(eq(documentsTable.file_id, fileId));
    try {
      const meili = await getMeilisearch();
      await meili
        .index("documents")
        .deleteDocuments({ filter: `file_id = ${fileId}` });
    } catch (e) {
      console.warn("MeiliSearch delete warning:", e);
    }
    invalidate("stats");
    return c.json({ deleted: true, filepath, file_id: fileId });
  } catch (e: any) {
    console.error("Delete error:", e);
    return c.json({ error: e.message }, 500);
  }
});

app.get("/download", async (c) => {
  const fileKey = c.req.query("fileKey");
  if (!fileKey) return c.json({ error: "Missing filepath query param" }, 400);
  const bucketName: string = fileKey.endsWith("webp")
    ? BucketNames.bannerImgs
    : BucketNames.userUploads;

  // Construct the full S3 URL
  const s3Url = `${await resolveS3BaseUrl(true)}${bucketName}/${fileKey}`;

  let res: Response;
  try {
    res = await fetch(s3Url);
  } catch (e: any) {
    return c.json({ error: `S3 fetch failed: ${e.message}` }, 502);
  }

  if (!res.ok) {
    return c.json(
      { error: `S3 returned ${res.status} for ${fileKey}` },
      res.status as any,
    );
  }

  const parts = fileKey.split(/[/\\]/);
  const rawName = parts[parts.length - 1];
  const cleanName =
    rawName
      .replace(
        /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
        "$1",
      )
      .replace(
        /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
        "$1",
      ) || rawName;

  const contentType =
    res.headers.get("Content-Type") ?? "application/octet-stream";

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(cleanName)}"`,
      "Content-Length": res.headers.get("Content-Length") ?? "",
      "Cache-Control": "no-store",
    },
  });
});

export default {
  port: parseInt(process.env.PORT ?? "3000"),
  fetch: app.fetch,
  maxRequestBodySize: 5 * 1024 * 1024 * 1024,
  certFile: "/certs/rain.dms.cert.pem",
  keyFile: "/certs/rain.dms.cert-key.pem",
};
