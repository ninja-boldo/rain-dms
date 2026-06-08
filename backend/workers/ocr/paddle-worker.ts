import { parentPort } from "worker_threads";
import { batchExtractFilesSync } from "@kreuzberg/node";

if (!parentPort) {
  throw new Error("[OcrWorker] This module must be run as a Worker thread.");
}

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
      recBatchNum: 40,
      detLimitSideLen: 960,
    },
  },
};

// ─── In-Memory Warmup ────────────────────────────────────────────────────────

function warmup(): void {
  try {
    // 1x1 transparent PNG data URI prevents cold-start lag without disk I/O
    const blankPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    batchExtractFilesSync([blankPng], KREUZBERG_CONFIG);
  } catch {
    /* Ignore baseline empty text warnings */
  }
}

warmup();
parentPort.postMessage({ type: "ready" });

// ─── Message Loop ─────────────────────────────────────────────────────────────

parentPort.on("message", ({ id, paths }: { id: number; paths: string[] }) => {
  try {
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
