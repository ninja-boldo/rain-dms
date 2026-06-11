import React, {
  useEffect, useRef, useState, useCallback, useMemo,
} from "react";
import { SearchHit } from "../../types";
import { useApp } from "../../lib/AppContext";
import styles from "./OcrOverlay.module.css";
import AuthImg from "../common/AuthImg";

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
  initialViewMode?: "ocr" | "pdf";
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isHashName(name: string): boolean {
  const stripped = name.replace(/[^a-fA-F0-9]/g, "");
  return name.length > 16 && stripped.length / name.length > 0.72;
}

function getFilename(filepath?: string, tags?: string[]): string {
  if (!filepath) return "Document";
  const parts = filepath.split(/[/\/]/);
  const raw = parts[parts.length - 1].replace(/\.(pdf|png|jpe?g)$/i, "").replace(/[_-]+/g, " ").trim();
  if (!isHashName(raw) && raw.length > 0 && raw.length < 80)
    return raw.replace(/^./, (c) => c.toUpperCase());
  const tagSet = new Set((tags ?? []).map((t) => t.toLowerCase()));
  const folders = parts.slice(0, -1).filter((p) => p && !tagSet.has(p.toLowerCase()));
  if (folders.length > 0) return folders[folders.length - 1].replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
  return raw.slice(0, 40) || "Document";
}

