import { S3Client } from "@aws-sdk/client-s3";

export enum OcrModel {
  Paddle = "paddleocr",
  Tesseract = "tesseract",
  EasyOcr = "easyocr",
}

export enum PaddleModelTier {
  mobile = "mobile",
  server = "server",
}

export enum FileTypes {
  jpeg = ".jpeg",
  png = ".png",
  pdf = ".pdf",
}

export type BatchImgBuffered = {
  buffer: Buffer;
  outputPath: string;
  idx: number;
};

export type BatchImgWritten = {
  outputPath: string;
  idx: number;
};
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
  pageNumber: number;
  lines: LineOcr[];
  bannerImgpath: string;
}

export interface OcrResult {
  pages: PageOcr[];
  originalFilePath: string;
  fileHash: string;
}

export interface FileInfo {
  originalFilePath: string;
  fileHash: string;
}

export const ImportantDirs = {
  consume: "consume_files",
  temp: "temp",
  consumed: "consumed_files",
} as const;

export const StatsTableKeys = {
  totalPages: "pages_known_to_system",
  totalDocuments: "files_known_to_system",
};
export interface RawBlockNormalized {
  text: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface QueueObjStartOcr {
  s3Key: string;
  username: string;
  spawnedTime: string;
  originalConsumePath: string;
  isEncrypted: boolean;
}
export interface QueueObjProcessOcrResult {
  result: OcrResult;
  username: string;
  spawnedTime: string;
  isEncrypted: boolean;
  originalFileKey: string;
  originalConsumePath: string;
}

export interface S3ReturnObj {
  s3Key: string;
  spawnedTimeIso: string;
}
export interface PasswordWithTimeSalt {
  timestampStr: string;
  iv: string;
  authTag: string;
  encrypted: string;
}

export interface CompositeKey {
  spawnTimeIso: string;
  username: string;
  key: string;
}

export const ApiPaths = {
  getEncryptedFileEncKey: "/internal/get_file_enc_key",
  checkHashExists: "/check/hash_exists",
  checkUserExists: "/check/user_exists",
};

export const BucketNames = {
  userUploads: "uploads",
  bannerImgs: "banner-imgs",
};

export abstract class BaseOcrProcessor {
  constructor(protected readonly tempFolder: string) {}

  abstract getOcr(
    filePath: string,
    encryptionKey: string | null,
  ): Promise<OcrResult>;

  protected abstract processImage(
    filePath: string,
    fileHash: string,
    encrypt: boolean,
    key: string | null,
    rmImg: boolean,
  ): Promise<OcrResult>;

  protected abstract processPdf(
    filePath: string,
    fileHash: string,
    encrypt: boolean,
    rmPdf: boolean,
  ): Promise<OcrResult>;
}

export enum OsType {
  Linux,
  Windows,
  MacOS,
  Unknown,
}
