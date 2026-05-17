import chokidar from "chokidar";
import { fdir } from "fdir";
import { QueueHandler } from "./QueueConnector";
import "dotenv/config";
import { QueueNames, ImportantDirs } from "../utils/types/main";
import fs from "fs";
import path from "path";

export const FileWatcher = async (rootPath: string) => {
  const root = path.resolve(rootPath);

  if (!root) {
    throw new Error("ROOT_DIR is not defined");
  }

  const consumeFolder = path.join(root, ImportantDirs.consume);
  const consumedFolder = path.join(root, ImportantDirs.consumed);
  const tempFolder = path.join(root, ImportantDirs.temp);

  const dirs = [root, consumeFolder, consumedFolder, tempFolder];

  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("initing path", dir);
  }

  const queueHandlerObj = await QueueHandler.create(process.env.AMQP_URL);

  // check the full dir tree
  const api = new fdir().withFullPaths().crawl(consumeFolder);
  api.withPromise().then((files) => {
    files.map((file) => {});
  });

  // watch for mods to the root path
  const allowedExt = [".pdf", ".png", ".jpeg"];
  chokidar
    .watch(consumeFolder, {
      awaitWriteFinish: true,
      atomic: true,
      ignored: (f, stats) =>
        (stats ? stats.isFile() : false) &&
        !allowedExt.some((ext) => f.endsWith(ext)),
    })
    .on("add", async (path) => {
      console.log(path);
      await queueHandlerObj.sendMsg(path, QueueNames.startOcrQueue);
    });
};
