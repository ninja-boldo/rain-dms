import { Box, PaddleOcrResult } from "ppu-paddle-ocr";
import {
  BoundingBoxOcr,
  BoxOcr,
  FileInfo,
  LineOcr,
  OcrResult,
  PageOcr,
  S3ReturnObj,
} from "../types/main";

export function createOcrMapping(
  results: PaddleOcrResult[],
  s3Keys: S3ReturnObj[],
): Map<PaddleOcrResult, S3ReturnObj> {
  if (results.length !== s3Keys.length) {
    throw Error(
      `results array (length ${results.length}) isnt the same length as the the s3 keys array (length ${s3Keys.length})`,
    );
  }
  const mapping = new Map<PaddleOcrResult, S3ReturnObj>();

  for (let i = 0; i < results.length; i++) {
    mapping.set(results[i], s3Keys[i]);
  }

  return mapping;
}

function convertPaddleBoxToCustom(box: Box): BoundingBoxOcr {
  return {
    upLeftPoint: { x: box.x, y: box.y },
    downRightPoint: { x: box.x + box.width, y: box.y + box.height },
  };
}

export function PaddleOcrResToPageOcr(
  res: PaddleOcrResult,
  bannerImgKey: string,
  pageIdx: number,
): PageOcr {
  const lines: LineOcr[] = [];

  for (const line of res.lines) {
    const boxes: BoxOcr[] = [];
    for (const box of line) {
      boxes.push({
        boundingBox: convertPaddleBoxToCustom(box.box),
        confidence: box.confidence,
        text: box.text,
      });
    }
    lines.push({ boxes: boxes });
  }
  const page: PageOcr = {
    pageNumber: pageIdx,
    lines,
    bannerImgpath: bannerImgKey,
  };
  return page;
}

export function PaddleOcrResultsToOcrRes(
  mapping: Map<PaddleOcrResult, S3ReturnObj>,
  info: FileInfo,
): OcrResult {
  const pages: PageOcr[] = [];
  let pageIndex = 0;

  for (const [rawResult, s3Obj] of mapping) {
    const page = PaddleOcrResToPageOcr(rawResult, s3Obj.s3Key, pageIndex);
    pages.push(page);
    pageIndex++;
  }

  return {
    pages,
    originalFilePath: info.originalFilePath,
    fileHash: info.fileHash,
  };
}
