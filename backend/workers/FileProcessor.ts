import { QueueHandler, PermanentFailureError } from "./QueueConnector";
import { OcrModel, OcrResult, QueueNames } from "../utils/types/main";
import { PaddleJsOcr } from "./ocr/Paddle";
import { TesseractOcr } from "./ocr/Tesseract";
import { promises as fs } from "fs";
import "dotenv/config";
import {
  downloadFileS3,
  getExtension,
  getFilename,
  getS3Client,
} from "./ocr/utils";
import path from "path";
import pLimit from "p-limit";

export class FileProcessor {
  private paddle!: PaddleJsOcr;
  private tesseract!: TesseractOcr;
  private queue!: QueueHandler;
  private tempFolder!: string;
  private ready = false;

  private readonly s3 = getS3Client();
  private readonly docLimit = pLimit(1);

  async init(tempFolder: string): Promise<void> {
    this.tempFolder = tempFolder;
    await fs.mkdir(tempFolder, { recursive: true });

    this.queue = await QueueHandler.create(process.env.AMQP_URL);

    this.paddle = new PaddleJsOcr(tempFolder);
    this.tesseract = new TesseractOcr(1, "eng");

    // Warmup BEFORE registering as a queue consumer.
    console.log("[Processor] Warming up Paddle OCR worker...");
    await this.paddle.warmup();
    console.log("[Processor] Paddle OCR worker ready.");

    this.ready = true;

    // Register the consumer only after warmup so the broker never sends
    // a message to an unready processor.
    this.queue.addQueueOnReceive(QueueNames.startOcrQueue, (s3Url: string) =>
      this.processDocument(s3Url),
    );
  }

  async processDocument(
    s3Url: string,
    model: OcrModel = OcrModel.Paddle,
  ): Promise<void> {
    return this.docLimit(() => this._processDocument(s3Url, model));
  }

  private async _processDocument(
    s3Url: string,
    model: OcrModel,
  ): Promise<void> {
    this.assertReady();

    // Robust filename extraction — handles percent-encoded characters and any
    // query-string or fragment that might be appended to the URL.
    let filename: string;
    try {
      const urlPath = new URL(s3Url).pathname;
      filename = path.basename(decodeURIComponent(urlPath));
    } catch {
      // Fallback for non-standard URL strings (shouldn't happen in practice).
      filename = `${getFilename(s3Url)}.${getExtension(s3Url)}`;
    }

    const localPath = path.join(this.tempFolder, filename);

    console.log(`[Processor] Downloading: ${s3Url} → ${localPath}`);

    try {
      await downloadFileS3(this.s3, path.basename(s3Url), localPath);
    } catch (err) {
      const msg = (err as Error).message;

      // 4xx → the key doesn't exist or we have no access. Dead-letter immediately.
      if (/S3 GET failed: 4\d\d/.test(msg)) {
        throw new PermanentFailureError(`Bad S3 key, won't retry: ${msg}`);
      }
      
      if (/S3 GET failed: 500/.test(msg)) {
        throw new PermanentFailureError(
          `S3 returned 500 for this key — file unrecoverable, dead-lettering: ${s3Url}`,
        );
      }

      // 502 / 503 / 504 → upstream/gateway issue, may resolve. Allow retry.
      throw err;
    }

    let result: OcrResult;
    try {
      result =
        model === OcrModel.Paddle
          ? await this.paddle.getOcr(this.s3, localPath)
          : await this.tesseract.getDocumentOcr(localPath);
    } finally {
      // Always clean up the local download, even if OCR throws.
      // (Paddle.ts also removes its own temp files, so force:true is harmless.)
      await fs
        .rm(localPath, { force: true })
        .catch((e) =>
          console.warn(
            `[Processor] Failed to delete temp file: ${localPath}`,
            e,
          ),
        );
    }

    if (!result!.pages?.length) {
      throw new PermanentFailureError(`OCR returned 0 pages for ${s3Url}`);
    }

    console.log(
      `[Processor] OCR complete — ${result!.pages.length} page(s): ${result!.originalFilePath}`,
    );

    await this.queue.sendMsg(result!, QueueNames.consumeOcrOutput);
  }

  private assertReady(): void {
    if (!this.ready)
      throw new Error("FileProcessor not initialised — call init() first");
  }
}
