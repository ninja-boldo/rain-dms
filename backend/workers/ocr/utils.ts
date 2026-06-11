import fs from "fs/promises";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import os from "os";
import {
  BoxOcr,
  FileTypes,
  LineOcr,
  OcrResult,
  PageOcr,
} from "../../utils/types/main";

import path from "path";
import { Poppler } from "node-poppler";
import "dotenv/config";
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

const crypto = require("crypto");
import { sign } from "jsonwebtoken";
import { ExtractionResult } from "@kreuzberg/node";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { documentsTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import pLimit from "p-limit";

const maxConcurrentUploadsS3 = pLimit(5);
const poppler = new Poppler();

/* ---------------------------
   FILE PATH HELPERS
----------------------------*/

export const changeFilenameForPath = (
  filepath: string | undefined,
  newFilename: string,
) => {
  if (!filepath) return newFilename;
  return path.join(path.dirname(filepath), newFilename);
};

export const getFilename = (p: string | undefined) => {
  if (!p) return "";
  return path.parse(p).name;
};

export const getExtension = (p: string | undefined) => {
  if (!p) return "";
  return path.parse(p).ext.slice(1);
};

/* ---------------------------
   URL / AUTH HELPERS
----------------------------*/

export const sanitizeUrl = (url: string): string => {
  return `https://${url.replace(/^(?:https?:\/\/?)+/gi, "")}`;
};

/* ---------------------------
   AUTH HEADER (cached JWT)
----------------------------*/
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;
const TOKEN_TTL_S = 60;

export function getAuthHeader(): Headers {
  const secret =
    process.env.CLUSTER_WORKER_SECRET ?? "celestialisabadplaceholder";
  const now = Math.floor(Date.now() / 1000);

  // Regenerate token dynamically if it is close to expiring
  if (!_cachedToken || now >= _tokenExpiresAt - 60) {
    _tokenExpiresAt = now + TOKEN_TTL_S;
    _cachedToken = sign(
      {
        exp: _tokenExpiresAt,
        role: "worker",
        iss: "rain-dms-watcher",
      },
      secret,
    );
  }

  const h = new Headers();
  // Pass the secure token via a custom channel so it doesn't conflict with S3 signatures
  h.append("X-Auth-Token", _cachedToken);
  return h;
}

/* ---------------------------
   IMAGE → WEBP
----------------------------*/
export const imgToWebp = async (
  origFilepath: string,
  inplace: boolean = true,
  quality: number = 90,
): Promise<string> => {
  const newFilename = `${getFilename(origFilepath)}.webp`;
  const newPath = changeFilenameForPath(origFilepath, newFilename);

  await sharp(origFilepath).webp({ quality }).toFile(newPath);

  if (inplace) {
    await fs.rm(origFilepath, { force: true }).catch(() => {});
  }

  return newPath;
};

/* ---------------------------
   PDF → IMAGES
----------------------------*/

const PARALLEL_THRESHOLD = 20;
const RE_PAGE_NUM = /-(\d+)\.(?:jpg|jpeg)$/i;

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

  const dirFiles = await fs.readdir(dir);
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

  const stats = await fs.stat(filePath);
  if (!stats.isFile()) throw new Error("Path is not a file");
  if (stats.size < 100) throw new Error("Invalid PDF (too small)");

  const outputDir = path.join(baseTempDir, uuidv4());
  await fs.mkdir(outputDir, { recursive: true });

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
    chunks.map(({ dir }) => fs.mkdir(dir, { recursive: true })),
  );

  const chunkPaths = await Promise.all(
    chunks.map(({ start, end, dir }) =>
      renderPdfChunk(filePath, dir, dpi, start, end),
    ),
  );

  return chunkPaths.flat();
};

