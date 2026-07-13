import { Meilisearch } from "meilisearch";
import { documentsTable, pagesTable } from "./../../db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { asc, eq, sql } from "drizzle-orm";
import { OcrResult } from "../types/main";
import path from "path";

let meilisearchClient: Meilisearch | null = null;
let dbInstance: any = null;
let isSyncing = false;

let cursor = { createdAt: new Date(0), fileId: -1, pageIdx: -1 };

const BATCH_SIZE = 500;

export async function getMeilisearch() {
  if (!meilisearchClient) {
    meilisearchClient = new Meilisearch({
      host: "http://meilisearch:7700",
      apiKey: process.env.MEILI_MASTER_KEY ?? "masterbenno",
    });
  }
  return meilisearchClient;
}

async function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(process.env.DATABASE_URL!);
  }
  return dbInstance;
}

/** Normalizes assigned_tags, which arrives as an array, a JSON string, or a
 * plain comma-separated string depending on how the row was written. */
function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [raw];
  } catch {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
}

/** Flattens a page's OCR result into one searchable string. */
function extractSearchableText(ocr: unknown): string {
  const lines = (ocr as any)?.lines;
  if (!Array.isArray(lines)) return "";
  return lines
    .flatMap((line: any) =>
      Array.isArray(line.boxes) ? line.boxes.map((b: any) => b.text) : [],
    )
    .join(" ");
}

function toEpochMs(value: Date | string): number {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

/** Fetches and indexes one batch of pages after the current cursor.
 * Returns false when there's nothing left to index. */
async function indexNextBatch(): Promise<boolean> {
  const db = await getDb();
  const client = await getMeilisearch();
  const index = client.index("documents");

  const rows: {
    id: number;
    user_id: number;
    filepath: string;
    created_at: Date;
    assigned_tags: string;
    page_count: number;
    ocr: OcrResult;
    banner_img: string;
    pageIdx: number;
  }[] = await db
    .select({
      user_id: documentsTable.user_id,
      id: documentsTable.file_id,
      filepath: documentsTable.fileS3Key,
      created_at: documentsTable.createdAt,
      assigned_tags: documentsTable.assigned_tags,
      page_count: documentsTable.pageCount,
      ocr: pagesTable.ocr,
      banner_img: pagesTable.page_banner_url,
      pageIdx: pagesTable.page_idx,
    })
    .from(documentsTable)
    .innerJoin(pagesTable, eq(pagesTable.file_id, documentsTable.file_id))
    .where(
      sql`(${documentsTable.createdAt}, ${documentsTable.file_id}, ${pagesTable.page_idx}) >
          (${cursor.createdAt}, ${cursor.fileId}, ${cursor.pageIdx})`,
    )
    .orderBy(
      asc(documentsTable.createdAt),
      asc(documentsTable.file_id),
      asc(pagesTable.page_idx),
    )
    .limit(BATCH_SIZE);

  if (rows.length === 0) return false;

  const docsToIndex = rows.map((row) => ({
    id: `${row.id}_${row.pageIdx}`,
    user_id: row.user_id,
    file_id: row.id,
    filepath: row.filepath,
    pageIdx: row.pageIdx,
    assigned_tags: parseTags(row.assigned_tags),
    searchable_text: extractSearchableText(row.ocr),
    banner_img: row.banner_img,
    created_at: toEpochMs(row.created_at),
    page_count: row.page_count ?? 0,
    filename: path.basename(row.filepath),
  }));

  const task = await index.addDocuments(docsToIndex, { primaryKey: "id" });
  await client.tasks.waitForTask(task.taskUid, { timeout: 1000 * 60 * 15 });

  const last = rows[rows.length - 1];
  cursor = {
    createdAt: last.created_at as Date,
    fileId: last.id,
    pageIdx: last.pageIdx,
  };

  return rows.length === BATCH_SIZE; // more to fetch only if this page was full
}

async function runSync() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    const client = await getMeilisearch();
    const index = client.index("documents");
    if ((await index.getStats()).numberOfDocuments === 0) {
      cursor = { createdAt: new Date(0), fileId: -1, pageIdx: -1 };
    }
    while (await indexNextBatch()) {
      /* keep going while batches come back full */
    }
  } catch (err) {
    console.error("index sync failed:", err);
  } finally {
    isSyncing = false;
  }
}

export async function syncIndex(intervalMs = 15000) {
  const client = await getMeilisearch();
  const index = client.index("documents");
  await index.updateFilterableAttributes([
  "assigned_tags",
  "file_id",
  "user_id",       
  "pageIdx",
  "created_at",
]);
  await index.updateSearchableAttributes([
    "searchable_text",
    "filepath",
    "assigned_tags",
  ]);
  await index.updateSortableAttributes(["created_at", "page_count"]);

  await runSync();
  setInterval(() => runSync().catch(console.error), intervalMs);
}
