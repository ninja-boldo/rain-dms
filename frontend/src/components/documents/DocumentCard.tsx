import React, { useState, useRef, useCallback } from "react";
import { Document } from "../../types";
import { useApp } from "../../lib/AppContext";
import OcrOverlay from "./OcrOverlay";
import styles from "./DocumentCard.module.css";
import AuthImg from "../common/AuthImg";

function getFilename(filepath: string): string {
  const parts = filepath.split(/[\\\/]/);
  const name = parts[parts.length - 1];
  return name
    .replace(/-\[object Object\]-[\d-T:.Z]+\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i,
      ".$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*\.(pdf|png|jpe?g)$/i,
      ".$1",
    )
    .replace(/\.(pdf|png|jpe?g)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
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

function sanitizeFilepath(filepath: string): string {
  const normalized = filepath.replace(/\\/g, "/");
  if (normalized.includes("../") || normalized.includes("..\\"))
    throw new Error("Invalid filepath");
  return encodeURIComponent(filepath);
}

interface Props {
  doc: Document;
  lang: string;
  thumbHeight?: number;
  style?: React.CSSProperties;
  onDeleted?: (filepath: string) => void;
  viewMode?: "grid" | "list";
}

export default function DocumentCard({
  doc,
  lang,
  thumbHeight = 130,
  style,
  onDeleted,
  viewMode = "grid",
}: Props) {
  const { settings, getAuthHeaders } = useApp();

  // Image / overlay state
  const [imgError, setImgError] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayInitialMode, setOverlayInitialMode] = useState<"ocr" | "pdf">(
    "ocr",
  );
  const [hoverPreview, setHoverPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Multi-page navigation ──────────────────────────────────────
  const pagesRef = useRef<string[] | null>(null); // null = not fetched yet
  const loadingNavRef = useRef(false);
  const curPageRef = useRef(0);
  const [curPage, setCurPage] = useState(0);
  const [navThumb, setNavThumb] = useState<string | null>(null);
  const [navLoading, setNavLoading] = useState(false);

  const totalDocPages = doc.page_count ?? 1;
  const hasMultiplePages = totalDocPages > 1;

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filename = getFilename(doc.filepath);
  const ext = getExt(doc.filepath);

  const getBannerUrl = useCallback(
    (bannerUrl: string): string => {
      if (!bannerUrl) return "";
      try {
        const url = new URL(bannerUrl);
        if (url.pathname.startsWith("/s3/"))
          return `${settings.serverUrl}${url.pathname}`;
        return bannerUrl;
      } catch {
        return bannerUrl;
      }
    },
    [settings.serverUrl],
  );

  const finalBannerImg = getBannerUrl(doc.banner_img);
  const displayThumbSrc = navThumb ?? finalBannerImg;

  // Fetch all page banner URLs lazily on first page-nav click
  const loadPages = useCallback(async (): Promise<string[]> => {
    if (pagesRef.current !== null) return pagesRef.current;
    if (loadingNavRef.current) return [];
    loadingNavRef.current = true;
    setNavLoading(true);
    try {
      const res = await fetch(
        `${settings.serverUrl}/pages?filepath=${encodeURIComponent(doc.filepath)}`,
        { headers: getAuthHeaders() },
      );
      const json = await res.json();
      const banners: string[] = (json.pages ?? [])
        .map((p: any) => getBannerUrl(p.banner_img))
        .filter(Boolean);
      pagesRef.current = banners;
      return banners;
    } catch {
      pagesRef.current = [];
      return [];
    } finally {
      loadingNavRef.current = false;
      setNavLoading(false);
    }
  }, [doc.filepath, settings.serverUrl, getAuthHeaders, getBannerUrl]);

  const goPage = useCallback(
    async (dir: 1 | -1, e: React.MouseEvent) => {
      e.stopPropagation();
      const banners = await loadPages();
      if (!banners.length) return;
      const next = Math.max(
        0,
        Math.min(curPageRef.current + dir, banners.length - 1),
      );
      curPageRef.current = next;
      setCurPage(next);
      setNavThumb(banners[next] ?? null);
    },
    [loadPages],
  );

  // ── Hover preview ──────────────────────────────────────────────
  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    hoverTimer.current = setTimeout(() => {
      setPreviewPos({ x, y });
      setHoverPreview(true);
    }, 600);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!hoverPreview) setPreviewPos({ x: e.clientX, y: e.clientY });
    },
    [hoverPreview],
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverPreview(false);
  }, []);

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteError(null);
    if (!confirmDelete) {
      setConfirmDelete(true);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirmDelete(false);
    setDeleting(true);
    try {
      let safePath: string;
      try {
        safePath = sanitizeFilepath(doc.filepath);
      } catch {
        setDeleteError("Ungültiger Dateipfad");
        setDeleting(false);
        return;
      }
      const res = await fetch(
        `${settings.serverUrl}/delete/consume?filepath=${safePath}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      if (res.ok) {
        onDeleted?.(doc.filepath);
      } else {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        setDeleteError(
          `Fehler ${res.status}: ${body?.error ?? res.statusText}`,
        );
        setDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(`Netzwerkfehler: ${err.message}`);
      setDeleting(false);
    }
  };

  const fakeHit = {
    id: "",
    filepath: doc.filepath,
    created_at: doc.created_at,
    assigned_tags: doc.assigned_tags,
    ocr: { lines: [] },
    banner_img: doc.banner_img,
    file_id: 0,
    pageIdx: 0,
  };

  const DeleteIcon = () =>
    deleting ? (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          strokeDasharray="60"
          strokeDashoffset="20"
        />
      </svg>
    ) : confirmDelete ? (
      <svg
        width="11"
        height="11"
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
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M9 6V4h6v2" />
      </svg>
    );

  // ── LIST VIEW ──────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <>
        <div
          className={styles.listRow}
          style={style}
          onClick={() => {
            setOverlayInitialMode("ocr");
            setOverlayOpen(true);
          }}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Thumbnail */}
          <div className={styles.listThumb}>
            {displayThumbSrc ? (
              <AuthImg
                src={displayThumbSrc}
                alt=""
                className={styles.listThumbImg}
                skeletonClass={styles.listThumbImg}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                fallback={<div className={styles.listThumbFallback}><span className={styles.extLabel}>{ext}</span></div>}
              />
            ) : (
              <div className={styles.listThumbFallback}>
                <span className={styles.extLabel}>{ext}</span>
              </div>
            )}
            <div className={styles.listThumbOverlay} />
          </div>

          {/* Info */}
          <div className={styles.listInfo}>
            <div className={styles.listTop}>
              <span className={styles.listExtBadge}>{ext}</span>
              <span className={styles.listFilename} title={filename}>
                {filename}
              </span>
            </div>
            <div className={styles.listMeta}>
              <span>{formatDate(doc.created_at, lang)}</span>
              {totalDocPages > 1 && (
                <span className={styles.listPageCount}>{totalDocPages} S.</span>
              )}
            </div>
            {doc.assigned_tags.length > 0 && (
              <div className={styles.tags}>
                {doc.assigned_tags.slice(0, 4).map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
                {doc.assigned_tags.length > 4 && (
                  <span className={styles.tag}>
                    +{doc.assigned_tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Page nav (list mode) */}
          {hasMultiplePages && (
            <div
              className={styles.listPageNav}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.listPageBtn}
                disabled={curPage === 0}
                onClick={(e) => goPage(-1, e)}
              >
                ‹
              </button>
              <span className={styles.listPageLabel}>
                {navLoading ? "…" : `${curPage + 1}/${totalDocPages}`}
              </span>
              <button
                className={styles.listPageBtn}
                disabled={curPage >= totalDocPages - 1}
                onClick={(e) => goPage(1, e)}
              >
                ›
              </button>
            </div>
          )}

          {/* Delete */}
          <div className={styles.listActions}>
            <button
              className={`${styles.deleteBtn} ${styles.deleteBtnList} ${confirmDelete ? styles.deleteBtnConfirm : ""}`}
              onClick={handleDelete}
              disabled={deleting}
              title={confirmDelete ? "Nochmal klicken" : "Löschen"}
            >
              <DeleteIcon />
            </button>
          </div>
        </div>

        {hoverPreview && displayThumbSrc && !imgError && (
          <HoverTooltip
            src={displayThumbSrc}
            label={filename}
            x={previewPos.x}
            y={previewPos.y}
          />
        )}
        {overlayOpen && (
          <OcrOverlay
            hit={fakeHit}
            initialViewMode={overlayInitialMode}
            onClose={() => setOverlayOpen(false)}
          />
        )}
        {deleteError && (
          <div className={styles.listDeleteError}>{deleteError}</div>
        )}
      </>
    );
  }

  // ── GRID VIEW (default) ────────────────────────────────────────
  return (
    <>
      <div
        className={styles.card}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          setOverlayInitialMode("ocr");
          setOverlayOpen(true);
        }}
      >
        {/* Thumbnail strip */}
        <div className={styles.thumb} style={{ height: `${thumbHeight}px` }}>
          {displayThumbSrc ? (
            <AuthImg
              src={displayThumbSrc}
              alt=""
              className={styles.thumbImg}
              skeletonClass={styles.thumbImg}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              fallback={<div className={styles.thumbFallback}><span className={styles.extLabel}>{ext}</span></div>}
            />
          ) : (
            <div className={styles.thumbFallback}>
              <span className={styles.extLabel}>{ext}</span>
            </div>
          )}
          <div className={styles.thumbOverlay} />
          <span
            className={styles.extBadge}
            onClick={(e) => {
              e.stopPropagation();
              setOverlayInitialMode("pdf");
              setOverlayOpen(true);
            }}
            title="PDF öffnen"
          >
            {ext}
          </span>

          {/* Multi-page navigator */}
          {hasMultiplePages && (
            <div
              className={styles.pageNav}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.pageNavBtn}
                disabled={curPage === 0}
                onClick={(e) => goPage(-1, e)}
                title="Vorherige Seite"
              >
                ‹
              </button>
              <span className={styles.pageNavLabel}>
                {navLoading ? "…" : `${curPage + 1}/${totalDocPages}`}
              </span>
              <button
                className={styles.pageNavBtn}
                disabled={curPage >= totalDocPages - 1}
                onClick={(e) => goPage(1, e)}
                title="Nächste Seite"
              >
                ›
              </button>
            </div>
          )}

          <button
            className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteBtnConfirm : ""}`}
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDelete ? "Nochmal klicken" : "Löschen"}
          >
            <DeleteIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.filename} title={filename}>
            {filename}
          </p>
          <div className={styles.bodyMeta}>
            <p className={styles.date}>{formatDate(doc.created_at, lang)}</p>
            {totalDocPages > 1 && (
              <span className={styles.pageCountBadge}>{totalDocPages} S.</span>
            )}
          </div>
          {doc.assigned_tags.length > 0 && (
            <div className={styles.tags}>
              {doc.assigned_tags.slice(0, 3).map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
              {doc.assigned_tags.length > 3 && (
                <span className={styles.tag}>
                  +{doc.assigned_tags.length - 3}
                </span>
              )}
            </div>
          )}
          {deleteError && <p className={styles.deleteError}>{deleteError}</p>}
        </div>
      </div>

      {hoverPreview && displayThumbSrc && !imgError && (
        <HoverTooltip
          src={displayThumbSrc}
          label={filename}
          x={previewPos.x}
          y={previewPos.y}
        />
      )}
      {overlayOpen && (
        <OcrOverlay
          hit={fakeHit}
          initialViewMode={overlayInitialMode}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}

function HoverTooltip({
  src,
  label,
  x,
  y,
}: {
  src: string;
  label: string;
  x: number;
  y: number;
}) {
  const TOOLTIP_W = 340;
  const TOOLTIP_H = 320;
  const OFFSET = 20;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = x + OFFSET;
  let top = y - TOOLTIP_H / 2;
  if (left + TOOLTIP_W > vw - 8) left = x - TOOLTIP_W - OFFSET;
  top = Math.max(8, Math.min(top, vh - TOOLTIP_H - 8));

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 9999,
        pointerEvents: "none",
        animation: "previewIn 0.12s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--accent-dim)",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow:
            "var(--shadow-lg), 0 0 0 1px var(--accent-dim), 0 0 24px rgba(200,168,75,0.12)",
          width: `${TOOLTIP_W}px`,
        }}
      >
        <div style={{ background: "#fff", lineHeight: 0 }}>
          <img
            src={src}
            alt=""
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              maxHeight: "290px",
              objectFit: "contain",
              objectPosition: "top",
              filter: "brightness(var(--img-brightness))",
            }}
          />
        </div>
        <div
          style={{
            padding: "6px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.64rem",
            color: "var(--text-secondary)",
            borderTop: "1px solid var(--border)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            background: "var(--bg-surface)",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
