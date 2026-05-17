import React, { useEffect, useRef, useState, useCallback } from "react";
import { SearchHit, DocPage, OcrData, OcrBox } from "../../types";
import { useApp } from "../../lib/AppContext";
import { sanitizeName, getRawFilename, parseTags } from "../../lib/utils";
import styles from "./OcrOverlay.module.css";

interface Props {
  hit: SearchHit;
  query?: string;
  onClose: () => void;
  /** If provided, show all pages in a scrollable viewer */
  allPages?: DocPage[];
  pagesLoading?: boolean;
}

function flatBoxes(ocr: OcrData | null) {
  if (!ocr?.lines) return [];
  return ocr.lines.flatMap((line, li) =>
    (line.boxes || []).map((box, bi) => ({ ...box, lineIdx: li, boxIdx: bi }))
  );
}

function PageViewer({
  page,
  query,
  matchOnly,
  setMatchOnly,
}: {
  page: DocPage;
  query?: string;
  matchOnly: boolean;
  setMatchOnly: (v: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const allBoxesList = flatBoxes(page.ocr);
  const matchBoxes = query
    ? allBoxesList.filter((b) =>
        b.text.toLowerCase().includes(query.toLowerCase())
      )
    : allBoxesList;
  const visibleBoxes = matchOnly && query ? matchBoxes : allBoxesList;

  // Reset when page changes
  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    setHoveredBox(null);
    setNaturalSize({ w: 0, h: 0 });
  }, [page.banner_img]);

  const drawBoxes = useCallback(
    (highlightIdx: number | null) => {
      const canvas = canvasRef.current;
      if (!canvas || !imgLoaded || naturalSize.w === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scaleX = canvasSize.w / naturalSize.w;
      const scaleY = canvasSize.h / naturalSize.h;
      ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

      visibleBoxes.forEach((box, idx) => {
        const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
        const x = ul.x * scaleX;
        const y = ul.y * scaleY;
        const w = (dr.x - ul.x) * scaleX;
        const h = (dr.y - ul.y) * scaleY;
        const isMatch =
          !!query && box.text.toLowerCase().includes(query.toLowerCase());
        const isHovered = idx === highlightIdx;
        const alpha = isHovered ? 0.6 : isMatch ? 0.45 : 0.18;

        ctx.fillStyle = isMatch
          ? `rgba(88, 166, 255, ${alpha})`
          : `rgba(200, 168, 75, ${alpha})`;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = isMatch
          ? isHovered
            ? "rgba(88,166,255,1)"
            : "rgba(88,166,255,0.8)"
          : isHovered
          ? "rgba(200,168,75,0.95)"
          : "rgba(200,168,75,0.5)";
        ctx.lineWidth = isHovered || isMatch ? 2 : 1;
        ctx.strokeRect(x, y, w, h);

        if (box.confidence < 0.8) {
          ctx.fillStyle = "rgba(196,90,74,0.7)";
          ctx.fillRect(x, y, 4, 4);
        }
      });

      if (highlightIdx !== null) {
        const box = visibleBoxes[highlightIdx];
        if (box) {
          const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
          const x = ul.x * scaleX;
          const y = ul.y * scaleY;
          const w2 = (dr.x - ul.x) * scaleX;
          const label = `${box.text}  ·  ${(box.confidence * 100).toFixed(0)}%`;
          ctx.font = "500 12px 'IBM Plex Mono', monospace";
          const tw = ctx.measureText(label).width;
          const px = 8, py = 5, bw = tw + px * 2, bh = 22;
          let tx = x;
          let ty = y - bh - 4;
          if (ty < 0) ty = y + (dr.y - ul.y) * scaleY + 4;
          if (tx + bw > canvasSize.w) tx = canvasSize.w - bw - 4;
          ctx.fillStyle = "rgba(14,13,11,0.92)";
          ctx.beginPath();
          ctx.roundRect(tx, ty, bw, bh, 4);
          ctx.fill();
          ctx.fillStyle = "#c8a84b";
          ctx.fillText(label, tx + px, ty + 15);
        }
      }
    },
    [visibleBoxes, imgLoaded, naturalSize, canvasSize, query]
  );

  useEffect(() => {
    drawBoxes(hoveredBox);
  }, [hoveredBox, drawBoxes]);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    setCanvasSize({ w: rect.width, h: rect.height });
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(syncCanvasSize);
    if (imgRef.current) ro.observe(imgRef.current);
    return () => ro.disconnect();
  }, [imgLoaded, syncCanvasSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || naturalSize.w === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = canvasSize.w / naturalSize.w;
    const scaleY = canvasSize.h / naturalSize.h;
    let found: number | null = null;
    for (let i = visibleBoxes.length - 1; i >= 0; i--) {
      const { upLeftPoint: ul, downRightPoint: dr } =
        visibleBoxes[i].boundingBox;
      const x = ul.x * scaleX, y = ul.y * scaleY;
      const w = (dr.x - ul.x) * scaleX, h = (dr.y - ul.y) * scaleY;
      if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
        found = i;
        break;
      }
    }
    setHoveredBox(found);
  };

  const bannerSrc = page.banner_img || page.ocr?.bannerImgpath;

  return (
    <div className={styles.pageViewerWrap}>
      <div className={styles.imageWrap}>
        {bannerSrc && !imgError ? (
          <div className={styles.imageContainer}>
            <img
              ref={imgRef}
              src={bannerSrc}
              alt=""
              className={styles.image}
              onLoad={(e) => {
                const img = e.currentTarget;
                setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
                setImgLoaded(true);
                setTimeout(syncCanvasSize, 0);
              }}
              onError={() => setImgError(true)}
              draggable={false}
            />
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredBox(null)}
            />
          </div>
        ) : (
          <div className={styles.fallback}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>Seite {page.pageIdx + 1} – kein Bild verfügbar</span>
          </div>
        )}
        {!imgLoaded && !imgError && bannerSrc && (
          <div className={styles.loader}><div className={styles.spinner} /></div>
        )}
      </div>

      {/* OCR sidebar for this page */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitleRow}>
          <p className={styles.sidebarTitle}>
            OCR-Text
            {matchBoxes.length > 0 && query && (
              <span className={styles.sidebarMatchCount}>
                {" "}· {matchBoxes.length} Treffer
              </span>
            )}
          </p>
          {query && allBoxesList.length > 0 && (
            <button
              className={`${styles.matchToggleBtn} ${matchOnly ? styles.matchToggleBtnOn : ""}`}
              onClick={() => setMatchOnly(!matchOnly)}
            >
              Nur Treffer
            </button>
          )}
        </div>
        <div className={styles.lineList}>
          {allBoxesList.length === 0 ? (
            <p className={styles.noOcr}>Keine OCR-Daten für diese Seite</p>
          ) : (
            page.ocr?.lines?.map((line, li) => (
              <div key={li} className={styles.lineGroup}>
                {line.boxes.map((box, bi) => {
                  const visIdx = visibleBoxes.findIndex(
                    (vb) => vb.lineIdx === li && vb.boxIdx === bi
                  );
                  const isMatch =
                    !!query &&
                    box.text.toLowerCase().includes(query.toLowerCase());
                  if (matchOnly && query && !isMatch) return null;
                  return (
                    <span
                      key={bi}
                      className={`${styles.textChip} ${
                        hoveredBox === visIdx ? styles.textChipActive : ""
                      } ${isMatch ? styles.textChipMatch : ""}`}
                      onMouseEnter={() => visIdx >= 0 && setHoveredBox(visIdx)}
                      onMouseLeave={() => setHoveredBox(null)}
                      title={`Konfidenz: ${(box.confidence * 100).toFixed(1)}%`}
                    >
                      {box.text}
                    </span>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function OcrOverlay({ hit, query, onClose, allPages, pagesLoading }: Props) {
  const { settings } = useApp();
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [matchOnly, setMatchOnly] = useState(!!query);
  const [showRawPath, setShowRawPath] = useState(false);
  const [locating, setLocating] = useState(false);

  // Build pages list: prefer allPages if provided; fallback to single hit
  const pages: DocPage[] = allPages && allPages.length > 0
    ? allPages
    : [{
        pageIdx: hit.pageIdx ?? 0,
        banner_img: hit.banner_img,
        ocr: hit.ocr,
      }];

  const currentPage = pages[Math.min(currentPageIdx, pages.length - 1)];
  const cleanName = sanitizeName(hit.filepath);
  const rawName = getRawFilename(hit.filepath);
  const tags = parseTags(hit.assigned_tags);
  const allBoxesCurrent = flatBoxes(currentPage?.ocr ?? null);
  const totalOcrBlocks = pages.reduce(
    (acc, p) => acc + flatBoxes(p.ocr).length,
    0
  );

  // Find pages with matches for query
  const matchingPageIdxs = query
    ? pages
        .map((p, i) => ({
          i,
          count: flatBoxes(p.ocr).filter((b) =>
            b.text.toLowerCase().includes(query.toLowerCase())
          ).length,
        }))
        .filter((x) => x.count > 0)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentPageIdx((i) => Math.min(i + 1, pages.length - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentPageIdx((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, pages.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Reset page index when pages load
  useEffect(() => {
    if (query && matchingPageIdxs.length > 0) {
      setCurrentPageIdx(matchingPageIdxs[0].i);
    } else {
      setCurrentPageIdx(0);
    }
  }, [allPages]);

  const handleLocate = () => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("dms:locate", { detail: { filepath: hit.filepath } })
      );
    }, 50);
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.filenameWrap}>
              <span className={styles.filename}>{cleanName}</span>
              <button
                className={styles.rawToggle}
                onClick={() => setShowRawPath(!showRawPath)}
                title="Rohdateiname / Pfad anzeigen"
              >
                {showRawPath ? "▲" : "▼"}
              </button>
            </div>
            {showRawPath && (
              <div className={styles.rawPath}>
                <span className={styles.rawPathFile}>{rawName}</span>
                <span className={styles.rawPathFull}>{hit.filepath}</span>
              </div>
            )}
            <span className={styles.boxCount}>
              {pagesLoading ? (
                <span className={styles.loadingDots}>lädt Seiten…</span>
              ) : (
                <>
                  {pages.length} {pages.length === 1 ? "Seite" : "Seiten"} · {totalOcrBlocks} OCR-Blöcke
                </>
              )}
            </span>
            {tags.length > 0 && (
              <div className={styles.headerTags}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.headerTag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.headerActions}>
            <button className={styles.locateBtn} onClick={handleLocate} title="Im Archiv anzeigen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12"/>
              </svg>
              Im Archiv
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Schließen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {/* Page strip (left, if multiple pages) */}
          {pages.length > 1 && (
            <div className={styles.pageStrip}>
              <div className={styles.pageStripInner}>
                {pages.map((p, i) => {
                  const matchCount = query
                    ? flatBoxes(p.ocr).filter((b) =>
                        b.text.toLowerCase().includes(query.toLowerCase())
                      ).length
                    : 0;
                  const bannerSrc = p.banner_img || p.ocr?.bannerImgpath;
                  return (
                    <button
                      key={i}
                      className={`${styles.pageThumb} ${i === currentPageIdx ? styles.pageThumbActive : ""} ${matchCount > 0 ? styles.pageThumbMatch : ""}`}
                      onClick={() => setCurrentPageIdx(i)}
                      title={`Seite ${i + 1}${matchCount > 0 ? ` · ${matchCount} Treffer` : ""}`}
                    >
                      {bannerSrc ? (
                        <img src={bannerSrc} alt="" className={styles.pageThumbImg} />
                      ) : (
                        <div className={styles.pageThumbEmpty}>
                          <span>{i + 1}</span>
                        </div>
                      )}
                      <span className={styles.pageThumbNum}>S. {i + 1}</span>
                      {matchCount > 0 && (
                        <span className={styles.pageThumbMatchBadge}>{matchCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main viewer */}
          <div className={styles.viewerArea}>
            {/* Page navigation header */}
            {pages.length > 1 && (
              <div className={styles.pageNav}>
                <button
                  className={styles.pageNavBtn}
                  disabled={currentPageIdx === 0}
                  onClick={() => setCurrentPageIdx((i) => Math.max(0, i - 1))}
                >
                  ‹
                </button>
                <span className={styles.pageNavLabel}>
                  Seite {currentPageIdx + 1} / {pages.length}
                </span>
                <button
                  className={styles.pageNavBtn}
                  disabled={currentPageIdx >= pages.length - 1}
                  onClick={() =>
                    setCurrentPageIdx((i) => Math.min(pages.length - 1, i + 1))
                  }
                >
                  ›
                </button>
                {query && matchingPageIdxs.length > 0 && (
                  <span className={styles.matchPageHint}>
                    Treffer auf: {matchingPageIdxs.map((m) => `S.${m.i + 1}`).join(", ")}
                  </span>
                )}
              </div>
            )}

            {currentPage ? (
              <PageViewer
                page={currentPage}
                query={query}
                matchOnly={matchOnly}
                setMatchOnly={setMatchOnly}
              />
            ) : (
              <div className={styles.fallback}>
                <div className={styles.spinner} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
