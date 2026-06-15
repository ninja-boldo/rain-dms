import watcher from "@parcel/watcher";
import { fdir } from "fdir";
import PQueue from "p-queue";
import pRetry, { AbortError } from "p-retry";
import { QueueHandler } from "../utils/helperClasses/QueueConnector";
import "dotenv/config";
import { BucketNames, QueueNames, QueueObjStartOcr } from "../utils/types/main";
import fs from "fs";
import os from "os";
import { S3Client } from "@aws-sdk/client-s3";
import {
  encryptFileStream,
  encryptTxt,
  generateKey,
  hashFile,
} from "../utils/cryptography";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import { dumpFileKeyPairInDb, fileHashAlreadyExistingApi } from "../utils/utils";
import { formatFilename, getUsernameFromConsumeDbChecked, sanitizeS3Key } from "../utils/pathHelpers";
import { getEncryptAtRestIsTrue, getMainEncryptionKey } from "../utils/envHelpers";
import { getS3Client, uploadGenericS3 } from "../utils/s3Helpers";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const CONCURRENCY = parseInt(
  process.env.UPLOAD_CONCURRENCY ?? String(Math.min(os.cpus().length, 4)),
);
const RETRIES = parseInt(process.env.UPLOAD_RETRIES ?? "3");
const DEBOUNCE_MS = parseInt(process.env.WATCH_DEBOUNCE_MS ?? "1000");
// Periodic rescan interval — catches events missed by inotify on deep new dirs
const RESCAN_MS = parseInt(process.env.WATCH_RESCAN_MS ?? "30000");

const ALLOWED_EXT = [".pdf", ".png", ".jpeg", ".jpg"];

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
const db = drizzle(pgPool);

