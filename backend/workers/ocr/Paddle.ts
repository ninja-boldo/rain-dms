import os from "os";
import { promises as fs } from "fs";
import path from "path";
import { Worker } from "worker_threads";
import pLimit from "p-limit";
import pc from "picocolors";
import { OcrResult, PageOcr, LineOcr } from "../../utils/types/main";
import { uploadManyS3, pdfToImgPages, imgToWebp, hashFile } from "./utils";
import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

const MAX_WORKERS = process.env.MAX_WORKERS
  ? parseInt(process.env.MAX_WORKERS)
  : 1;
const CORE_FACTOR = 0.5;
const factoredCoreCount = Math.round(os.cpus().length * CORE_FACTOR);
const WORKER_COUNT = Math.max(1, Math.min(MAX_WORKERS, factoredCoreCount));
const WEBP_CONCURRENCY = Math.min(2, os.cpus().length);
const PDF_DPI = 100;
const webpLimit = pLimit(WEBP_CONCURRENCY);

interface PendingOcr {
  resolve: (results: any[]) => void;
  reject: (err: Error) => void;
}

class OcrWorker {
  private readonly worker: Worker;
  private readonly pending = new Map<number, PendingOcr>();
  private nextId = 0;
  private readonly readyPromise: Promise<void>;

  constructor() {
    this.worker = new Worker(new URL("./paddle-worker.ts", import.meta.url));
    let markReady!: () => void;
    this.readyPromise = new Promise<void>((res) => (markReady = res));

    this.worker.on("message", (msg: any) => {
      if (msg.type === "ready") {
        markReady();
        return;
      }

      const { id, ok, results, error, fatal } = msg;
      const handler = this.pending.get(id);
      if (!handler) return;
      this.pending.delete(id);

      if (ok) {
        handler.resolve(results);
      } else {
        if (fatal) {
          console.error(
            pc.bold(
              pc.red(
                "❌ [CRITICAL] Kreuzberg native binding corrupted — exiting",
              ),
            ),
          );
          process.exit(1);
        }
        handler.reject(new Error(error));
      }
    });

    this.worker.on("error", (err) => {
      console.error(pc.red("[OcrWorker] Uncaught worker error:"), err);
      for (const h of this.pending.values()) h.reject(err);
      this.pending.clear();
      process.exit(1);
    });

    this.worker.on("exit", (code) => {
      if (code === 0) return;
      const err = new Error(`OcrWorker exited with code ${code}`);
      for (const h of this.pending.values()) h.reject(err);
      this.pending.clear();
      process.exit(1);
    });
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
  private readonly readyPromise: Promise<void>;

  constructor(count: number) {
    this.workers = Array.from({ length: count }, () => new OcrWorker());
    this.readyPromise = Promise.all(this.workers.map((w) => w.ready())).then(
      () => {},
    );
  }

  ready(): Promise<void> {
    return this.readyPromise;
  }

  async runAll(paths: string[]): Promise<any[]> {
    if (paths.length === 0) return [];
    const activeCount = Math.min(this.workers.length, paths.length);
    const chunkSize = Math.ceil(paths.length / activeCount);

    const chunkPromises = Array.from({ length: activeCount }, (_, i) => {
      const chunk = paths.slice(i * chunkSize, (i + 1) * chunkSize);
      return this.workers[i].run(chunk);
    });

    return (await Promise.all(chunkPromises)).flat();
  }

  terminate(): void {
    for (const w of this.workers) w.terminate();
  }
}

export class PaddleJsOcr {
  private readonly tempFolder: string;
  private readonly pool: OcrWorkerPool;

  constructor(tempFolder: string) {
    this.tempFolder = tempFolder;
    this.pool = new OcrWorkerPool(WORKER_COUNT);
  }

  async warmup(): Promise<void> {
    await fs.mkdir(this.tempFolder, { recursive: true });
    await this.pool.ready();
  }

  private memMB(): number {
    return Math.round(process.memoryUsage().rss / 1024 / 1024);
  }

