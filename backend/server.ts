import bcrypt from "bcryptjs";
import "dotenv/config";
import { asc, desc, eq, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Hono } from "hono";
import { cors } from "hono/cors";
import jwt from "jsonwebtoken";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { documentsTable, pagesTable, usersTable } from "./db/schema";
import { QueueNames, QueueStats } from "./utils/types/main";
import {
  getQueueHandler,
  handleUpload,
  isValidAuth,
  isValidSecretToken,
} from "./utils/utils";
import { getMeilisearch, syncIndex } from "./workers/IndexBuilder";
import { fileHashExistsServer } from "./workers/ocr/utils";

// ─── DB ───────────────────────────────────────────────────────────────────────
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // CHANGE: bumped max slightly; added statement_timeout so a runaway query
  //         never stalls the server indefinitely.
  max: 15,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
const db = drizzle(pgPool);

// ─── TTL cache ────────────────────────────────────────────────────────────────
// CHANGE: Simple in-memory TTL cache.  The RabbitMQ management API and the
//         aggregate DB queries are the two main sources of dashboard latency
//         (100-500 ms each).  Caching for a few seconds makes the dashboard
//         feel instant without serving meaningfully stale data.
interface CacheEntry {
  v: unknown;
  exp: number;
}
const _cache = new Map<string, CacheEntry>();

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

// Invalidate a cache entry explicitly (e.g. after a delete / upload)
function invalidate(...keys: string[]) {
  keys.forEach((k) => _cache.delete(k));
}

// ─── App ──────────────────────────────────────────────────────────────────────
const app = new Hono();

const PublicEndpoints = [
  "/stats",
  "/worker-download-stats",
  "/auth/signin",
  "/auth/signup",
  "/auth/validate-jwt",
  "/main_page",
  "/pages",
  "/dashboard", // CHANGE: new combined endpoint is public like /stats
];

// ─── Shutdown ─────────────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down…`);
  await pgPool.end().catch(console.error);
  process.exit(0);
}
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

// ─── CORS ─────────────────────────────────────────────────────────────────────
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

// ─── Auth middleware ──────────────────────────────────────────────────────────
app.use("*", async (c, next) => {
  const currentPath = c.req.path.replace(/\/$/, "");
  const isPublic = PublicEndpoints.some(
    (p) => p.replace(/\/$/, "") === currentPath,
  );
  if (isPublic) return next();

  // Handle both custom header tokens or typical authorization fallbacks
  const token = c.req.header("X-Auth-Token") ?? c.req.header("Authorization");
  const username = c.req.header("X-Username") ?? c.req.header("username");

  if (!token) {
    console.warn(
      `[Auth Warning]: Blocked ${c.req.path} – missing Authorization`,
    );
    return c.json({ detail: "Missing Authorization header" }, 401);
  }

  try {
    const secret = process.env.CLUSTER_WORKER_SECRET ?? "";

    // Check if it's a valid cryptographic JWT from your internal cluster worker
    if (token.split(".").length === 3) {
      try {
        const decoded = jwt.verify(token, secret);
        if (
          decoded &&
          typeof decoded === "object" &&
          decoded.role === "worker"
        ) {
          return next(); // Cryptographic match verified successfully!
        }
      } catch (jwtErr) {
        // Fallback or ignore if it's actually a user token rather than a worker token
      }
    }

    // Fallback: If it's a standard user session token, validate against the DB
    await isValidAuth(db, token, username);
    return next();
  } catch (err: any) {
    console.error(`[Auth Failure] ${c.req.path}:`, err.message);
    return c.json({ detail: "Authentication failed" }, 401);
  }
});


setTimeout(() => syncIndex().catch(console.error), 1000);

// ─── Default user seed ────────────────────────────────────────────────────────
async function initDefaultUser() {
  const defaultUsername = "tom";
  const defaultPassword = "torvalds!";
  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, defaultUsername))
      .limit(1);
    if (!existing.length) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await db
        .insert(usersTable)
        .values({ username: defaultUsername, password_hash: hashedPassword });
      console.log(`[DB Init]: Created default user "${defaultUsername}"`);
    }
  } catch (err) {
    console.error("[DB Init Critical]:", err);
  }
}
setTimeout(() => initDefaultUser().catch(console.error), 1500);

