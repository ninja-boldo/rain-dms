import { drizzle } from "drizzle-orm/node-postgres";
import { OcrResult, QueueNames } from "../utils/types/main";
import { QueueHandler } from "./QueueConnector";
import { documentsTable, pagesTable } from "../db/schema";
import { moveFile } from "move-file";
import { convertImgPathToUrl, getExtension, getFilename } from "./ocr/utils";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();
export class FileMerger {
  private queueHandler: QueueHandler | null = null;
  private pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  private db = drizzle(this.pool);
  private newOrigPath: string | null = null;

  constructor(newOrigPath: string) {
    this.newOrigPath = newOrigPath;
  }

  async init() {
    this.queueHandler = await QueueHandler.create(process.env.AMQP_URL);
    await this.queueHandler.addQueueOnReceive(
      QueueNames.consumeOcrOutput,
      (file) => this.mergeFile(file),
    );
  }

  async mergeFile(file: OcrResult) {
    console.log(
      "now merging file with this path: ",
      file.originalFilePath,
      " and this banner img: ",
      file.pages[0].bannerImgpath,
    );
    if (file.pages.length === 0) {
      console.error(
        "the file ",
        file.originalFilePath,
        " is the culprit with no pages",
      );
    }

    if (!file.pages?.length) {
      console.warn("Skipping DB insert: no OCR pages", file.originalFilePath);
      return;
    }

    const currentDate = new Date();
    const nowTimestamp = currentDate.toISOString().replace(/:/g, "-");
    const newFilename: string = `${getFilename(file.originalFilePath)}-${uuidv4()}-${nowTimestamp.toString()}.${getExtension(file.originalFilePath)}`;
    const newPath: string = `${this.newOrigPath}/${newFilename}`;

    try {
      await moveFile(file.originalFilePath, newPath);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        console.warn(
          `Warning: Could not move file because it no longer exists at ${file.originalFilePath}. It may have been deleted or moved already.`,
        );
      } else {
        throw e;
      }
    }

    const fileIdJson = await this.db
      .insert(documentsTable)
      .values({
        filepath: newPath,
        createdAt: currentDate,
        assigned_tags: [],
      })
      .returning();

    const fileId = fileIdJson[0].file_id;

    await this.db.insert(pagesTable).values(
      file.pages.map((page, idx) => ({
        file_id: fileId,
        ocr: page,
        page_idx: idx,
        page_banner_url: convertImgPathToUrl(page.bannerImgpath),
      })),
    );
  }
}
