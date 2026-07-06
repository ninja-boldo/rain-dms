import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { getMainPage, getTags, deleteDocument } from "../api/client";
import type { Document, TagEntry } from "../api/client";
import DocumentCard from "../components/DocumentCard";
import FileTree from "../components/FileTree";
import { useSettingsStore } from "../store/settings";
import { useUploadStore } from "../store/uploads";
import { reportSuccess } from "../store/toast";
import { useI18n } from "../i18n";

const CARD_MIN = 188;
const GAP = 13;
const ROW_HEIGHT = 215;
const ROW_OVERSCAN = 4;

type ViewMode = "grid" | "tree";
type SortKey = "date_desc" | "date_asc" | "name_asc" | "pages_desc";

function cleanName(key: string) {
  const b = key?.split("/").pop() ?? key ?? "";
  return b
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
      "$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
      "$1",
    );
}

function sortDocs(docs: Document[], sort: SortKey): Document[] {
  const d = [...docs];
  switch (sort) {
    case "date_asc":
      return d.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    case "name_asc":
      return d.sort((a, b) =>
        cleanName(a.fileS3Key).localeCompare(cleanName(b.fileS3Key)),
      );
    case "pages_desc":
      return d.sort((a, b) => (b.page_count ?? 0) - (a.page_count ?? 0));
    default:
      return d.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

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

  // Reset and fetch page 0 whenever the tag filter changes or an upload finishes.
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
  }, [activeTag]);

  // Infinite scroll — fetch the next chunk and append.
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
  }, [nextPageIdx, hasMore, activeTag]);

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

  const filtered = sortDocs(docs, sort).filter((d) => {
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