/** Build the breadcrumb path segments, hiding parts that are already tags */
function buildBreadcrumbs(filepath: string, tags: string[], pathPrefixes: string[]): string[] {
  let rel = filepath;
  // Strip configured path prefixes
  for (const prefix of pathPrefixes) {
    const p = prefix.endsWith("/") ? prefix : prefix + "/";
    if (rel.startsWith(p)) { rel = rel.slice(p.length); break; }
    if (rel.startsWith(prefix)) { rel = rel.slice(prefix.length).replace(/^\//, ""); break; }
  }
  const segments = rel.split(/[/\\]/).filter(Boolean);
  const tagSet = new Set(tags.map((t) => t.toLowerCase()));
  // Hide segments that match a tag (they're already shown as tag pills)
  return segments
    .slice(0, -1) // exclude filename itself
    .filter((s) => !tagSet.has(s.toLowerCase()));
}

function rewriteUrl(url: string, serverUrl: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/s3/")) return `${serverUrl}${u.pathname}`;
    return `${serverUrl}/s3${u.pathname}`;
  } catch {
    if (url.startsWith("/s3/")) return `${serverUrl}${url}`;
    return url;
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ZoomIn = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const ZoomOut = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ─── PageView (OCR mode) ──────────────────────────────────────────────────────
interface PageViewProps {
  page: PageData;
  pageNumber: number;
  query?: string;
  zoom: number;
  hoveredBoxId: string | null;
  setHoveredBoxId: (id: string | null) => void;
  onVisible: (pos: number) => void;
  renderPos: number;
  onHoverText: (text: string | null, x: number, y: number) => void;
}

function PageView({ page, pageNumber, query, zoom, hoveredBoxId, setHoveredBoxId, onVisible, renderPos, onHoverText }: PageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const terms = useMemo(() => (query || "").toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const isMatch = useCallback((text: string) => terms.some((t) => text.toLowerCase().includes(t)), [terms]);

  const allBoxes = useMemo(() => {
    const boxes: any[] = [];
    page.ocr?.lines?.forEach((line, li) => {
      line.boxes?.forEach((box, bi) => {
        boxes.push({ ...box, id: `${renderPos}-${li}-${bi}`, lineIdx: li, boxIdx: bi });
      });
    });
    return boxes;
  }, [page, renderPos]);

  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.intersectionRatio > 0.3) onVisible(renderPos); }, { threshold: [0.3] });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [renderPos, onVisible]);

  const syncCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    setCanvasSize({ w: rect.width, h: rect.height });
  }, []);

  useEffect(() => {
    if (!imgRef.current) return;
    const ro = new ResizeObserver(syncCanvas);
    ro.observe(imgRef.current);
    return () => ro.disconnect();
  }, [imgLoaded, syncCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgLoaded || canvasSize.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
    const sx = canvasSize.w / (naturalSize.w || 1);
    const sy = canvasSize.h / (naturalSize.h || 1);
    allBoxes.forEach((box) => {
      const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
      const x = ul.x * sx, y = ul.y * sy, w = (dr.x - ul.x) * sx, h = (dr.y - ul.y) * sy;
      const hovered = box.id === hoveredBoxId;
      const matched = isMatch(box.text);
      if (hovered) {
        ctx.fillStyle = "rgba(56,139,253,0.32)";
        ctx.strokeStyle = "#58a6ff";
        ctx.lineWidth = 2;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      } else if (matched) {
        ctx.fillStyle = "rgba(var(--accent-rgb,124,58,237),0.18)";
        ctx.strokeStyle = "var(--accent,#7c3aed)";
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
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let found: any = null;
    for (let i = allBoxes.length - 1; i >= 0; i--) {
      const box = allBoxes[i];
      const { upLeftPoint: ul, downRightPoint: dr } = box.boundingBox;
      const sx = canvasSize.w / (naturalSize.w || 1), sy = canvasSize.h / (naturalSize.h || 1);
      if (mx >= ul.x * sx && mx <= dr.x * sx && my >= ul.y * sy && my <= dr.y * sy) { found = box; break; }
    }
    if (found) {
      if (found.id !== hoveredBoxId) {
        setHoveredBoxId(found.id);
        document.getElementById(`side-${found.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      onHoverText(found.text, e.clientX, e.clientY);
    } else {
      if (hoveredBoxId) setHoveredBoxId(null);
      onHoverText(null, 0, 0);
    }
  };

  // Retry with cache-busting on error (handles stale/flaky S3 responses)
  const handleError = () => {
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount((n) => n + 1);
        setImgError(false);
        if (imgRef.current) {
          imgRef.current.src = page.banner_img + (page.banner_img.includes("?") ? "&" : "?") + `_r=${Date.now()}`;
        }
      }, 800 * (retryCount + 1));
    } else {
      setImgError(true);
    }
  };

  return (
    <div ref={wrapRef} data-render-pos={renderPos} className={styles.pageBlock}
      style={{ width: `${95 * zoom}%`, maxWidth: `${920 * zoom}px` }}>
      <div className={styles.pageLabel}>Page {pageNumber}</div>
      <div className={styles.imageContainer}>
        <AuthImg
          src={page.banner_img}
          alt={`Page ${pageNumber}`}
          className={styles.image}
          skeletonClass={styles.imgSkeleton}
          style={{ display: "block", width: "100%", height: "auto" }}
          onLoad={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
            setImgLoaded(true);
            setTimeout(syncCanvas, 30);
          }}
          fallback={
            <div className={styles.imgErrorBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>Page {pageNumber} — image unavailable</span>
            </div>
          }
        />
        <canvas ref={canvasRef} className={styles.canvas}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredBoxId(null); onHoverText(null, 0, 0); }}
        />
      </div>
    </div>
  );
}

// ─── Main OcrOverlay ──────────────────────────────────────────────────────────
export default function OcrOverlay({ hit, initialPageIdx = 0, matchingPageIdxs = [], query = "", initialViewMode = "ocr", onClose }: Props) {
  const { settings, getAuthHeaders } = useApp();
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPos, setCurrentPos] = useState(initialPageIdx);
  const [zoom, setZoom] = useState(1.0);
  const [showCoords, setShowCoords] = useState(false);
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [manualPage, setManualPage] = useState("");
  const [viewMode, setViewMode] = useState<"ocr" | "pdf">(initialViewMode);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSought = useRef(false);
  const filename = getFilename(hit?.filepath, hit?.assigned_tags ?? []);

  // Path breadcrumbs from settings
  const pathPrefixes: string[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("rain-dms-path-prefixes") ?? "[]"); } catch { return []; }
  }, []);
  const breadcrumbs = useMemo(() =>
    hit?.filepath ? buildBreadcrumbs(hit.filepath, hit.assigned_tags ?? [], pathPrefixes) : [],
  [hit?.filepath, hit?.assigned_tags, pathPrefixes]);

  // ── Load pages ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hit?.filepath) return;
    fetch(`${settings.serverUrl}/pages?filepath=${encodeURIComponent(hit.filepath)}`, { headers: getAuthHeaders() })
      .then((r) => r.ok ? r.json() : { pages: [] })
      .then((data: { pages: PageData[] }) => {
        const list = data.pages?.length
          ? data.pages.map((p) => ({ ...p, banner_img: rewriteUrl(p.banner_img, settings.serverUrl) }))
          : [{ pageIdx: 0, banner_img: rewriteUrl(hit.banner_img, settings.serverUrl), ocr: hit.ocr }];
        setPages(list);
      })
      .catch(() => setPages([{ pageIdx: 0, banner_img: rewriteUrl(hit.banner_img, settings.serverUrl), ocr: hit.ocr }]));
  }, [hit?.filepath]);

  const goTo = useCallback((pos: number) => {
    const clamped = Math.max(0, Math.min(pos, pages.length - 1));
    setCurrentPos(clamped);
    const scroll = (n = 0) => {
      const el = scrollRef.current?.querySelector(`[data-render-pos="${clamped}"]`) as HTMLElement;
      if (el) { el.scrollIntoView({ behavior: n === 0 ? "smooth" : "auto", block: "start" }); return; }
      if (n < 10) requestAnimationFrame(() => scroll(n + 1));
    };
    scroll();
  }, [pages.length]);

  useEffect(() => {
    if (!pages.length || hasSought.current) return;
    hasSought.current = true;
    if (initialPageIdx > 0) setTimeout(() => goTo(initialPageIdx), 200);
  }, [pages.length > 0]);

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(currentPos + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(currentPos - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [currentPos, goTo, onClose]);

  // ── Derive PDF URL from first page ─────────────────────────────────────────
  const derivePdfUrl = useCallback((): string => {
    if (!hit?.filepath) return "";
    const ext = hit.filepath.match(/\.([^.]+)$/i)?.[1] ?? "pdf";
    // Use pages[0] banner URL to determine the S3 path prefix
    const first = pages[0];
    if (first?.banner_img) {
      try {
        const u = new URL(first.banner_img);
        const pageBase = u.pathname.replace(/-page\d+\.[a-zA-Z]+$/i, `.${ext}`);
        return `${settings.serverUrl}${pageBase}`;
      } catch {}
    }
    // Fallback: derive directly from filepath
    return `${settings.serverUrl}/s3/uploads/${encodeURIComponent(hit.filepath)}`;
  }, [pages, hit?.filepath, settings.serverUrl]);

  const loadPdf = useCallback(async () => {
    if (pdfUrl || pdfLoading) return;
    setPdfLoading(true);
    setPdfError(null);
    const url = derivePdfUrl();
    if (!url) { setPdfError("Could not determine PDF URL."); setPdfLoading(false); return; }
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
      const blob = await res.blob();
      if (!blob.type.includes("pdf") && !blob.type.includes("octet") && blob.size < 500) {
        throw new Error("Response doesn't look like a PDF");
      }
      setPdfUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setPdfError(e.message);
    } finally {
      setPdfLoading(false);
    }
  }, [pdfUrl, pdfLoading, derivePdfUrl, getAuthHeaders]);

  useEffect(() => { return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); }; }, [pdfUrl]);
  useEffect(() => { if (initialViewMode === "pdf" && pages.length && !pdfUrl && !pdfLoading) loadPdf(); }, [initialViewMode, pages.length]);

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!hit?.filepath || downloading) return;
    setDownloading(true);
    const ext = hit.filepath.match(/\.(pdf|png|jpe?g)$/i)?.[0] ?? ".pdf";
    const dlFilename = filename + ext;

    // Try /download?filepath= first (server streaming endpoint)
    try {
      const res = await fetch(
        `${settings.serverUrl}/download?filepath=${encodeURIComponent(hit.filepath)}`,
        { headers: getAuthHeaders() },
      );
      if (res.ok) {
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = dlFilename;
        a.click();
        URL.revokeObjectURL(a.href);
        setDownloading(false);
        return;
      }
    } catch {}

    // Fallback: use existing PDF blob if available
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = dlFilename;
      a.click();
      setDownloading(false);
      return;
    }

    // Last resort: fetch directly from S3 proxy
    try {
      const url = derivePdfUrl();
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = dlFilename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // ── Hit navigation ──────────────────────────────────────────────────────────
  const hitPositions = useMemo(() =>
    matchingPageIdxs
      .map((mi) => pages.findIndex((p) => p.pageIdx === mi))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b),
  [matchingPageIdxs, pages]);
  const currentHitIdx = hitPositions.indexOf(currentPos);
  const prevHit = hitPositions[currentHitIdx - 1] ?? hitPositions[hitPositions.length - 1];
  const nextHit = hitPositions[currentHitIdx + 1] ?? hitPositions[0];

  const activePage = pages[currentPos] ?? pages[0];
  const queryTerms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {/* Breadcrumbs + filename */}
            <div className={styles.filepathDisplay}>
              {breadcrumbs.length > 0 && (
                <span className={styles.breadcrumbs}>
                  {breadcrumbs.map((seg, i) => (
                    <React.Fragment key={i}>
                      <span className={styles.breadSeg}>{seg}</span>
                      <span className={styles.breadSep}>/</span>
                    </React.Fragment>
                  ))}
                </span>
              )}
              <span className={styles.filename} title={hit?.filepath}>{filename}</span>
            </div>

            {/* Tags */}
            {(hit?.assigned_tags?.length ?? 0) > 0 && (
              <div className={styles.headerTags}>
                {hit.assigned_tags.slice(0, 6).map((tag) => (
                  <span key={tag} className={styles.headerTag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {/* OCR / PDF toggle */}
            <div className={styles.viewTabs}>
              <button className={`${styles.viewTab} ${viewMode === "ocr" ? styles.viewTabActive : ""}`}
                onClick={() => setViewMode("ocr")}>OCR</button>
              <button className={`${styles.viewTab} ${viewMode === "pdf" ? styles.viewTabActive : ""}`}
                onClick={() => { setViewMode("pdf"); loadPdf(); }}>PDF</button>
            </div>

            {viewMode === "ocr" && (
              <div className={styles.zoomRow}>
                <button className={styles.iconBtn} onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}><ZoomOut /></button>
                <span className={styles.zoomVal}>{Math.round(zoom * 100)}%</span>
                <button className={styles.iconBtn} onClick={() => setZoom((z) => Math.min(3.0, z + 0.15))}><ZoomIn /></button>
              </div>
            )}

            <button className={`${styles.iconBtn} ${styles.dlBtn} ${downloading ? styles.dlBtnBusy : ""}`}
              onClick={handleDownload} title="Download original file" disabled={downloading}>
              {downloading
                ? <span className={styles.smallSpinner} />
                : <DownloadIcon />}
              <span>{downloading ? "…" : "Download"}</span>
            </button>

            <button className={styles.closeBtn} onClick={onClose}><CloseIcon /></button>
          </div>
        </div>

        {/* ── Page nav strip ── */}
        <div className={styles.pageStrip}>
          <div className={styles.pageChips}>
            {pages.map((p, i) => {
              const isMatch = matchingPageIdxs.includes(p.pageIdx);
              return (
                <button key={p.pageIdx}
                  className={`${styles.pageChip} ${i === currentPos ? styles.pageChipActive : ""} ${isMatch ? styles.pageChipMatch : ""}`}
                  onClick={() => goTo(i)}
                >{i + 1}</button>
              );
            })}
          </div>

          <div className={styles.pageStripRight}>
            {hitPositions.length > 1 && (
              <div className={styles.hitNav}>
                <button className={styles.hitNavBtn} onClick={() => goTo(prevHit)}><ChevronLeft /> Prev hit</button>
                <span className={styles.hitCount}>
                  {currentHitIdx >= 0 ? currentHitIdx + 1 : "—"}/{hitPositions.length}
                </span>
                <button className={styles.hitNavBtn} onClick={() => goTo(nextHit)}>Next hit <ChevronRight /></button>
              </div>
            )}
            <form onSubmit={(e) => {
              e.preventDefault();
              const n = parseInt(manualPage, 10);
              if (n >= 1 && n <= pages.length) goTo(n - 1);
              setManualPage("");
            }}>
              <input className={styles.pageInput}
                placeholder={`p. 1–${pages.length}`}
                value={manualPage}
                onChange={(e) => setManualPage(e.target.value)}
              />
            </form>
            <span className={styles.pageCounter}>{currentPos + 1} / {pages.length}</span>
          </div>
        </div>

        {/* ── Content area ── */}
        <div className={styles.body}>

          {/* PDF mode */}
          {viewMode === "pdf" ? (
            <div className={styles.pdfArea}>
              {pdfLoading && (
                <div className={styles.pdfStatus}>
                  <div className={styles.pdfSpinner} />
                  <p className={styles.pdfStatusText}>Loading PDF…</p>
                  <p className={styles.pdfStatusSub}>Fetching from S3 proxy with auth</p>
                </div>
              )}
              {pdfError && !pdfLoading && (
                <div className={styles.pdfStatus}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{ color: "var(--danger)" }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className={styles.pdfStatusText} style={{ color: "var(--danger)" }}>{pdfError}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    <button className={styles.pdfAction} onClick={() => { setPdfError(null); setPdfUrl(null); loadPdf(); }}>
                      Retry
                    </button>
                    <button className={styles.pdfAction} onClick={handleDownload} style={{ background: "var(--accent-glow)", borderColor: "var(--accent)", color: "var(--accent)" }}>
                      Download instead
                    </button>
                  </div>
                </div>
              )}
              {pdfUrl && !pdfLoading && (
                <iframe src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  className={styles.pdfIframe}
                  title={filename}
                />
              )}
            </div>
          ) : (
            <>
              {/* OCR scroll area */}
              <div className={styles.ocrArea} ref={scrollRef}>
                {pages.map((pg, i) => (
                  <PageView key={pg.pageIdx} page={pg} pageNumber={i + 1} query={query}
                    zoom={zoom} hoveredBoxId={hoveredBoxId} setHoveredBoxId={setHoveredBoxId}
                    onVisible={setCurrentPos} renderPos={i} onHoverText={(t, x, y) =>
                      t ? setTooltip({ text: t, x, y }) : setTooltip(null)
                    }
                  />
                ))}
              </div>

              {/* OCR sidebar */}
              <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                  <span>Extracted — page {currentPos + 1}</span>
                  <label className={styles.coordToggle}>
                    <input type="checkbox" checked={showCoords} onChange={(e) => setShowCoords(e.target.checked)} />
                    <span>Coords</span>
                  </label>
                </div>
                <div className={styles.sidebarBody}>
                  {activePage?.ocr?.lines?.map((line, li) =>
                    line.boxes?.map((box, bi) => {
                      const id = `${currentPos}-${li}-${bi}`;
                      const hov = id === hoveredBoxId;
                      const match = queryTerms.length > 0 && queryTerms.some((t: string) => box.text.toLowerCase().includes(t));
                      return (
                        <div key={bi} id={`side-${id}`}
                          className={`${styles.ocrCard} ${hov ? styles.ocrCardHov : ""} ${match ? styles.ocrCardMatch : ""}`}
                          onMouseEnter={() => setHoveredBoxId(id)}
                          onMouseLeave={() => setHoveredBoxId(null)}
                        >
                          <span className={styles.ocrText}>{box.text}</span>
                          <span className={styles.ocrConf}>{(box.confidence * 100).toFixed(0)}%</span>
                          {showCoords && (
                            <div className={styles.ocrCoords}>
                              [{box.boundingBox.upLeftPoint.x},{box.boundingBox.upLeftPoint.y}]
                              → [{box.boundingBox.downRightPoint.x},{box.boundingBox.downRightPoint.y}]
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  {(!activePage?.ocr?.lines?.length) && (
                    <div className={styles.ocrEmpty}>No OCR text on this page</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {tooltip && (
        <div className={styles.tooltip} style={{ top: tooltip.y + 14, left: tooltip.x + 14 }}>
          <div className={styles.tooltipLabel}>OCR fragment</div>
          <div className={styles.tooltipText}>{tooltip.text}</div>
        </div>
      )}
    </div>
  );
}