/* ---------------------------
   FILENAME FORMATTING
----------------------------*/
export const formatFilename = (
  filepath: string,
  basePathToRemove?: string | null | undefined,
): string => {
  const key =
    basePathToRemove && filepath.startsWith(basePathToRemove)
      ? filepath.slice(basePathToRemove.length)
      : filepath;

  const { dir, name, ext } = path.parse(key);

  const suffix = `-${uuidv4()}-${new Date().toISOString().replace(/:/g, "-")}`;
  const prefix = dir ? `${dir}/` : "";

  const allowedBytes = 1024 - Buffer.byteLength(prefix + suffix + ext, "utf8");

  let truncated = name;

  while (Buffer.byteLength(truncated, "utf8") > allowedBytes) {
    truncated = [...truncated].slice(0, -1).join("");
  }

  return `${prefix}${truncated}${suffix}${ext}`;
};

export function prependImgKey(imgKey: string): string {
  const s3Prepend = "/s3/";
  if (!imgKey.startsWith(s3Prepend)) {
    return `${s3Prepend}${imgKey}`;
  }
  return imgKey;
}
/* ---------------------------
   PATH SANITIZER
----------------------------*/

function replaceUmlauts(str: string): string {
  const umlautMap: Record<string, string> = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };
  return str.replace(/[äöüÄÖÜß]/g, (match) => umlautMap[match]);
}

export function sanitizeFilePath(
  inputPath: string,
  maxNameBytes: number = 200,
  appendUuid: boolean = false,
): string {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const name = path.basename(inputPath, ext);

  let sanitizedName = name
    .replace(/\s+/g, "_")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  sanitizedName = replaceUmlauts(sanitizedName);

  if (appendUuid) sanitizedName += "-" + uuidv4();

  const extBytes = Buffer.byteLength(ext, "utf8");
  const allowed = maxNameBytes - extBytes;

  let truncated = sanitizedName || "unnamed";
  while (Buffer.byteLength(truncated, "utf8") > allowed) {
    truncated = [...truncated].slice(0, -1).join("");
  }

  return path.join(dir, truncated + ext);
}

/* ---------------------------
   KREUZBERG RESULT PARSING
----------------------------*/

