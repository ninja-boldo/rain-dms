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
