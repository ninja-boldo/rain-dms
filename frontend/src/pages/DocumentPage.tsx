import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  buildDownloadUrl,
  deleteDocument,
  getDocument,
  getPages,
} from "../api/client";
import type {
  Document,
  Page,
  PageOcr,
  LineOcr,
  BoxOcr,
  RawBlockNormalized,
} from "../api/client";
import AuthImage from "../components/AuthImage";
import { useLocalStore, type LocalMarker } from "../store/localData";
import { useAuthStore } from "../store/auth";
import { useSettingsStore } from "../store/settings";
import { useI18n } from "../i18n";
import { reportSuccess } from "../store/toast";
import { cleanFileName } from "../utils/filename";

interface FlatBox {
  text: string;
  confidence: number | null;
  x: number;
  y: number;
  w: number;
  h: number;
}

function flattenOcr(raw: unknown): FlatBox[] {
  if (!raw) return [];
  if (typeof raw === "object" && !Array.isArray(raw) && "lines" in (raw as any))
    return flattenLines((raw as PageOcr).lines);
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [];
    if ("boxes" in raw[0]) return flattenLines(raw as LineOcr[]);
    if ("boundingBox" in raw[0]) return (raw as BoxOcr[]).map(boxOcrToFlat);
    if ("bbox" in raw[0])
      return (raw as RawBlockNormalized[]).map((b) => ({
        text: b.text,
        confidence: b.confidence,
        x: b.bbox.x,
        y: b.bbox.y,
        w: b.bbox.width,
        h: b.bbox.height,
      }));
  }
  return [];
}
function flattenLines(lines: LineOcr[]): FlatBox[] {
  return lines.flatMap((l) => l.boxes.map(boxOcrToFlat));
}
function boxOcrToFlat(box: BoxOcr): FlatBox {
  const ul = box.boundingBox.upLeftPoint,
    dr = box.boundingBox.downRightPoint;
  return {
    text: box.text,
    confidence: box.confidence,
    x: ul.x,
    y: ul.y,
    w: dr.x - ul.x,
    h: dr.y - ul.y,
  };
}


function tokenizeQuery(q: string): string[] {
  return (q || "")
    .replace(/tag:\S+/g, "")
    .split(/\s+/)
    .filter((t) => t && !t.startsWith("-"))
    .map((t) => t.toLowerCase());
}

const GAP = 16;
const OVERSCAN = 2;

