// workers.ts
import { FileMerger } from "./workers/FileMerger";
import { FileWatcher } from "./workers/FileWatcher";
import { ImportantDirs } from "./utils/types/main";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { inspect } from "util";
import { getS3Client, initBuckets } from "./workers/ocr/utils";
import { S3Client } from "@aws-sdk/client-s3";
import { getConsumePath } from "./utils/utils";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.resolve(__dirname, "..");
const root = process.env.ROOT_DIR ?? parentDir;
const consumeFolder = getConsumePath();
const tempFolder = path.join(root, ImportantDirs.temp);
const dirs = [root, consumeFolder, tempFolder];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("Initializing directory:", dir);
}

console.log("AMQP URL:", process.env.AMQP_URL);

const fileMerger = new FileMerger();
const fileWatcher = FileWatcher();

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function start() {
  try {
    const waitTime: number = 10000;
    console.log(`waiting for ${waitTime} ms`);
    await timeout(waitTime);

    console.log("Initializing systems...");

    const s3: S3Client = await getS3Client();
    await initBuckets(s3);
    await timeout(2500);

    const [merger, watcher] = await Promise.allSettled([
      fileMerger.init(),
      fileWatcher,
    ]);

    if (merger.status === "rejected" || watcher.status === "rejected") {
      if (merger.status === "rejected") {
        console.error(
          "❌ fileMerger failed:",
          inspect(merger.reason, { depth: null, colors: true }),
        );
      }
      if (watcher.status === "rejected") {
        console.error(
          "❌ fileWatcher failed:",
          inspect(watcher.reason, { depth: null, colors: true }),
        );
      }
      throw new Error("Startup aborted.");
    }

    console.log("🚀 All background systems running.");
  } catch (error) {
    console.error("💥 Critical startup failure:");
    console.error(
      error instanceof Error
        ? error.stack
        : inspect(error, { depth: null, colors: true }),
    );
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM. Shutting down gracefully...");
  await fileMerger.shutdown();
  process.exit(0);
});

start().catch((err) => {
  console.error("Unhandled error in start():", err);
  process.exit(1);
});
