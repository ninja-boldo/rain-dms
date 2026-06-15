import { useCallback, useEffect, useRef, useState } from "react";
import { getMainPage, getTags, deleteDocument } from "../api/client";
import type { Document, TagEntry } from "../api/client";
import DocumentCard from "../components/DocumentCard";
import FileTree from "../components/FileTree";
import { useSettingsStore } from "../store/settings";
import { useUploadStore } from "../store/uploads";
import { useI18n } from "../i18n";

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

const LIMIT = 48;

export default function MainPage() {
  const t = useI18n();
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [tags, setTags] = useState<TagEntry[]>([]);
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [fileFilter, setFileFilter] = useState("");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bulk delete
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const simulatedTagPaths = useSettingsStore((s) => s.simulatedTagPaths);
  // Re-fetch when uploads complete
  const lastCompletedAt = useUploadStore((s) => s.lastCompletedAt);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMainPage(pageIdx, LIMIT, activeTag);
      setDocs(res.data);
      setTotal(res.totalCount);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [pageIdx, activeTag]);

  useEffect(() => {
    load();
  }, [load, lastCompletedAt]);
  useEffect(() => {
    getTags()
      .then((r) => setTags(r.tags.slice(0, 80)))
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const filtered = sortDocs(docs, sort).filter((d) => {
    if (!fileFilter) return true;
    const f = fileFilter.toLowerCase();
    return (
      cleanName(d.fileS3Key).toLowerCase().includes(f) ||
      d.fileS3Key.toLowerCase().includes(f)
    );
  });

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
    for (const key of keys) {
      try {
        await deleteDocument(key);
      } catch {
        /* continue */
      }
    }
    setDeleting(false);
    clearSelection();
    load();
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Tag sidebar */}
      {tags.length > 0 && (
        <aside
          style={{
            width: 176,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg-surface)",
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
              onClick={() => {
                setActiveTag(undefined);
                setPageIdx(0);
              }}
            />
            {tags.map((tag) => (
              <TagBtn
                key={tag.tag}
                label={tag.tag}
                count={tag.doc_count}
                active={activeTag === tag.tag}
                onClick={() => {
                  setActiveTag(tag.tag);
                  setPageIdx(0);
                }}
              />
            ))}
          </div>
        </aside>
      )}

      {/* Main */}
      <div
        style={{
          flex: 1,
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
            title="Bulk select"
          >
            ☑ Select
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
                {selected.size} selected
              </span>
              <button onClick={selectAll} style={toolBtn}>
                all {filtered.length}
              </button>
              <button onClick={clearSelection} style={toolBtn}>
                none
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
                  ? "…"
                  : deleteConfirm
                    ? `⚠ Confirm delete ${selected.size}`
                    : `✗ Delete ${selected.size}`}
              </button>
              {deleteConfirm && (
                <button onClick={() => setDeleteConfirm(false)} style={toolBtn}>
                  cancel
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(188px,1fr))",
                gap: 13,
              }}
            >
              {loading
                ? Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="card"
                      style={{
                        height: 185,
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  ))
                : filtered.map((d) => (
                    <div
                      key={d.fileS3Key}
                      style={{ position: "relative" }}
                      onClick={
                        bulkMode ? () => toggleSelect(d.fileS3Key) : undefined
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
          ) : (
            <FileTree
              documents={filtered}
              simulatedTagPaths={simulatedTagPaths}
              filter={fileFilter}
              sortKey={sort as any}
              selectedPath={selectedPath}
              onSelect={(d) => setSelectedPath(d?.fileS3Key ?? null)}
            />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "6px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              flexShrink: 0,
              background: "var(--bg-surface)",
            }}
          >
            <button
              className="btn btn-ghost"
              disabled={pageIdx === 0}
              onClick={() => setPageIdx((p) => p - 1)}
              style={{ padding: "3px 10px" }}
            >
              ←
            </button>
            <span
              style={{
                fontSize: "0.77rem",
                color: "var(--text-2)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {pageIdx + 1} / {totalPages}
            </span>
            <button
              className="btn btn-ghost"
              disabled={pageIdx >= totalPages - 1}
              onClick={() => setPageIdx((p) => p + 1)}
              style={{ padding: "3px 10px" }}
            >
              →
            </button>
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