export default function DocumentPage() {
  const t = useI18n();
  const [searchParams] = useSearchParams();
  const filepath = searchParams.get("filepath") ?? "";
  const targetPageIdx = parseInt(searchParams.get("page") ?? "", 10) || 0;
  const query = searchParams.get("q") ?? "";
  const nav = useNavigate();
  const loadOcrByDefault = useSettingsStore((s) => s.loadOcrByDefault);
  // Arriving from a search hit needs every page's OCR up front so all
  // matches across the document can be located and jumped to. Otherwise we
  // honor the "load OCR by default" setting: fetch nothing eagerly and pull
  // OCR in lazily, page by page, only for what's actually scrolled into
  // view (or once the person switches the OCR overlay on manually).
  const eagerOcr = loadOcrByDefault || !!query;
  const [doc, setDoc] = useState<Document | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [showFullPath, setShowFullPath] = useState(false);
  const [showOcr, setShowOcr] = useState(eagerOcr);
  const [markersMode, setMarkersMode] = useState<"view" | "draw">("view");
  const [noteMarkerKey, setNoteMarkerKey] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState(800);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(800);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryTokens = useMemo(() => tokenizeQuery(query), [query]);
  const loadedOcrPages = useRef<Set<number>>(new Set());
  const ocrFetchInFlight = useRef<Set<number>>(new Set());

  const { markers, setMarkers } = useLocalStore(filepath);

  useEffect(() => {
    if (!filepath) {
      nav("/", { replace: true });
      return;
    }
    setLoading(true);
    loadedOcrPages.current = new Set();
    ocrFetchInFlight.current = new Set();
    setShowOcr(eagerOcr);
    // Fast path: page list + banner images only. OCR JSON (which can be
    // sizeable across a long document) is only requested up front when
    // `eagerOcr` is true — otherwise it's fetched lazily below.
    Promise.all([
      getDocument(filepath),
      getPages(filepath, { includeOcr: eagerOcr }),
    ])
      .then(([d, p]) => {
        setDoc(d);
        setPages(p.pages);
        if (eagerOcr) {
          loadedOcrPages.current = new Set(p.pages.map((pg) => pg.pageIdx));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filepath, nav]);

  /** Fetch OCR for a single page (by its position in `pages`) on demand. */
  function ensureOcrLoaded(idx: number) {
    if (loadedOcrPages.current.has(idx) || ocrFetchInFlight.current.has(idx))
      return;
    const target = pages[idx];
    if (!target) return;
    ocrFetchInFlight.current.add(idx);
    getPages(filepath, {
      offset: target.pageIdx,
      limit: 1,
      includeOcr: true,
    })
      .then((res) => {
        const fetched = res.pages[0];
        loadedOcrPages.current.add(idx);
        if (!fetched) return;
        setPages((prev) =>
          prev.map((pg, i) => (i === idx ? { ...pg, ocr: fetched.ocr } : pg)),
        );
      })
      .catch(() => {
        // Swallow — the page image itself already loaded fine; the OCR
        // overlay just won't have data for this one page.
      })
      .finally(() => {
        ocrFetchInFlight.current.delete(idx);
      });
  }


  function toggleBoxMarker(
    boxIndex: number,
    bbox: { x: number; y: number; w: number; h: number },
    pageIdx: number,
  ) {
    if (!filepath) return;
    const boxKey = `ocr_${pageIdx}_${boxIndex}`;
    const existing = markers.find((m) => m.box_key === boxKey);
    if (existing) {
      setMarkers((prev) => prev.filter((m) => m.box_key !== boxKey));
      if (noteMarkerKey === boxKey) setNoteMarkerKey(null);
      return;
    }
    const created: LocalMarker = {
      box_key: boxKey,
      page_idx: pageIdx,
      kind: "ocr",
      x: bbox.x,
      y: bbox.y,
      w: bbox.w,
      h: bbox.h,
      note: null,
      created_at: new Date().toISOString(),
    };
    setMarkers((prev) => [...prev, created]);
    setNoteMarkerKey(boxKey);
  }

  function addDrawnMarker(
    pageIdx: number,
    bbox: { x: number; y: number; w: number; h: number },
    note?: string,
  ) {
    if (!filepath) return;
    const created: LocalMarker = {
      box_key: `drawn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      page_idx: pageIdx,
      kind: "drawn",
      x: bbox.x,
      y: bbox.y,
      w: bbox.w,
      h: bbox.h,
      note: note ?? null,
      created_at: new Date().toISOString(),
    };
    setMarkers((prev) => [...prev, created]);
    setNoteMarkerKey(created.box_key);
  }

  function updateMarkerNote(boxKey: string, note: string) {
    setMarkers((prev) =>
      prev.map((m) => (m.box_key === boxKey ? { ...m, note } : m)),
    );
  }

  function removeMarkerByKey(boxKey: string) {
    setMarkers((prev) => prev.filter((m) => m.box_key !== boxKey));
    if (noteMarkerKey === boxKey) setNoteMarkerKey(null);
  }

  async function handleDelete() {
    if (!confirmDel) {
      setConfirmDel(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteDocument(filepath);
      reportSuccess(t.toast_success, displayName);
      nav("/", { replace: true });
    } catch (e: any) {
      setError(e.message);
      setDeleting(false);
      setConfirmDel(false);
    }
  }

  const displayName = cleanFileName(doc?.fileS3Key ?? "") || "Unknown";
  const encryptedFileKey = (doc as any)?.encrypted_file_key as
    | string
    | undefined;

  const pageData = useMemo(
    () => pages.map((p) => ({ page: p, boxes: flattenOcr(p.ocr) })),
    [pages],
  );

  const totalOcrBoxes = useMemo(
    () => pageData.reduce((sum, p) => sum + p.boxes.length, 0),
    [pageData],
  );

  const allMatches = useMemo(() => {
    const list: { pageIdx: number; boxIdx: number; text: string }[] = [];
    pageData.forEach(({ boxes }, pIdx) => {
      boxes.forEach((b, bIdx) => {
        if (queryTokens.some((t) => (b.text ?? "").toLowerCase().includes(t))) {
          list.push({ pageIdx: pIdx, boxIdx: bIdx, text: b.text });
        }
      });
    });
    return list;
  }, [pageData, queryTokens]);

  const [activeGlobalMatch, setActiveGlobalMatch] = useState(0);
  useEffect(() => {
    setActiveGlobalMatch(0);
  }, [filepath]);

  // ResizeObserver on scroll container → page width & viewport height
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const cw = el.clientWidth;
      const narrow = cw < 480;
      const margin = narrow ? 12 : 48;
      const floor = narrow ? 200 : 360;
      const w = Math.max(floor, Math.min(cw - margin, 1100));
      setPageWidth(w);
      setViewportH(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Estimate aspect ratio from the first page's natural size; fallback to A4
  const [aspectRatio, setAspectRatio] = useState(0.707);

  const pageHeight = pageWidth / aspectRatio;
  const rowHeight = pageHeight + GAP;

  // Determine which pages should be mounted
  const firstVisible = Math.max(
    0,
    Math.floor(scrollTop / rowHeight) - OVERSCAN,
  );
  const lastVisible = Math.min(
    pages.length - 1,
    Math.ceil((scrollTop + viewportH) / rowHeight) + OVERSCAN,
  );

  const totalHeight = pages.length === 0 ? 0 : pages.length * rowHeight + 40;

  // Lazily fetch OCR for whatever's currently in the visible (+overscan)
  // range, but only once OCR is actually wanted — either the overlay is
  // toggled on, or the whole document was fetched eagerly already (in
  // which case every page is marked loaded and this is a no-op).
  useEffect(() => {
    if (!showOcr || pages.length === 0) return;
    for (let i = firstVisible; i <= lastVisible; i++) {
      ensureOcrLoaded(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstVisible, lastVisible, showOcr, pages.length, filepath]);

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop);
    // Find page index closest to top of viewport
    const idx = Math.min(
      pages.length - 1,
      Math.max(0, Math.floor(e.currentTarget.scrollTop / rowHeight)),
    );
    setVisibleIdx(idx);
  }

  function scrollToPage(idx: number) {
    const top = idx * rowHeight;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top, behavior: "smooth" });
    }
  }

  // When arriving via search (?q=) without an explicit page, jump to the
  // first page that contains a match.
  const initialScrollPage = useMemo(() => {
    if (!query || targetPageIdx > 0) return targetPageIdx;
    const first = allMatches[0]?.pageIdx;
    return first ?? 0;
  }, [query, targetPageIdx, allMatches]);

  // After data loads, jump to target page
  useEffect(() => {
    if (loading || pages.length === 0) return;
    const id = requestAnimationFrame(() => {
      scrollToPage(Math.min(initialScrollPage, pages.length - 1));
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, pages.length, initialScrollPage]);

  // Scroll to active match — to the page, then to the specific box within it
  useEffect(() => {
    if (allMatches.length === 0) return;
    const m = allMatches[activeGlobalMatch];
    if (!m) return;
    const pageTop = m.pageIdx * rowHeight;
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: pageTop, behavior: "smooth" });
    // After page scroll settles, scroll to the specific box element
    const tid = setTimeout(() => {
      const boxEl = scrollRef.current?.querySelector(
        "[data-active-box='true']",
      ) as HTMLElement | null;
      if (boxEl) {
        boxEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 320);
    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGlobalMatch, allMatches.length]);

  const activeBoxByPage = useMemo(() => {
    const m = new Map<number, number>();
    const cur = allMatches[activeGlobalMatch];
    if (cur) m.set(cur.pageIdx, cur.boxIdx);
    return m;
  }, [allMatches, activeGlobalMatch]);

  const hitNav = queryTokens.length > 0 && allMatches.length > 0;
  const [hitDismissed, setHitDismissed] = useState(false);
  // Reset dismissed when match set changes (new search)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const prevMatchLen = useRef(0);
  if (prevMatchLen.current !== allMatches.length) {
    prevMatchLen.current = allMatches.length;
    if (hitDismissed) setHitDismissed(false);
  }

  if (loading)
    return (
      <Centered>
        <p style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>
          {t.doc_loading}
        </p>
      </Centered>
    );
  if (error || !doc)
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>
          {error ?? t.doc_notFound}
        </p>
        <button
          className="btn btn-ghost"
          onClick={() => nav(-1)}
          style={{ marginTop: 8 }}
        >
          {t.doc_back}
        </button>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
          flexWrap: "wrap",
          background: "var(--bg-surface)",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => nav(-1)}
          style={{ padding: "3px 8px", fontSize: "0.78rem" }}
        >
          {t.doc_back}
        </button>
        <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <p
              className="mono"
              style={{
                margin: 0,
                fontSize: "0.76rem",
                color: "var(--text-1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={doc.fileS3Key}
            >
              {displayName}
            </p>
            <button
              title={showFullPath ? t.doc_hidePath : t.doc_showPath}
              aria-label={showFullPath ? t.doc_hidePath : t.doc_showPath}
              onClick={() => setShowFullPath((v) => !v)}
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "none",
                cursor: "pointer",
                color: "var(--text-1)",
                fontSize: "0.72rem",
                padding: "2px 6px",
                borderRadius: 4,
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ⓘ
            </button>
          </div>
          {showFullPath && (
            <div
              style={{
                margin: "2px 0 0",
                fontSize: "0.62rem",
                color: "var(--text-2)",
                background: "var(--bg-raised)",
                padding: "5px 7px",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(doc.fileS3Key).catch(() => {});
                  reportSuccess(t.toast_success, doc.fileS3Key);
                }}
                title={doc.fileS3Key}
                className="mono"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  color: "var(--text-2)",
                  fontSize: "0.62rem",
                  textAlign: "left",
                  wordBreak: "break-all",
                }}
              >
                {doc.fileS3Key} ⧉
              </button>
              <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                {t.doc_ingested}:{" "}
                {doc.created_at
                  ? new Date(doc.created_at).toLocaleString()
                  : "—"}
                {(doc as any).spawned_time && (
                  <>
                    {" · "}
                    {t.doc_pipeline}:{" "}
                    {new Date((doc as any).spawned_time).toLocaleString()}
                  </>
                )}
              </span>
              {doc.file_id != null && (
                <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {t.doc_fileId}: {String(doc.file_id)}
                </span>
              )}
            </div>
          )}
          {query && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.66rem",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  background: "var(--accent-glow)",
                  padding: "1px 6px",
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
                “{query}”
              </span>
              <span>{t.doc_matches(allMatches.length)}</span>
            </p>
          )}
          <p style={{ margin: 0, fontSize: "0.64rem", color: "var(--text-3)" }}>
            {t.doc_page(visibleIdx + 1, pages.length)}
            {doc.assigned_tags?.length
              ? " · " + doc.assigned_tags.join(", ")
              : ""}
            {totalOcrBoxes > 0 && ` · ${totalOcrBoxes} ${t.doc_ocrBoxes}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {hitNav && (
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                gap: 0,
                background: "var(--accent-glow)",
                border:
                  "1.5px solid color-mix(in srgb, var(--accent) 70%, transparent)",
                borderRadius: 7,
                overflow: "hidden",
                boxShadow:
                  "0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent)",
                animation: hitDismissed
                  ? "none"
                  : "ocr-blink-border 1.4s ease-in-out 3, hit-pill-persist 1.8s ease-in-out 1.4s infinite",
              }}
            >
              <button
                onClick={() =>
                  setActiveGlobalMatch(
                    (i) => (i - 1 + allMatches.length) % allMatches.length,
                  )
                }
                style={hitBtnStyle}
                title={t.doc_prevHit}
                aria-label={t.doc_prevHit}
              >
                ↑
              </button>
              <button
                onClick={() => {
                  setActiveGlobalMatch(0);
                  const m = allMatches[0];
                  if (m && scrollRef.current) {
                    scrollRef.current.scrollTo({
                      top: m.pageIdx * rowHeight,
                      behavior: "smooth",
                    });
                  }
                }}
                title={t.doc_jumpFirst}
                aria-label={t.doc_jumpFirst}
                style={{
                  ...hitBtnStyle,
                  padding: "3px 9px",
                  fontSize: "0.72rem",
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  borderLeft:
                    "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
                  borderRight:
                    "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ fontSize: "0.78rem" }}>●</span>
                <span>
                  HIT&nbsp;
                  {activeGlobalMatch + 1}/{allMatches.length}
                </span>
              </button>
              <button
                onClick={() =>
                  setActiveGlobalMatch((i) => (i + 1) % allMatches.length)
                }
                style={hitBtnStyle}
                title={t.doc_nextHit}
                aria-label={t.doc_nextHit}
              >
                ↓
              </button>
              <button
                onClick={() => setHitDismissed(true)}
                style={{
                  ...hitBtnStyle,
                  fontSize: "0.62rem",
                  padding: "2px 6px",
                  borderLeft:
                    "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                  opacity: 0.6,
                }}
                title={t.doc_dismiss}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
          {pages.length > 0 && (
            <button
              className={`btn ${showOcr ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setShowOcr((v) => !v)}
              style={{ fontSize: "0.72rem" }}
              title={
                showOcr
                  ? t.doc_ocrBoxes
                  : "Load and show OCR text boxes for visible pages"
              }
            >
              OCR
            </button>
          )}
          <button
            className={`btn ${markersMode !== "view" ? "btn-primary" : "btn-ghost"}`}
            onClick={() =>
              setMarkersMode((m) => (m === "draw" ? "view" : "draw"))
            }
            style={{ fontSize: "0.72rem" }}
            title={
              markersMode === "draw" ? t.doc_markModeHint : t.doc_markModeHint2
            }
          >
            {markersMode === "draw" ? t.doc_drawing : t.doc_mark}
          </button>
          {markers.length > 0 && (
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--warn)",
                fontFamily: "JetBrains Mono, monospace",
                background: "var(--bg-raised)",
                padding: "2px 7px",
                borderRadius: 4,
              }}
            >
              {t.doc_marker(markers.length)}
            </span>
          )}
          <a
            href={buildDownloadUrl(doc.fileS3Key)}
            download
            className="btn btn-ghost"
            style={{ fontSize: "0.72rem", textDecoration: "none" }}
          >
            ↓
          </a>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
            style={{ fontSize: "0.72rem" }}
          >
            {deleting ? "…" : confirmDel ? t.doc_confirmDelete : t.doc_delete}
          </button>
          {confirmDel && !deleting && (
            <button
              className="btn btn-ghost"
              onClick={() => setConfirmDel(false)}
              style={{ fontSize: "0.72rem" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Page jump bar */}
      {pages.length > 1 && (
        <div
          style={{
            padding: "5px 12px",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex",
            gap: 4,
            alignItems: "center",
            flexShrink: 0,
            background: "var(--bg-surface)",
            overflowX: "auto",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--text-3)",
              flexShrink: 0,
              marginRight: 4,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            pages
          </span>
          {pages.map((p, i) => (
            <button
              key={p.pageIdx}
              onClick={() => scrollToPage(i)}
              style={{
                padding: "2px 7px",
                borderRadius: 4,
                fontSize: "0.68rem",
                background:
                  visibleIdx === i ? "var(--accent-glow)" : "var(--bg-raised)",
                border: `1px solid ${
                  visibleIdx === i ? "var(--accent)" : "var(--border)"
                }`,
                color: visibleIdx === i ? "var(--accent)" : "var(--text-2)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {p.pageIdx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Virtualized scroller */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
        }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {pageData.length === 0 && (
            <Centered>
              <p style={{ color: "var(--text-3)" }}>{t.doc_noPages}</p>
            </Centered>
          )}
          {pageData.map(({ page, boxes }, i) => {
            const isVisible = i >= firstVisible && i <= lastVisible;
            const top = i * rowHeight + 20;
            if (!isVisible) {
              return (
                <div
                  key={page.pageIdx}
                  id={`page-${i}`}
                  style={{
                    position: "absolute",
                    top,
                    left: 0,
                    right: 0,
                    height: pageHeight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-3)",
                    fontSize: "0.7rem",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  page {page.pageIdx + 1}
                </div>
              );
            }
            return (
              <PageBlock
                key={page.pageIdx}
                page={page}
                boxes={boxes}
                showOcr={showOcr}
                markersMode={markersMode}
                markers={markers.filter((m) => m.page_idx === i)}
                encryptedFileKey={encryptedFileKey}
                width={pageWidth}
                height={pageHeight}
                index={i}
                highlightTokens={queryTokens}
                activeHighlightIdx={activeBoxByPage.get(i)}
                onAspectRatio={(w, h) => {
                  if (w && h && i === 0) setAspectRatio(w / h);
                }}
                top={top}
                onToggleBoxMarker={(boxIdx, bbox) =>
                  toggleBoxMarker(boxIdx, bbox, i)
                }
                onAddDrawnMarker={(bbox) => addDrawnMarker(i, bbox)}
                onRemoveMarker={(boxKey) => removeMarkerByKey(boxKey)}
                noteMarkerKey={noteMarkerKey}
                onSaveNote={(boxKey, note) => updateMarkerNote(boxKey, note)}
                onCloseNote={() => setNoteMarkerKey(null)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PageBlock({
  page,
  boxes,
  showOcr,
  markersMode,
  markers,
  encryptedFileKey,
  width,
  height,
  index,
  highlightTokens,
  activeHighlightIdx,
  onAspectRatio,
  top,
  onToggleBoxMarker,
  onAddDrawnMarker,
  onRemoveMarker,
  noteMarkerKey,
  onSaveNote,
  onCloseNote,
}: {
  page: Page;
  boxes: FlatBox[];
  showOcr: boolean;
  markersMode: "view" | "draw";
  markers: LocalMarker[];
  encryptedFileKey?: string;
  width: number;
  height: number;
  index: number;
  highlightTokens: string[];
  activeHighlightIdx?: number;
  onAspectRatio?: (w: number, h: number) => void;
  top: number;
  onToggleBoxMarker: (boxIdx: number, bbox: FlatBox) => void;
  onAddDrawnMarker: (bbox: FlatBox) => void;
  onRemoveMarker: (boxKey: string) => void;
  noteMarkerKey: string | null;
  onSaveNote: (boxKey: string, note: string) => void;
  onCloseNote: () => void;
}) {
  const [naturalDims, setNaturalDims] = useState<{
    w: number;
    h: number;
  } | null>(null);

  return (
    <div
      id={`page-${index}`}
      style={{
        position: "absolute",
        top,
        left: "50%",
        transform: "translateX(-50%)",
        width,
        background: "#fff",
        boxShadow: "0 4px 28px rgba(0,0,0,0.45)",
        borderRadius: 4,
        overflow: "hidden",
        height,
      }}
    >
      <AuthImage
        src={page.banner_img}
        encryptedFileKey={encryptedFileKey}
        alt={`Page ${page.pageIdx + 1}`}
        onLoad={(w, h) => {
          setNaturalDims({ w, h });
          onAspectRatio?.(w, h);
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#fff",
        }}
      />

      {showOcr && boxes.length > 0 && naturalDims && (
        <OcrOverlay
          boxes={boxes}
          markers={markers}
          naturalWidth={naturalDims.w}
          naturalHeight={naturalDims.h}
          highlightTokens={highlightTokens}
          activeHighlightIdx={activeHighlightIdx}
          markersMode={markersMode}
          onToggleBoxMarker={onToggleBoxMarker}
          onAddDrawnMarker={onAddDrawnMarker}
          onRemoveMarker={onRemoveMarker}
          noteMarkerKey={noteMarkerKey}
          onSaveNote={onSaveNote}
          onCloseNote={onCloseNote}
        />
      )}
    </div>
  );
}

/**
 * OCR overlay — absolutely-positioned on top of the page image.
 * One bounding box per OCR word; hover shows text + confidence.
 * Markers (user-pinned boxes + drawn rectangles) overlay on top.
 * When `markersMode === "draw"` the layer accepts drag-to-draw rectangles.
 */
function OcrOverlay({
  boxes,
  markers,
  naturalWidth,
  naturalHeight,
  highlightTokens,
  activeHighlightIdx,
  markersMode,
  onToggleBoxMarker,
  onAddDrawnMarker,
  onRemoveMarker,
  noteMarkerKey,
  onSaveNote,
  onCloseNote,
}: {
  boxes: FlatBox[];
  markers: LocalMarker[];
  naturalWidth: number;
  naturalHeight: number;
  highlightTokens?: string[];
  activeHighlightIdx?: number;
  markersMode: "view" | "draw";
  onToggleBoxMarker: (boxIdx: number, bbox: FlatBox) => void;
  onAddDrawnMarker: (bbox: FlatBox) => void;
  onRemoveMarker: (boxKey: string) => void;
  noteMarkerKey: string | null;
  onSaveNote: (boxKey: string, note: string) => void;
  onCloseNote: () => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // Drag-to-draw state
  const [drawing, setDrawing] = useState<{
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);

  // Index of OCR box → marker (so we can dim/show "marked" state on existing boxes)
  const ocrMarkerByBoxIdx = new Map<number, LocalMarker>();
  markers.forEach((m) => {
    if (m.kind === "ocr") {
      const m2 = m.box_key.match(/^ocr_(\d+)_(\d+)$/);
      if (m2) ocrMarkerByBoxIdx.set(parseInt(m2[2], 10), m);
    }
  });

  const tokens = highlightTokens ?? [];
  const matchIdx = boxes
    .map((b, i) => ({
      i,
      match:
        tokens.length > 0 &&
        tokens.some((t) => (b.text ?? "").toLowerCase().includes(t)),
    }))
    .filter((x) => x.match)
    .map((x) => x.i);

  const localActiveIdx =
    activeHighlightIdx != null ? matchIdx.indexOf(activeHighlightIdx) : -1;

  const hovered = hoveredIdx != null ? boxes[hoveredIdx] : null;

  function layerToImage(clientX: number, clientY: number) {
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const px = (clientX - rect.left) / rect.width;
    const py = (clientY - rect.top) / rect.height;
    return {
      x: Math.round(px * naturalWidth),
      y: Math.round(py * naturalHeight),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const onBox = (e.target as HTMLElement).closest("[data-box-key]");
    if (markersMode === "draw") {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (onBox) return; // don't draw when tapping a marker
      const { x, y } = layerToImage(e.clientX, e.clientY);
      setDrawing({ startX: x, startY: y, x, y });
      return;
    }
    // Touch/pen tap on empty space (not a box): dismiss any pinned tooltip.
    if (e.pointerType !== "mouse" && !onBox) {
      setHoveredIdx(null);
      setMouse(null);
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") {
      const rect = layerRef.current?.getBoundingClientRect();
      if (rect) {
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
    if (drawing) {
      const { x, y } = layerToImage(e.clientX, e.clientY);
      setDrawing((d) => (d ? { ...d, x, y } : d));
    }
  }

  function onPointerUp() {
    if (!drawing) return;
    const x1 = Math.min(drawing.startX, drawing.x);
    const y1 = Math.min(drawing.startY, drawing.y);
    const x2 = Math.max(drawing.startX, drawing.x);
    const y2 = Math.max(drawing.startY, drawing.y);
    const w = x2 - x1;
    const h = y2 - y1;
    setDrawing(null);
    if (w > 10 && h > 10) {
      onAddDrawnMarker({ x: x1, y: y1, w, h, text: "", confidence: null });
    }
  }

  function onPointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") {
      setHoveredIdx(null);
      setMouse(null);
    }
    if (drawing) setDrawing(null);
  }

  function updateMouseFromEvent(e: React.PointerEvent) {
    const layerRect = layerRef.current?.getBoundingClientRect();
    if (layerRect) {
      setMouse({ x: e.clientX - layerRect.left, y: e.clientY - layerRect.top });
    }
  }

  const drawnRects = markers.filter((m) => m.kind === "drawn");

  return (
    <div
      ref={layerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      style={{
        position: "absolute",
        inset: 0,
        touchAction: markersMode === "draw" ? "none" : undefined,
        pointerEvents: "none",
        cursor: markersMode === "draw" ? "crosshair" : "default",
      }}
    >
      {boxes.map((b, i) => {
        const conf = b.confidence ?? 1;
        const isHovered = i === hoveredIdx;
        const isMatch = matchIdx.includes(i);
        const isActive = localActiveIdx >= 0 && matchIdx[localActiveIdx] === i;
        const marker = ocrMarkerByBoxIdx.get(i);
        const isMarked = !!marker;
        const baseBorder =
          conf > 0.85
            ? "var(--ocr-conf-high)"
            : conf > 0.6
              ? "var(--ocr-conf-mid)"
              : "var(--ocr-conf-low)";
        const border = isActive
          ? "var(--ocr-active-border)"
          : isMarked
            ? "var(--ocr-marker-border)"
            : isMatch
              ? "var(--ocr-match-border)"
              : isHovered
                ? "var(--ocr-active-border)"
                : baseBorder;
        const bg = isActive
          ? "var(--ocr-active-bg)"
          : isMarked
            ? "var(--ocr-marker-bg)"
            : isMatch
              ? "var(--ocr-match-bg)"
              : isHovered
                ? "var(--ocr-match-bg)"
                : "transparent";
        return (
          <div
            key={i}
            data-box-key={`ocr_${i}`}
            onPointerEnter={(e) => {
              if (e.pointerType !== "mouse") return;
              setHoveredIdx(i);
              updateMouseFromEvent(e);
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse" || hoveredIdx !== i) return;
              updateMouseFromEvent(e);
            }}
            onPointerDown={(e) => {
              if (e.pointerType === "mouse") return;
              e.stopPropagation();
              setHoveredIdx((prev) => (prev === i ? null : i));
              updateMouseFromEvent(e);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onToggleBoxMarker(i, b);
            }}
            onDoubleClick={() => onToggleBoxMarker(i, b)}
            className={isActive ? "ocr-active-blink" : undefined}
            data-active-box={isActive ? "true" : undefined}
            style={{
              position: "absolute",
              left: `${(b.x / naturalWidth) * 100}%`,
              top: `${(b.y / naturalHeight) * 100}%`,
              width: `${(b.w / naturalWidth) * 100}%`,
              height: `${(b.h / naturalHeight) * 100}%`,
              border: `2px solid ${border}`,
              background: bg,
              cursor: "crosshair",
              boxSizing: "border-box",
              transition: "background 0.08s, border-color 0.08s",
              zIndex: isActive ? 4 : isMarked ? 3 : isMatch ? 2 : 1,
              pointerEvents: "auto",
              borderRadius: 2,
            }}
          />
        );
      })}

      {/* Drawn rectangles */}
      {drawnRects.map((m) => (
        <div
          key={m.box_key}
          data-box-key={m.box_key}
          style={{
            position: "absolute",
            left: `${(m.x / naturalWidth) * 100}%`,
            top: `${(m.y / naturalHeight) * 100}%`,
            width: `${(m.w / naturalWidth) * 100}%`,
            height: `${(m.h / naturalHeight) * 100}%`,
            border: "2px dashed var(--ocr-marker-border)",
            background: "var(--ocr-marker-bg)",
            zIndex: 5,
            pointerEvents: "auto",
            boxSizing: "border-box",
          }}
          onDoubleClick={() => onRemoveMarker(m.box_key)}
        >
          {m.note && (
            <div
              style={{
                position: "absolute",
                top: -22,
                left: 0,
                fontSize: "0.66rem",
                background: "var(--ocr-tooltip-bg)",
                color: "var(--ocr-tooltip-fg)",
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid var(--ocr-marker-border)",
                whiteSpace: "nowrap",
                maxWidth: 320,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={m.note}
            >
              ✎ {m.note}
            </div>
          )}
        </div>
      ))}

      {/* Live draw rectangle */}
      {drawing && (
        <div
          style={{
            position: "absolute",
            left: `${(Math.min(drawing.startX, drawing.x) / naturalWidth) * 100}%`,
            top: `${(Math.min(drawing.startY, drawing.y) / naturalHeight) * 100}%`,
            width: `${(Math.abs(drawing.x - drawing.startX) / naturalWidth) * 100}%`,
            height: `${(Math.abs(drawing.y - drawing.startY) / naturalHeight) * 100}%`,
            border: "2px dashed var(--ocr-marker-border)",
            background: "var(--ocr-marker-bg)",
            zIndex: 6,
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        />
      )}

      {/* Hover / tap tooltip */}
      {hovered && mouse && (
        <div
          style={{
            position: "absolute",
            left: Math.min(
              mouse.x + 14,
              (layerRef.current?.clientWidth ?? 0) - 260,
            ),
            top: Math.min(
              mouse.y + 14,
              (layerRef.current?.clientHeight ?? 0) - 70,
            ),
            background: "var(--ocr-tooltip-bg)",
            border: "1px solid var(--ocr-tooltip-border)",
            borderRadius: 6,
            padding: "8px 10px",
            color: "var(--ocr-tooltip-fg)",
            pointerEvents: "auto",
            zIndex: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.85)",
            maxWidth: 260,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 500,
              lineHeight: 1.4,
              color: "var(--ocr-tooltip-fg)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {hovered.text || "(empty)"}
          </div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexWrap: "wrap",
            }}
          >
            {hovered.confidence != null && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "2px 7px",
                  borderRadius: 999,
                  background:
                    hovered.confidence > 0.85
                      ? "var(--ocr-conf-high)"
                      : hovered.confidence > 0.6
                        ? "var(--ocr-conf-mid)"
                        : "var(--ocr-conf-low)",
                  fontSize: "0.7rem",
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600,
                  color: "var(--ocr-tooltip-fg)",
                  letterSpacing: "0.04em",
                }}
              >
                conf {(hovered.confidence * 100).toFixed(0)}%
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (hoveredIdx != null) onToggleBoxMarker(hoveredIdx, hovered);
              }}
              style={{
                background: "none",
                border: "1px solid var(--ocr-tooltip-border)",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: "0.66rem",
                color: "var(--ocr-tooltip-fg)",
                cursor: "pointer",
              }}
            >
              {ocrMarkerByBoxIdx.has(hoveredIdx ?? -1) ? "★ Unmark" : "☆ Mark"}
            </button>
          </div>
        </div>
      )}

      {/* Note editor for newly created markers */}
      {noteMarkerKey &&
        (() => {
          const m = markers.find((x) => x.box_key === noteMarkerKey);
          if (!m) return null;
          return (
            <NoteEditor
              marker={m}
              naturalWidth={naturalWidth}
              naturalHeight={naturalHeight}
              onSave={(text) => onSaveNote(m.box_key, text)}
              onClose={onCloseNote}
              onDelete={() => {
                onRemoveMarker(m.box_key);
                onCloseNote();
              }}
            />
          );
        })()}
    </div>
  );
}

function NoteEditor({
  marker,
  naturalWidth,
  naturalHeight,
  onSave,
  onClose,
  onDelete,
}: {
  marker: LocalMarker;
  naturalWidth: number;
  naturalHeight: number;
  onSave: (text: string) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const t = useI18n();
  const [text, setText] = useState(marker.note ?? "");
  return (
    <div
      style={{
        position: "absolute",
        left: `${((marker.x + marker.w + 8) / naturalWidth) * 100}%`,
        top: `${(marker.y / naturalHeight) * 100}%`,
        background: "var(--ocr-tooltip-bg)",
        border: "1px solid var(--ocr-marker-border)",
        borderRadius: 6,
        padding: 8,
        zIndex: 9,
        width: 220,
        maxWidth: "calc(100vw - 40px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.doc_notePlaceholder}
        rows={3}
        style={{
          width: "100%",
          background: "var(--bg-raised)",
          color: "var(--ocr-tooltip-fg)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: 5,
          fontSize: "0.76rem",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
      <div
        style={{
          marginTop: 6,
          display: "flex",
          gap: 4,
          justifyContent: "flex-end",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={onDelete}
          style={{ fontSize: "0.68rem", padding: "3px 7px" }}
        >
          {t.doc_noteDelete}
        </button>
        <button
          className="btn btn-ghost"
          onClick={onClose}
          style={{ fontSize: "0.68rem", padding: "3px 7px" }}
        >
          {t.doc_noteClose}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            onSave(text);
            onClose();
          }}
          style={{ fontSize: "0.68rem", padding: "3px 9px" }}
        >
          {t.doc_noteSave}
        </button>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}

const hitBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--accent)",
  cursor: "pointer",
  fontSize: "0.85rem",
  padding: "2px 6px",
  borderRadius: 3,
  lineHeight: 1,
};
