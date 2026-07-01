import { PaddleOcrService, V6_TINY_MODEL } from "ppu-paddle-ocr";
import { writeFileSync } from "fs";

const imgPaths: string[] = JSON.parse(process.argv[2]);
const workerIdx: number = Number(process.argv[3]);
const outFile: string = process.argv[4];
const threadsPerProcess: number = Number(process.argv[5]);
const verbose: boolean = false;

const svc = new PaddleOcrService({
  model: V6_TINY_MODEL,
  debugging: { debug: false, verbose: false },
  session: {
    executionProviders: ["cpu"],
    graphOptimizationLevel: "all",
    interOpNumThreads: threadsPerProcess,
    intraOpNumThreads: threadsPerProcess,
    executionMode: "sequential",
  },
  processing: { engine: "opencv" },
});
await svc.initialize();

const results = await svc.batchRecognize(
  await Promise.all(imgPaths.map((p) => Bun.file(p).arrayBuffer())),
  {
    strategy: "per-box",
    flatten: false,
    onProgress: (done, total) => {
      if (verbose) {
        console.error(`[worker-${workerIdx}] ${done}/${total}`);
      }
    },
  },
);

writeFileSync(outFile, JSON.stringify(results));
Bun.gc();
