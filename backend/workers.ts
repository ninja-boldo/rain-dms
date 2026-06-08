import path from "path";
import { FileMerger } from "./workers/FileMerger";
import { FileProcessor } from "./workers/FileProcessor";
import { FileWatcher } from "./workers/FileWatcher";
import "dotenv/config";
import { ImportantDirs } from "./utils/types/main";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.resolve(__dirname, "..");

const root = process.env.ROOT_DIR ?? parentDir;
const consumeFolder = path.join(root, ImportantDirs.consume);
const tempFolder = path.join(root, ImportantDirs.temp);

const dirs = [root, consumeFolder, tempFolder];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("initing path", dir);
}

console.log("AMQP:", process.env.AMQP_URL);

await Promise.all([
  Promise.resolve(FileWatcher(root)),

  new FileProcessor().init(tempFolder),

  new FileMerger().init(),
]);
