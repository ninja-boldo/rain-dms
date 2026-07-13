import path from "path";
import { FileProcessor } from "./workers/FileProcessor";
import "dotenv/config";
import { ImportantDirs } from "./utils/types/main";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.resolve(__dirname, "..");

const root = process.env.ROOT_DIR ?? parentDir;
const consumeFolder =
  process.env.CONSUME_PATH ?? path.join(root, ImportantDirs.consume);
const consumedFolder =
  process.env.CONSUMED_PATH ?? path.join(root, ImportantDirs.consumed);
const tempFolder = process.env.TEMP_PATH ?? path.join(root, ImportantDirs.temp);

const dirs = [root, consumeFolder, consumedFolder, tempFolder];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("initing path", dir);
}

console.log("AMQP:", process.env.AMQP_URL);

await Promise.all([new FileProcessor().init(tempFolder, false, false)]);
