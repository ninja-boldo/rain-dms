import chokidar from "chokidar";
import { QueueHandler } from "./QueueConnector";
import "dotenv/config";
import { QueueNames, ImportantDirs } from "../utils/types/main";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import {
  fileHashAlreadyExistingApi,
  fileHashExistsServer,
  formatFilename,
  getS3Client,
  hashFile,
  initBuckets,
  sanitizeFilePath,
  uploadGenericS3,
} from "./ocr/utils";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION FLAGS & LIFECYCLE STATE
// ─────────────────────────────────────────────────────────────────────────────
const VERBOSE_LOGGING = true;
const BATCH_SETTLE_TIMEOUT_MS = 5000; // Time to wait for writes to cease before starting execution

let pool: Pool | null = null;
let watcher: chokidar.FSWatcher | null = null;
let isShuttingDown = false;

// --- Logging Helper ---
const getTimestamp = (): string =>
  new Date().toISOString().replace("T", " ").replace("Z", "+00:00");
const log = (message: string, color: (text: string) => string = pc.white) => {
  const timestampedMessage = VERBOSE_LOGGING
    ? `[${getTimestamp()}] ${message}`
    : message;
  console.log(color(timestampedMessage));
};
const logStep = (message: string) => log(` [WATCHER STEP] ${message}`, pc.cyan);
const logInit = (message: string) => log(` [WATCHER INIT] ${message}`, pc.cyan);
const logSuccess = (message: string) =>
  log(` [WATCHER SUCCESS] ${message}`, pc.bgGreen.black);
const logError = (message: string) =>
  log(` [WATCHER ERROR] ${message}`, pc.bgRed.white);
const logWarning = (message: string) =>
  log(` [WATCHER LOG] ${message}`, pc.yellow);
const logCritical = (message: string) =>
  log(` [CRITICAL BOOT FAILURE] ${message}`, pc.bgRed.white);

