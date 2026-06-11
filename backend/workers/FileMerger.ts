// workers/FileMerger.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { OcrResult, QueueNames } from "../utils/types/main";
import { QueueHandler, PermanentFailureError } from "./QueueConnector";
import { documentsTable, pagesTable } from "../db/schema";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

export class FileMerger {
  private queueHandler: QueueHandler | null = null;
  private pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  private db = drizzle(this.pool);

  private log(
    level: "INFO" | "WARN" | "ERROR",
    message: string,
    meta?: Record<string, unknown>,
  ) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "FileMerger",
        level,
        message,
        ...meta,
      }),
    );
  }

  async init() {
    this.log("INFO", "Starting FileMerger");

    this.queueHandler = await QueueHandler.create(
      process.env.AMQP_URL,
      1, // prefetch
    );

    await this.queueHandler.addQueueOnReceive<OcrResult>(
      QueueNames.consumeOcrOutput,
      async (file: OcrResult) => {
        try {
          await this.mergeFile(file);
        } catch (error) {
          this.log("ERROR", "Failed to merge file", {
            fileHash: file.fileHash,
            error:
              error instanceof Error
                ? { name: error.name, message: error.message }
                : String(error),
          });
          throw error; // Let QueueHandler handle retry/poison queue
        }
      },
      { noAck: false }, // Explicitly use manual ack
    );

    this.log("INFO", "Consumer registered", {
      queue: QueueNames.consumeOcrOutput,
      prefetch: 1,
      dbPoolMax: 5,
    });
  }

  async mergeFile(file: OcrResult) {
    const started = Date.now();
    this.log("INFO", "OCR file received", {
      fileHash: file.fileHash,
      filepath: file.originalFilePath,
      pages: file.pages?.length ?? 0,
    });

    if (!file.pages?.length) {
      throw new PermanentFailureError(
        `No OCR pages for ${file.originalFilePath}`,
      );
    }
    function generateTags(filepath: string, basePath: string): string[] {
      let rawChunks: string[] = filepath
        .split("/")
        .filter((chunk) => !chunk.includes(".") && chunk.trim().length > 0);
      const baseChunks: string[] = basePath
        .split("/")
        .filter((chunk) => !chunk.includes(".") && chunk.trim().length > 0);

      rawChunks = rawChunks.filter((chunk) => !baseChunks.includes(chunk));
      return rawChunks;
    }
    const tags: string[] = generateTags(
      file.pages[0].bannerImgpath,
      process.env.CONSUME_PATH ?? "",
    );

    const currentDate = new Date();
    const inserted = await this.db
      .insert(documentsTable)
      .values({
        filepath: file.originalFilePath,
        createdAt: currentDate,
        assigned_tags: tags,
        fileHash: file.fileHash,
      })
      .onConflictDoNothing()
      .returning({ file_id: documentsTable.file_id });

    if (!inserted.length) {
      this.log("WARN", "Duplicate file skipped", {
        fileHash: file.fileHash,
        filepath: file.originalFilePath,
      });
      return;
    }

    const fileId = inserted[0].file_id;
    this.log("INFO", "Document created", { fileId, fileHash: file.fileHash });

    const BATCH_SIZE = 500;
    for (let i = 0; i < file.pages.length; i += BATCH_SIZE) {
      const batch = file.pages.slice(i, i + BATCH_SIZE);
      const batchStart = Date.now();

      await this.db.insert(pagesTable).values(
        batch.map((page, idx) => ({
          file_id: fileId,
          ocr: page,
          page_idx: i + idx,
          page_banner_url: page.bannerImgpath,
        })),
      );

      this.log("INFO", "Page batch inserted", {
        fileId,
        batchStartIndex: i,
        batchSize: batch.length,
        durationMs: Date.now() - batchStart,
      });
    }

    this.log("INFO", "File merged", {
      fileId,
      fileHash: file.fileHash,
      pageCount: file.pages.length,
      durationMs: Date.now() - started,
    });
  }

  async shutdown() {
    this.log("INFO", "Shutdown requested");
    try {
      await this.pool.end();
      this.log("INFO", "Pool closed");
      if (this.queueHandler) {
        await this.queueHandler.close();
        this.log("INFO", "QueueHandler closed");
      }
    } catch (error) {
      this.log("ERROR", "Failed to shutdown cleanly", {
        error:
          error instanceof Error
            ? { name: error.name, message: error.message }
            : String(error),
      });
    }
  }
}
