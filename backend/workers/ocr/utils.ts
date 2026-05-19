import { Screenshot } from "pdf-parse";
import { pdfToImg } from "pdftoimg-js";
import { ImageLike } from "tesseract.js";

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
import path from "path";
import { writeFile } from "fs/promises";

export const pdfToImgPages = async (
  filePath: string,
  baseTempDir: string,
): Promise<string[]> => {
  if (!filePath) {
    throw new Error("ArgumentError: File path is required.");
  }

  try {
    const images: string[] = await pdfToImg(filePath, {
      pages: "all",
      imgType: "jpg",
      scale: 2,
      background: "white",
    });

    // FAST PARALLEL WRITE (bounded)
    const results = new Array(images.length);

    await Promise.all(
      images.map(async (img, i) => {
        const base64 = img.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64, "base64");

        const filePath = path.join(
          baseTempDir,
          `${Date.now()}_${i}_${crypto.randomUUID()}.jpg`,
        );

        await writeFile(filePath, buffer);
        results[i] = filePath;
      }),
    );

    return results;
  } catch (error) {
    throw new Error(
      `failed for this filepath: ${filePath} with this error: ${error}`,
    );
  }
};

export const formatFilename = async (filepath: string): Promise<string> => {
  const ext = getExtension(filepath);
  const name = getFilename(filepath);

  const suffix = `-${uuidv4()}-${new Date().toISOString().replace(/:/g, "-")}`;
  const suffixBytes = Buffer.byteLength(suffix + "." + ext, "utf8");

  // Leave room for suffix + extension, hard cap at 200 bytes total name
  const allowedNameBytes = 200 - suffixBytes;

  let truncated = name;
  while (Buffer.byteLength(truncated, "utf8") > allowedNameBytes) {
    truncated = [...truncated].slice(0, -1).join("");
  }

  return `${truncated}${suffix}.${ext}`;
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
  const boxes: BoxOcr[] = line.map((singleCell) => {
    // 1. Maintain the fully original "line" box for strict backwards compatibility
    const originalBox: BoxOcr = {
      text: singleCell.text,
      confidence: singleCell.confidence,
      boundingBox: convertPaddleBox(singleCell.box),
      words: [],
    };

    // 2. Compute the sub-word bounding boxes
    const words = singleCell.text.split(" ");
    const totalChars = singleCell.text.length;

    if (totalChars > 0) {
      const boxWidth = singleCell.box.width;
      const pxPerChar = boxWidth / totalChars;
      let currentX = singleCell.box.x;

      words.forEach((word) => {
        if (!word) return;
        const wordWidth = word.length * pxPerChar;

        originalBox.words!.push({
          text: word,
          confidence: singleCell.confidence,
          boundingBox: {
            upLeftPoint: { x: currentX, y: singleCell.box.y },
            downRightPoint: {
              x: currentX + wordWidth,
              y: singleCell.box.y + singleCell.box.height,
            },
          },
        });

        currentX += wordWidth + pxPerChar;
      });
    }

    return originalBox;
  });

  return { boxes };
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

export const getFilename = (fullFilepath: string): string => {
  return path.parse(fullFilepath).name;
};

export const getExtension = (fullFilepath: string): string => {
  // for /../../test.ts this would return ts
  return path.parse(fullFilepath).ext.slice(1);
};

export function sanitizeFilePath(
  inputPath: string,
  maxNameBytes: number = 200,
): string {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const name = path.basename(inputPath, ext);

  const sanitizedName = name
    .replace(/\s+/g, "_")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  // Truncate to maxNameBytes, accounting for the extension
  const extBytes = Buffer.byteLength(ext, "utf8");
  const allowedNameBytes = maxNameBytes - extBytes;

  let truncated = sanitizedName || "unnamed";
  while (Buffer.byteLength(truncated, "utf8") > allowedNameBytes) {
    // Slice by char to avoid cutting mid-surrogate-pair
    truncated = [...truncated].slice(0, -1).join("");
  }

  return path.join(dir, truncated + ext);
}

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

export const sanitizeUrl = (url: string): string => {
  // Remove all occurrences of "http://", "https://", "http//", "https//" at the start of the string
  const cleaned = url.replace(/^(?:https?:\/\/?)+/gi, "");

  // If "https" was present anywhere in the original prefix, prefer it
  const isHttps = url.toLowerCase().includes("https");
  const proto = isHttps ? "https://" : "http://";

  return `${proto}${cleaned}`;
};

export async function deleteFileApi(serverPath: string) {
  const url = sanitizeUrl(
    `${process.env.BASE_SITE_URL}:3000/delete/consume?filepath=${encodeURIComponent(serverPath)}`,
  );
  const res = await fetch(url, { method: "delete" });
}

export async function downloadFile(
  serverPath: string,
  outputPath: string,
  deleteAfterDown: boolean = false,
) {
  const url = sanitizeUrl(
    `${process.env.BASE_SITE_URL}:3000/download/consume?filepath=${encodeURIComponent(serverPath)}`,
  );
  console.log(`Downloading from url: ${url}`);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Download failed: ${res.status} for URL ${url}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  await fs.mkdir(path.dirname(outputPath), {
    recursive: true,
  });
  await fs.writeFile(outputPath, buffer);
  if (deleteAfterDown) {
    await deleteFileApi(serverPath);
  }
  return outputPath;
}

export const toArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  const ab = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(ab).set(buffer);
  return ab;
};

export async function uploadFiles(paths: string[] = []) {
  const form = new FormData();

  for (const filePath of paths) {
    const buffer = await fs.readFile(filePath);

    const file = new File([buffer], path.basename(filePath));

    form.append("file", file);
  }

  const url = sanitizeUrl(`${process.env.BASE_SITE_URL}:3000/upload/temp`);
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return await res.json();
}

export const imgFilepathToArrayBuffer = async (
  filepath: string,
): Promise<ArrayBuffer> => {
  const buffer = await fs.readFile(filepath);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
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
