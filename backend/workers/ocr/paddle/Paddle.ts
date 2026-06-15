import os from "os";
import { promises as fs } from "fs";
import path from "path";
import { Worker } from "worker_threads";
import pLimit from "p-limit";
import pc from "picocolors";
import { BucketNames, OcrResult } from "../../../utils/types/main";
import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { encryptFileStream, hashFile } from "../../../utils/trust/cryptography";
import { imgToWebp, pdfToImgPages } from "../../../utils/other/pdf";
import { uploadManyS3 } from "../../../utils/other/s3Helpers";
import { mapRawResultToPage } from "../../../utils/other/parsing";

const MAX_SYS_WORKERS = Math.round(os.cpus().length * 0.3) - 1;
const WORKER_COUNT = 1;
const WEBP_CONCURRENCY = Math.min(4, os.cpus().length);
const PDF_DPI = 110;
const BATCH_SIZE = 24;

function ts(): string {
  return new Date().toISOString();
}

function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function memMB(): number {
  return Math.round(process.memoryUsage().rss / 1024 / 1024);
}

interface PendingOcr {
  resolve: (results: any[]) => void;
  reject: (err: Error) => void;
}

class OcrWorker {
  private readonly worker: Worker;
  private readonly pending = new Map<number, PendingOcr>();
  private nextId = 0;
  private readonly readyPromise: Promise<void>;

  constructor(private readonly index: number) {
    this.worker = new Worker(new URL("./paddle-worker.ts", import.meta.url));

    let markReady!: () => void;
    this.readyPromise = new Promise<void>((res) => (markReady = res));

    this.worker.on("message", (msg: any) => this.handleMessage(msg, markReady));
    this.worker.on("error", (err) => this.handleError(err));
    this.worker.on("exit", (code) => this.handleExit(code));
  }

  private handleMessage(msg: any, markReady: () => void) {
    if (msg.type === "ready") {
      markReady();
      return;
    }

    const { id, ok, results, error, fatal } = msg;
    const handler = this.pending.get(id);
    if (!handler) return;
    this.pending.delete(id);

    if (fatal) {
      console.error(
        `${ts()} ${pc.bold(pc.red("[FATAL]"))} Worker ${this.index} — Kreuzberg native binding corrupted`,
      );
      process.exit(1);
    }

    ok ? handler.resolve(results) : handler.reject(new Error(error));
  }

  private handleError(err: Error) {
    console.error(
      `${ts()} ${pc.red(`[Worker ${this.index}]`)} Uncaught error:`,
      err.message,
    );
    this.rejectAll(err);
    process.exit(1);
  }

  private handleExit(code: number) {
    if (code === 0) return;
    const err = new Error(`Worker ${this.index} exited with code ${code}`);
    this.rejectAll(err);
    process.exit(1);
  }

  private rejectAll(err: Error) {
    for (const h of this.pending.values()) h.reject(err);
    this.pending.clear();
  }

  ready(): Promise<void> {
    return this.readyPromise;
  }

  run(paths: string[]): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      const id = ++this.nextId;
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, paths });
    });
  }

  terminate(): void {
    this.worker.terminate();
  }
}

class OcrWorkerPool {
  private readonly workers: OcrWorker[];
  private readonly queues: Promise<any>[];

  constructor(count: number) {
    this.workers = Array.from({ length: count }, (_, i) => new OcrWorker(i));
    this.queues = this.workers.map(() => Promise.resolve());
  }

  ready(): Promise<void> {
    return Promise.all(this.workers.map((w) => w.ready())).then(() => {});
  }

  async runAll(paths: string[]): Promise<any[]> {
    if (paths.length === 0) return [];

    const batches = Array.from(
      { length: Math.ceil(paths.length / BATCH_SIZE) },
      (_, i) => paths.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE),
    );

    const results: Promise<any[]>[] = batches.map((batch, i) => {
      const wi = i % this.workers.length;
      const task = this.queues[wi].then(() => this.workers[wi].run(batch));
      this.queues[wi] = task.catch(() => {});
      return task;
    });

