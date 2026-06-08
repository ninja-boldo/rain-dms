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
  initialPageIdx?: number;
  matchingPageIdxs?: number[];
  query?: string;
  onClose: () => void;
}

// Clean sanitization protecting German Umlauts & stripping raw UUID strings
function getFilename(filepath?: string): string {
  if (!filepath) return "Unbekanntes Dokument";
  const parts = filepath.split(/[\\\/]/);
  let name = parts[parts.length - 1];
  
  // Strip UUID hashes, object notations, and trailing timestamps
  name = name
    .replace(/-\[object Object\]-[\d-T:.Z]+\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/\.(pdf|png|jpe?g)$/i, "");

  // Add spaces between text and numbers gracefully without swallowing letters
  return name
    .replace(/([a-zA-ZäöüÄÖÜß])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-ZäöüÄÖÜß])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}

function rewriteBannerUrl(bannerUrl: string | undefined, serverUrl: string): string {
  if (!bannerUrl) return "";
  try {
    const url = new URL(bannerUrl);
    if (url.pathname.startsWith("/s3/")) {
      return `${serverUrl}${url.pathname}`;
    }
    return bannerUrl;
  } catch {
    return bannerUrl;
  }
}

// ─── SVG Icons ────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ZoomInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const ZoomOutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Precision Scaled Page Element ───────────────────────────
interface PageViewProps {
  page: PageData;
  pageNumber: number;
  query?: string;
  zoom: number;
  hoveredBoxId: string | null;
  setHoveredBoxId: (id: string | null) => void;
  onVisible: (renderPos: number) => void;
  renderPos: number;
  onCanvasHoverText: (text: string | null, clientX: number, clientY: number) => void;
}

