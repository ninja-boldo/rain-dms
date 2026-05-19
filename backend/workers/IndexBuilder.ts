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
let lastIndexedAt = new Date("1021-03-25");

async function runSync() {
  if (isSyncing) {
    console.log("sync already running");
    return;
  }

  isSyncing = true;

  try {
    const stats = await index.getStats();
    if (stats.numberOfDocuments === 0) {
      console.log("index is empty, forcing full sync");
      lastIndexedAt = new Date("1021-03-25");
    }

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
      .innerJoin(pagesTable, eq(pagesTable.file_id, documentsTable.file_id))
      .where(gt(documentsTable.createdAt, lastIndexedAt))
      .orderBy(asc(documentsTable.createdAt), asc(pagesTable.page_idx));

    if (docs.length === 0) {
      console.log("no new docs");
      return;
    }

    console.log(`fetched ${docs.length} rows`);

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

      return {
        id: `${doc.id}_${doc.pageIdx}`,
        file_id: doc.id,
        filepath: doc.filepath,
        pageIdx: doc.pageIdx,
        assigned_tags: parsedTags,
        searchable_text: searchableText,
        banner_img: doc.banner_img,
        created_at: doc.created_at,
      };
    });

    console.log(`indexing ${docsToIndex.length} docs`);

    const task = await index.addDocuments(docsToIndex, { primaryKey: "id" });
    await client.tasks.waitForTask(task.taskUid);
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

  await index.updateFilterableAttributes([
    "assigned_tags",
    "file_id",
    "pageIdx",
  ]);
  await index.updateSearchableAttributes([
    "searchable_text",
    "filepath",
    "assigned_tags",
  ]);

  await runSync();

  setInterval(() => {
    runSync().catch(console.error);
  }, intervalMs);
}
