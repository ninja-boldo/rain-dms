import { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  buildDownloadUrl,
  deleteDocument,
  fetchBinary,
  getDocument,
  getMainPage,
  getPages,
  getTags,
} from "../api/client";
import type {
  Document,
  Page,
  PageOcr,
  LineOcr,
  BoxOcr,
  RawBlockNormalized,
  TagEntry,
} from "../api/client";
import AuthImage from "../components/AuthImage";
import { useLocalStore, type LocalMarker } from "../store/localData";
import { useAuthStore } from "../store/auth";
import { useSettingsStore } from "../store/settings";
import { useI18n } from "../i18n";
import { reportError, reportSuccess } from "../store/toast";
import { decryptBlob, decryptFileKey } from "../utils/crypto";
import { useVirtualizer } from "@tanstack/react-virtual";
import DocumentCard from "../components/DocumentCard";
import FileTree from "../components/FileTree";
import { useUploadStore } from "../store/uploads";
import { cleanFileName as cleanName } from "../utils/filename";



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

// Order used for the Prev/Next "browse other files" controls — same
// newest-first order as the Documents tab. Cached at module scope for a
// short window so stepping through files doesn't re-fetch on every click;
// refreshed if it goes stale or the current file isn't found in it.
const SIBLING_LIMIT = 500;
const SIBLING_TTL_MS = 60_000;
let siblingCache: { keys: string[]; ts: number } | null = null;
async function getSiblingKeys(currentFilepath: string): Promise<string[]> {
  const fresh = siblingCache && Date.now() - siblingCache.ts < SIBLING_TTL_MS;
  if (fresh && siblingCache!.keys.includes(currentFilepath)) {
    return siblingCache!.keys;
  }
  const { data } = await getMainPage(0, SIBLING_LIMIT);
  const keys = data.map((d) => d.fileS3Key);
  siblingCache = { keys, ts: Date.now() };
  return keys;
}


const CARD_MIN = 220;
const ROW_HEIGHT = 238;
const ROW_OVERSCAN = 4;

type ViewMode = "grid" | "tree";
// Keys match the backend's /main_page `sort` param exactly (see MAIN_PAGE_SORT_COLUMNS
// in index.ts) — sorting happens in the database now, across the *whole* collection,
// not just whatever page(s) happen to already be loaded client-side.
type SortKey = "date_desc" | "date_asc" | "name_asc" | "pages_desc";

const PAGE_SIZE = 100;

