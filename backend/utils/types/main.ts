export enum OcrModel {
  Paddle = "paddle",
  Tesseract = "tesseract",
}

export enum PaddleRecognitionModel {
  PP_OCRv5_mobile_en = "PP-OCRv5-mobile-en",
  PP_OCRv5_mobile_de = "PP-OCRv5-mobile-de",
}

export enum FileTypes {
  jpeg = ".jpeg",
  png = ".png",
  pdf = ".pdf",
}

export interface QueueStats {
  queue: string;

  // RabbitMQ broker stats
  messages: number;
  readyMessages: number;
  unackedMessages: number;

  consumers: number;
  busyConsumers: number;
  idleConsumers: number;

  // Local worker stats
  published: number;
  consumed: number;
  acked: number;
  nacked: number;

  inFlightMessages: number;

  // Rates
  publishRatePerSec: number;
  consumeRatePerSec: number;
  ackRatePerSec: number;
  nackRatePerSec: number;

  // Timing
  clientUptimeMs: number;
  createdAt: number;
  lastMessageAt: number | null;

  // Health
  processingBacklog: boolean;
}

export enum QueueNames {
  startOcrQueue = "ocr_handling_input",
  consumeOcrOutput = "ocr_handling_output",
}

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBoxOcr {
  upLeftPoint: Point;
  downRightPoint: Point;
}

export interface BoxOcr {
  text: string;
  confidence: number | null;
  boundingBox: BoundingBoxOcr;
  words?: BoxOcr[];
}

export interface LineOcr {
  boxes: BoxOcr[];
}

export interface PageOcr {
  lines: LineOcr[];
  bannerImgpath: string;
}

export interface OcrResult {
  pages: PageOcr[];
  originalFilePath: string;
}

export const ImportantDirs = {
  consume: "consume_files",
  temp: "temp",
  consumed: "consumed_files",
} as const;
