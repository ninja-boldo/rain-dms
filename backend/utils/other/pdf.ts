import { v4 as uuidv4 } from "uuid";
import { changeFilenameForPath, getFilename } from "./pathHelpers";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import Poppler from "node-poppler";
import os from "node:os";

const poppler = new Poppler("/usr/bin");
const PARALLEL_THRESHOLD = 20;
const RE_PAGE_NUM = /-(\d+)\.(?:jpg|jpeg)$/i;

export const imgToWebp = async (
  origFilepath: string,
  inplace: boolean = true,
  quality: number = 90,
): Promise<string> => {
  const newFilename = `${getFilename(origFilepath)}.webp`;
  const newPath = changeFilenameForPath(origFilepath, newFilename);

  await sharp(origFilepath).webp({ quality }).toFile(newPath);

  if (inplace) {
    await fs.promises.rm(origFilepath, { force: true }).catch(() => {});
  }

  return newPath;
};

async function renderPdfChunk(
  filePath: string,
  dir: string,
  dpi: number,
  firstPage?: number,
  lastPage?: number,
): Promise<string[]> {
  const filePrefix = `page-${uuidv4()}`;
  const targetPrefixPath = path.join(dir, filePrefix);

  const opts: Record<string, unknown> = {
    jpegFile: true,
    resolutionXAxis: dpi,
    resolutionYAxis: dpi,
  };
  if (firstPage !== undefined) opts.firstPageToConvert = firstPage;
  if (lastPage !== undefined) opts.lastPageToConvert = lastPage;

  await poppler.pdfToCairo(filePath, targetPrefixPath, opts);

  const dirFiles = await fs.promises.readdir(dir);
  return dirFiles
    .filter((f) => f.startsWith(filePrefix) && RE_PAGE_NUM.test(f))
    .map((f) => ({ f, n: parseInt(f.match(RE_PAGE_NUM)![1], 10) }))
    .sort((a, b) => a.n - b.n)
    .map(({ f }) => path.join(dir, f));
}

export const pdfToImgPages = async function (
  filePath: string,
  baseTempDir: string,
  dpi: number = 100,
): Promise<string[]> {
  if (!filePath) throw new Error("ArgumentError: File path is required.");

  const stats = await fs.promises.stat(filePath);
  if (!stats.isFile()) throw new Error("Path is not a file");
  if (stats.size < 100) throw new Error("Invalid PDF (too small)");

  const outputDir = path.join(baseTempDir, uuidv4());
  await fs.promises.mkdir(outputDir, { recursive: true });

  const numCpus = os.cpus().length;

  let totalPages: number | null = null;
  if (numCpus > 1) {
    try {
      const info = (await poppler.pdfInfo(filePath)) as string;
      const m = info.match(/Pages:\s+(\d+)/i);
      if (m) totalPages = parseInt(m[1], 10);
    } catch {}
  }

  const useParallel =
    totalPages !== null && totalPages > PARALLEL_THRESHOLD && numCpus > 1;

  if (!useParallel) {
    return renderPdfChunk(filePath, outputDir, dpi);
  }

  const numChunks = Math.min(numCpus, Math.ceil(totalPages! / 10));
  const chunkSize = Math.ceil(totalPages! / numChunks);

  const chunks = Array.from({ length: numChunks }, (_, i) => {
    const start = 1 + i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, totalPages!);
    return { start, end, dir: path.join(outputDir, `c${i}`) };
  });

  await Promise.all(
    chunks.map(({ dir }) => fs.promises.mkdir(dir, { recursive: true })),
  );

  const chunkPaths = await Promise.all(
    chunks.map(({ start, end, dir }) =>
      renderPdfChunk(filePath, dir, dpi, start, end),
    ),
  );

  return chunkPaths.flat();
};

export const bufferToArrayBuffer = (buf: Buffer): ArrayBuffer =>
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

export const imgFilepathToArrayBuffer = async (
  filepath: string,
): Promise<ArrayBuffer> =>
  bufferToArrayBuffer(await fs.promises.readFile(filepath));