function PageView({
  page,
  pageNumber,
  query,
  zoom,
  hoveredBoxId,
  setHoveredBoxId,
  onVisible,
  renderPos,
  onCanvasHoverText,
}: PageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const queryTerms = useMemo(
    () => (query || "").toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );

  const isMatch = useCallback(
    (text: string) => queryTerms.length > 0 && queryTerms.some((t) => text.toLowerCase().includes(t)),
    [queryTerms],
  );

  const allBoxes = useMemo(() => {
    const boxes: Array<any> = [];
    page.ocr?.lines?.forEach((line, li) => {
      line.boxes?.forEach((box, bi) => {
        boxes.push({
          ...box,
          id: `${renderPos}-${li}-${bi}`,
          lineIdx: li,
          boxIdx: bi,
        });
      });
    });
    return boxes;
  }, [page, renderPos]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio > 0.4) onVisible(renderPos);
      },
      { threshold: [0.4], rootMargin: "-10% 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [renderPos, onVisible]);

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
  }, [imgLoaded, syncCanvasSize, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgLoaded || canvasSize.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    allBoxes.forEach((box) => {
      const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
      
      // Calculate responsive absolute bounds dynamically matching image container geometry
      const scaleX = canvasSize.w / (naturalSize.w || 1);
      const scaleY = canvasSize.h / (naturalSize.h || 1);

      const x = ul.x * scaleX;
      const y = ul.y * scaleY;
      const w = (dr.x - ul.x) * scaleX;
      const h = (dr.y - ul.y) * scaleY;

      const hasMatch = isMatch(box.text);
      const isHovered = box.id === hoveredBoxId;

      if (isHovered) {
        ctx.fillStyle = "rgba(56, 139, 253, 0.35)";
        ctx.strokeStyle = "#58a6ff";
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      } else if (hasMatch) {
        ctx.fillStyle = "rgba(249, 226, 175, 0.25)";
        ctx.strokeStyle = "#f9e2af";
        ctx.lineWidth = 1.5;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }
    });
  }, [allBoxes, canvasSize, imgLoaded, isMatch, hoveredBoxId, naturalSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let foundBox: any = null;
    for (let i = allBoxes.length - 1; i >= 0; i--) {
      const box = allBoxes[i];
      const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
      const scaleX = canvasSize.w / (naturalSize.w || 1);
      const scaleY = canvasSize.h / (naturalSize.h || 1);

      const x1 = ul.x * scaleX;
      const y1 = ul.y * scaleY;
      const x2 = dr.x * scaleX;
      const y2 = dr.y * scaleY;

      if (mx >= x1 && mx <= x2 && my >= y1 && my <= y2) {
        foundBox = box;
        break;
      }
    }

    if (foundBox) {
      if (foundBox.id !== hoveredBoxId) {
        setHoveredBoxId(foundBox.id);
        const sidebarEl = document.getElementById(`side-card-${foundBox.id}`);
        sidebarEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      onCanvasHoverText(foundBox.text, e.clientX, e.clientY);
    } else {
      if (hoveredBoxId !== null) setHoveredBoxId(null);
      onCanvasHoverText(null, 0, 0);
    }
  };

  return (
    <div ref={wrapRef} data-render-pos={renderPos} className={styles.pageBlock} style={{ width: `${95 * zoom}%`, maxWidth: `${900 * zoom}px` }}>
      <div className={styles.pageLabel}>
        <span>Seite {pageNumber}</span>
      </div>
      <div className={styles.imageContainer}>
        <img
          ref={imgRef}
          src={page.banner_img}
          alt={`Dokumentenseite ${pageNumber}`}
          className={styles.image}
          draggable={false}
          onLoad={(e) => {
            setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
            setImgLoaded(true);
            setTimeout(syncCanvasSize, 50);
          }}
        />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoveredBoxId(null);
            onCanvasHoverText(null, 0, 0);
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Component Window ──────────────────────────────────────
export default function OcrOverlay({
  hit,
  initialPageIdx = 0,
  matchingPageIdxs = [],
  query = "",
  onClose,
}: Props) {
  const { settings, getAuthHeaders } = useApp();
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentRenderPos, setCurrentRenderPos] = useState(initialPageIdx);
  const [zoom, setZoom] = useState(1.0);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  
  // Custom manual page selection state
  const [manualPage, setManualPage] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const filename = getFilename(hit?.filepath);

  useEffect(() => {
    if (!hit.filepath) return;
    fetch(`${settings.serverUrl}/pages?filepath=${encodeURIComponent(hit.filepath)}`, {
      headers: getAuthHeaders(),
    })
      .then((r) => (r.ok ? r.json() : { pages: [] }))
      .then((data: { pages: PageData[] }) => {
        if (data.pages?.length > 0) {
          setPages(data.pages.map((p) => ({ ...p, banner_img: rewriteBannerUrl(p.banner_img, settings.serverUrl) })));
        } else {
          setPages([{ pageIdx: 0, banner_img: rewriteBannerUrl(hit.banner_img, settings.serverUrl), ocr: hit.ocr }]);
        }
      })
      .catch(() => {
        setPages([{ pageIdx: 0, banner_img: rewriteBannerUrl(hit.banner_img, settings.serverUrl), ocr: hit.ocr }]);
      });
  }, [hit.filepath, settings.serverUrl]);

  const goToRenderPos = useCallback((pos: number) => {
    const clamped = Math.max(0, Math.min(pos, pages.length - 1));
    setCurrentRenderPos(clamped);
    const scrollTo = (attempts = 0) => {
      const el = scrollContainerRef.current?.querySelector(`[data-render-pos="${clamped}"]`) as HTMLElement;
      if (el) { el.scrollIntoView({ behavior: attempts === 0 ? "smooth" : "auto", block: "start" }); return; }
      if (attempts < 8) requestAnimationFrame(() => scrollTo(attempts + 1));
    };
    scrollTo();
  }, [pages.length]);

  // Auto-jump to initialPageIdx once pages have loaded (fixes search-result click landing on wrong page)
  const hasSoughtInitial = useRef(false);
  useEffect(() => {
    if (pages.length === 0 || hasSoughtInitial.current) return;
    hasSoughtInitial.current = true;
    if (initialPageIdx <= 0) return;
    // Delay to let all PageView elements mount
    const t = setTimeout(() => goToRenderPos(initialPageIdx), 250);
    return () => clearTimeout(t);
  }, [pages.length > 0]);

  const handleManualPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsePage = parseInt(manualPage, 10);
    if (!isNaN(parsePage) && parsePage > 0 && parsePage <= pages.length) {
      goToRenderPos(parsePage - 1);
    }
    setManualPage("");
  };

  const handleDownload = async () => {
    if (!hit?.filepath) return;
    const url = `${settings.serverUrl}/files/${encodeURIComponent(hit.filepath)}`;
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename + (hit.filepath.match(/\.(pdf|png|jpe?g)$/i)?.[0] ?? ".pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handlePageVisible = useCallback((renderPos: number) => {
    setCurrentRenderPos(renderPos);
  }, []);

  const handleCanvasHoverText = useCallback((text: string | null, clientX: number, clientY: number) => {
    if (!text) {
      setTooltip(null);
    } else {
      setTooltip({ text, x: clientX, y: clientY });
    }
  }, []);

  const activePage = pages[currentRenderPos] ?? pages[0];

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Control Panel */}
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.filename} title={hit?.filepath}>{filename}</span>
            <div className={styles.paginationChunkGroup}>
              {pages.map((p, idx) => {
                const isActive = idx === currentRenderPos;
                const isMatch = matchingPageIdxs.includes(p.pageIdx);
                return (
                  <button
                    key={p.pageIdx}
                    onClick={() => goToRenderPos(idx)}
                    className={`${styles.pageChunkBtn} ${isActive ? styles.pageChunkBtnActive : ""} ${isMatch ? styles.pageChunkBtnMatch : ""}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Direct Jump Input Form */}
            <form onSubmit={handleManualPageSubmit} className={styles.manualPageForm}>
              <input
                type="text"
                placeholder={`Gehe zu (1-${pages.length})...`}
                value={manualPage}
                onChange={(e) => setManualPage(e.target.value)}
                className={styles.manualPageInput}
              />
            </form>
          </div>

          <div className={styles.toolbarRight}>
            <div className={styles.zoomContainer}>
              <button className={styles.zoomIconBtn} onClick={() => setZoom(z => Math.max(0.5, z - 0.15))} title="Herauszoomen">
                <ZoomOutIcon />
              </button>
              <span className={styles.zoomValueStr}>{Math.round(zoom * 100)}%</span>
              <button className={styles.zoomIconBtn} onClick={() => setZoom(z => Math.min(3.0, z + 0.15))} title="Heranzoomen">
                <ZoomInIcon />
              </button>
            </div>
            
            <button className={styles.downloadFileBtn} onClick={handleDownload} title="Dokument herunterladen">
              <DownloadIcon />
            </button>

            <button className={styles.closeOverlayBtn} onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Center Document Continuous Viewport */}
        <div className={styles.imageWrap} ref={scrollContainerRef}>
          {pages.map((pg, i) => (
            <PageView
              key={pg.pageIdx}
              page={pg}
              pageNumber={i + 1}
              query={query}
              zoom={zoom}
              hoveredBoxId={hoveredBoxId}
              setHoveredBoxId={setHoveredBoxId}
              onVisible={handlePageVisible}
              renderPos={i}
              onCanvasHoverText={handleCanvasHoverText}
            />
          ))}
        </div>

        {/* Right Extracted OCR Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>Extrahiert (Seite {currentRenderPos + 1})</span>
            <label className={styles.coordToggle}>
              <input type="checkbox" checked={showCoordinates} onChange={(e) => setShowCoordinates(e.target.checked)} />
              <span>Koordinaten</span>
            </label>
          </div>

          <div className={styles.lineListStream}>
            {activePage?.ocr?.lines?.map((line, li) => (
              <div key={li} className={styles.lineRowGroup}>
                {line.boxes?.map((box, bi) => {
                  const currentBoxId = `${currentRenderPos}-${li}-${bi}`;
                  const isHovered = currentBoxId === hoveredBoxId;
                  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
                  const isWordMatch = queryTerms.length > 0 && queryTerms.some((t) => box.text.toLowerCase().includes(t));

                  return (
                    <div
                      key={bi}
                      id={`side-card-${currentBoxId}`}
                      className={`${styles.textInspectCard} ${isHovered ? styles.textInspectCardActive : ""} ${isWordMatch ? styles.textInspectCardMatch : ""}`}
                      onMouseEnter={() => setHoveredBoxId(currentBoxId)}
                      onMouseLeave={() => setHoveredBoxId(null)}
                    >
                      <div className={styles.cardHeaderRow}>
                        <span className={styles.extractedText}>{box.text}</span>
                        <span className={styles.confidenceScore}>{(box.confidence * 100).toFixed(0)}%</span>
                      </div>

                      {showCoordinates && box.boundingBox && (
                        <div className={styles.coordsBlock}>
                          <div>P1: [{box.boundingBox.upLeftPoint.x}, {box.boundingBox.upLeftPoint.y}]</div>
                          <div>P2: [{box.boundingBox.downRightPoint.x}, {box.boundingBox.downRightPoint.y}]</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {(!activePage?.ocr?.lines || activePage.ocr.lines.length === 0) && (
              <div className={styles.emptyState}>Kein OCR-Text vorhanden</div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Canvas Tooltip Element */}
      {tooltip && (
        <div className={styles.canvasTextTooltip} style={{ top: tooltip.y + 15, left: tooltip.x + 15 }}>
          <div className={styles.tooltipLabel}>Erkanntes Textfragment:</div>
          <div className={styles.tooltipContent}>{tooltip.text}</div>
        </div>
      )}
    </div>
  );
}