const mapLineToBoxOcr = (line: any): BoxOcr => {
  // Types.ts states PaddleOCR geometry targets OcrBoundingGeometryQuadrilateral (points: number[][])
  const points: number[][] = line.geometry?.points ?? [];

  let minX = 0,
    minY = 0,
    maxX = 0,
    maxY = 0;

  if (points.length > 0) {
    minX = maxX = points[0][0];
    minY = maxY = points[0][1];

    for (let i = 1; i < points.length; i++) {
      const x = points[i][0];
      const y = points[i][1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  } else if (line.geometry?.type === "rectangle") {
    minX = line.geometry.left;
    minY = line.geometry.top;
    maxX = minX + line.geometry.width;
    maxY = minY + line.geometry.height;
  }

  return {
    text: line.text ?? "",
    confidence: line.confidence?.recognition ?? null,
    boundingBox: {
      upLeftPoint: { x: minX, y: minY },
      downRightPoint: { x: maxX, y: maxY },
    },
  };
};

const mapPage = (
  pageNumber: number,
  bannerImgpath: string,
  elements: any[],
): PageOcr => {
  return {
    pageNumber,
    bannerImgpath,
    lines: elements.map(
      (line: any): LineOcr => ({
        boxes: [mapLineToBoxOcr(line)],
      }),
    ),
  };
};

export const parseRawPagesKreuzberg = async (
  nativeResult: ExtractionResult,
  finalPageUrls: string[],
  originalFilePath: string,
  hash: string,
): Promise<OcrResult> => {
  // Types.ts maps granular line blocks strictly to the root ocrElements sequence
  const globalElements = nativeResult.ocrElements ?? [];
  const rawPages = nativeResult.pages ?? [];

  let pages: PageOcr[] = [];

  if (rawPages.length > 0) {
    pages = rawPages.map((page: any, idx: number) => {
      const pageNum = page.pageNumber ?? idx + 1;
      const pageElements = globalElements.filter(
        (el: any) => el.pageNumber === pageNum,
      );
      return mapPage(pageNum, finalPageUrls[idx] ?? "", pageElements);
    });
  } else {
    pages = [mapPage(1, finalPageUrls[0] ?? "", globalElements)];
  }

  return { pages, originalFilePath, fileHash: hash };
};

/* ---------------------------
   FILE API (download / upload / delete)
----------------------------*/
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export function getS3Client(): S3Client {
  const client = new S3Client({
    region: "us-east-1",
    endpoint: process.env.S3_ENDPOINT!.replace(/\/$/, ""),
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "rain-dms",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "rain-dms",
    },
  });
  console.warn(
    "using this s3 endpoint url: ",
    process.env.S3_ENDPOINT!.replace(/\/$/, ""),
  );

  client.middlewareStack.add(
    (next) => async (args) => {
      const req = args.request as any;

      // Inject auth headers
      getAuthHeader().forEach((value, key) => {
        req.headers[key] = value;
      });

      if (process.env.S3_VERBOSE === "true") {
        console.log("[S3_REQUEST]");
        console.log("  → method:", req.method);
        console.log("  → protocol:", req.protocol);
        console.log("  → hostname:", req.hostname);
        console.log("  → path:", req.path);

        // full reconstructed URL (best-effort)
        const url = `${req.protocol}//${req.hostname}${req.path}`;
        console.log("  → url:", url);
      }

      return next(args);
    },
    { step: "finalizeRequest", priority: "low", name: "authHeaderMiddleware" },
  );

  return client;
}

export const uploadGenericS3 = async (
  client: S3Client,
  bucket: string,
  objectKey: string,
  fileData: any,
  mimeType?: string,
  verbose: boolean = true,
): Promise<void> => {
  if (!fileData) {
    throw new Error(`[S3_UPLOAD_ERROR] No file data provided.`);
  }

  let binaryPayload: Uint8Array;

  if (fileData instanceof Uint8Array) {
    binaryPayload = fileData;
  } else if (fileData instanceof ArrayBuffer) {
    binaryPayload = new Uint8Array(fileData);
  } else if (Buffer.isBuffer(fileData)) {
    binaryPayload = new Uint8Array(fileData);
  } else if (
    fileData &&
    typeof fileData === "object" &&
    fileData.buffer instanceof ArrayBuffer
  ) {
    binaryPayload = new Uint8Array(
      fileData.buffer,
      fileData.byteOffset,
      fileData.byteLength,
    );
  } else {
    throw new Error(
      `[S3_UPLOAD_ERROR] Unsupported data type. Must be Buffer, ArrayBuffer, or Uint8Array. Got: ${fileData?.constructor?.name}`,
    );
  }

  const byteLength = binaryPayload.byteLength;

  if (byteLength === 0) {
    throw new Error(
      `[S3_UPLOAD_ERROR] Refusing to upload 0-byte ghost file for key: "${objectKey}"`,
    );
  }

  const startTime = performance.now();
  const sizeMb = (byteLength / (1024 * 1024)).toFixed(2);

  if (verbose) {
    console.log(`[S3_UPLOAD_START]`);
    console.log(`  → Bucket : ${bucket}`);
    console.log(`  → Key    : ${objectKey}`);
    console.log(`  → Size   : ${sizeMb} MB`);
    console.log(`  → Type   : ${mimeType ?? "unknown"}`);
  }

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: binaryPayload,
        ContentLength: byteLength,
        ...(mimeType && { ContentType: mimeType }),
      }),
    );

    const duration = (performance.now() - startTime) / 1000;
    const speed = (parseFloat(sizeMb) / duration).toFixed(2);

    if (verbose) {
      console.log(`[S3_UPLOAD_SUCCESS]`);
      console.log(`  → Key    : ${objectKey}`);
      console.log(`  → Time   : ${duration.toFixed(3)}s`);
      console.log(`  → Speed  : ${speed} MB/s`);
    }
  } catch (error: any) {
    console.error(`[S3_UPLOAD_FAILED] ${objectKey}`);
    console.error(error?.message ?? error);
    throw error;
  }
};