  async getOcr(s3: S3Client, filePath: string): Promise<OcrResult> {
    const fileHash: string = await hashFile(filePath);
    const isPdf = filePath.toLowerCase().endsWith(".pdf");
    await fs.mkdir(this.tempFolder, { recursive: true });

    const globalStart = performance.now();
    const baseName = path.basename(filePath);

    // --- IMAGE MODE ---
    if (!isPdf) {
      const ocrPromise = this.pool.runAll([filePath]);
      const webpPath = await imgToWebp(filePath, false);
      const [s3Url] = await uploadManyS3(s3, [webpPath], true);
      const [rawRes] = await ocrPromise;

      if (typeof Bun !== "undefined" && typeof Bun.gc === "function")
        Bun.gc(true);

      return {
        pages: [this.mapPageTokens(rawRes, 1, s3Url)],
        originalFilePath: filePath,
        fileHash,
      };
    }

    // --- PDF MODE ---
    let jpgPaths: string[] = [];
    const popplerStart = performance.now();

    try {
      jpgPaths = await pdfToImgPages(filePath, this.tempFolder, PDF_DPI);
    } catch (err: any) {
      await fs.rm(filePath, { force: true }).catch(() => {});
      throw new Error(`UNREADABLE_PDF_CORRUPTION: ${err.message}`);
    }

    const popplerMs = performance.now() - popplerStart;
    const totalPages = jpgPaths.length;

    if (totalPages === 0) {
      await fs.rm(filePath, { force: true }).catch(() => {});
      return { pages: [], originalFilePath: filePath, fileHash };
    }

    const popplerDir = path.dirname(jpgPaths[0]);
    const activeWorkers = Math.min(WORKER_COUNT, totalPages);

    console.log(
      [
        pc.cyan(
          `┌── PADDLE OCR LOADING ────────────────────────────────────────────────`,
        ),
        `│ ${pc.bold("DOC:")} ${pc.white(baseName)} │ ${pc.bold("PAGES:")} ${pc.yellow(totalPages)} │ ${pc.bold("WORKERS:")} ${pc.green(`${activeWorkers}/${WORKER_COUNT}`)} │ ${pc.bold("RAM:")} ${pc.magenta(this.memMB() + "MB")} │ ${pc.bold("POPPLER:")} ${pc.gray((popplerMs / 1000).toFixed(2) + "s")}`,
        pc.cyan(
          `└──────────────────────────────────────────────────────────────────────`,
        ),
      ].join("\n"),
    );

    try {
      const pipelineStart = performance.now();

      const rawResults = await this.pool.runAll(jpgPaths);
      const webpUploadPromise = Promise.all(
        jpgPaths.map((p) => webpLimit(() => imgToWebp(p, true))),
      ).then((webpPaths) => uploadManyS3(s3, webpPaths, true));

      const finalPageUrls = await webpUploadPromise;
      const pipelineMs = performance.now() - pipelineStart;

      const pages: PageOcr[] = rawResults.map((rawRes, idx) =>
        this.mapPageTokens(rawRes, idx + 1, finalPageUrls[idx] ?? ""),
      );

      if (typeof Bun !== "undefined" && typeof Bun.gc === "function")
        Bun.gc(true);

      console.log(
        [
          pc.green(
            `┌── OCR COMPLETE ──────────────────────────────────────────────────────`,
          ),
          `│ ${pc.bold("DOC:")} ${pc.white(baseName)} (${pc.yellow(totalPages)}p) │ ${pc.bold("RAM:")} ${pc.magenta(this.memMB() + "MB")} │ ${pc.bold("TIME:")} Pip: ${pc.cyan((pipelineMs / 1000).toFixed(2) + "s")} ∥ Tot: ${pc.bold(pc.green(((performance.now() - globalStart) / 1000).toFixed(2) + "s"))}`,
          pc.green(
            `└──────────────────────────────────────────────────────────────────────`,
          ),
        ].join("\n"),
      );

      return { pages, originalFilePath: filePath, fileHash };
    } finally {
      await fs.rm(popplerDir, { recursive: true, force: true }).catch(() => {});
      await fs.rm(filePath, { force: true }).catch(() => {});
    }
  }

  private mapPageTokens(
    rawRes: any,
    pageNumber: number,
    bannerImgpath: string,
  ): PageOcr {
    const rawElements: any[] = rawRes?.ocrElements ?? rawRes?.elements ?? [];

    const lines: LineOcr[] = rawElements.map((el): LineOcr => {
      const points: number[][] = el.geometry?.points ?? [];

      let minX = 0,
        minY = 0,
        maxX = 0,
        maxY = 0;
      if (points.length > 0) {
        const xs = points.map((p) => p[0]);
        const ys = points.map((p) => p[1]);
        minX = Math.min(...xs);
        maxX = Math.max(...xs);
        minY = Math.min(...ys);
        maxY = Math.max(...ys);
      }

      return {
        boxes: [
          {
            text: el.text ?? el.content ?? "",
            confidence: el.confidence?.recognition ?? null,
            boundingBox: {
              upLeftPoint: { x: minX, y: minY },
              downRightPoint: { x: maxX, y: maxY },
            },
          },
        ],
      };
    });

    return { pageNumber, lines, bannerImgpath };
  }
}
