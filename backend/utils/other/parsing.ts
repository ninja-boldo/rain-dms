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
): Array<{ result: PaddleOcrResult; s3Obj: S3ReturnObj }> {
  if (results.length !== s3Keys.length) {
    throw Error(
      `results array (length ${results.length}) isnt the same length as the s3 keys array (length ${s3Keys.length})`,
    );
  }
  return results.map((result, i) => ({ result, s3Obj: s3Keys[i] }));
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
  mapping: Array<{ result: PaddleOcrResult; s3Obj: S3ReturnObj }>,
  info: FileInfo,
): OcrResult {
  const pages: PageOcr[] = mapping.map(({ result, s3Obj }, pageIndex) =>
    PaddleOcrResToPageOcr(result, s3Obj.s3Key, pageIndex),
  );
  return {
    pages,
    originalFilePath: info.originalFilePath,
    fileHash: info.fileHash,
  };
}
