import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { SearchHit } from "../../types";
import { useApp } from "../../lib/AppContext";
import styles from "./OcrOverlay.module.css";

interface PageData {
  pageIdx: number;
  banner_img: string;
  ocr: SearchHit["ocr"];
}

interface Props {
  hit: SearchHit;
  allPages?: SearchHit[];
  initialPageIdx?: number;
  matchingPageIdxs?: number[];
  query?: string;
  onClose: () => void;
}

function getFilename(filepath?: string): string {
  if (!filepath) return "Unknown Document";
  const parts = filepath.split(/[\\\/]/);
  const name = parts[parts.length - 1];
  return name
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
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function isPdf(filepath?: string) {
  return !!filepath?.toLowerCase().endsWith(".pdf");
}

// ─── Icons ────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const DownloadIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const PdfIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const ScrollIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <line x1="9" y1="7" x2="15" y2="7" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="13" y2="15" />
  </svg>
);
const GridIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);
const LocateIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </svg>
);

// ─── Single-page canvas overlay ───────────────────────────────
interface PageViewProps {
  page: PageData;
  pageNumber: number;
  query?: string;
  zoom: number;
  isCurrentPage: boolean;
  onVisible: (idx: number) => void;
}

function PageView({
  page,
  pageNumber,
  query,
  zoom,
  isCurrentPage,
  onVisible,
}: PageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);

  const queryTerms = useMemo(
    () => (query || "").toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  const isMatch = useCallback(
    (text: string) =>
      queryTerms.length > 0 &&
      queryTerms.some((t) => text.toLowerCase().includes(t)),
    [queryTerms],
  );

  const allBoxes = useMemo(
    () =>
      page.ocr?.lines?.flatMap((line, li) =>
        (line.boxes || []).map((box, bi) => ({
          ...box,
          lineIdx: li,
          boxIdx: bi,
        })),
      ) ?? [],
    [page],
  );

  // Intersection observer: report when this page is visible
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio > 0.4) onVisible(page.pageIdx);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [page.pageIdx, onVisible]);

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

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgLoaded || naturalSize.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scaleX = canvasSize.w / naturalSize.w;
    const scaleY = canvasSize.h / naturalSize.h;
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    allBoxes.forEach((box, idx) => {
      const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
      const x = ul.x * scaleX,
        y = ul.y * scaleY;
      const w = (dr.x - ul.x) * scaleX,
        h = (dr.y - ul.y) * scaleY;
      const isMt = isMatch(box.text);
      const isHov = idx === hoveredBox;
      if (!isMt && !isHov) return; // only draw matches + hovered for perf

      let alpha = isHov ? 0.6 : 0.45;
      ctx.fillStyle = isMt
        ? `rgba(88,166,255,${alpha})`
        : `rgba(200,168,75,${alpha})`;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = isMt
        ? isHov
          ? "rgba(88,166,255,1)"
          : "rgba(88,166,255,0.8)"
        : isHov
          ? "rgba(200,168,75,0.95)"
          : "rgba(200,168,75,0.5)";
      ctx.lineWidth = isHov || isMt ? 2 : 1;
      ctx.strokeRect(x, y, w, h);
    });

    // Hover tooltip
    if (hoveredBox !== null && allBoxes[hoveredBox]) {
      const box = allBoxes[hoveredBox];
      const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
      const x = ul.x * scaleX,
        y = ul.y * scaleY;
      const label = `${box.text}  ·  ${(box.confidence * 100).toFixed(0)}%`;
      ctx.font = "500 12px 'IBM Plex Mono', monospace";
      const tw = ctx.measureText(label).width;
      const px = 8,
        bw = tw + px * 2,
        bh = 22;
      let tx = x,
        ty = y - bh - 4;
      if (ty < 0) ty = (dr.y - ul.y) * scaleY + y + 4;
      if (tx + bw > canvasSize.w) tx = canvasSize.w - bw - 4;
      ctx.fillStyle = "rgba(14,13,11,0.92)";
      ctx.beginPath();
      ctx.roundRect(tx, ty, bw, bh, 4);
      ctx.fill();
      ctx.fillStyle = "#c8a84b";
      ctx.fillText(label, tx + px, ty + 15);
    }
  }, [hoveredBox, allBoxes, imgLoaded, naturalSize, canvasSize, isMatch]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || naturalSize.w === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left,
      my = e.clientY - rect.top;
    const scaleX = canvasSize.w / naturalSize.w,
      scaleY = canvasSize.h / naturalSize.h;
    let found: number | null = null;
    for (let i = allBoxes.length - 1; i >= 0; i--) {
      const { upLeftPoint: ul, downRightPoint: dr } = allBoxes[i].boundingBox;
      if (
        mx >= ul.x * scaleX &&
        mx <= dr.x * scaleX &&
        my >= ul.y * scaleY &&
        my <= dr.y * scaleY
      ) {
        found = i;
        break;
      }
    }
    setHoveredBox(found);
  };

  const matchCount = allBoxes.filter((b) => isMatch(b.text)).length;

  return (
    <div
      ref={wrapRef}
      className={styles.pageBlock}
      data-page-idx={page.pageIdx}
    >
      <div className={styles.pageLabel}>
        <span>Seite {pageNumber}</span>
        {matchCount > 0 && (
          <span className={styles.pageLabelMatch}>{matchCount} Treffer</span>
        )}
      </div>
      <div
        className={styles.imageContainer}
        style={{ width: `${Math.min(800, 800 * zoom)}px` }}
      >
        <img
          ref={imgRef}
          src={page.banner_img}
          alt={`Seite ${pageNumber}`}
          className={styles.image}
          draggable={false}
          style={{ width: "100%", height: "auto" }}
          onLoad={(e) => {
            const img = e.currentTarget;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            setImgLoaded(true);
            setTimeout(syncCanvasSize, 0);
          }}
        />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredBox(null)}
          style={{ cursor: "crosshair" }}
        />
      </div>
    </div>
  );
}

