import { parentPort } from "worker_threads";
import { accessSync } from "fs";
import { batchExtractFilesSync } from "@kreuzberg/node";

const KREUZBERG_CONFIG = {
  outputFormat: "plain" as const,
  ocr: {
    backend: "paddle-ocr",
    elementConfig: {
      includeElements: true,
      minLevel: "line" as const,
      minConfidence: 0.5,
      buildHierarchy: false,
    },
    paddleOcrConfig: {
      recBatchNum: 6,
      detLimitSideLen: 960,
    },
  },
};

const OCR_TIMEOUT_MS = 120_000;

function ts(): string {
  return new Date().toISOString();
}

function warmup(): void {
  try {
    // Use a real tiny JPEG — base64 PNG skips the OCR model entirely.
    // Models should already be cached by the main thread at this point.
    const { tmpdir } = require("os");
    const { join } = require("path");
    const { writeFileSync } = require("fs");
    const seedPath = join(
      tmpdir(),
      `_paddle_worker_warmup_${process.pid}_${Date.now()}.jpg`,
    );

    // Minimal valid JPEG (1x1 white pixel)
    const minimalJpeg = Buffer.from(
      "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U" +
        "HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN" +
        "DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy" +
        "MjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAA" +
        "AAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA" +
        "/9oADAMBAAIRAxEAPwCwABmX/9k=",
      "base64",
    );
    writeFileSync(seedPath, minimalJpeg);
    batchExtractFilesSync([seedPath], KREUZBERG_CONFIG);
    require("fs").unlinkSync(seedPath);
  } catch {
    // ignore
  }
}

warmup();
parentPort!.postMessage({ type: "ready" });

parentPort!.on("message", ({ id, paths }: { id: number; paths: string[] }) => {
  console.log(
    `${ts()} [paddle-worker] job ${id} received — ${paths.length} path(s)`,
  );

  // Verify every path is readable before handing it to the native binding.
  // A silent unreadable file is the most common cause of a no-CPU hang here.
  const unreadable: string[] = [];
  for (const p of paths) {
    try {
      accessSync(p);
    } catch {
      unreadable.push(p);
    }
  }

  if (unreadable.length > 0) {
    console.error(
      `${ts()} [paddle-worker] job ${id} — ${unreadable.length} unreadable path(s):`,
    );
    for (const p of unreadable) console.error(`  ✗ ${p}`);
    parentPort!.postMessage({
      id,
      ok: false,
      error: `Unreadable input files: ${unreadable.join(", ")}`,
    });
    return;
  }

  console.log(
    `${ts()} [paddle-worker] job ${id} — all ${paths.length} path(s) readable, starting OCR`,
  );

  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    console.error(
      `${ts()} [paddle-worker] job ${id} TIMED OUT after ${OCR_TIMEOUT_MS / 1000}s — batchExtractFilesSync did not return`,
    );
    parentPort!.postMessage({
      id,
      ok: false,
      error: `batchExtractFilesSync timed out after ${OCR_TIMEOUT_MS}ms`,
    });
  }, OCR_TIMEOUT_MS);

  try {
    const t0 = performance.now();
    const results = batchExtractFilesSync(paths, KREUZBERG_CONFIG);
    const elapsedMs = performance.now() - t0;

    clearTimeout(timer);
    if (timedOut) return;

    const perPage = (elapsedMs / paths.length).toFixed(0);
    console.log(
      `${ts()} [paddle-worker] job ${id} done — ${results.length} result(s) | total ${(elapsedMs / 1000).toFixed(2)}s | ${perPage}ms/page`,
    );

    parentPort!.postMessage({ id, ok: true, results });
  } catch (err: any) {
    clearTimeout(timer);
    if (timedOut) return;

    const fatal =
      err?.message?.includes("Native binding") ||
      err?.message?.includes("failed to load");

    console.error(
      `${ts()} [paddle-worker] job ${id} error (fatal=${fatal}): ${err?.message ?? String(err)}`,
    );

    parentPort!.postMessage({
      id,
      ok: false,
      error: err?.message ?? String(err),
      fatal,
    });
  }
});
