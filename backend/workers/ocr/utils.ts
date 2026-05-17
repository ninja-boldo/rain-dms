import { PDFParse, Screenshot } from "pdf-parse";
import { ImageLike } from "tesseract.js";
const { createCanvas, loadImage } = require("canvas");
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import {
  BoundingBoxOcr,
  BoxOcr,
  FileTypes,
  LineOcr,
  OcrResult,
  PageOcr,
} from "../../utils/types/main";
import { Box, PaddleOcrResult, RecognitionResult } from "ppu-paddle-ocr";
import "dotenv/config";
import { error } from "console";
import path from "path";

export const pdfToPngPages = async (filePath: string) => {
  const parser = new PDFParse({ url: filePath });

  const result = await parser.getScreenshot({
    scale: 2,
  });

  await parser.destroy();

  return result.pages;
};

export const screenshotToPaddleComp = async (s: Screenshot) => {
  const buffer = Buffer.from(s.data);

  const img = await loadImage(buffer);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);

  return canvas;
};

const convertPaddleBox = (paddleBox: Box): BoundingBoxOcr => {
  const parsedBox: BoundingBoxOcr = {
    upLeftPoint: { x: paddleBox.x, y: paddleBox.y },
    downRightPoint: {
      x: paddleBox.x + paddleBox.width,
      y: paddleBox.y + paddleBox.height,
    },
  };
  return parsedBox;
};
const parseRawLine = (line: RecognitionResult[]): LineOcr => {
  const boxes: BoxOcr[] = line.map((singleCell) => ({
    text: singleCell.text,
    confidence: singleCell.confidence,
    boundingBox: convertPaddleBox(singleCell.box),
  }));
  const lineParsed: LineOcr = { boxes: boxes };
  return lineParsed;
};
const parseRawLines = (linesRaw: RecognitionResult[][]): LineOcr[] => {
  const newLines: LineOcr[] = linesRaw.map((lineRaw) => parseRawLine(lineRaw));
  return newLines;
};

export const parseRawPagesPaddleOcr = async (
  rawPages: {
    [imgFilePath: string]: PaddleOcrResult;
  },
  filepath: string,
): Promise<OcrResult> => {
  const pages: PageOcr[] = [];
  for (const pageFilepath of Object.keys(rawPages)) {
    const ocrRes: PaddleOcrResult = rawPages[pageFilepath];
    const lines = ocrRes.lines;

    pages.push({ lines: parseRawLines(lines), bannerImgpath: pageFilepath });
  }
  return { pages: pages, originalFilePath: filepath };
};

const getLastElement = <T>(arr: T[]): T => {
  const arrLength: number = arr.length;
  return arr[arrLength - 1];
};

export const getFilename = (fullFilepath: string): string => {
  return path.parse(fullFilepath).name;
};

export const getExtension = (fullFilepath: string): string => {
  return path.parse(fullFilepath).ext.slice(1);
};

export const convertImgPathToUrl = (path: string): string => {
  const filename = getFilename(path);
  const ext = getExtension(path);
  const baseUrl: string = process.env.BASE_SITE_URL;
  const nginxPort: number = 7701;
  if (!baseUrl) {
    throw Error(
      "couldnt retrieve base site url from the .env file(should be something like http://192.168.1.163) ",
    );
  }
  return `${baseUrl}:${nginxPort.toString()}/uploads/${filename}.${ext}`;
};

export const saveImgToTemp = async (
  data: Uint8Array,
  filepathBase: string = `${process.env.ROOT_DIR}/temp/banner_imgs`,
  filename: string | null = null,
  fileExt: FileTypes,
) => {
  if (fileExt === FileTypes.pdf) {
    throw new Error(
      "you cant use the file extension .pdf here. only .png and .jpeg are supported",
    );
  }
  if (filename === null) {
    const currentDate = new Date();
    const isoString = currentDate.toISOString();
    const cleanTime = isoString.split(".")[0];
    const timestamp = cleanTime.replace(/:/g, "-");

    filename = `${uuidv4()}_${timestamp}`;
  }

  const filepath = `${filepathBase}/${filename}${fileExt}`;
  await fs.writeFile(filepath, Buffer.from(data));
  console.log(`Saved to ${filepath}`);
  return filepath;
};

export const isFilepath = (s: string): boolean => {
  return !s.startsWith("http");
};

export async function downloadFile(serverPath: string, outputPath: string) {
  const res = await fetch(
    `http://localhost:3000/download/consume?filepath=${encodeURIComponent(serverPath)}`,
  );

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  await fs.writeFile(outputPath, buffer);
}

export const toArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
};

export async function uploadFiles(paths: string[] = []) {
  const form = new FormData();

  for (const filePath of paths) {
    const buffer = await fs.readFile(filePath);

    const file = new File([buffer], path.basename(filePath));

    form.append("file", file);
  }

  const res = await fetch("http://localhost:3000/upload/temp", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return await res.json();
}

export const imgFilepathToCanvas = async (filepath: string) => {
  const img = await loadImage(filepath);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);

  return canvas;
};

export const screenshotToImageLike = (s: Screenshot): ImageLike => {
  if (s.data && s.data.length) return Buffer.from(s.data);

  if (s.dataUrl && s.dataUrl.startsWith("data:")) {
    return s.dataUrl;
  }

  if (s.dataUrl) {
    return `data:image/png;base64,${s.dataUrl}`;
  }

  throw new Error("Screenshot missing usable data");
};
