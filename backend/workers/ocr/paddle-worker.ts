import { parentPort } from "worker_threads";
import { batchExtractFilesSync } from "@kreuzberg/node";

// ─── Kreuzberg / Paddle Config ───────────────────────────────────────────────
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
      recBatchNum: 96,
      detLimitSideLen: 960,
    },
  },
};

// ─── In-Memory Warmup (forces model load once per worker) ───────────────────
function warmup(): void {
  try {
    const blankPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    batchExtractFilesSync([blankPng], KREUZBERG_CONFIG);
  } catch {
    /* Ignore baseline empty text warnings */
  }
}

warmup();
parentPort!.postMessage({ type: "ready" });

// ─── Message Loop ─────────────────────────────────────────────────────────────
parentPort!.on("message", ({ id, paths }: { id: number; paths: string[] }) => {
  try {
    // Model is reused automatically by the worker process
    const results = batchExtractFilesSync(paths, KREUZBERG_CONFIG);
    parentPort!.postMessage({ id, ok: true, results });
  } catch (err: any) {
    const fatal =
      err?.message?.includes("Native binding") ||
      err?.message?.includes("failed to load");
    parentPort!.postMessage({
      id,
      ok: false,
      error: err?.message ?? String(err),
      fatal,
    });
  }
});