    return (await Promise.all(results)).flat();
  }

  terminate(): void {
    for (const w of this.workers) w.terminate();
  }
}

export class PaddleJsOcr {
  private readonly tempFolder: string;
  private readonly pool: OcrWorkerPool;
  private readonly webpLimit = pLimit(WEBP_CONCURRENCY);

  constructor(tempFolder: string) {
    this.tempFolder = tempFolder;
    this.pool = new OcrWorkerPool(WORKER_COUNT);
  }

  async warmup(): Promise<void> {
    const t0 = performance.now();
    await fs.mkdir(this.tempFolder, { recursive: true });

    // Force model download on the main thread before workers start.
    // The blank base64 PNG doesn't trigger model download — a real JPEG does.
    const seedPath = path.join(this.tempFolder, "_warmup_seed.jpg");
    try {
      const { default: sharp } = await import("sharp");
      await sharp({
        create: {
          width: 64,
          height: 64,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .jpeg()
        .toFile(seedPath);

      console.log(
        `${ts()} ${pc.cyan("[OCR]")} pre-downloading PaddleOCR models on main thread...`,
      );
      const { batchExtractFilesSync } = await import("@kreuzberg/node");
      batchExtractFilesSync([seedPath], {
        outputFormat: "plain",
        ocr: {
          backend: "paddle-ocr",
          elementConfig: {
            includeElements: true,
            minLevel: "line",
            minConfidence: 0.5,
            buildHierarchy: false,
          },
          paddleOcrConfig: { recBatchNum: 6, detLimitSideLen: 960 },
        },
      });
      console.log(
        `${ts()} ${pc.green("[OCR]")} models ready — ${fmtMs(performance.now() - t0)}`,
      );
    } catch (e) {
      console.warn(
        `${ts()} ${pc.yellow("[OCR]")} model pre-download failed (non-fatal):`,
        e,
      );
    } finally {
      await fs.rm(seedPath, { force: true }).catch(() => {});
    }

    // Workers will now find models cached and won't race to download them.
    await this.pool.ready();

    console.log(
      `${ts()} ${pc.green("[OCR]")} ${WORKER_COUNT} worker(s) ready — warmup ${fmtMs(performance.now() - t0)} | RAM ${memMB()}MB`,
    );
  }

  private gcIfAvailable(): void {
    if (typeof Bun !== "undefined" && typeof Bun.gc === "function")
      Bun.gc(true);
  }

  async getOcr(
    s3: S3Client,
    filePath: string,
    encryptionKey: string | null,
  ): Promise<OcrResult> {
    const shouldEncrypt = encryptionKey !== null && encryptionKey.trim() !== "";
    const fileHash = await hashFile(filePath);
    const isPdf = filePath.toLowerCase().endsWith(".pdf");

    await fs.mkdir(this.tempFolder, { recursive: true });

    return isPdf
      ? this.processPdf(s3, filePath, fileHash, shouldEncrypt)
      : this.processImage(s3, filePath, fileHash, shouldEncrypt, encryptionKey);
  }

  private async processImage(
    s3: S3Client,
    filePath: string,
    fileHash: string,
    shouldEncrypt: boolean,
    encryptionKey: string | null,
  ): Promise<OcrResult> {
    const t0 = performance.now();
    const baseName = path.basename(filePath);

    console.log(
      `${ts()} ${pc.cyan("[OCR]")} image — ${baseName} | RAM ${memMB()}MB`,
    );

    const ocrPromise = this.pool.runAll([filePath]);

    let webpPath = await imgToWebp(filePath, false);
    if (shouldEncrypt)
      webpPath = await encryptFileStream(webpPath, encryptionKey);

    const [[rawRes], [s3ReturnObj]] = await Promise.all([
      ocrPromise,
      uploadManyS3(s3, [webpPath], true, BucketNames.bannerImgs),
    ]);

    this.gcIfAvailable();

    console.log(
      `${ts()} ${pc.green("[OCR]")} image done — ${baseName} | total ${fmtMs(performance.now() - t0)} | RAM ${memMB()}MB`,
    );

    return {
      pages: [mapRawResultToPage(rawRes, 1, s3ReturnObj.s3Key)],
      originalFilePath: filePath,
      fileHash,
    };
  }

  private async processPdf(
    s3: S3Client,
    filePath: string,
    fileHash: string,
    shouldEncrypt: boolean,
  ): Promise<OcrResult> {
    const t0 = performance.now();
    const baseName = path.basename(filePath);

    const tPoppler = performance.now();
    let jpgPaths: string[];
    try {
      jpgPaths = await pdfToImgPages(filePath, this.tempFolder, PDF_DPI);
    } catch (err: any) {
      await fs.rm(filePath, { force: true }).catch(() => {});
      throw new Error(`UNREADABLE_PDF_CORRUPTION: ${err.message}`);
    }
    const popplerMs = performance.now() - tPoppler;

    const totalPages = jpgPaths.length;

    if (totalPages === 0) {
      await fs.rm(filePath, { force: true }).catch(() => {});
      console.warn(
        `${ts()} ${pc.yellow("[OCR]")} ${baseName} — 0 pages after rasterisation`,
      );
      return { pages: [], originalFilePath: filePath, fileHash };
    }

    const activeWorkers = Math.min(
      WORKER_COUNT,
      Math.ceil(totalPages / BATCH_SIZE),
    );
    const batches = Math.ceil(totalPages / BATCH_SIZE);

    console.log(
      [
        `${ts()} ${pc.cyan("┌─ PDF OCR START")}`,
        `${ts()} ${pc.cyan("│")} doc:${pc.white(baseName)} pages:${pc.yellow(totalPages)} batches:${batches} workers:${pc.green(`${activeWorkers}/${WORKER_COUNT}`)} poppler:${fmtMs(popplerMs)} RAM:${memMB()}MB`,
      ].join("\n"),
    );

    const popplerDir = path.dirname(jpgPaths[0]);

    try {
      const tPipeline = performance.now();

      const [rawResults, webpPaths] = await this.runOcrAndConvert(
        jpgPaths,
        shouldEncrypt,
      ).finally(() =>
        Promise.all(
          jpgPaths.map((p) => fs.rm(p, { force: true }).catch(() => {})),
        ),
      );

      const ocrMs = performance.now() - tPipeline;

      const tUpload = performance.now();
      const s3Objects = await uploadManyS3(
        s3,
        webpPaths,
        true,
        BucketNames.bannerImgs,
      );
      const uploadMs = performance.now() - tUpload;

      const pages = rawResults.map((raw, i) =>
        mapRawResultToPage(raw, i + 1, s3Objects[i].s3Key ?? ""),
      );

      const totalMs = performance.now() - t0;
      const msPerPage = totalMs / totalPages;

      this.gcIfAvailable();

      console.log(
        [
          `${ts()} ${pc.green("│")} poppler:${fmtMs(popplerMs)} ocr+webp:${fmtMs(ocrMs)} s3:${fmtMs(uploadMs)} total:${pc.bold(fmtMs(totalMs))} avg/page:${fmtMs(msPerPage)} RAM:${memMB()}MB`,
          `${ts()} ${pc.green("└─ PDF OCR DONE")} ${pc.white(baseName)} — ${pc.yellow(totalPages)}p ✓`,
        ].join("\n"),
      );

      return { pages, originalFilePath: filePath, fileHash };
    } finally {
      await fs.rm(popplerDir, { recursive: true, force: true }).catch(() => {});
      await fs.rm(filePath, { force: true }).catch(() => {});
    }
  }

  private async runOcrAndConvert(
    jpgPaths: string[],
    shouldEncrypt: boolean,
  ): Promise<[any[], string[]]> {
    return Promise.all([
      this.pool.runAll(jpgPaths),
      Promise.all(
        jpgPaths.map((p) =>
          this.webpLimit(async () => {
            const webpPath = await imgToWebp(p, false, 90);
            if (!shouldEncrypt) return webpPath;
            return encryptFileStream(
              webpPath,
              process.env.CLUSTER_WORKER_SECRET,
              null,
              true,
            );
          }),
        ),
      ),
    ]);
  }
}
