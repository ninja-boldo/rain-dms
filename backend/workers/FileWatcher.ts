import watcher from "@parcel/watcher";
import { fdir } from "fdir";
import PQueue from "p-queue";
import pRetry, { AbortError } from "p-retry";
import { QueueHandler } from "./QueueConnector";
import "dotenv/config";
import { QueueNames } from "../utils/types/main";
import fs from "fs";
import os from "os";
import {
  fileHashAlreadyExistingApi,
  formatFilename,
  getS3Client,
  hashFile,
  initBuckets,
  sanitizeFilePath,
  uploadGenericS3,
} from "./ocr/utils";
import { S3Client } from "@aws-sdk/client-s3";

const CONCURRENCY = parseInt(
  process.env.UPLOAD_CONCURRENCY ?? String(os.cpus().length),
);
const RETRIES = parseInt(process.env.UPLOAD_RETRIES ?? "3");
const DEBOUNCE_MS = parseInt(process.env.WATCH_DEBOUNCE_MS ?? "150");
const ALLOWED_EXT = [".pdf", ".png", ".jpeg"];

async function processFile(
  path: string,
  s3: S3Client,
  queue: QueueHandler,
  basePath: string,
): Promise<void> {
  const hash = await hashFile(path);
  const isAlreadyProcessed = await fileHashAlreadyExistingApi(hash);
  if (isAlreadyProcessed) {
    return;
  }
  const sanitizedFilepath = sanitizeFilePath(path);
  let finalPath = sanitizedFilepath;

  if (path !== sanitizedFilepath) {
    try {
      await fs.promises.rename(path, sanitizedFilepath);
    } catch {
      finalPath = path;
    }
  }

  await pRetry(
    async () => {
      let objectKey: string;
      let fileBuffer: Buffer;

      try {
        objectKey = await formatFilename(finalPath, basePath);
        fileBuffer = await fs.promises.readFile(finalPath);
      } catch (err: any) {
        if (err?.code === "ENOENT") throw new AbortError(err);
        throw err;
      }

      await uploadGenericS3(s3, "uploads", objectKey, fileBuffer);
      await queue.sendMsg(objectKey, QueueNames.startOcrQueue);
      await fs.promises.unlink(finalPath);
    },
    {
      retries: RETRIES,
      minTimeout: 500,
      factor: 2,
      onFailedAttempt: (err) =>
        console.error(
          `[retry ${err.attemptNumber}/${RETRIES + 1}] ${finalPath}: ${err.message}`,
        ),
    },
  );
}

export const FileWatcher = async (): Promise<void> => {
  const {
    CONSUME_PATH: consumeFolder,
    CONSUMED_PATH: consumedFolder,
    TEMP_PATH: tempFolder,
  } = process.env;

  if (!consumeFolder || !consumedFolder || !tempFolder) {
    throw new Error(
      `Missing env vars — CONSUME_PATH=${consumeFolder}, CONSUMED_PATH=${consumedFolder}, TEMP_PATH=${tempFolder}`,
    );
  }

  await Promise.all(
    [consumeFolder, consumedFolder, tempFolder].map((d) =>
      fs.promises.mkdir(d, { recursive: true }),
    ),
  );

  const s3 = getS3Client();
  const queueHandler = await QueueHandler.create(process.env.AMQP_URL);
  const pq = new PQueue({ concurrency: CONCURRENCY });
  await initBuckets(s3);

  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  const enqueue = (path: string): void => {
    if (!ALLOWED_EXT.some((ext) => path.endsWith(ext))) return;
    clearTimeout(pending.get(path));
    pending.set(
      path,
      setTimeout(() => {
        pending.delete(path);
        pq.add(() => processFile(path, s3, queueHandler, consumeFolder)).catch(
          (err) =>
            console.error(`Failed after ${RETRIES} retries — ${path}:`, err),
        );
      }, DEBOUNCE_MS),
    );
  };

  const existing = (await new fdir()
    .withFullPaths()
    .crawl(consumeFolder)
    .withPromise()) as string[];

  for (const file of existing) enqueue(file);

  await watcher.subscribe(consumeFolder, (err, events) => {
    if (err) return console.error("Watcher error:", err);
    for (const event of events) {
      if (event.type === "create" || event.type === "update")
        enqueue(event.path);
    }
  });

  console.log(
    `FileWatcher ready — concurrency=${CONCURRENCY}, retries=${RETRIES}, debounce=${DEBOUNCE_MS}ms`,
  );
};