// ─── Main overlay ─────────────────────────────────────────────
export default function OcrOverlay({
  hit,
  initialPageIdx = 0,
  matchingPageIdxs,
  query,
  onClose,
}: Props) {
  const { settings } = useApp();
  const [pages, setPages] = useState<PageData[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [currentPageIdx, setCurrentPageIdx] = useState(initialPageIdx);
  const [zoom, setZoom] = useState(1);
  const [pdfMode, setPdfMode] = useState(false);
  const [jumpInput, setJumpInput] = useState("");
  const [showJump, setShowJump] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageBlockRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const filename = getFilename(hit?.filepath);
  const totalPages = pages.length || 1;
  const matchingPgIdxs = matchingPageIdxs ?? [];

  // Load pages
  useEffect(() => {
    if (!hit.filepath) return;
    setPagesLoading(true);
    fetch(
      `${settings.serverUrl}/pages?filepath=${encodeURIComponent(hit.filepath)}`,
    )
      .then((r) => r.json())
      .then((data: { pages: PageData[] }) => {
        setPages(
          data.pages?.length > 0
            ? data.pages
            : [{ pageIdx: 0, banner_img: hit.banner_img, ocr: hit.ocr }],
        );
      })
      .catch(() =>
        setPages([{ pageIdx: 0, banner_img: hit.banner_img, ocr: hit.ocr }]),
      )
      .finally(() => setPagesLoading(false));
  }, [hit.filepath, settings.serverUrl]);

  // Scroll to initialPageIdx once pages load
  useEffect(() => {
    if (pages.length === 0 || initialPageIdx === 0) return;
    setTimeout(() => {
      const el = scrollContainerRef.current?.querySelector(
        `[data-page-idx="${initialPageIdx}"]`,
      ) as HTMLElement;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [pages.length, initialPageIdx]);

  const handlePageVisible = useCallback((idx: number) => {
    setCurrentPageIdx(idx);
  }, []);

  const goToPage = useCallback((idx: number) => {
    setCurrentPageIdx(idx);
    const el = scrollContainerRef.current?.querySelector(
      `[data-page-idx="${idx}"]`,
    ) as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleDownload = async () => {
    const url = `${settings.serverUrl}/download/consume?filepath=${encodeURIComponent(hit.filepath)}&attachment=1`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download =
        filename + (hit.filepath.match(/\.(pdf|png|jpe?g)$/i)?.[0] ?? "");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleLocate = () => {
    onClose();
    setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("dms:locate", { detail: { filepath: hit.filepath } }),
        ),
      50,
    );
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pdfMode) {
          setPdfMode(false);
          return;
        }
        onClose();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (!e.ctrlKey) goToPage(Math.min(currentPageIdx + 1, totalPages - 1));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (!e.ctrlKey) goToPage(Math.max(currentPageIdx - 1, 0));
      }
      if ((e.key === "+" || e.key === "=") && !e.ctrlKey)
        setZoom((z) => Math.min(5, z + 0.25));
      if (e.key === "-" && !e.ctrlKey) setZoom((z) => Math.max(0.3, z - 0.25));
      if (e.key === "0") setZoom(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, totalPages, pdfMode, currentPageIdx, goToPage]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleJump = () => {
    const n = parseInt(jumpInput, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      goToPage(n - 1);
      setShowJump(false);
      setJumpInput("");
    }
  };

  // PDF native view
  if (pdfMode && isPdf(hit.filepath)) {
    const pdfUrl = `${settings.serverUrl}/download/consume?filepath=${encodeURIComponent(hit.filepath)}`;
    return (
      <div
        className={styles.backdrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) setPdfMode(false);
        }}
      >
        <div className={styles.pdfViewerModal}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.filename}>{filename}</span>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.actionBtn} onClick={handleDownload}>
                <DownloadIcon /> Download
              </button>
              <button
                className={styles.closeBtn}
                onClick={() => setPdfMode(false)}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <iframe src={pdfUrl} className={styles.pdfFrame} title={filename} />
        </div>
      </div>
    );
  }

  const displayPages =
    pages.length > 0
      ? pages
      : [{ pageIdx: 0, banner_img: hit.banner_img, ocr: hit.ocr }];

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <span className={styles.filename}>{filename}</span>
            {pagesLoading ? (
              <span
                className={styles.boxCount}
                style={{ color: "var(--text-muted)" }}
              >
                laden…
              </span>
            ) : (
              <span className={styles.boxCount}>{totalPages} Seiten</span>
            )}
          </div>
          <div className={styles.headerActions}>
            {/* Zoom */}
            <div className={styles.zoomRow}>
              <button
                className={styles.zoomBtn}
                onClick={() =>
                  setZoom((z) => Math.max(0.3, +(z - 0.25).toFixed(2)))
                }
              >
                −
              </button>
              <span className={styles.zoomLabel}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                className={styles.zoomBtn}
                onClick={() =>
                  setZoom((z) => Math.min(5, +(z + 0.25).toFixed(2)))
                }
              >
                +
              </button>
              <button
                className={styles.zoomBtnReset}
                onClick={() => setZoom(1)}
              >
                1:1
              </button>
            </div>

            {isPdf(hit.filepath) && (
              <button
                className={styles.actionBtn}
                onClick={() => setPdfMode(true)}
                title="Native PDF-Ansicht"
              >
                <PdfIcon /> PDF
              </button>
            )}
            <button
              className={styles.actionBtn}
              onClick={handleDownload}
              title="Herunterladen"
            >
              <DownloadIcon />
            </button>
            <button
              className={styles.locateBtn}
              onClick={handleLocate}
              title="Im Archiv anzeigen"
            >
              <LocateIcon /> Im Archiv
            </button>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Schließen"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Page nav bar */}
        <div className={styles.pageBar}>
          <button
            className={styles.pageNavBtn}
            disabled={currentPageIdx === 0}
            onClick={() => goToPage(currentPageIdx - 1)}
          >
            ‹
          </button>

          {showJump ? (
            <div className={styles.jumpWrap}>
              <input
                className={styles.jumpInput}
                type="number"
                min={1}
                max={totalPages}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJump();
                  if (e.key === "Escape") {
                    setShowJump(false);
                    setJumpInput("");
                  }
                }}
                autoFocus
                placeholder={`1–${totalPages}`}
              />
              <button className={styles.jumpGoBtn} onClick={handleJump}>
                Go
              </button>
              <button
                className={styles.jumpCancelBtn}
                onClick={() => {
                  setShowJump(false);
                  setJumpInput("");
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className={styles.pageIndicator}
              onClick={() => setShowJump(true)}
              title="Zur Seite springen"
            >
              Seite {currentPageIdx + 1} / {totalPages}
            </button>
          )}

          <button
            className={styles.pageNavBtn}
            disabled={currentPageIdx >= totalPages - 1}
            onClick={() => goToPage(currentPageIdx + 1)}
          >
            ›
          </button>

          {/* Match page dots */}
          {matchingPgIdxs.length > 0 && (
            <div className={styles.matchPageDots}>
              <span className={styles.matchPageLabel}>Treffer:</span>
              {matchingPgIdxs.map((pi) => (
                <button
                  key={pi}
                  className={`${styles.matchPageDot} ${pi === currentPageIdx ? styles.matchPageDotActive : ""}`}
                  onClick={() => goToPage(pi)}
                  title={`Seite ${pi + 1}`}
                >
                  {pi + 1}
                </button>
              ))}
            </div>
          )}

          {/* Page dots (≤30) */}
          {totalPages <= 30 && (
            <div className={styles.pageDots}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.pageDot} ${i === currentPageIdx ? styles.pageDotActive : ""} ${matchingPgIdxs.includes(i) ? styles.pageDotMatch : ""}`}
                  onClick={() => goToPage(i)}
                  title={`Seite ${i + 1}${matchingPgIdxs.includes(i) ? " ✓" : ""}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Continuous scroll area — all pages stacked */}
        <div className={styles.imageWrap} ref={scrollContainerRef}>
          {displayPages.map((pg, i) => (
            <PageView
              key={pg.pageIdx}
              page={pg}
              pageNumber={i + 1}
              query={query}
              zoom={zoom}
              isCurrentPage={pg.pageIdx === currentPageIdx}
              onVisible={handlePageVisible}
            />
          ))}
        </div>

        {/* Sidebar: OCR text for current page */}
        <div className={styles.sidebar}>
          <p className={styles.sidebarTitle}>
            OCR-Text · S. {currentPageIdx + 1}
          </p>
          <div className={styles.lineList}>
            {(() => {
              const pg =
                displayPages.find((p) => p.pageIdx === currentPageIdx) ??
                displayPages[0];
              const queryTerms = (query || "")
                .toLowerCase()
                .split(/\s+/)
                .filter(Boolean);
              const isMatch = (text: string) =>
                queryTerms.length > 0 &&
                queryTerms.some((t) => text.toLowerCase().includes(t));
              return pg?.ocr?.lines?.map((line, li) => (
                <div key={li} className={styles.lineGroup}>
                  {line.boxes.map((box, bi) => {
                    const isMt = isMatch(box.text);
                    return (
                      <span
                        key={bi}
                        className={`${styles.textChip} ${isMt ? styles.textChipMatch : ""}`}
                        title={`Konfidenz: ${(box.confidence * 100).toFixed(1)}%`}
                      >
                        {box.text}
                      </span>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