export default function MainPage() {
  const t = useI18n();
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [nextPageIdx, setNextPageIdx] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [tags, setTags] = useState<TagEntry[]>([]);
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [fileFilter, setFileFilter] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk delete
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const simulatedTagPaths = useSettingsStore((s) => s.simulatedTagPaths);
  // Re-fetch when uploads complete
  const lastCompletedAt = useUploadStore((s) => s.lastCompletedAt);

  const loadingRef = useRef(false);

  // Reset and fetch page 0 whenever the tag filter or sort changes, or an upload finishes.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    loadingRef.current = true;
    try {
      const res = await getMainPage(0, PAGE_SIZE, activeTag);
      setDocs(res.data);
      setTotal(res.totalCount);
      setNextPageIdx(1);
      setHasMore(res.data.length < res.totalCount);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [activeTag, sort]);

  // Infinite scroll — fetch the next chunk (in the current sort order) and append.
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await getMainPage(nextPageIdx, PAGE_SIZE, activeTag);
      setDocs((prev) => {
        const seen = new Set(prev.map((d) => d.fileS3Key));
        return [...prev, ...res.data.filter((d) => !seen.has(d.fileS3Key))];
      });
      setTotal(res.totalCount);
      setNextPageIdx((i) => i + 1);
      setHasMore(
        (nextPageIdx + 1) * PAGE_SIZE < res.totalCount && res.data.length > 0,
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [nextPageIdx, hasMore, activeTag, sort]);

  useEffect(() => {
    load();
  }, [load, lastCompletedAt]);
  useEffect(() => {
    getTags()
      .then((r) => setTags(r.tags.slice(0, 80)))
      .catch(() => {});
  }, []);

  // Tree view needs the *complete* document set to build an accurate folder
  // hierarchy — a partial page would silently hide whole subfolders. Rather
  // than paginate it, keep pulling subsequent chunks in the background until
  // everything is loaded, independent of scroll position.
  useEffect(() => {
    if (view !== "tree" || !hasMore || loading) return;
    const id = setTimeout(() => loadMore(), 60);
    return () => clearTimeout(id);
  }, [view, hasMore, loading, docs.length, loadMore]);

  // Infinite-scroll sentinel for grid/list views.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (view === "tree") return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [view, loadMore]);

  // ── Virtualization ─────────────────────────────────────────────────────
  // Track the scroll container's width so we can derive the column count
  // and re-flow the grid responsively (same minmax(188, 1fr) sizing as the
  // original CSS grid, just measured in JS).
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(w);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const filtered = docs.filter((d) => {
    if (!fileFilter) return true;
    const f = fileFilter.toLowerCase();
    return (
      cleanName(d.fileS3Key).toLowerCase().includes(f) ||
      d.fileS3Key.toLowerCase().includes(f)
    );
  });

  const columns = useMemo(() => {
    if (containerWidth <= 0) return 1;
    const inner = containerWidth - 28; // 14px padding each side
    // Floor so we never promise a column that doesn't fully fit
    return Math.max(1, Math.floor((inner + GAP) / (CARD_MIN + GAP)));
  }, [containerWidth]);

  const rowCount = useMemo(
    () => Math.ceil(filtered.length / columns),
    [filtered.length, columns],
  );

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: ROW_OVERSCAN,
  });

  const virtualRows = virtualizer.getVirtualItems();

  function toggleSelect(key: string) {
    setSelected((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }
  function selectAll() {
    setSelected(new Set(filtered.map((d) => d.fileS3Key)));
  }
  function clearSelection() {
    setSelected(new Set());
    setBulkMode(false);
    setDeleteConfirm(false);
  }

  async function bulkDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    const keys = [...selected];
    let ok = 0;
    for (const key of keys) {
      try {
        await deleteDocument(key);
        ok++;
      } catch {
        /* apiFetch already surfaced a toast with the real error */
      }
    }
    setDeleting(false);
    clearSelection();
    load();
    if (ok > 0) reportSuccess(t.toast_success, `${ok}/${keys.length}`);
  }

  return (
    <div className="split-panel" style={{ height: "100%" }}>
      {/* Tag sidebar */}
      {tags.length > 0 && (
        <aside
          className="split-secondary"
          style={{
            width: 176,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-surface)",
            maxHeight: "34vh",
          }}
        >
          <div
            style={{
              padding: "10px 8px 6px",
              borderBottom: "1px solid var(--border-soft)",
              flexShrink: 0,
            }}
          >
            <p className="label" style={{ paddingLeft: 4 }}>
              {t.main_tags}
            </p>
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "4px 6px 8px" }}>
            <TagBtn
              label={t.main_all}
              count={total}
              active={!activeTag}
              onClick={() => setActiveTag(undefined)}
            />
            {tags.map((tag) => (
              <TagBtn
                key={tag.tag}
                label={tag.tag}
                count={tag.doc_count}
                active={activeTag === tag.tag}
                onClick={() => setActiveTag(tag.tag)}
              />
            ))}
          </div>
        </aside>
      )}

      {/* Main */}
      <div
        className="split-primary"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            padding: "8px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexShrink: 0,
            background: "var(--bg-surface)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "0.87rem",
                fontWeight: 600,
                color: "var(--text-1)",
              }}
            >
              {activeTag ? (
                <>
                  <span style={{ color: "var(--text-3)", fontWeight: 400 }}>
                    {t.main_tagLabel}{" "}
                  </span>
                  <span className="tag">{activeTag}</span>
                </>
              ) : (
                t.main_allDocuments
              )}
            </h2>
            <p
              style={{ margin: 0, fontSize: "0.66rem", color: "var(--text-3)" }}
            >
              {t.main_documents(total)}
            </p>
          </div>

          {/* Bulk mode toggle */}
          <button
            onClick={() => {
              setBulkMode((v) => !v);
              clearSelection();
            }}
            style={{
              ...toolBtn,
              background: bulkMode ? "var(--accent-glow)" : undefined,
              color: bulkMode ? "var(--accent)" : "var(--text-2)",
              borderColor: bulkMode ? "var(--accent)" : undefined,
            }}
            title={t.main_select}
          >
            ☑ {t.main_select}
          </button>

          {/* Bulk actions */}
          {bulkMode && selected.size > 0 && (
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <span
                style={{
                  fontSize: "0.73rem",
                  color: "var(--text-2)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {t.main_selected(selected.size)}
              </span>
              <button onClick={selectAll} style={toolBtn}>
                {t.main_allOnPage(filtered.length)}
              </button>
              <button onClick={clearSelection} style={toolBtn}>
                {t.main_none}
              </button>
              <button
                onClick={bulkDelete}
                disabled={deleting}
                style={{
                  ...toolBtn,
                  background: deleteConfirm
                    ? "rgba(248,113,113,0.15)"
                    : undefined,
                  color: "var(--danger)",
                  borderColor: "rgba(248,113,113,0.35)",
                }}
              >
                {deleting
                  ? t.main_deleting
                  : deleteConfirm
                    ? t.ft_confirmDelete(selected.size)
                    : `✗ ${t.ft_delete(selected.size)}`}
              </button>
              {deleteConfirm && (
                <button onClick={() => setDeleteConfirm(false)} style={toolBtn}>
                  {t.main_cancel}
                </button>
              )}
            </div>
          )}

          {/* Filename filter */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-3)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: 7,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              placeholder={t.main_filterByFilename}
              className="input"
              style={{ paddingLeft: 26, width: 175, fontSize: "0.77rem" }}
            />
            {fileFilter && (
              <button
                onClick={() => setFileFilter("")}
                style={{
                  position: "absolute",
                  right: 5,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontSize: "0.7rem",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-2)",
              fontSize: "0.77rem",
              padding: "4px 8px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="date_desc">{t.main_newestFirst}</option>
            <option value="date_asc">{t.main_oldestFirst}</option>
            <option value="name_asc">{t.main_nameAZ}</option>
            <option value="pages_desc">{t.main_mostPages}</option>
          </select>

          {/* View toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <VBtn
              active={view === "grid"}
              onClick={() => setView("grid")}
              title={t.main_grid}
            >
              <GridIco />
            </VBtn>
            <VBtn
              active={view === "tree"}
              onClick={() => setView("tree")}
              title={t.main_tree}
            >
              <TreeIco />
            </VBtn>
          </div>
          <button
            className="btn btn-ghost"
            onClick={load}
            style={{ padding: "4px 8px" }}
            title={t.main_refresh}
            disabled={loading}
          >
            <RefreshIco spin={loading} />
          </button>
        </div>

        {/* Content */}
        <div
          ref={view === "tree" ? null : scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: view === "tree" ? 0 : "14px",
          }}
        >
          {error && (
            <div
              style={{
                margin: "0 14px 12px",
                padding: "9px 13px",
                background: "rgba(248,113,113,0.07)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 7,
                color: "var(--danger)",
                fontSize: "0.8rem",
              }}
            >
              {error}
            </div>
          )}
          {!loading && filtered.length === 0 && !error && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "var(--text-3)",
              }}
            >
              <p style={{ fontSize: "0.85rem" }}>
                {fileFilter ? t.main_noMatch(fileFilter) : t.main_noDocuments}
              </p>
            </div>
          )}
          {view === "grid" ? (
            loading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.max(1, columns)}, 1fr)`,
                  gap: GAP,
                }}
              >
                {Array.from({
                  length: Math.max(1, columns) * 2,
                }).map((_, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      height: ROW_HEIGHT - 30,
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: "relative",
                  width: "100%",
                }}
              >
                {virtualRows.map((vr) => {
                  const start = vr.index * columns;
                  const rowDocs = filtered.slice(start, start + columns);
                  return (
                    <div
                      key={vr.key}
                      data-index={vr.index}
                      style={{
                        position: "absolute",
                        top: vr.start,
                        left: 0,
                        right: 0,
                        height: vr.size,
                        display: "grid",
                        gridTemplateColumns: `repeat(${columns}, 1fr)`,
                        gap: GAP,
                      }}
                    >
                      {rowDocs.map((d) => (
                        <div
                          key={d.fileS3Key}
                          style={{ position: "relative", minWidth: 0 }}
                          onClick={
                            bulkMode
                              ? () => toggleSelect(d.fileS3Key)
                              : undefined
                          }
                        >
                          {bulkMode && (
                            <div
                              style={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                zIndex: 10,
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                background: selected.has(d.fileS3Key)
                                  ? "var(--accent)"
                                  : "rgba(0,0,0,0.5)",
                                border: `2px solid ${selected.has(d.fileS3Key) ? "var(--accent)" : "rgba(255,255,255,0.5)"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "background 0.1s",
                              }}
                            >
                              {selected.has(d.fileS3Key) ? "✓" : ""}
                            </div>
                          )}
                          <DocumentCard doc={d} />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <FileTree
              documents={filtered}
              simulatedTagPaths={simulatedTagPaths}
              filter={fileFilter}
              sortKey={sort as any}
              selectedPath={selectedPath}
              onSelect={(d) => setSelectedPath(d?.fileS3Key ?? null)}
              onChanged={load}
            />
          )}

          {/* Infinite-scroll sentinel — fetches the next chunk when it enters view */}
          {view !== "tree" && hasMore && !loading && (
            <div ref={sentinelRef} style={{ height: 1, marginTop: 4 }} />
          )}
        </div>

        {/* Status footer — infinite scroll, no page numbers */}
        {(docs.length > 0 || loadingMore) && (
          <div
            style={{
              padding: "5px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              flexShrink: 0,
              background: "var(--bg-surface)",
              fontSize: "0.68rem",
              color: "var(--text-3)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {loadingMore ? (
              <>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    animation: "pulse 0.9s ease-in-out infinite",
                  }}
                />
                {t.main_loadingMore}
              </>
            ) : hasMore ? (
              t.main_loadedOf(docs.length, total)
            ) : (
              t.main_loadedAll(docs.length)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  background: "var(--bg-raised)",
  border: "1px solid var(--border)",
  borderRadius: 5,
  cursor: "pointer",
  color: "var(--text-2)",
  fontSize: "0.73rem",
  padding: "4px 8px",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

function TagBtn({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "4px 8px",
        border: "none",
        borderRadius: 5,
        cursor: "pointer",
        fontSize: "0.77rem",
        fontWeight: active ? 600 : 400,
        background: active ? "var(--accent-glow)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-2)",
        transition: "background 0.1s",
        marginBottom: 1,
        borderLeft: active
          ? "2px solid var(--accent)"
          : "2px solid transparent",
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 112,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.61rem",
          color: "var(--text-3)",
          flexShrink: 0,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {count}
      </span>
    </button>
  );
}
function VBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "5px 8px",
        border: "none",
        background: active ? "var(--accent-glow)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-3)",
        cursor: "pointer",
        transition: "background 0.1s",
        display: "flex",
        alignItems: "center",
      }}
    >
      {children}
    </button>
  );
}
function GridIco() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function TreeIco() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}
function RefreshIco({ spin }: { spin: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: spin ? "spin 1s linear infinite" : "none" }}
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
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