// ─────────────────────────────────────────────────────────────────────────────
// Process one file
// ─────────────────────────────────────────────────────────────────────────────
async function processFile(
  filePath: string,
  s3: S3Client,
  queue: QueueHandler,
  tempFolder: string,
): Promise<void> {
  console.log(`[watcher] 🔍 hashing  ${filePath}`);
  const hash = await hashFile(filePath);

  const isAlreadyProcessed = await fileHashAlreadyExistingApi(hash);
  if (isAlreadyProcessed) {
    console.log(`[watcher] ⏩ skip (dup) ${filePath}`);
    return;
  }

  const isToEncrypt = getEncryptAtRestIsTrue();
  const originalConsumePath = filePath;
  const usernameBoundToFile = await getUsernameFromConsumeDbChecked(filePath);
  const spawnTime = new Date().toISOString();

  let finalPath = filePath;
  let encryptionKey = "";

  if (isToEncrypt) {
    encryptionKey = await generateKey();
    finalPath = await encryptFileStream(
      filePath,
      encryptionKey,
      path.join(
        tempFolder,
        path.basename(filePath).replace(/(\.[^.]+)$/, "_encrypted$1"),
      ),
    );
  }

  await pRetry(
    async () => {
      let objectKey: string;
      let fileBuffer: Buffer;

      try {
        objectKey = sanitizeS3Key(await formatFilename(finalPath, tempFolder));
        fileBuffer = await fs.promises.readFile(finalPath);
      } catch (err: any) {
        if (err?.code === "ENOENT") throw new AbortError(err);
        throw err;
      }

      console.log(
        `[watcher] ⬆️  uploading ${objectKey} (${(fileBuffer.length / 1024).toFixed(0)} KB)`,
      );
      await uploadGenericS3(
        s3,
        BucketNames.userUploads,
        objectKey,
        fileBuffer,
        spawnTime,
      );

      const queueObj: QueueObjStartOcr = {
        s3Key: objectKey,
        username: usernameBoundToFile,
        spawnedTime: spawnTime,
        originalConsumePath,
        isEncrypted: isToEncrypt,
      };

      // ── BUG FIX: was always "" because encryptTxt result was discarded ──────
      let encryptedEncKey = "";
      if (isToEncrypt && encryptionKey !== "") {
        encryptedEncKey = await encryptTxt(
          encryptionKey,
          getMainEncryptionKey(),
        );
      }

      await dumpFileKeyPairInDb(db, objectKey, encryptedEncKey);
      await queue.sendMsg(queueObj, QueueNames.startOcrQueue);

      console.log(`[watcher] ✅ queued   ${JSON.stringify(queueObj)}`);
      await fs.promises.unlink(finalPath);
    },
    {
      retries: RETRIES,
      minTimeout: 500,
      factor: 2,
      onFailedAttempt: (err) =>
        console.error(
          `[watcher] ⚠️  retry ${err.attemptNumber}/${RETRIES + 1} — ${finalPath}: ${err.message}`,
        ),
    },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main watcher
// ─────────────────────────────────────────────────────────────────────────────
export const FileWatcher = async (): Promise<void> => {
  const { CONSUME_PATH: consumeFolder, TEMP_PATH: tempFolder } = process.env;

  if (!consumeFolder || !tempFolder) {
    throw new Error(
      `Missing env vars — CONSUME_PATH=${consumeFolder}, TEMP_PATH=${tempFolder}`,
    );
  }

  await Promise.all(
    [consumeFolder, tempFolder].map((d) =>
      fs.promises.mkdir(d, { recursive: true }),
    ),
  );

  const s3 = await getS3Client();
  const queueHandler = await QueueHandler.create(process.env.AMQP_URL);
  const pq = new PQueue({ concurrency: CONCURRENCY });

  // Track which files have already been enqueued in this session to prevent
  // double-processing from both rescan and inotify events
  const enqueuedThisSession = new Set<string>();
  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  const enqueue = (
    filePath: string,
    source: "watch" | "scan" | "rescan",
  ): void => {
    const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return;

    clearTimeout(pending.get(filePath));
    pending.set(
      filePath,
      setTimeout(() => {
        pending.delete(filePath);

        // Skip if already in flight from a previous event
        if (enqueuedThisSession.has(filePath)) return;
        enqueuedThisSession.add(filePath);

        console.log(
          `[watcher] 📄 detected [${source}] ${filePath} (pq size=${pq.size})`,
        );
        pq.add(() =>
          processFile(filePath, s3, queueHandler, tempFolder).finally(() => {
            // Remove from session set after processing so re-uploads (same path,
            // new content) can be re-queued — the hash check deduplicates
            enqueuedThisSession.delete(filePath);
          }),
        ).catch((err) =>
          console.error(
            `[watcher] ❌ failed after ${RETRIES} retries — ${filePath}:`,
            err,
          ),
        );
      }, DEBOUNCE_MS),
    );
  };

  // ── Initial scan ────────────────────────────────────────────────────────────
  const scan = async (label: "scan" | "rescan"): Promise<void> => {
    const files = (await new fdir()
      .withFullPaths()
      .filter((fp) =>
        ALLOWED_EXT.includes(fp.slice(fp.lastIndexOf(".")).toLowerCase()),
      )
      .crawl(consumeFolder)
      .withPromise()) as string[];

    if (files.length > 0)
      console.log(
        `[watcher] 🗂  ${label}: ${files.length} files found in ${consumeFolder}`,
      );

    for (let i = 0; i < files.length; i++) {
      enqueue(files[i], label);
      // Micro-pause every 50 to avoid hammering the event loop on large dirs
      if (i > 0 && i % 50 === 0)
        await new Promise<void>((r) => setTimeout(r, 50));
    }
  };

  await scan("scan");

  // ── inotify subscription ────────────────────────────────────────────────────
  await watcher.subscribe(consumeFolder, (err, events) => {
    if (err) {
      console.error("[watcher] ❌ watcher error:", err);
      return;
    }
    for (const event of events) {
      if (event.type === "create" || event.type === "update") {
        enqueue(event.path, "watch");
      }
    }
  });

  // ── Periodic rescan fallback ────────────────────────────────────────────────
  setInterval(() => scan("rescan"), RESCAN_MS);

  console.log(
    `[watcher] 🚀 ready — concurrency=${CONCURRENCY}, retries=${RETRIES}, debounce=${DEBOUNCE_MS}ms, rescan=${RESCAN_MS}ms`,
  );
};