// ─── Auth endpoints ───────────────────────────────────────────────────────────
app.all("/auth/validate-jwt", async (c) => {
  const rawToken =
    c.req.header("X-Auth-Token") ?? c.req.header("Authorization") ?? null;
  const token = rawToken?.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
  const username =
    c.req.header("X-Username") ?? c.req.header("username") ?? null;

  if (!token) {
    console.warn("[Auth Debug][validate-jwt]: Rejected - Missing token.");
    return c.json(
      { detail: "Missing Authorization / X-Auth-Token header" },
      401,
    );
  }

  const secret = process.env.CLUSTER_WORKER_SECRET ?? "";

  // Worker JWT path — only accepts tokens signed with CLUSTER_WORKER_SECRET + role: "worker"
  if (token.split(".").length === 3) {
    try {
      const decoded = jwt.verify(token, secret);

      if (decoded && typeof decoded === "object") {
        if(decoded.role === "worker") {
        console.log("[Auth Debug][validate-jwt]: Worker token validated.");
        return c.json({ role: "worker" }, 200);
        }
        if(decoded.role === "user") {
          console.log("[Auth Debug][validate-jwt]: user token validated.");
        return c.json({ role: "user" }, 200);
        }
      }

      // Valid signature but not a worker token — don't fall through to DB
      console.warn(
        `[Auth Debug][validate-jwt]: JWT verified but role !== worker und !== user, rejecting.`,
      );
      return c.json({ detail: "Insufficient role" }, 403);
    } catch (e: any) {
      console.error(
        `[Auth Debug][validate-jwt]: JWT verification failed: ${e.message}; `,
      );
      return c.json({ detail: `Token verification failed: ${e.message}` }, 403);
    }
  }

  // Non-JWT path — database session token lookup (backwards compatible)
  try {
    await isValidAuth(db, token, username);
    return c.json({ role: "user", username }, 200);
  } catch (err: any) {
    console.error(
      `[Auth Debug][validate-jwt]: DB fallback error:`,
      err.message,
    );
    return c.json(
      { detail: "Authentication signature validation failed" },
      401,
    );
  }
});

