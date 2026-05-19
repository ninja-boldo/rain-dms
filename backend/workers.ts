import "./workers/ocr/pdfjs-polyfill";

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
const consumedFolder = path.join(root, ImportantDirs.consumed);
const tempFolder = path.join(root, ImportantDirs.temp);

const dirs = [root, consumeFolder, consumedFolder, tempFolder];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log("initing path", dir);
}

console.log("AMQP:", process.env.AMQP_URL);

await Promise.all([
  Promise.resolve(
    FileWatcher(
      "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms",
    ),
  ),

  //new FileProcessor().init("en", tempFolder),

  new FileMerger(consumedFolder).init(),
]);
