// workers.ts
import { FileMerger } from "./workers/FileMerger";
import { FileWatcher } from "./workers/FileWatcher";
import { ImportantDirs } from "./utils/types/main";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.resolve(__dirname, "..");
const root = process.env.ROOT_DIR ?? parentDir;
const consumeFolder = path.join(root, ImportantDirs.consume);
const tempFolder = path.join(root, ImportantDirs.temp);
const dirs = [root, consumeFolder, tempFolder];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("Initializing directory:", dir);
}

console.log("AMQP URL:", process.env.AMQP_URL);

const fileMerger = new FileMerger();
const fileWatcher = FileWatcher();

async function start() {
  try {
    await Promise.all([fileMerger.init(), fileWatcher]);
    console.log("All background systems are running.");
  } catch (error) {
    console.error("Critical worker failure during startup:", error);
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
