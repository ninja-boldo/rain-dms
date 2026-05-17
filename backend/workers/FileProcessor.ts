import { QueueHandler } from "./QueueConnector";
import { OcrModel, OcrResult, QueueNames } from "../utils/types/main";
import { PaddleJsOcr } from "./ocr/Paddle";
import { TesseractOcr } from "./ocr/Tesseract";
import fs from "fs";

import "dotenv/config";
import { downloadFile, getExtension, getFilename } from "./ocr/utils";
export class FileProcessor {
  private PaddleOcrObj: PaddleJsOcr | null = null;
  private TesseractOcrObj: TesseractOcr | null = null;
  private queue: QueueHandler | null = null;

  constructor() {}

  async init(lang: string = "en", tempFolder: string) {
    this.queue = await QueueHandler.create(process.env.AMQP_URL);
    this.PaddleOcrObj = await new PaddleJsOcr(lang, tempFolder).init();
    this.TesseractOcrObj = await new TesseractOcr(1, "eng").init();

    this.queue.addQueueOnReceive(QueueNames.startOcrQueue, async (path) => {
      await this.processDocument(path, OcrModel.Paddle);
    });
  }

  async processDocument(
    filepath: string,
    model: OcrModel = OcrModel.Tesseract,
    queueName: QueueNames = QueueNames.consumeOcrOutput,
  ) {
    let result: OcrResult;
    console.log("now processing file with filepath: ", filepath);
    const isAvail = fs.existsSync("/path/to/file");
    if (!isAvail) {
      fs.mkdirSync("./temp_consume", { recursive: true });

      const localPath = `./temp_consume/${getFilename(filepath)}.${getExtension(filepath)}`;

      await downloadFile(filepath, localPath);

      console.log("downloaded to:", localPath);

      filepath = localPath;
    }
    if (model === OcrModel.Paddle) {
      if (this.PaddleOcrObj === null) {
        throw Error(
          "the PaddleOcrObj in the fileprocessor is null/wasnt initilized correctly",
        );
      }
      result = await this.PaddleOcrObj.getOcr(filepath, !isAvail);
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
