import React, { useState, useRef } from "react";
import { Document } from "../../types";
import { useApp } from "../../lib/AppContext";
import OcrOverlay from "./OcrOverlay";
import styles from "./DocumentCard.module.css";

function getFilename(filepath: string): string {
  const parts = filepath.split(/[\\\/]/);
  const name = parts[parts.length - 1];
  return (
    name
      // strip trailing timestamp + UUID-like suffixes added during ingest
      .replace(/-\[object Object\]-[\d-T:.Z]+\.(pdf|png|jpe?g)$/i, ".$1")
      .replace(
        /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i,
        ".$1",
      )
      .replace(
        /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[.\dZ]*\.(pdf|png|jpe?g)$/i,
        ".$1",
      )
      .replace(/\.(pdf|png|jpe?g)$/i, "")
      // replace underscores/hyphens with spaces for display, collapse runs
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      // title-case first letter
      .replace(/^./, (c) => c.toUpperCase())
  );
}

function getExt(filepath: string): string {
  const m = filepath.match(/\.(pdf|png|jpg|jpeg)$/i);
  return m ? m[1].toUpperCase() : "FILE";
}

function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface Props {
  doc: Document;
  lang: string;
  style?: React.CSSProperties;
  onDeleted?: (filepath: string) => void;
}

export default function DocumentCard({ doc, lang, style, onDeleted }: Props) {
  const { settings } = useApp();
  const [imgError, setImgError] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filename = getFilename(doc.filepath);
  const ext = getExt(doc.filepath);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setHoverPreview(true), 900);
  };
  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverPreview(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await fetch(
        `${settings.serverUrl}/delete/consume?filepath=${encodeURIComponent(doc.filepath)}`,
        { method: "DELETE" },
      );
      onDeleted?.(doc.filepath);
    } catch {
      setDeleting(false);
    }
  };

  // Build a fake SearchHit for OcrOverlay
  const fakeHit = {
    id: 0,
    filepath: doc.filepath,
    created_at: doc.created_at,
    assigned_tags: doc.assigned_tags,
    ocr: { lines: [] },
    banner_img: doc.banner_img,
  };

  return (
    <>
      <div
        className={styles.card}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setOverlayOpen(true)}
      >
        <div className={styles.banner}>
          {doc.banner_img && !imgError ? (
            <img
              src={doc.banner_img}
              alt={filename}
              className={styles.bannerImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.bannerFallback}>
              <span className={styles.extLabel}>{ext}</span>
            </div>
          )}
          <div className={styles.extBadge}>{ext}</div>
          <div className={styles.hoverOverlay}>
            <svg
              width="20"
              height="20"
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

          <button
            className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteBtnConfirm : ""}`}
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDelete ? "Nochmal klicken zum Bestätigen" : "Löschen"}
          >
            {deleting ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            ) : confirmDelete ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            )}
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.filename} title={filename}>
            {filename}
          </p>
          <p className={styles.date}>{formatDate(doc.created_at, lang)}</p>
          {doc.assigned_tags.length > 0 && (
            <div className={styles.tags}>
              {doc.assigned_tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover preview tooltip */}
      {hoverPreview && doc.banner_img && !imgError && (
        <div
          className={styles.hoverPreviewPortal}
          onMouseEnter={() => setHoverPreview(false)}
        >
          <div className={styles.hoverPreviewCard}>
            <img
              src={doc.banner_img}
              alt={filename}
              className={styles.hoverPreviewImg}
            />
            <div className={styles.hoverPreviewLabel}>{filename}</div>
          </div>
        </div>
      )}

      {overlayOpen && (
        <OcrOverlay hit={fakeHit} onClose={() => setOverlayOpen(false)} />
      )}
    </>
  );
}