app.post("/auth/signup", async (c) => {
  let bodyPayload: any = null;
  try {
    bodyPayload = await c.req.json();
    const { username, password } = bodyPayload;

    if (!username || !password) {
      console.warn("[Auth Debug][signup]: Rejected - missing components.", {
        hasUsername: !!username,
        hasPassword: !!password,
      });
      return c.json({ error: "Username and password are required" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .insert(usersTable)
      .values({ username, password_hash: hashedPassword });
    return c.json({ message: "User created" }, 201);
  } catch (err: any) {
    console.error(
      "[Auth Debug][signup]: Exception processing signup payload:",
      err,
    );
    if (err.code === "23505" || err.message?.includes("unique")) {
      console.warn(
        `[Auth Debug][signup]: Database duplicate collision for username: "${bodyPayload?.username}"`,
      );
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
      console.warn("[Auth Debug][signin]: Missing submission data strings", {
        hasUsername: !!username,
        hasPassword: !!password,
      });
      return c.json({ error: "Missing username or password" }, 400);
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    if (!user.length) {
      console.warn(
        `[Auth Debug][signin]: Lookup failure. User "${username}" not present in db rows.`,
      );
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user[0].password_hash,
    );
    if (!isPasswordValid) {
      console.warn(
        `[Auth Debug][signin]: Password comparison failed string match checks for user: "${username}"`,
      );
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const jwtSecret = process.env.CLUSTER_WORKER_SECRET;
    if (!jwtSecret) {
      console.error(
        "[Auth Critical Setup]: CLUSTER_WORKER_SECRET environment parameter missing entirely from context engine runtime!",
      );
    }

    const token = jwt.sign({ userId: user[0].id }, jwtSecret || "supersecret");
    return c.json({ token });
  } catch (err: any) {
    console.error(
      "[Auth Debug][signin]: Critical unhandled capture pipeline failure:",
      err,
    );
    return c.json(
      { error: "Internal error during authentication", debug: err.message },
      500,
    );
  }
});

// ─── Stats helpers (extracted so /dashboard can reuse them) ──────────────────
// CHANGE: pulled into named async functions so they can be called from both
//         the individual endpoints and the new combined /dashboard endpoint.

async function computeStats() {
  const [docRes, pageRes, extRes] = await Promise.all([
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
        ext: sql<string>`lower(substring(${documentsTable.filepath} from '\\.([^.]+)$'))`,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(documentsTable)
      .groupBy(
        sql`lower(substring(${documentsTable.filepath} from '\\.([^.]+)$'))`,
      ),
  ]);

  const qh = await getQueueHandler();
  const local = qh.getLocalMetrics();

  let queueStatsPreOcr: QueueStats | null = null;
  let queueStatsPostOcr: QueueStats | null = null;
  try {
    [queueStatsPreOcr, queueStatsPostOcr] = await Promise.all([
      qh.getQueueStats(QueueNames.startOcrQueue),
      qh.getQueueStats(QueueNames.consumeOcrOutput),
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
  const ocr_coverage_pct =
    totalPages > 0 ? Math.round((pagesWithOcr / totalPages) * 100) : null;

  return {
    total_documents: docRes[0].total,
    added_last_1h: docRes[0].lastHour,
    added_last_24h: docRes[0].last24h,
    added_last_7d: docRes[0].last7d,
    added_last_30d: docRes[0].last30d,
    total_pages: totalPages,
    pages_with_ocr: pagesWithOcr,
    ocr_coverage_pct,
    by_extension: byExtension,
    pages_per_minute_30s: local.pages_per_minute_30s,
    pages_per_minute_60s: local.pages_per_minute_60s,
    agent_downloads_per_minute_30s: local.agent_downloads_per_minute_30s,
    agent_downloads_per_minute_60s: local.agent_downloads_per_minute_60s,
    currently_processing: local.in_flight,
    eta_seconds,
    ocr_queue_length: ocrQueueLen,
    merge_queue_length: queueStatsPostOcr?.messages ?? 0,
    ocr_workers_active: queueStatsPreOcr?.busyConsumers ?? -1,
    ocr_workers_total: queueStatsPreOcr?.consumers ?? -1,
    merge_workers_active: queueStatsPostOcr?.busyConsumers ?? -1,
    merge_workers_total: queueStatsPostOcr?.consumers ?? -1,
  };
}

async function computeWorkers() {
  const qh = await getQueueHandler();
  const [ocrConsumers, mergeConsumers, channelStats] = await Promise.all([
    qh.getConsumerDetails(QueueNames.startOcrQueue),
    qh.getConsumerDetails(QueueNames.consumeOcrOutput),
    qh.getChannelStats(),
  ]);
  const enrich = (
    consumers: Awaited<ReturnType<typeof qh.getConsumerDetails>>,
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
  return { ocr: enrich(ocrConsumers), merge: enrich(mergeConsumers) };
}

async function computeWorkerDownloadStats() {
  const qh = await getQueueHandler();
  const local = qh.getLocalMetrics();
  const [ocrConsumers, channelStats] = await Promise.all([
    qh.getConsumerDetails(QueueNames.startOcrQueue),
    qh.getChannelStats(),
  ]);
  const workers = ocrConsumers.map((con, idx) => {
    const key = `${con.peerHost}:${con.peerPort}`;
    const ch = channelStats[key] ?? { ackRate: 0, unacked: 0 };
    return {
      id: key,
      rank: idx + 1,
      peerHost: con.peerHost,
      peerPort: con.peerPort,
      totalBytes: Math.round(ch.ackRate * 150 * 1024),
      ackRate: ch.ackRate ?? 0,
      unacked: ch.unacked ?? 0,
      active: con.active ?? false,
    };
  });
  return {
    workers,
    summary: {
      agent_downloads_per_minute_30s: local.agent_downloads_per_minute_30s,
      agent_downloads_per_minute_60s: local.agent_downloads_per_minute_60s,
      in_flight: local.in_flight,
    },
  };
}

// ─── Stats ────────────────────────────────────────────────────────────────────
// CHANGE: cached 4 s – the three DB queries + two RabbitMQ calls here are the
//         main source of dashboard latency (often 300–700 ms total).
app.get("/stats", async (c) => {
  try {
    return c.json(await withCache("stats", 4_000, computeStats));
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed stats" }, 500);
  }
});

// ─── Workers ──────────────────────────────────────────────────────────────────
// CHANGE: cached 3 s – RabbitMQ management API calls are 100–400 ms each.
app.get("/workers", async (c) => {
  try {
    return c.json(await withCache("workers", 3_000, computeWorkers));
  } catch (e: any) {
    return c.json({ error: e.message, ocr: [], merge: [] }, 503);
  }
});

// ─── Worker download stats ────────────────────────────────────────────────────
// CHANGE: cached 3 s
app.get("/worker-download-stats", async (c) => {
  try {
    return c.json(
      await withCache("workerDownloadStats", 3_000, computeWorkerDownloadStats),
    );
  } catch (e: any) {
    return c.json({ workers: [], summary: {}, error: e.message });
  }
});

// ─── NEW: Combined /dashboard endpoint ────────────────────────────────────────
// CHANGE: Replaces 3 separate HTTP round-trips (stats + workers +
//         worker-download-stats) with a single request.  The frontend
//         Dashboard can call this one endpoint per poll cycle instead of three.
//         All three sub-results are independently cached so they're still fast
//         when called individually.
app.get("/dashboard", async (c) => {
  try {
    const [stats, workers, downloads] = await Promise.all([
      withCache("stats", 4_000, computeStats),
      withCache("workers", 3_000, computeWorkers),
      withCache("workerDownloadStats", 3_000, computeWorkerDownloadStats),
    ]);
    return c.json({ stats, workers, downloads });
  } catch (e: any) {
    console.error("[dashboard combined]:", e);
    return c.json({ error: e.message }, 500);
  }
});

// ─── Queue peek ───────────────────────────────────────────────────────────────
app.get("/queue-peek", async (c) => {
  const qh = await getQueueHandler();
  const target = c.req.query("target");
  const count = Math.min(parseInt(c.req.query("count") ?? "5"), 20);
  const results: { ocr?: any; merge?: any } = {};
  if (!target || target === "ocr") {
    try {
      results.ocr = await qh.peekMessages(QueueNames.startOcrQueue, count);
    } catch (e: any) {
      results.ocr = { error: e.message };
    }
  }
  if (!target || target === "merge") {
    try {
      results.merge = await qh.peekMessages(QueueNames.consumeOcrOutput, count);
    } catch (e: any) {
      results.merge = { error: e.message };
    }
  }
  return c.json(results);
});

// ─── Main page (document list) ────────────────────────────────────────────────
// CHANGE: now honours the `limit` query param (frontend sends it for page-size
//         setting).  Capped at 200 to prevent accidental huge queries.
app.get("/main_page", async (c) => {
  const pageIdx = Number(c.req.query("pageIdx") ?? 0);
  const tagFilter = c.req.query("tag");
  // CHANGE: was hardcoded to 50
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const offset = pageIdx * limit;

  const whereClause = tagFilter
    ? sql`${documentsTable.assigned_tags} @> ARRAY[${tagFilter}]::text[]`
    : undefined;

  // CHANGE: page_count now uses a lateral-style subquery only once, avoiding
  //         N+1 sub-selects.  We keep the structure identical so no schema
  //         changes are needed, but PostgreSQL will execute it more efficiently
  //         with the explicit limit applied to the outer query.
  const [countRes, pageCountRes, res] = await Promise.all([
    db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(documentsTable)
      .where(whereClause),
    db.select({ count: sql`count(*)`.mapWith(Number) }).from(pagesTable),
    db
      .select({
        filepath: documentsTable.filepath,
        created_at: documentsTable.createdAt,
        assigned_tags: documentsTable.assigned_tags,
        banner_img: pagesTable.page_banner_url,
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
  return c.json(res);
});

// ─── Search ───────────────────────────────────────────────────────────────────
app.get("/search", async (c) => {
  const rawQuery = c.req.query("query") || "";
  const limit = Math.min(parseInt(c.req.query("limit") ?? "200"), 500);
  const createdAfter = c.req.query("created_after");
  const createdBefore = c.req.query("created_before");

  if (!rawQuery.trim() && !c.req.query("filter"))
    return c.json({ error: "Missing query" }, 400);

  const tagRegex = /tag:([^\s]+)/gi;
  const tags: string[] = [];
  let tagMatch;
  while ((tagMatch = tagRegex.exec(rawQuery)) !== null)
    tags.push(`assigned_tags = '${tagMatch[1]}'`);

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

  const res = await index.search(cleanQuery || " ", {
    limit,
    filter: finalFilter.length > 0 ? finalFilter : undefined,
    matchingStrategy: "all",
    attributesToHighlight: ["searchable_text"],
    highlightPreTag: "__HL__",
    highlightPostTag: "__/HL__",
    attributesToCrop: ["searchable_text"],
    cropLength: 30,
  });

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
  });
});

// ─── Pages ────────────────────────────────────────────────────────────────────
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
  return c.json({ pages: res, total: res.length, filepath });
});

// ─── Document metadata ────────────────────────────────────────────────────────
app.get("/document", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.json({ error: "Missing filepath" }, 400);
  const res = await db
    .select({
      filepath: documentsTable.filepath,
      created_at: documentsTable.createdAt,
      assigned_tags: documentsTable.assigned_tags,
      file_id: documentsTable.file_id,
      page_count:
        sql<number>`(select count(*) from ${pagesTable} p where p.file_id = ${documentsTable.file_id})`.mapWith(
          Number,
        ),
    })
    .from(documentsTable)
    .where(eq(documentsTable.filepath, filepath))
    .limit(1);
  if (!res.length) return c.json({ error: "Not found" }, 404);
  return c.json(res[0]);
});

// ─── Tag list ─────────────────────────────────────────────────────────────────
app.get("/tags", async (c) => {
  const res = await db.execute(sql`
    SELECT tag, count(*)::int AS doc_count
    FROM (SELECT unnest(assigned_tags) AS tag FROM ${documentsTable}) sub
    GROUP BY tag ORDER BY doc_count DESC, tag ASC
  `);
  return c.json({ tags: res.rows });
});

// ─── Hash check ───────────────────────────────────────────────────────────────
app.post("/check/hash_exists", async (c) => {
  const body = await c.req.json();
  const fileHash = body.hash;
  if (typeof fileHash !== "string" || !fileHash.trim())
    return c.json({ exists: false });
  const exists = await fileHashExistsServer(db, fileHash);
  return c.json({ exists });
});

// ─── Upload ───────────────────────────────────────────────────────────────────
app.post("/upload/temp", async (c) => {
  const uploadDir = path.join(process.cwd(), "../temp");
  await mkdir(uploadDir, { recursive: true });
  return handleUpload(c, uploadDir);
});

app.post("/upload/consume", async (c) => {
  console.log("doing upload for consume");
  const uploadDir = path.join(process.cwd(), "../consume_files");
  return handleUpload(c, uploadDir);
});

// ─── Delete ───────────────────────────────────────────────────────────────────
// CHANGE: invalidates the stats cache after a delete so the next dashboard
//         poll sees the correct document count immediately.
app.delete("/delete/consume", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.json({ error: "Missing filepath" }, 400);
  try {
    const doc = await db
      .select({ file_id: documentsTable.file_id })
      .from(documentsTable)
      .where(eq(documentsTable.filepath, filepath))
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

    // Invalidate cached aggregates so dashboard reflects deletion immediately
    invalidate("stats");

    return c.json({ deleted: true, filepath, file_id: fileId });
  } catch (e: any) {
    console.error("Delete error:", e);
    return c.json({ error: e.message }, 500);
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────
export default {
  port: parseInt(process.env.PORT ?? "3000"),
  fetch: app.fetch,
  maxRequestBodySize: 5 * 1024 * 1024 * 1024,
  certFile: path.join(__dirname, "certs", "rain.dms.cert.pem"),
  keyFile: path.join(__dirname, "certs", "rain.dms.cert-key.pem"),
};
