import React, { useState, useRef } from "react";
import { Document } from "../../types";
import { useApp } from "../../lib/AppContext";
import OcrOverlay from "./OcrOverlay";
import { useDocPages } from "../../hooks/useApi";
import { sanitizeName, getExt, formatDate, parseTags } from "../../lib/utils";
import styles from "./DocumentCard.module.css";

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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanName = sanitizeName(doc.filepath);
  const ext = getExt(doc.filepath);
  const tags = parseTags(doc.assigned_tags);

  const { pages, loading: pagesLoading } = useDocPages(
    overlayOpen ? doc.filepath : null,
    settings.serverUrl
  );

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
        `${settings.serverUrl}/delete?filepath=${encodeURIComponent(doc.filepath)}`,
        { method: "DELETE" }
      );
      onDeleted?.(doc.filepath);
    } catch {
      setDeleting(false);
    }
  };

  const fakeHit = {
    id: 0,
    filepath: doc.filepath,
    created_at: doc.created_at,
    assigned_tags: doc.assigned_tags,
    ocr: null,
    banner_img: doc.banner_img,
  };

  return (
    <>
      <div
        className={styles.card}
        style={style}
        onClick={() => setOverlayOpen(true)}
      >
        <div className={styles.banner}>
          {doc.banner_img && !imgError ? (
            <img
              src={doc.banner_img}
              alt={cleanName}
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </div>
          <button
            className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteBtnConfirm : ""}`}
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDelete ? "Nochmal klicken" : "Löschen"}
          >
            {deleting ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
            ) : confirmDelete ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            )}
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.filename} title={cleanName}>{cleanName}</p>
          <p className={styles.date}>{formatDate(doc.created_at, lang)}</p>
          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {overlayOpen && (
        <OcrOverlay
          hit={fakeHit}
          onClose={() => setOverlayOpen(false)}
          allPages={pages}
          pagesLoading={pagesLoading}
        />
      )}
    </>
  );
}
