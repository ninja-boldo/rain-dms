import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useSettingsStore } from "../store/settings";
import { searchDocuments } from "../api/client";
import type { SearchResponse } from "../api/client";
import AuthImage from "../components/AuthImage";
import { useI18n } from "../i18n";
import { cleanFileName } from "../utils/filename";

interface Hit {
  filepath: string;
  pageIdx: number;
  fileId: number | string;
  banner_img?: string;
  assigned_tags?: string[];
  searchable_text?: string;
  formatted_text?: string;
  formatted_filepath?: string;
  formatted_tags?: string[];
  /** Which indexed field the query actually matched, so the UI can show
   * *something* meaningful even when there's no searchable_text excerpt
   * (e.g. a hit that only matched on filename or a tag). */
  matchedIn: "content" | "filename" | "tag" | "other";
}

const hasHighlight = (s?: string | null) => !!s && s.includes("__HL__");

function renderHighlight(text: string): React.ReactNode[] {
  const parts = text.split(/(__HL__|__\/HL__)/g);
  const nodes: React.ReactNode[] = [];
  let inHl = false;
  for (const part of parts) {
    if (part === "__HL__") {
      inHl = true;
      continue;
    }
    if (part === "__/HL__") {
      inHl = false;
      continue;
    }
    if (inHl)
      nodes.push(
        <mark key={nodes.length} className="hl">
          {part}
        </mark>,
      );
    else nodes.push(part);
  }
  return nodes;
}

/**
 * Figures out — and renders — what a hit actually matched on. Meilisearch
 * only highlights/crops `searchable_text` by default, so a hit that matched
 * on the filename or a tag instead used to render as a blank, unexplained
 * card. This checks all three and falls back to an honest "no excerpt"
 * note rather than silently showing nothing.
 */
function matchSnippet(hit: Hit): { node: React.ReactNode; note?: string } {
  if (hit.matchedIn === "content" && hit.formatted_text) {
    return { node: renderHighlight(hit.formatted_text) };
  }
  if (hit.matchedIn === "filename" && hit.formatted_filepath) {
    const base =
      hit.formatted_filepath.split("/").pop() ?? hit.formatted_filepath;
    return { node: renderHighlight(base), note: "Matched in filename" };
  }
  if (hit.matchedIn === "tag" && hit.formatted_tags) {
    const matched = hit.formatted_tags.filter(hasHighlight);
    return {
      node: matched.length ? renderHighlight(matched.join(", ")) : null,
      note: "Matched tag",
    };
  }
  if (hit.searchable_text) {
    return { node: hit.searchable_text.slice(0, 320) };
  }
  return { node: null, note: "No excerpt available — matched by relevance" };
}

/* ── grouped hit card ──────────────────────────────────────────────────────── */

