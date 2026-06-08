import { drizzle } from "drizzle-orm/node-postgres";
import { OcrResult, QueueNames } from "../utils/types/main";
import { QueueHandler, PermanentFailureError } from "./QueueConnector";
import { documentsTable, pagesTable } from "../db/schema";
import { fileHashExistsServer, formatFilename } from "./ocr/utils";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

export class FileMerger {
  private queueHandler: QueueHandler | null = null;
  private pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  private db = drizzle(this.pool);

  async init() {
    this.queueHandler = await QueueHandler.create(process.env.AMQP_URL);
    await this.queueHandler.addQueueOnReceive(
      QueueNames.consumeOcrOutput,
      (file: OcrResult) => this.mergeFile(file),
    );
  }

  async mergeFile(file: OcrResult) {
    if (!file.pages?.length) {
      throw new PermanentFailureError(
        `No OCR pages for ${file.originalFilePath} — skipping`,
      );
    }

    // 1. Check if the file hash already exists BEFORE doing any inserts
    const isDuplicate = await fileHashExistsServer(this.db, file.fileHash);
    if (isDuplicate) {
      console.warn(
        `[Merger] File with hash ${file.fileHash} already exists. Skipping page merging.`,
      );
      return; // Or throw a handled error depending on how you want the queue to react
    }

    const currentDate = new Date();

    const fileIdJson = await this.db
      .insert(documentsTable)
      .values({
        filepath: file.originalFilePath,
        createdAt: currentDate,
        assigned_tags: [],
        fileHash: file.fileHash,
      })
      .returning();

    const fileId = fileIdJson[0].file_id;

    // 3. Since we checked uniqueness up-front, safely insert all pages
    await this.db.insert(pagesTable).values(
      file.pages.map((page, idx) => ({
        file_id: fileId,
        ocr: page,
        page_idx: idx,
        page_banner_url: page.bannerImgpath,
      })),
    );
  }
}
