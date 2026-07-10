import { Meilisearch } from "meilisearch";
import { documentsTable, pagesTable } from "./../../db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, gt, asc } from "drizzle-orm";

let meilisearchClient: Meilisearch | null = null;
let dbInstance: any = null;
let isSyncing = false;
let lastIndexedAt = new Date("1021-03-25");

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

async function runSync() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const client = await getMeilisearch();
    const db = await getDb();
    const index = client.index("documents");
    const stats = await index.getStats();
    if (stats.numberOfDocuments === 0) {
      lastIndexedAt = new Date("1021-03-25");
    }

    while (true) {
      const docs = await db
        .select({
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
        .where(gt(documentsTable.createdAt, lastIndexedAt))
        .orderBy(asc(documentsTable.createdAt), asc(pagesTable.page_idx))
        .limit(500);

      if (docs.length === 0) break;

      const docsToIndex = docs.map((doc) => {
        let parsedTags: string[] = [];
        if (Array.isArray(doc.assigned_tags)) {
          parsedTags = doc.assigned_tags.map(String);
        } else if (typeof doc.assigned_tags === "string") {
          try {
            const parsed = JSON.parse(doc.assigned_tags);
            parsedTags = Array.isArray(parsed)
              ? parsed.map(String)
              : [String(doc.assigned_tags)];
          } catch {
            parsedTags = doc.assigned_tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
          }
        }

        let searchableText = "";
        if (doc.ocr && typeof doc.ocr === "object") {
          const ocrObj = doc.ocr as any;
          if (Array.isArray(ocrObj.lines)) {
            searchableText = ocrObj.lines
              .flatMap((line: any) =>
                Array.isArray(line.boxes)
                  ? line.boxes.map((b: any) => b.text)
                  : [],
              )
              .join(" ");
          }
        }

        const createdAtMs =
          doc.created_at instanceof Date
            ? doc.created_at.getTime()
            : new Date(doc.created_at as unknown as string).getTime();

        return {
          id: `${doc.id}_${doc.pageIdx}`,
          file_id: doc.id,
          filepath: doc.filepath,
          pageIdx: doc.pageIdx,
          assigned_tags: parsedTags,
          searchable_text: searchableText,
          banner_img: doc.banner_img,
          created_at: createdAtMs,

          page_count: doc.page_count ?? 0,
        };
      });

      const task = await index.addDocuments(docsToIndex, { primaryKey: "id" });
      await client.tasks.waitForTask(task.taskUid, { timeout: 1000 * 60 * 15 });
      lastIndexedAt = docs[docs.length - 1].created_at;
      if (docs.length < 200) break;
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