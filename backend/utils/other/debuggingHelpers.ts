import pc from "picocolors";
import { OcrResult } from "../types/main";

export interface OcrStatsOptions {
  verbose?: boolean;
  startTime?: Date;
}

export function printOcrStats(
  res: OcrResult,
  options: OcrStatsOptions = {},
): void {
  const { verbose = false, startTime } = options;
  const now = new Date();

  // 1. Time & Throughput Rate Calculations
  let durationSec = 0;
  let durationStr = "";
  let rates = { pagesPerSec: "0.0", boxesPerSec: "0.0", charsPerSec: "0.0" };

  if (startTime) {
    durationSec = (now.getTime() - startTime.getTime()) / 1000;
    durationStr = pc.magenta(`${durationSec.toFixed(2)}s total`);

    // Guard against 0ms execution window to avoid dividing by zero (Infinity)
    if (durationSec > 0) {
      rates = {
        pagesPerSec: (res.pages.length / durationSec).toFixed(1),
        boxesPerSec: (
          res.pages.reduce(
            (acc, p) =>
              acc +
              (p.lines?.reduce((lAcc, l) => lAcc + (l.boxes?.length || 0), 0) ||
                0),
            0,
          ) / durationSec
        ).toFixed(1),
        charsPerSec: (
          res.pages.reduce(
            (acc, p) =>
              acc +
              (p.lines?.reduce(
                (lAcc, l) =>
                  lAcc +
                  l.boxes?.reduce((bAcc, b) => bAcc + (b.text?.length || 0), 0),
                0,
              ) || 0),
            0,
          ) / durationSec
        ).toFixed(0),
      };
    }
  }

  // 2. Traversal & Metrical Aggregation
  const pageCount = res.pages.length;
  let totalLines = 0;
  let totalBoxes = 0;
  let totalCharacters = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const page of res.pages) {
    if (!page.lines) continue;
    totalLines += page.lines.length;

    for (const line of page.lines) {
      if (!line.boxes) continue;
      totalBoxes += line.boxes.length;

      for (const box of line.boxes) {
        if (box.text) {
          totalCharacters += box.text.length;
        }
        if (typeof box.confidence === "number") {
          confidenceSum += box.confidence;
          confidenceCount++;
        }
      }
    }
  }

  const avgConfidence =
    confidenceCount > 0
      ? ((confidenceSum / confidenceCount) * 100).toFixed(1)
      : "N/A";

  const avgCharsPerPage =
    pageCount > 0 ? Math.round(totalCharacters / pageCount) : 0;
  const fileName = res.originalFilePath
    ? res.originalFilePath.split(/[/\\]/).pop()
    : "unknown_file";
  const shortHash = res.fileHash ? res.fileHash.substring(0, 8) : "no-hash";

  // --- LOW VERBOSITY (High Density One-Liner Output) ---
  if (!verbose) {
    const logLine = [
      pc.cyan("[OCR-STAT]"),
      pc.white(fileName),
      pc.gray(`(${shortHash})`),
      pc.yellow(`📄 ${pageCount}p`),
      pc.green(`🔤 ${totalCharacters}ch`),
      pc.blue(`🧱 ${totalBoxes}bx`),
      startTime
        ? pc.dim(`⚡ ${rates.pagesPerSec} p/s | ${rates.boxesPerSec} b/s`)
        : "",
      durationStr ? `⏱️ ${durationStr}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    console.log(logLine);
    return;
  }

  // --- HIGH VERBOSITY (Structured Architectural Layout Output) ---
  const border = pc.cyan("├" + "─".repeat(55));
  const closing = pc.cyan("└" + "─".repeat(55));

  const output = [
    pc.cyan(`┌─ OCR METRICS EXTRACTION REPORT ───────────────────────`),
    `│ ${pc.bold("Target File:")}   ${pc.white(res.originalFilePath)}`,
    `│ ${pc.bold("File Hash:")}     ${pc.gray(res.fileHash || "N/A")}`,
    border,
    `│ ${pc.yellow("● Geometry & Layout Topology")}`,
    `│   ├── Total Target Pages:  ${pc.yellow(pageCount)}`,
    `│   ├── Extracted Lines:     ${pc.yellow(totalLines)}`,
    `│   └── Tokenized Text Boxes: ${pc.yellow(totalBoxes)}`,
    border,
    `│ ${pc.green("● Content Metrics & Engine Confidence")}`,
    `│   ├── Cumulative Chars:    ${pc.green(totalCharacters)}`,
    `│   ├── Mean Density/Page:   ${pc.green(`${avgCharsPerPage} chars/p`)}`,
    `│   └── Engine Certainty:    ${pc.green(`${avgConfidence}%`)}`,
    startTime ? border : "",
    startTime ? `│ ${pc.red("● Performance Throughput Velocity")}` : "",
    startTime
      ? `│   ├── Processing Speed:    ${pc.red(`${rates.pagesPerSec} pages/sec`)}`
      : "",
    startTime
      ? `│   ├── Line Box Speed:      ${pc.red(`${rates.boxesPerSec} boxes/sec`)}`
      : "",
    startTime
      ? `│   └── Character Speed:     ${pc.red(`${rates.charsPerSec} chars/sec`)}`
      : "",
    startTime ? border : "",
    startTime ? `│ ${pc.magenta("● Timeline Chronology Pipeline")}` : "",
    startTime
      ? `│   ├── Processing Start:    ${pc.gray(startTime.toISOString())}`
      : "",
    startTime
      ? `│   ├── Compilation End:     ${pc.gray(now.toISOString())}`
      : "",
    startTime ? `│   └── Cycle Latency:       ${durationStr}` : "",
    closing,
  ]
    .filter((line) => line !== "")
    .join("\n");

  console.log(output);
}