export async function uploadManyS3(
  client: S3Client,
  files: string[],
  deleteAfterUpload: boolean = false,
): Promise<string[]> {
  const keys = await Promise.all(
    files.map((filepath) =>
      maxConcurrentUploadsS3(async () => {
        const objectKey = await formatFilename(filepath);
        const fileBuffer = await fs.readFile(filepath);
        await uploadGenericS3(client, "uploads", objectKey, fileBuffer);
        return objectKey;
      }),
    ),
  );
  if (deleteAfterUpload) {
    await Promise.all(files.map((f) => fs.rm(f)));
  }
  return keys;
}

export const initBuckets = async (client: S3Client): Promise<void> => {
  const buckets = ["uploads"];
  await Promise.all(
    buckets.map(async (bucket) => {
      try {
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
      } catch (err: any) {
        if (
          err?.name !== "BucketAlreadyExists" &&
          err?.name !== "BucketAlreadyOwnedByYou"
        ) {
          throw err;
        }
      }
    }),
  );
};

export async function downloadFileS3(
  client: S3Client,
  key: string,
  outputPath: string,
  bucket: string = "uploads",
): Promise<string> {
  const response = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  if (!response.Body) {
    throw new Error("No response body returned from S3");
  }

  await pipeline(
    response.Body as unknown as NodeJS.ReadableStream,
    createWriteStream(outputPath),
  );

  return outputPath;
}
/* ---------------------------
   TEMP IMAGE SAVE
----------------------------*/

export const saveImgToTemp = async (
  data: Uint8Array,
  filepathBase: string = `${process.env.ROOT_DIR}/temp/banner_imgs`,
  filename: string | null = null,
  fileExt: FileTypes,
): Promise<string> => {
  if (fileExt === FileTypes.pdf) throw new Error("PDF not allowed here");

  const name = filename ?? `${uuidv4()}_${Date.now()}`;
  const filepath = path.join(filepathBase, `${name}${fileExt}`);

  await fs.mkdir(filepathBase, { recursive: true });
  await fs.writeFile(filepath, Buffer.from(data));

  return filepath;
};

/* ---------------------------
   FILE UTILS
----------------------------*/
export const fileHashExistsServer = async (
  db: NodePgDatabase<any>,
  fileHash: string,
): Promise<boolean> => {
  const cleanHash = String(fileHash).trim();

  const result = await db
    .select({ id: documentsTable.file_id })
    .from(documentsTable)
    .where(eq(documentsTable.fileHash, cleanHash))
    .limit(1);

  return result.length > 0;
};

export const fileHashAlreadyExistingApi = async (
  fileHash: string,
): Promise<boolean> => {
  const res = await fetch(`${process.env.BASE_SERVER_URL}/check/hash_exists`, {
    headers: getAuthHeader(),
    method: "POST",
    body: JSON.stringify({ hash: fileHash }),
  });

  if (!res.ok) {
    throw new Error(`Hash check API failed: ${res.status} ${res.statusText}`);
  }
  const resJson = await res.json();
  return resJson.exists;
};

export async function hashFile(
  filepath: string,
  bytesToHash: number = 16777216,
): Promise<string> {
  const fileHandle = await fs.open(filepath, "r");
  try {
    const buffer = Buffer.alloc(bytesToHash);
    const { bytesRead } = await fileHandle.read(buffer, 0, bytesToHash, 0);

    const hash = crypto.createHash("sha256");
    hash.update(buffer.subarray(0, bytesRead));
    return hash.digest("hex");
  } finally {
    await fileHandle.close();
  }
}

export const isFilepath = (s: string) => !s.startsWith("http");

export const bufferToArrayBuffer = (buf: Buffer): ArrayBuffer =>
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

export const imgFilepathToArrayBuffer = async (
  filepath: string,
): Promise<ArrayBuffer> => bufferToArrayBuffer(await fs.readFile(filepath));
