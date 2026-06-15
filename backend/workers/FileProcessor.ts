import { QueueHandler, PermanentFailureError } from "../utils/helperClasses/QueueConnector";
import {
  BucketNames,
  OcrModel,
  OcrResult,
  QueueNames,
  QueueObjProcessOcrResult,
  QueueObjStartOcr,
} from "../utils/types/main";
import { PaddleJsOcr } from "./ocr/paddle/Paddle";
import { TesseractOcr } from "./ocr/tesseract/Tesseract";
import { promises as fs } from "fs";
import "dotenv/config";
import path from "path";
import pLimit from "p-limit";
import { decryptFileStream, decryptTxt } from "../utils/trust/cryptography";
import { S3Client } from "@aws-sdk/client-s3";
import { getExtension, getFilename } from "../utils/other/pathHelpers";
import { downloadFileS3, getS3Client } from "../utils/other/s3Helpers";
import { getEncryptAtRestIsTrue, getMainEncryptionKey } from "../utils/trust/envHelpers";
import { getEncryptedFileEncKeyApi } from "../utils/other/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveFilename(s3Key: string): string {
  try {
    return path.basename(decodeURIComponent(new URL(s3Key).pathname));
  } catch {
    return `${getFilename(s3Key)}.${getExtension(s3Key)}`;
  }
}

function classifyS3Error(err: any, s3Key: string): never {
  const status = err.$metadata?.httpStatusCode;

  if (status >= 400 && status < 500)
    throw new PermanentFailureError(
      `Bad S3 request (HTTP ${status}): ${err.message}`,
    );

  if (status === 500)
    throw new PermanentFailureError(
      `S3 internal server error (500) for key: ${s3Key}`,
    );

  if (err.name === "NoSuchKey" || err.name === "AccessDenied")
    throw new PermanentFailureError(
      `S3 key issue (${err.name}): ${err.message}`,
    );

  throw err;
}

// ─── FileProcessor ────────────────────────────────────────────────────────────

export class FileProcessor {
  private paddle!: PaddleJsOcr;
  private tesseract!: TesseractOcr;
  private queue!: QueueHandler;
  private tempFolder!: string;
  private s3: S3Client | null = null;
  private ready = false;

  private readonly docLimit = pLimit(1);

  async init(tempFolder: string): Promise<void> {
    this.tempFolder = tempFolder;
    await fs.mkdir(tempFolder, { recursive: true });

    this.s3 = await getS3Client();
    this.queue = await QueueHandler.create(process.env.AMQP_URL);
    this.paddle = new PaddleJsOcr(tempFolder);
    this.tesseract = new TesseractOcr(1, "eng");

    console.log("[Processor] Warming up Paddle OCR worker...");
    await this.paddle.warmup();
    console.log("[Processor] Paddle OCR worker ready.");

    this.ready = true;

    this.queue.addQueueOnReceive(
      QueueNames.startOcrQueue,
      (queueObj: QueueObjStartOcr) => this.processDocument(queueObj),
    );
  }

  async processDocument(
    queueObj: QueueObjStartOcr,
    model: OcrModel = OcrModel.Paddle,
  ): Promise<void> {
    return this.docLimit(() => this._processDocument(queueObj, model));
  }

  private async _processDocument(
    queueObj: QueueObjStartOcr,
    model: OcrModel,
  ): Promise<void> {
    this.assertReady();
    if (!this.s3) throw new Error("S3 client not initialised");

    const filename = resolveFilename(queueObj.s3Key);
    let localPath = path.join(this.tempFolder, filename);
    let result: OcrResult | null = null;

    if (queueObj.isEncrypted === true) {
      const decryptedKey: string = await this.getDecryptedKey(queueObj);
      localPath = await this.downloadAndDecrypt(queueObj, decryptedKey);
      result = await this.runOcr(localPath, decryptedKey);
    } else {
      await downloadFileS3(this.s3, queueObj.s3Key, localPath);
      result = await this.runOcr(localPath, null);
    }

    if (!result.pages?.length) {
      throw new PermanentFailureError(
        `OCR returned 0 pages for ${JSON.stringify(queueObj)}`,
      );
    }

    console.log(
      `[Processor] OCR complete — ${result.pages.length} page(s): ${result.originalFilePath}`,
    );

    const outMsg: QueueObjProcessOcrResult = {
      result,
      username: queueObj.username,
      spawnedTime: queueObj.spawnedTime,
      isEncrypted: queueObj.isEncrypted,
      originalFileKey: queueObj.s3Key,
      originalConsumePath: queueObj.originalConsumePath,
    };
    console.log("queueing in for merging with this: ", outMsg);
    await this.queue.sendMsg(outMsg, QueueNames.consumeOcrOutput);
  }

  private async getDecryptedKey(queueObj: QueueObjStartOcr): Promise<string> {
    const encryptionKey = await getEncryptedFileEncKeyApi(queueObj.s3Key);
    let decryptedEncKey: string = "";

    if (encryptionKey !== null) {
      decryptedEncKey = await decryptTxt(encryptionKey, getMainEncryptionKey());
      if (decryptedEncKey === "") {
        throw new PermanentFailureError(`couldnt get encryptionKey from server for ${JSON.stringify(queueObj)}
       as we got an encryption Key but couldnt decrypt it seemingly`);
      }
    } else if (encryptionKey === null && getEncryptAtRestIsTrue() === true) {
      throw new PermanentFailureError(`couldnt get encryptionKey from server for ${JSON.stringify(queueObj)}
       as EncryptAtRest is true but the server has no encryption Key for this file`);
    }
    return decryptedEncKey;
  }

  private async downloadAndDecrypt(
    queueObj: QueueObjStartOcr,
    decryptedEncKey: string | null,
  ): Promise<string> {
    const filename = resolveFilename(queueObj.s3Key);
    let filePath = path.join(this.tempFolder, filename);

    console.log(`[Processor] Downloading: ${queueObj.s3Key} → ${filePath}`);

    try {
      await downloadFileS3(
        this.s3!,
        queueObj.s3Key,
        filePath,
        BucketNames.userUploads,
      );

      filePath = await decryptFileStream(filePath, decryptedEncKey);

      return filePath;
    } catch (err: any) {
      classifyS3Error(err, queueObj.s3Key);
    }
  }

  private async runOcr(
    localPath: string,
    encryptionKey: string | null,
  ): Promise<OcrResult> {
    try {
      return await this.paddle.getOcr(this.s3!, localPath, encryptionKey);
    } finally {
      await fs
        .rm(localPath, { force: true })
        .catch((e) =>
          console.warn(
            `[Processor] Failed to delete temp file: ${localPath}`,
            e,
          ),
        );
    }
  }

  private assertReady(): void {
    if (!this.ready)
      throw new Error("FileProcessor not initialised — call init() first");
  }
}
