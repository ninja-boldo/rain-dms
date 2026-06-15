import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSettingsStore } from "../store/settings";
import { searchDocuments } from "../api/client";
import type { SearchResponse } from "../api/client";
import AuthImage from "../components/AuthImage";
import { useI18n } from "../i18n";

function cleanFileName(key: string): string {
  if (!key) return "";
  const base = key.split("/").pop() ?? key;
  return base
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
      "$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
      "$1",
    );
}

interface Hit {
  filepath: string;
  pageIdx: number;
  fileId: number | string;
  banner_img?: string;
  assigned_tags?: string[];
  searchable_text?: string;
  formatted_text?: string;
}

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
          const snippet = (
            hit.formatted_text ??
            hit.searchable_text ??
            ""
          ).slice(0, 280);
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
              {snippet && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    color: "var(--text-2)",
                    lineHeight: 1.5,
                    flex: 1,
                    minWidth: 0,
                    wordBreak: "break-word",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                  }}
                >
                  {renderHighlight(snippet)}
                </p>
              )}
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
  const snippet = (hit.formatted_text ?? hit.searchable_text ?? "").slice(
    0,
    320,
  );
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
      {hit.banner_img && (
        <div
          style={{ width: 80, flexShrink: 0, background: "var(--bg-raised)" }}
        >
          <AuthImage
            src={hit.banner_img}
            alt=""
            style={{
              width: "100%",
              height: "100%",
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
        {snippet && (
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
            {renderHighlight(snippet)}
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
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [grouped, setGrouped] = useState(true);
  const apiUrl = useSettingsStore((s) => s.apiUrl);

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

  async function doSearch(q: string, tag?: string | null) {
    const effective = tag ? `${q} tag:${tag}`.trim() : q.trim();
    if (!effective && !createdAfter && !createdBefore) return;
    setLoading(true);
    setError(null);
    try {
      const extra: Record<string, string> = {};
      if (createdAfter) extra.created_after = createdAfter;
      if (createdBefore) extra.created_before = createdBefore;
      const res = await searchDocuments(effective, extra);
      setResult(res);
      setParams({ q: effective }, { replace: true });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

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

  const hits: Hit[] = (result?.hits ?? []).map((h: any) => ({
    filepath: h.filepath,
    pageIdx:
      typeof h.pageIdx === "string" ? parseInt(h.pageIdx, 10) : h.pageIdx,
    fileId: h.file_id,
    banner_img: resolveBannerUrl(h.banner_img) ?? undefined,
    assigned_tags: h.assigned_tags,
    searchable_text: h.searchable_text,
    formatted_text: h._formatted?.searchable_text,
  }));

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

  function openHit(hit: Hit, idx: number) {
    nav(
      `/document?filepath=${encodeURIComponent(hit.filepath)}&page=${hit.pageIdx}&q=${encodeURIComponent(query)}&hit=${idx}`,
    );
  }

  const distinctFiles = new Set(hits.map((h) => h.filepath)).size;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Main column */}
      <div
        style={{
          flex: 1,
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
              setActiveTag(null);
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

          {/* Date filters */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label className="label">{t.sr_after}</label>
              <input
                className="input"
                type="date"
                value={createdAfter}
                onChange={(e) => setCreatedAfter(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">{t.sr_before}</label>
              <input
                className="input"
                type="date"
                value={createdBefore}
                onChange={(e) => setCreatedBefore(e.target.value)}
              />
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

          {/* Result summary */}
          {result && (
            <div
              style={{
                marginTop: 7,
                display: "flex",
                alignItems: "center",
                gap: 8,
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
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {error && (
            <div
              style={{
                padding: "8px 12px",
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

          {!loading && grouped
            ? groupedHits.map(([filepath, fileHits], gi) => {
                const baseIdx = groupedHits
                  .slice(0, gi)
                  .reduce((s, [, h]) => s + h.length, 0);
                return (
                  <FileGroup
                    key={filepath}
                    filepath={filepath}
                    hits={fileHits}
                    totalHits={hits.length}
                    baseIndex={baseIdx}
                    onJump={(hit, idx) => openHit(hit, idx)}
                  />
                );
              })
            : !loading &&
              hits.map((hit, i) => (
                <FlatHit
                  key={`${hit.fileId}_${hit.pageIdx}_${i}`}
                  hit={hit}
                  index={i}
                  totalHits={hits.length}
                  onJump={() => openHit(hit, i)}
                />
              ))}
        </div>
      </div>

      {/* Tag facet sidebar */}
      {tagFacets.length > 0 && (
        <aside
          style={{
            width: 160,
            flexShrink: 0,
            borderLeft: "1px solid var(--border)",
            padding: "12px 6px",
            overflowY: "auto",
            background: "var(--bg-surface)",
          }}
        >
          <p className="label" style={{ paddingLeft: 4, marginBottom: 6 }}>
            {t.sr_filterByTag}
          </p>
          {tagFacets.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => {
                const n = activeTag === tag ? null : tag;
                setActiveTag(n);
                doSearch(query, n);
              }}
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
                fontWeight: 500,
                background:
                  activeTag === tag ? "var(--accent-glow)" : "transparent",
                color: activeTag === tag ? "var(--accent)" : "var(--text-2)",
                transition: "background 0.1s",
                marginBottom: 1,
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 100,
                }}
              >
                {tag}
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
          ))}
        </aside>
      )}
    </div>
  );
}
