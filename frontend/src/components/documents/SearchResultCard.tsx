import React, { useState } from "react";
import { SearchHit } from "../../types";
import OcrOverlay from "./OcrOverlay";
import styles from "./SearchResultCard.module.css";

function getFilename(filepath?: string): string {
  if (!filepath) return "Unknown Document";
  const parts = filepath.split(/[\\/]/);
  const name = parts[parts.length - 1];
  return name
    .replace(/-\[object Object\]-[\d-T.Z]+\.(pdf|png|jpg|jpeg)$/i, ".$1")
    .replace(/\.(pdf|png|jpg|jpeg)$/i, "");
}

function getSnippet(hit: SearchHit): string {
  const lines = hit.ocr?.lines ?? [];
  return (
    lines
      .flatMap((l) => (l.boxes || []).map((b) => b.text))
      .join(" ")
      .slice(0, 180) + "..."
  );
}

export default function SearchResultCard({
  hit,
  query,
}: {
  hit: SearchHit;
  query?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const filename = getFilename(hit.filepath);
  const snippet = getSnippet(hit);

  return (
    <>
      <div
        className={styles.card}
        onClick={() => setOverlayOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOverlayOpen(true)}
      >
        <div className={styles.thumb}>
          {hit.banner_img && !imgError ? (
            <img
              src={`${hit.banner_img}`}
              alt={filename}
              onError={() => setImgError(true)}
              className={styles.thumbImg}
            />
          ) : (
            <div className={styles.thumbFallback}>
              <span>PDF</span>
            </div>
          )}
          <div className={styles.thumbOverlay}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <p className={styles.filename}>{filename}</p>
            <span className={styles.score}>
              {hit.ocr?.lines?.length ?? 0} Zeilen
            </span>
          </div>
          <p className={styles.snippet}>{snippet}</p>
          <div className={styles.footer}>
            <p className={styles.date}>
              {new Date(hit.created_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <span className={styles.viewHint}>OCR ansehen →</span>
          </div>
        </div>
      </div>

      {overlayOpen && (
        <OcrOverlay
          hit={hit}
          query={query}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}
