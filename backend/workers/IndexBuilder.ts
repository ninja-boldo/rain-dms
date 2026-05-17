import { Meilisearch } from "meilisearch";
import { documentsTable, pagesTable } from "../db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, gt, asc } from "drizzle-orm";

const client = new Meilisearch({
  host: "http://127.0.0.1:7700",
  apiKey: "masterbenno",
});

const db = drizzle(process.env.DATABASE_URL!);
const index = client.index("documents");

let isSyncing = false;
let lastIndexedAt = new Date(0);

async function runSync() {
  if (isSyncing) {
    console.log("sync already running");
    return;
  }

  isSyncing = true;

  try {
    console.log("checking for new docs");

    const docs = await db
      .select({
        id: documentsTable.file_id,
        filepath: documentsTable.filepath,
        created_at: documentsTable.createdAt,
        assigned_tags: documentsTable.assigned_tags,
        ocr: pagesTable.ocr,
        banner_img: pagesTable.page_banner_url,
        pageIdx: pagesTable.page_idx,
      })
      .from(documentsTable)
      .innerJoin(
        pagesTable,
        eq(pagesTable.file_id, documentsTable.file_id),
      )
      .where(gt(documentsTable.createdAt, lastIndexedAt))
      .orderBy(asc(documentsTable.createdAt));

    if (docs.length === 0) {
      console.log("no new docs");
      return;
    }

    console.log(`indexing ${docs.length} docs`);

    await index.addDocuments(docs);

    console.log("finished indexing");

    lastIndexedAt = docs[docs.length - 1].created_at;
  } catch (err) {
    console.error("index sync failed:", err);
  } finally {
    isSyncing = false;
  }
}

export async function syncIndex(intervalMs = 15000) {
  console.log("starting index sync worker");

  // initial sync
  await runSync();

  // background polling loop
  setInterval(() => {
    runSync().catch(console.error);
  }, intervalMs);
}