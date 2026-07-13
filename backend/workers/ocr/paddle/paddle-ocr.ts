import { promises as fs } from "fs";
import "dotenv/config";
import {
  BaseOcrProcessor,
  OcrResult,
  S3ReturnObj,
} from "../../../utils/types/main";
import { hashFile } from "../../../utils/trust/cryptography";
import {
  createOcrMapping,
  PaddleOcrResToPageOcr,
  PaddleOcrResultsToOcrRes,
} from "../../../utils/other/parsing";
import {
  PaddleOcrResult,
  PaddleOcrService,
  V6_MEDIUM_MODEL,
  V6_TINY_MODEL,
} from "ppu-paddle-ocr";
import { ImageHandler } from "../ImageHandler";
import { chunkArray, mockS3Obj, mockS3Objs } from "../../../utils/other/utils";
import { printOcrStats } from "../../../utils/other/debuggingHelpers";
const cliProgress = require("cli-progress");
import os from "os";

export class PaddleJsOcr extends BaseOcrProcessor {
  private modelUsed: Readonly<{
    detection: string;
    recognition: string;
    charactersDictionary: string;
  }> = V6_TINY_MODEL;

  protected service = new PaddleOcrService({
    model: this.modelUsed,
    debugging: {
      debug: false,
      verbose: false,
    },
    session: {
      executionProviders: ["cpu"],
      graphOptimizationLevel: "all",
      enableCpuMemArena: true,
      enableMemPattern: true,
      executionMode: "parallel",
    },
    processing: { engine: "opencv" },
  });
  protected IMG_DPI: number = 120;
  protected ImageHandler: ImageHandler;
  protected lastInferenceStart: Date;
  protected localDevMode: boolean;
  protected verboseStats: boolean;
  protected progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );

  protected maxPossibleWorkers: number = 4;
  protected numProcesses: number =
    process.env.ocrProcesses !== undefined
      ? parseInt(process.env.ocrProcesses)
      : Math.min(
          this.maxPossibleWorkers,
          Math.max(2, Math.floor(os.cpus().length)),
        );

  protected chunkSize: number = 32 * this.numProcesses;
  protected minShardSizeForPool: number = 8;

  constructor(
    protected readonly tempFolder: string,
    localDevMode: boolean = false,
    verboseStats: boolean = false,
  ) {
    super(tempFolder);

    this.ImageHandler = new ImageHandler(tempFolder, this.IMG_DPI);
    this.lastInferenceStart = new Date();
    this.localDevMode = localDevMode;
    this.verboseStats = verboseStats;
    console.log(`using ${this.numProcesses} workers`);
  }

  async init() {
    await this.service.initialize();
    if (this.localDevMode === false) {
      await this.ImageHandler.init();
    } else {
      console.warn(
        "running in local dev mode and therefore not interacting with s3(doesnt down or upload)",
      );
    }
  }

  checkImageHandler() {
    if (this.ImageHandler === null && this.localDevMode === false) {
      throw Error("failed to init Image Handler");
    }
  }

  protected async ocrImage(imgPath: string): Promise<PaddleOcrResult> {
    const file = Bun.file(imgPath);
    const buffer = await file.arrayBuffer();

    const result = await this.service.recognize(buffer, {
      noCache: false,
      flatten: false,
      strategy: "per-line",
    });
    return result;
  }

  protected async ocrImageChunkLocal(
    imgPaths: string[],
  ): Promise<PaddleOcrResult[]> {
    const results = await this.service.batchRecognize(
      await Promise.all(imgPaths.map((p) => Bun.file(p).arrayBuffer())),
      {
        strategy: "per-box",
        flatten: false,
      },
    );
    return results as PaddleOcrResult[];
  }

  protected async ocrImageChunk(
    imgPaths: string[],
  ): Promise<PaddleOcrResult[]> {
    if (imgPaths.length < this.minShardSizeForPool) {
      return await this.ocrImageChunkLocal(imgPaths);
    }

    const shardSize = Math.ceil(imgPaths.length / this.numProcesses);
    const shards: string[][] = [];
    for (let i = 0; i < imgPaths.length; i += shardSize) {
      shards.push(imgPaths.slice(i, i + shardSize));
    }

    const threadsPerProcess = 1;
    const shardResults = await Promise.all(
      shards.map(async (shard, idx) => {
        const outFile = `${this.tempFolder}/shard-${idx}-${Date.now()}.json`;

        const proc = Bun.spawn(
          [
            "bun",
            "run",
            "workers/ocr/paddle/ocr-subprocess.ts",
            JSON.stringify(shard),
            idx.toString(),
            outFile,
            threadsPerProcess.toString(),
            JSON.stringify(this.modelUsed),
          ],
          { stdout: "inherit", stderr: "inherit" },
        );

        await proc.exited;

        const raw = await Bun.file(outFile).text();
        await fs.rm(outFile, { force: true }).catch(() => {});

        return {
          idx,
          result: JSON.parse(raw) as PaddleOcrResult[],
        };
      }),
    );

    const orderedShards: PaddleOcrResult[][] = [];

    for (const { idx, result } of shardResults) {
      orderedShards[idx] = result;
    }

    console.log("shardResults: ", JSON.stringify(shardResults));
    return orderedShards.flat();
  }

  protected async cleanup(filePath: string, rmFile: boolean) {
    try {
      await Promise.all([
        this.ImageHandler.clearDanglingImages(),
        rmFile ? fs.rm(filePath, { force: true }).catch(() => {}) : undefined,
      ]);
    } catch {}
  }

  async getOcr(
    filePath: string,
    encryptionKey: string | null,
    rmFile: boolean = true,
  ): Promise<OcrResult> {
    this.lastInferenceStart = new Date();
    const hasKey = !!encryptionKey?.trim();
    const hash = await hashFile(filePath);
    await fs.mkdir(this.tempFolder, { recursive: true });

    return filePath.toLowerCase().endsWith(".pdf")
      ? this.processPdf(filePath, hash, hasKey, rmFile)
      : this.processImage(filePath, hash, hasKey, encryptionKey, rmFile);
  }

  protected async processImage(
    filePath: string,
    fileHash: string,
    encrypt: boolean,
    key: string | null,
    rmImg: boolean,
  ): Promise<OcrResult> {
    try {
      const webpImgPath: string = await this.ImageHandler.imgToWebp(
        filePath,
        true,
      );
      const res: PaddleOcrResult = await this.ocrImage(webpImgPath);
      const s3Obj: S3ReturnObj =
        this.localDevMode === false
          ? await this.ImageHandler.uploadToS3Single(webpImgPath)
          : mockS3Obj();

      const ocrRes: OcrResult = {
        pages: [PaddleOcrResToPageOcr(res, s3Obj.s3Key, 0)],
        originalFilePath: filePath,
        fileHash,
      };
      printOcrStats(ocrRes, { verbose: this.verboseStats });
      return ocrRes;
    } finally {
      await this.cleanup(filePath, rmImg);
    }
  }

  protected async processPdf(
    filePath: string,
    fileHash: string,
    encrypt: boolean,
    rmPdf: boolean,
  ): Promise<OcrResult> {
    try {
      this.checkImageHandler();
      const imgPaths: string[] = await this.ImageHandler.convertPdfToImgs(
        filePath,
        true,
      );

      const arrayChunks: string[][] = chunkArray(imgPaths, this.chunkSize);
      const rawResults: PaddleOcrResult[] = [];
      this.progressBar.start(arrayChunks.length, 0);
      for (const chunk of arrayChunks) {
        const results: PaddleOcrResult[] = await this.ocrImageChunk(chunk);
        rawResults.push(...results);
        this.progressBar.increment();
      }

      const s3Objs: S3ReturnObj[] =
        this.localDevMode === false
          ? await this.ImageHandler.uploadToS3Many(imgPaths)
          : mockS3Objs(imgPaths.length);

      const mapping: Map<PaddleOcrResult, S3ReturnObj> = createOcrMapping(
        rawResults,
        s3Objs,
      );
      Bun.gc();

      const ocrRes: OcrResult = PaddleOcrResultsToOcrRes(mapping, {
        originalFilePath: filePath,
        fileHash: fileHash,
      });

      printOcrStats(ocrRes, {
        verbose: this.verboseStats,
        startTime: this.lastInferenceStart,
      });
      return ocrRes;
    } finally {
      await this.cleanup(filePath, rmPdf);
    }
  }

  shutdown() {
    Bun.gc();
  }
}
