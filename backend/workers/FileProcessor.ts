import "./ocr/pdfjs-polyfill";

import { QueueHandler } from "./QueueConnector";
import {
  ImportantDirs,
  OcrModel,
  OcrResult,
  QueueNames,
} from "../utils/types/main";
import { PaddleJsOcr } from "./ocr/Paddle";
import { TesseractOcr } from "./ocr/Tesseract";
import fs from "fs";
import "dotenv/config";
import {
  downloadFile,
  formatFilename,
  getExtension,
  getFilename,
  sanitizeFilePath,
} from "./ocr/utils";
import { fileURLToPath } from "url";
import path from "path";
export class FileProcessor {
  private PaddleOcrObj: PaddleJsOcr | null = null;
  private TesseractOcrObj: TesseractOcr | null = null;
  private queue: QueueHandler | null = null;
  private tempFolder: string | null = null;

  constructor() {}

  async init(lang: string = "en", tempFolder: string) {
    this.tempFolder = tempFolder;
    this.queue = await QueueHandler.create(process.env.AMQP_URL);
    this.PaddleOcrObj = await new PaddleJsOcr(lang, tempFolder).init();
    this.TesseractOcrObj = await new TesseractOcr(1, "eng").init();

    this.queue.addQueueOnReceive(
      QueueNames.startOcrQueue,
      async (filepath: string) => {
        await this.processDocument(filepath, OcrModel.Paddle);
      },
    );
  }

  async processDocument(
    filepath: string,
    model: OcrModel = OcrModel.Tesseract,
    queueName: QueueNames = QueueNames.consumeOcrOutput,
  ) {
    let result: OcrResult;
    console.log("now processing file with filepath: ", filepath);
    if (filepath === "/") {
      console.log("Ignoring invalid filepath /");
      return;
    }
    const isLocal =
      !filepath.startsWith("http://") && !filepath.startsWith("https://");

    let origServerPath: string | null = null;

    if (isLocal && !fs.existsSync(filepath)) {
      // sanitizeFilePath BEFORE formatFilename so the UUID suffix
      // is appended to an already-truncated name, not a 200-char one
      const safeFilepath = sanitizeFilePath(filepath);
      const newPath = path.join(
        this.tempFolder!,
        "documents",
        await formatFilename(safeFilepath),
      );
      origServerPath = filepath;
      await downloadFile(filepath, newPath, false);
      filepath = newPath;
    }

    const isAvail = isLocal;

    if (!isAvail) {
      fs.mkdirSync("./temp_consume", { recursive: true });
      // Same here — sanitize before building localPath
      const safeFilepath = sanitizeFilePath(filepath);
      const localPath = path.join(
        "./temp_consume",
        `${getFilename(safeFilepath)}.${getExtension(safeFilepath)}`,
      );

      await downloadFile(filepath, localPath, true);
      console.log("downloaded to:", localPath);
      filepath = localPath;
    }
    if (model === OcrModel.Paddle) {
      if (this.PaddleOcrObj === null) {
        throw Error(
          "the PaddleOcrObj in the fileprocessor is null/wasnt initilized correctly",
        );
      }
      result = await this.PaddleOcrObj.getOcr(
        filepath,
        origServerPath,
        !isAvail,
      );
    } else {
      if (this.TesseractOcrObj === null) {
        throw Error(
          "the TesseractOcrObj in the fileprocessor is null/wasnt initilized correctly",
        );
      }
      result = await this.TesseractOcrObj.getDocumentOcr(filepath);
    }

    // Send result to output queue
    if (this.queue === null) {
      throw Error("Queue is not initialized");
    }
    if (!result.pages?.length) {
      console.warn("Skipping OCR result with 0 pages:", filepath);
      return;
    }

    console.log("the result of the ocr has", result.pages.length, " pages");
    await this.queue.sendMsg(result, queueName);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.resolve(__dirname, "..");

const root = process.env.ROOT_DIR ?? parentDir;
const consumeFolder = path.join(root, ImportantDirs.consume);
const consumedFolder = path.join(root, ImportantDirs.consumed);
const tempFolder = path.join(root, ImportantDirs.temp);

const dirs = [root, consumeFolder, consumedFolder, tempFolder];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("initing path", dir);
}

console.log("AMQP:", process.env.AMQP_URL);

await Promise.all([new FileProcessor().init("en", tempFolder)]);