// Watchdog helper to enforce maximum thresholds on async requests
const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  stepName: string,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Operation timed out at step: [${stepName}] after ${ms}ms`,
            ),
          ),
        ms,
      ),
    ),
  ]);
};

export const FileWatcher = async (rootPath: string) => {
  log("[Watcher] Starting FileWatcher Boot Sequence..", pc.cyan);

  let s3: any;
  let db: ReturnType<typeof drizzle>;
  let queueHandler: QueueHandler;

  // --- INITIALIZATION BLOCK ---
  try {
    s3 = getS3Client();
    logInit("Connecting to S3/MinIO Buckets...");
    await withTimeout(initBuckets(s3), 10000, "S3 Bucket Init");
    logInit(pc.green("S3 Buckets Ready."));

    pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      min: 4,
      max: 20,
      connectionTimeoutMillis: 5000,
    });
    db = drizzle(pool);
    console.log("inited db connection");

    logInit("Connecting to RabbitMQ Broker...");
    queueHandler = await withTimeout(
      QueueHandler.create(process.env.AMQP_URL, 1),
      10000,
      "RabbitMQ Connect",
    );
    logInit(pc.green("RabbitMQ Connected."));
  } catch (initErr) {
    logCritical(`Watcher could not start: ${(initErr as Error).message}`);
    if (pool) {
      await pool.end().catch(() => null);
      pool = null;
    }
    return;
  }

  // Log pool stats every 10 seconds if verbose
  if (VERBOSE_LOGGING && pool) {
    const activePool = pool;
    setInterval(() => {
      log(
        `[POOL STATS] total: ${activePool.totalCount}, idle: ${activePool.idleCount}, waiting: ${activePool.waitingCount}`,
        pc.gray,
      );
    }, 10000);
  }

  // --- DIRECTORY SETUP ---
  const root = path.resolve(rootPath);
  const consumeFolder =
    process.env.CONSUME_PATH ?? path.join(root, ImportantDirs.consume);
  const consumedFolder =
    process.env.CONSUMED_PATH ?? path.join(root, ImportantDirs.consumed);
  const tempFolder =
    process.env.TEMP_PATH ?? path.join(root, ImportantDirs.temp);

  for (const dir of [root, consumeFolder, consumedFolder, tempFolder]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const allowedExt = new Set([".pdf", ".png", ".jpeg", ".jpg", ".webp"]);

  // --- TELEMETRY ENGINE ---
  const metrics = {
    totalReceived: 0,
    sentToQueue: 0,
    ignoredNonOcr: 0,
    duplicates: 0,
    failed: 0,
    timeouts: 0,
  };

  let filesSinceLastReport = 0;

  const printReport = () => {
    if (!VERBOSE_LOGGING) return;
    log(
      [
        pc.magenta(
          `\n── Watcher Progress Telemetry Report ──────────────────────────────────`,
        ),
        `• ${pc.bold("TOTAL RECEIVED:")} ${pc.blue(metrics.totalReceived)} files processed`,
        `• ${pc.bold("FLUSHED TO QUEUE:")} ${pc.green(metrics.sentToQueue)} (Clean entries)`,
        `• ${pc.bold("DUPLICATES DETECTED:")} ${pc.yellow(metrics.duplicates)}`,
        `• ${pc.bold("INVALID/IGNORED:")} ${pc.gray(metrics.ignoredNonOcr)}`,
        `• ${pc.bold("TIMEOUT STALLS:")} ${pc.red(metrics.timeouts)}`,
        `• ${pc.bold("CRITICAL FAILURES:")} ${pc.red(metrics.failed)}`,
        pc.magenta(
          `────────────────────────────────────────────────────────────────────────\n`,
        ),
      ].join("\n"),
      pc.magenta,
    );
    filesSinceLastReport = 0;
  };

  setInterval(printReport, 60000);

  // --- ACCUMULATION & PROCESSING STATE ---
  let accumulationBuffer: string[] = [];
  let fileTaskQueue: string[] = [];
  let isProcessing = false;
  let settlementTimeout: NodeJS.Timeout | null = null;

  const isIgnored = (f: string) => {
    const b = path.basename(f);
    return b.startsWith(".") || b.startsWith("._") || b === "Thumbs.db";
  };

  const cleanEmptyFolders = async (dirPath: string) => {
    const resolvedTarget = path.resolve(dirPath);
    if (
      resolvedTarget === path.resolve(consumeFolder) ||
      !resolvedTarget.startsWith(path.resolve(consumeFolder))
    )
      return;
    try {
      const files = await fs.promises.readdir(dirPath);
      if (files.filter((f) => !isIgnored(f)).length === 0) {
        for (const file of files)
          await fs.promises.unlink(path.join(dirPath, file)).catch(() => null);
        await fs.promises.rmdir(dirPath);
        await cleanEmptyFolders(path.dirname(dirPath));
      }
    } catch {}
  };

  // Sort accumulated files from Smallest -> Largest, then merge into running execution queue
  const processAccumulatedBatch = async () => {
    if (accumulationBuffer.length === 0) return;

    log(
      `[Watcher] Sorting and preparing batch of ${accumulationBuffer.length} discovered items...`,
      pc.yellow,
    );

    const fileWithSizes = await Promise.all(
      accumulationBuffer.map(async (filePath) => {
        try {
          const stats = await fs.promises.stat(filePath);
          return { filePath, size: stats.size };
        } catch {
          return { filePath, size: Infinity }; // Push broken handles down the priority ladder
        }
      }),
    );

    // Smallest size first, biggest last
    fileWithSizes.sort((a, b) => a.size - b.size);

    const sortedPaths = fileWithSizes.map((f) => f.filePath);
    fileTaskQueue.push(...sortedPaths);

    // Reset buffer
    accumulationBuffer = [];

    // Trigger execution worker if dormant
    if (!isProcessing) {
      processNextFileInQueue();
    }
  };

  // --- MAIN FILE PROCESSING WORKER ---
  const processNextFileInQueue = async () => {
    if (isProcessing || fileTaskQueue.length === 0) return;
    isProcessing = true;

    const filePath = fileTaskQueue.shift()!;
    const fileName = path.basename(filePath);

    log(
      pc.bgCyan(pc.black(` [WATCHER START] `)) +
        ` 🚀 Processing: ${pc.cyan(fileName)}`,
    );
    metrics.totalReceived++;
    filesSinceLastReport++;

    const startTime = Date.now();
    let currentStep = "Initialization";

    try {
      // --- 1. VALIDATE FILE EXTENSION ---
      const ext = path.extname(filePath).toLowerCase();
      if (!allowedExt.has(ext)) {
        metrics.ignoredNonOcr++;
        logStep(`⚠️  Ignored extension: ${ext}`);
        await fs.promises.unlink(filePath).catch(() => null);
        await cleanEmptyFolders(path.dirname(filePath));
        return;
      }

      // --- 2. SANITIZE FILENAME ---
      let currentPath = filePath;
      const sanitized = sanitizeFilePath(filePath);
      if (filePath !== sanitized) {
        logStep("Sanitizing filename...");
        await fs.promises.rename(filePath, sanitized).catch(() => null);
        currentPath = sanitized;
      }

      // --- 3. CHECK FILE EXISTS ON DISK ---
      currentStep = "Disk Accessibility Check";
      logStep("Checking file visibility on disk...");
      const exists = await withTimeout(
        fs.promises
          .access(currentPath)
          .then(() => true)
          .catch(() => false),
        5000,
        currentStep,
      );
      if (!exists) {
        logWarning("❌ File system lost handle on item.");
        return;
      }

      // --- 4. HASH FILE ---
      currentStep = "Hashing File";
      logStep("Calculating stream file hash...");
      const fileHash = await withTimeout(
        hashFile(currentPath),
        10000,
        currentStep,
      );

      // --- 5. CHECK FOR DUPLICATES IN DATABASE ---
      currentStep = "Database Duplicate Check";
      logStep("Querying database for duplicate hash matching...");
      let isDuplicate = false;
      try {
        isDuplicate = await withTimeout(
          fileHashAlreadyExistingApi(fileHash),
          10000,
          currentStep,
        );
      } catch (err) {
        logError(
          `⚠️ DB pool issue or timeout at [${currentStep}]: ${(err as Error).message}`,
        );
        isDuplicate = false;
      }
      logStep("finished hash matching");

      if (isDuplicate) {
        metrics.duplicates++;
        logWarning(`🗑️  Duplicate recognized. Purging file.`);
        await fs.promises.unlink(currentPath).catch(() => null);
        await cleanEmptyFolders(path.dirname(currentPath));
        return;
      }

      // --- 6. UPLOAD TO S3 (WITH EXPONENTIAL BACKOFF FOR 502 ERROR MITIGATION) ---
      currentStep = "S3 Uploading";
      let key: string | null = null;
      let retries = 3;
      let retryDelay = 1500;

      // Generate the S3 key once, before the retry loop
      const objectKey = await formatFilename(currentPath);
      const fileBuffer = await fs.promises.readFile(currentPath);

      while (retries > 0) {
        try {
          logStep(
            `Streaming object upload payload to S3... (Remaining attempts: ${retries})`,
          );
          await withTimeout(
            uploadGenericS3(s3, "uploads", objectKey, fileBuffer),
            45000,
            currentStep,
          );
          key = objectKey; // uploadGenericS3 is now void, key comes from here
          break;
        } catch (uploadErr) {
          retries--;
          const errMsg = (uploadErr as Error).message;
          logError(`S3 Upload Attempt failed: ${errMsg}`);
          if (retries === 0) throw uploadErr;
          logWarning(`Retrying S3 upload in ${retryDelay}ms...`);
          await new Promise((res) => setTimeout(res, retryDelay));
          retryDelay *= 2;
        }
      }

      if (key) {
        await fs.promises.unlink(currentPath).catch(() => null);
      }

      // --- 7. SEND TO RABBITMQ ---
      currentStep = "RabbitMQ Message Dispatch";
      logStep("Publishing task message to RabbitMQ AMQP Broker...");
      await withTimeout(
        queueHandler.sendMsg(key!, QueueNames.startOcrQueue),
        15000,
        currentStep,
      );

      // --- SUCCESS ---
      metrics.sentToQueue++;
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logSuccess(`✅ Finished ${fileName} inside ${duration}s`);

      currentStep = "Directory Cleanup";
      await cleanEmptyFolders(path.dirname(currentPath));
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes("timed out")) {
        metrics.timeouts++;
        logError(`File: ${fileName} hung completely at step: [${currentStep}]`);
      } else {
        metrics.failed++;
        logError(
          `${fileName} dropped out on step [${currentStep}]: ${errorMessage}`,
        );
      }
    } finally {
      isProcessing = false;
      if (fileTaskQueue.length === 0) printReport();
      processNextFileInQueue();
    }
  };

  // --- FILESYSTEM WATCHER SETUP ---
  logInit("Instantiating directory path indexing...");

  watcher = chokidar.watch(consumeFolder, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 200 },
    atomic: true,
    ignored: (f) => isIgnored(f),
  });

  watcher.on("add", (p) => {
    // Stage file into historical accumulation array
    accumulationBuffer.push(p);

    // Debounce processing to ensure batch files settle and arrive completely
    if (settlementTimeout) clearTimeout(settlementTimeout);
    settlementTimeout = setTimeout(
      processAccumulatedBatch,
      BATCH_SETTLE_TIMEOUT_MS,
    );
  });

  watcher.on("ready", () => {
    log(
      pc.green(
        "[Watcher] Initial directory ingestion baseline ready. Accumulating entries...",
      ),
    );
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFE GRACEFUL LIFE LIFE-CYCLE SHUTDOWN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
const handleShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log(`Received ${signal}, shutting down watcher cleanly...`, pc.yellow);

  try {
    if (watcher) {
      await watcher.close();
      log("FS Chokidar active stream handles detached.", pc.gray);
    }
    if (pool) {
      await pool.end();
      log(
        "PostgreSQL active database connection pool drained completely.",
        pc.gray,
      );
      pool = null;
    }
  } catch (err) {
    console.error("Error during graceful service teardown:", err);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