function FileGroup({
  filepath,
  hits,
  totalHits,
  baseIndex,
  onJump,
}: {
  filepath: string;
  hits: Hit[];
  totalHits: number;
  baseIndex: number;
  onJump: (hit: Hit, idx: number) => void;
}) {
  const t = useI18n();
  const name = cleanFileName(filepath);
  const firstHit = hits[0];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* File header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "var(--bg-raised)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        {firstHit.banner_img && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              overflow: "hidden",
              flexShrink: 0,
              background: "var(--bg-base)",
            }}
          >
            <AuthImage
              src={firstHit.banner_img}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--text-1)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "JetBrains Mono, monospace",
            }}
            title={name}
          >
            {name}
          </p>
          <p style={{ margin: 0, fontSize: "0.63rem", color: "var(--text-3)" }}>
            {hits.length} hit{hits.length !== 1 ? "s" : ""} ·{" "}
            {filepath.split("/").slice(0, -1).join("/")}
          </p>
        </div>
        {firstHit.assigned_tags && firstHit.assigned_tags.length > 0 && (
          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {firstHit.assigned_tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="tag"
                style={{
                  fontSize: "0.6rem",
                  padding: "0 5px",
                  pointerEvents: "none",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hit rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {hits.map((hit, i) => {
          const absIdx = baseIndex + i;
          const { node: snippetNode, note: matchNote } = matchSnippet(hit);
          return (
            <div
              key={`${hit.pageIdx}_${i}`}
              style={{
                display: "flex",
                gap: 10,
                padding: "7px 12px",
                borderBottom:
                  i < hits.length - 1 ? "1px solid var(--border-soft)" : "none",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-raised)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              onClick={() => onJump(hit, absIdx)}
            >
              <span
                style={{
                  fontSize: "0.58rem",
                  color: "var(--accent)",
                  fontFamily: "JetBrains Mono, monospace",
                  background: "var(--accent-glow)",
                  padding: "2px 5px",
                  borderRadius: 3,
                  flexShrink: 0,
                  alignSelf: "flex-start",
                  marginTop: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {t.sr_page}
                {hit.pageIdx + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {matchNote && (
                  <p
                    style={{
                      margin: "0 0 1px",
                      fontSize: "0.6rem",
                      color: "var(--text-3)",
                      fontStyle: "italic",
                    }}
                  >
                    {matchNote}
                  </p>
                )}
                {snippetNode && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.72rem",
                      color: "var(--text-2)",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                    }}
                  >
                    {snippetNode}
                  </p>
                )}
              </div>
              <button
                style={{
                  background: "var(--accent-glow)",
                  border: "1px solid var(--accent)",
                  color: "var(--accent)",
                  padding: "3px 9px",
                  borderRadius: 4,
                  fontSize: "0.68rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontFamily: "JetBrains Mono, monospace",
                  flexShrink: 0,
                  alignSelf: "center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onJump(hit, absIdx);
                }}
              >
                {t.sr_open}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── flat hit card ─────────────────────────────────────────────────────────── */

function FlatHit({
  hit,
  index,
  totalHits,
  onJump,
}: {
  hit: Hit;
  index: number;
  totalHits: number;
  onJump: () => void;
}) {
  const t = useI18n();
  const [showPath, setShowPath] = useState(false);
  const { node: snippetNode, note: matchNote } = matchSnippet(hit);
  const name = cleanFileName(hit.filepath ?? "");

  return (
    <div
      className="card"
      style={{
        padding: 0,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        minHeight: 80,
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--accent)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
      onClick={onJump}
    >
      {hit.pageIdx === 0 && hit.banner_img && (
        <div
          style={{
            width: 56,
            height: 80,
            flexShrink: 0,
            background: "var(--bg-raised)",
          }}
        >
          <AuthImage
            src={hit.banner_img}
            alt=""
            style={{
              width: 56,
              height: 80,
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}
      <div
        style={{
          padding: "8px 11px",
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              fontSize: "0.58rem",
              color: "var(--accent)",
              fontFamily: "JetBrains Mono, monospace",
              background: "var(--accent-glow)",
              padding: "1px 5px",
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            {index + 1}/{totalHits}
          </span>
          <p
            className="mono"
            style={{
              margin: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-1)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
            title={name}
          >
            {name}
          </p>
          <button
            title="Full path"
            onClick={(e) => {
              e.stopPropagation();
              setShowPath((v) => !v);
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-3)",
              fontSize: "0.68rem",
              padding: "2px 4px",
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            ⓘ
          </button>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.61rem",
            color: "var(--text-3)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span>
            {t.sr_page}
            {hit.pageIdx + 1}
          </span>
          {hit.assigned_tags && hit.assigned_tags.length > 0 && (
            <span style={{ display: "flex", gap: 3 }}>
              {hit.assigned_tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="tag"
                  style={{
                    pointerEvents: "none",
                    fontSize: "0.6rem",
                    padding: "0 5px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </span>
          )}
        </p>
        {showPath && (
          <p
            className="mono"
            style={{
              margin: 0,
              fontSize: "0.59rem",
              color: "var(--text-2)",
              wordBreak: "break-all",
              background: "var(--bg-raised)",
              padding: "3px 5px",
              borderRadius: 3,
            }}
          >
            {hit.filepath}
          </p>
        )}
        {matchNote && (
          <p
            style={{
              margin: 0,
              fontSize: "0.6rem",
              color: "var(--text-3)",
              fontStyle: "italic",
            }}
          >
            {matchNote}
          </p>
        )}
        {snippetNode && (
          <p
            style={{
              margin: 0,
              fontSize: "0.71rem",
              color: "var(--text-2)",
              lineHeight: 1.45,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            {snippetNode}
          </p>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJump();
          }}
          style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            padding: "5px 11px",
            borderRadius: 5,
            fontSize: "0.68rem",
            cursor: "pointer",
            fontWeight: 600,
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {t.sr_open}
        </button>
      </div>
    </div>
  );
}

/* ── main SearchPage ────────────────────────────────────────────────────────── */

export default function SearchPage() {
  const t = useI18n();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAfter, setCreatedAfter] = useState("");
  const [createdBefore, setCreatedBefore] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "relevance" | "newest" | "oldest" | "biggest" | "smallest"
  >("relevance");
  const [grouped, setGrouped] = useState(true);
  const apiUrl = useSettingsStore((s) => s.apiUrl);

  const RECENT_KEY = "rain-dms-recent-searches";
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  function pushRecent(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((r) => r !== trimmed)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }
  function clearRecent() {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      /* ignore */
    }
  }

  // Construct proper banner URL — search hits have raw filenames from MeiliSearch
  function resolveBannerUrl(raw: string | null | undefined): string | null {
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw; // already absolute
    // Route through authenticated download endpoint
    return `${apiUrl}/download?fileKey=${encodeURIComponent(raw)}`;
  }

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function doSearch(
    q: string,
    overrides?: {
      tags?: string[];
      sort?: typeof sortBy;
    },
  ) {
    const effective = q.trim();
    const tagsToUse = overrides?.tags ?? selectedTags;
    const sortToUse = overrides?.sort ?? sortBy;
    if (
      !effective &&
      !createdAfter &&
      !createdBefore &&
      tagsToUse.length === 0
    )
      return;
    setLoading(true);
    setError(null);
    try {
      const extra: Record<string, string> = {};
      if (createdAfter) extra.created_after = createdAfter;
      if (createdBefore) extra.created_before = createdBefore;
      if (tagsToUse.length > 0) extra.tags = tagsToUse.join(",");
      if (sortToUse !== "relevance") extra.sort = sortToUse;
      const res = await searchDocuments(effective, extra);
      setResult(res);
      setParams({ q: effective }, { replace: true });
      pushRecent(effective);
      // Jump back to the top of the results list for a fresh search.
      requestAnimationFrame(() => {
        resultsScrollRef.current?.scrollTo({ top: 0 });
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Debounced live search — fires ~450ms after typing stops, in addition to
  // explicit submit. Skips very short queries to avoid noisy calls.
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) return;
    const handle = setTimeout(() => {
      doSearch(query);
    }, 450);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const q = params.get("q");
    if (q) {
      setQuery(q);
      doSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagFacets = result?.tag_facets
    ? Object.entries(result.tag_facets).sort((a, b) => b[1] - a[1])
    : [];

  const hits: Hit[] = (result?.hits ?? []).map((h: any) => {
    const fText: string | undefined = h._formatted?.searchable_text;
    const fPath: string | undefined = h._formatted?.filepath;
    const fTags: string[] | undefined = h._formatted?.assigned_tags;
    let matchedIn: Hit["matchedIn"] = "other";
    if (hasHighlight(fText)) matchedIn = "content";
    else if (hasHighlight(fPath)) matchedIn = "filename";
    else if (fTags?.some(hasHighlight)) matchedIn = "tag";
    return {
      filepath: h.filepath,
      pageIdx:
        typeof h.pageIdx === "string" ? parseInt(h.pageIdx, 10) : h.pageIdx,
      fileId: h.file_id,
      banner_img: resolveBannerUrl(h.banner_img) ?? undefined,
      assigned_tags: h.assigned_tags,
      searchable_text: h.searchable_text,
      formatted_text: fText,
      formatted_filepath: fPath,
      formatted_tags: fTags,
      matchedIn,
    };
  });

  // Group hits by file
  const groupedHits = useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const hit of hits) {
      const arr = map.get(hit.filepath) ?? [];
      arr.push(hit);
      map.set(hit.filepath, arr);
    }
    return Array.from(map.entries());
  }, [hits]);

  // ── Virtualization ────────────────────────────────────────────────────
  // Result lists can easily run into the hundreds of hits across many
  // files, and rendering every card at once made typing/scrolling janky.
  // Row heights vary a lot (a grouped file card can have anywhere from 1
  // to dozens of hit rows), so we measure each rendered row and let the
  // virtualizer keep its cache in sync via ResizeObserver.
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const rowCount = grouped ? groupedHits.length : hits.length;
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => resultsScrollRef.current,
    estimateSize: (i) => {
      if (grouped) {
        const fileHits = groupedHits[i]?.[1]?.length ?? 1;
        return 58 + fileHits * 52 + 8;
      }
      return 96;
    },
    overscan: 6,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  function openHit(hit: Hit, idx: number) {
    nav(
      `/document?filepath=${encodeURIComponent(hit.filepath)}&page=${hit.pageIdx}&q=${encodeURIComponent(query)}&hit=${idx}`,
    );
  }

  const distinctFiles = new Set(hits.map((h) => h.filepath)).size;

  return (
    <div className="split-panel" style={{ height: "100%", overflow: "hidden" }}>
      {/* Main column */}
      <div
        className="split-primary"
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Search bar */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            background: "var(--bg-surface)",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              doSearch(query);
            }}
            style={{ display: "flex", gap: 7 }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-3)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  position: "absolute",
                  left: 9,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                className="input"
                style={{
                  paddingLeft: 30,
                  paddingRight: query ? 28 : undefined,
                }}
                placeholder={t.sr_placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResult(null);
                    inputRef.current?.focus();
                  }}
                  style={{
                    position: "absolute",
                    right: 7,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-3)",
                    fontSize: "0.72rem",
                    padding: "0 2px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ flexShrink: 0 }}
            >
              {loading ? "…" : t.sr_search}
            </button>
          </form>

          {/* Recent searches */}
          {!query && !result && recent.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 9,
              }}
            >
              <span
                style={{
                  fontSize: "0.66rem",
                  color: "var(--text-3)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {t.sr_recent}
              </span>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setQuery(r);
                    doSearch(r);
                  }}
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 999,
                    cursor: "pointer",
                    color: "var(--text-2)",
                    fontSize: "0.7rem",
                    padding: "2px 10px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={clearRecent}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontSize: "0.68rem",
                  textDecoration: "underline",
                  padding: "2px 4px",
                }}
              >
                {t.sr_clearRecent}
              </button>
            </div>
          )}

          {/* Date filters */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}
          >
            <div style={{ flex: "1 1 120px" }}>
              <label className="label">{t.sr_after}</label>
              <input
                className="input"
                type="date"
                value={createdAfter}
                onChange={(e) => setCreatedAfter(e.target.value)}
              />
            </div>
            <div style={{ flex: "1 1 120px" }}>
              <label className="label">{t.sr_before}</label>
              <input
                className="input"
                type="date"
                value={createdBefore}
                onChange={(e) => setCreatedBefore(e.target.value)}
              />
            </div>
            {/* Sort */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <label className="label" style={{ marginBottom: 3 }}>
                Sort
              </label>
              <select
                className="input"
                value={sortBy}
                onChange={(e) => {
                  const next = e.target.value as typeof sortBy;
                  setSortBy(next);
                  doSearch(query, { sort: next });
                }}
                style={{ fontSize: "0.72rem", padding: "4px 8px" }}
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="biggest">Biggest first</option>
                <option value="smallest">Smallest first</option>
              </select>
            </div>
            {/* Group toggle */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setGrouped((g) => !g)}
                className="btn btn-ghost"
                style={{
                  fontSize: "0.72rem",
                  padding: "4px 9px",
                  borderColor: grouped ? "var(--accent)" : undefined,
                  color: grouped ? "var(--accent)" : undefined,
                }}
                title={grouped ? t.sr_flat : t.sr_groupByFile}
              >
                {grouped ? t.sr_flat : t.sr_groupByFile}
              </button>
            </div>
          </div>

          {/* Selected tag filter chips */}
          {selectedTags.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: "0.63rem",
                  color: "var(--text-3)",
                }}
              >
                Tags included:
              </span>
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const next = selectedTags.filter((tg) => tg !== tag);
                    setSelectedTags(next);
                    doSearch(query, { tags: next });
                  }}
                  className="tag"
                  style={{
                    fontSize: "0.65rem",
                    padding: "1px 8px",
                    cursor: "pointer",
                    border: "1px solid var(--accent)",
                    color: "var(--accent)",
                    background: "var(--accent-glow)",
                  }}
                  title="Remove filter"
                >
                  {tag} ✕
                </button>
              ))}
              <button
                onClick={() => {
                  setSelectedTags([]);
                  doSearch(query, { tags: [] });
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontSize: "0.63rem",
                  textDecoration: "underline",
                }}
              >
                clear
              </button>
            </div>
          )}

          {/* Result summary + search stats */}
          {result && (
            <div
              style={{
                marginTop: 7,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.7rem",
                  color: "var(--text-3)",
                }}
              >
                {t.sr_results(hits.length, distinctFiles)}
                {typeof result.estimatedTotalHits === "number" &&
                  result.estimatedTotalHits > hits.length && (
                    <> of {result.estimatedTotalHits} total</>
                  )}
                {typeof result.processing_time_ms === "number" && (
                  <> · {result.processing_time_ms}ms</>
                )}
                {result.sort && result.sort !== "relevance" && (
                  <>
                    {" "}
                    · sorted by {result.sort}
                    {result.sort_applied === false && " (unavailable, showing relevance order)"}
                  </>
                )}
                {result.excludedTerms.length > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span style={{ color: "var(--danger)" }}>
                      {t.sr_excluded} {result.excludedTerms.join(", ")}
                    </span>
                  </>
                )}
              </p>
              {result.cleanQuery && query !== result.cleanQuery && (
                <span
                  style={{
                    fontSize: "0.63rem",
                    color: "var(--text-3)",
                    fontFamily: "JetBrains Mono, monospace",
                    background: "var(--bg-raised)",
                    padding: "1px 6px",
                    borderRadius: 3,
                  }}
                >
                  ↳ {result.cleanQuery}
                </span>
              )}
            </div>
          )}

          {/* Keyboard hint */}
          {!result && !loading && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "0.63rem",
                color: "var(--text-3)",
              }}
            >
              Press{" "}
              <kbd
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: 3,
                  padding: "0 4px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.62rem",
                }}
              >
                /
              </kbd>{" "}
              to focus
            </p>
          )}
        </div>

        {/* Results */}
        <div
          ref={resultsScrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
          }}
        >
          {!query && !result && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--text-3)",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              <div style={{ color: "var(--accent)", marginBottom: 10 }}>
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: "0 auto" }}
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--text-1)",
                }}
              >
                {t.sr_welcomeTitle}
              </p>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: "0.78rem",
                  lineHeight: 1.5,
                }}
              >
                {t.sr_welcomeBody}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                {[
                  { label: t.sr_exTag, value: "tag:invoices" },
                  { label: t.sr_exExclude, value: "report -draft" },
                  { label: t.sr_exPhrase, value: '"quarterly summary"' },
                ].map((ex) => (
                  <button
                    key={ex.value}
                    onClick={() => {
                      setQuery(ex.value);
                      doSearch(ex.value);
                    }}
                    title={ex.value}
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: 999,
                      cursor: "pointer",
                      color: "var(--text-2)",
                      fontSize: "0.7rem",
                      padding: "4px 12px",
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "8px 12px",
                marginBottom: 8,
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
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[80, 100, 70].map((h, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    height: h,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          )}
          {!loading && !error && hits.length === 0 && result && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "var(--text-3)",
              }}
            >
              <p style={{ fontSize: "0.85rem" }}>{t.sr_noResults}</p>
            </div>
          )}

          {!loading && !error && rowCount > 0 && (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: rowVirtualizer.getTotalSize(),
              }}
            >
              {virtualRows.map((vr) => {
                if (grouped) {
                  const entry = groupedHits[vr.index];
                  if (!entry) return null;
                  const [filepath, fileHits] = entry;
                  const baseIdx = groupedHits
                    .slice(0, vr.index)
                    .reduce((s, [, h]) => s + h.length, 0);
                  return (
                    <div
                      key={vr.key}
                      data-index={vr.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${vr.start}px)`,
                        paddingBottom: 8,
                      }}
                    >
                      <FileGroup
                        filepath={filepath}
                        hits={fileHits}
                        totalHits={hits.length}
                        baseIndex={baseIdx}
                        onJump={(hit, idx) => openHit(hit, idx)}
                      />
                    </div>
                  );
                }
                const hit = hits[vr.index];
                if (!hit) return null;
                return (
                  <div
                    key={vr.key}
                    data-index={vr.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vr.start}px)`,
                      paddingBottom: 8,
                    }}
                  >
                    <FlatHit
                      hit={hit}
                      index={vr.index}
                      totalHits={hits.length}
                      onJump={() => openHit(hit, vr.index)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tag facet sidebar */}
      {tagFacets.length > 0 && (
        <aside
          className="split-secondary"
          style={{
            width: 160,
            flexShrink: 0,
            borderLeft: "1px solid var(--border)",
            padding: "12px 6px",
            overflowY: "auto",
            background: "var(--bg-surface)",
            maxHeight: "40vh",
          }}
        >
          <p className="label" style={{ paddingLeft: 4, marginBottom: 2 }}>
            {t.sr_filterByTag}
          </p>
          <p
            style={{
              paddingLeft: 4,
              margin: "0 0 6px",
              fontSize: "0.6rem",
              color: "var(--text-3)",
            }}
          >
            {selectedTags.length === 0
              ? "All tags included"
              : `${selectedTags.length} selected`}
          </p>
          {tagFacets.map(([tag, count]) => {
            const checked = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => {
                  const next = checked
                    ? selectedTags.filter((tg) => tg !== tag)
                    : [...selectedTags, tag];
                  setSelectedTags(next);
                  doSearch(query, { tags: next });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  width: "100%",
                  padding: "4px 8px",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: "0.77rem",
                  fontWeight: 500,
                  background: checked ? "var(--accent-glow)" : "transparent",
                  color: checked ? "var(--accent)" : "var(--text-2)",
                  transition: "background 0.1s",
                  marginBottom: 1,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 0,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      flexShrink: 0,
                      border: `1px solid ${checked ? "var(--accent)" : "var(--border-soft)"}`,
                      background: checked ? "var(--accent)" : "transparent",
                    }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 84,
                    }}
                  >
                    {tag}
                  </span>
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
          })}
        </aside>
      )}
    </div>
  );
}
