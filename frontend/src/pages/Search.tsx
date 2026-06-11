import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import { SearchHit } from "../types";
import OcrOverlay from "../components/documents/OcrOverlay";
import styles from "./Search.module.css";
import AuthImg from "../components/common/AuthImg";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFilename(filepath?: string, tags?: string[]): string {
  if (!filepath) return "Unknown";
  const parts = filepath.split(/[/\\]/);
  return parts[parts.length - 1]
    .replace(/-\[object Object\]-[\d-T:.Z]+\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[.\dZ]*\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/\.(pdf|png|jpe?g)$/i, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function rewriteBanner(url: string, serverUrl: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/s3/")) return `${serverUrl}${u.pathname}`;
    return `${serverUrl}/s3${u.pathname}`;
  } catch {
    return url;
  }
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const regex = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((p, i) =>
        terms.some((t) => p.toLowerCase() === t.toLowerCase()) ? (
          <mark key={i} className={styles.mark}>{p}</mark>
        ) : (p),
      )}
    </>
  );
}

interface GroupedResult {
  filepath: string;
  pages: SearchHit[];
  matchingPageIdxs: number[];
}

const RECENT_KEY = "rain-dms-recent-searches";
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function pushRecent(q: string) {
  if (!q.trim()) return;
  const prev = getRecent().filter((r) => r !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 8)));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Search() {
  const { settings, getAuthHeaders } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const params = new URLSearchParams(location.search);
  const qParam = params.get("q") ?? "";
  const fileParam = params.get("file") ?? "";

  const [query, setQuery] = useState(qParam);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingMs, setProcessingMs] = useState<number | null>(null);
  const [totalHits, setTotalHits] = useState<number | null>(null);

  // filters
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateAfter, setDateAfter] = useState("");
  const [dateBefore, setDateBefore] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // overlay
  const [overlayHit, setOverlayHit] = useState<SearchHit | null>(null);
  const [overlayPageIdx, setOverlayPageIdx] = useState(0);
  const [overlayMatchPages, setOverlayMatchPages] = useState<number[]>([]);

  // recent searches
  const [recent, setRecent] = useState<string[]>(getRecent);

  // ── Fetch available tags ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${settings.serverUrl}/tags`, { headers: getAuthHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.tags ? setAvailableTags(d.tags.map((t: any) => t.tag)) : null)
      .catch(() => null);
  }, [settings.serverUrl]);

  // ── Build query string with filters ──────────────────────────────────────
  const buildApiQuery = useCallback((q: string, tags: string[], after: string, before: string) => {
    let qs = `query=${encodeURIComponent(q)}&limit=100`;
    if (tags.length) {
      const tagFilter = tags.map((t) => `assigned_tags = '${t}'`).join(" AND ");
      qs += `&filter=${encodeURIComponent(tagFilter)}`;
    }
    if (after) qs += `&created_after=${encodeURIComponent(after)}`;
    if (before) qs += `&created_before=${encodeURIComponent(before)}`;
    return qs;
  }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const doSearch = useCallback(
    async (q: string, tags: string[], after: string, before: string) => {
      if (!q.trim() && !tags.length && !after && !before) {
        setResults([]); setTotalHits(null); setLoading(false); return;
      }
      setLoading(true); setError(null);
      try {
        const qs = buildApiQuery(q, tags, after, before);
        const res = await fetch(`${settings.serverUrl}/search?${qs}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rewritten = (data.hits ?? []).map((h: SearchHit) => ({
          ...h,
          banner_img: rewriteBanner(h.banner_img, settings.serverUrl),
        }));
        setResults(rewritten);
        setProcessingMs(data.processingTimeMs ?? null);
        setTotalHits(data.estimatedTotalHits ?? rewritten.length);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [settings.serverUrl, getAuthHeaders, buildApiQuery],
  );

  // Sync query/filters from URL on mount
  useEffect(() => {
    setQuery(qParam);
    if (qParam) doSearch(qParam, selectedTags, dateAfter, dateBefore);
    else setResults([]);
  }, [qParam]);

  // Debounce search as user types
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const urlParams = new URLSearchParams();
      if (query) urlParams.set("q", query);
      navigate(`/search?${urlParams.toString()}`, { replace: true });
      doSearch(query, selectedTags, dateAfter, dateBefore);
    }, 280);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, selectedTags, dateAfter, dateBefore]);

  // Auto-open file from modal navigation
  useEffect(() => {
    if (fileParam && results.length > 0) {
      const hit = results.find((h) => h.filepath === fileParam);
      if (hit) openOverlay(hit);
    }
  }, [fileParam, results.length]);

  // / to focus
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const terms = useMemo(() => query.trim().split(/\s+/).filter(Boolean), [query]);

  const groups = useMemo<GroupedResult[]>(() => {
    const map = new Map<string, SearchHit[]>();
    for (const hit of results) {
      const key = hit.filepath ?? hit.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(hit);
    }
    return Array.from(map.entries()).map(([filepath, pages]) => ({
      filepath,
      pages,
      matchingPageIdxs: pages.map((p) => p.pageIdx),
    }));
  }, [results]);

  const openOverlay = (hit: SearchHit, pageIdx?: number, matchPages?: number[]) => {
    setOverlayHit(hit);
    setOverlayPageIdx(pageIdx ?? hit.pageIdx ?? 0);
    setOverlayMatchPages(matchPages ?? [hit.pageIdx ?? 0]);
  };

  const handleSubmit = () => {
    if (query.trim()) { pushRecent(query.trim()); setRecent(getRecent()); }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]); setDateAfter(""); setDateBefore("");
  };

  const hasActiveFilters = selectedTags.length > 0 || !!dateAfter || !!dateBefore;
  const showEmpty = !loading && !query.trim() && !hasActiveFilters;

  return (
    <div className={styles.root}>

      {/* ── Search bar ── */}
      <div className={styles.searchBarWrap}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Search documents… (/ to focus)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            autoFocus
            spellCheck={false}
          />
          {loading && <span className={styles.spinner} />}
          {query && !loading && (
            <button className={styles.clearBtn} onClick={() => setQuery("")} title="Clear">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button
            className={`${styles.filterToggle} ${filterOpen || hasActiveFilters ? styles.filterToggleActive : ""}`}
            onClick={() => setFilterOpen((v) => !v)}
            title="Filters"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            {hasActiveFilters && <span className={styles.filterBadge}>{selectedTags.length + (dateAfter ? 1 : 0) + (dateBefore ? 1 : 0)}</span>}
          </button>
        </div>

        {/* ── Active filter chips ── */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            {selectedTags.map((tag) => (
              <span key={tag} className={styles.activeFilterChip} onClick={() => toggleTag(tag)}>
                tag:{tag} ×
              </span>
            ))}
            {dateAfter && (
              <span className={styles.activeFilterChip} onClick={() => setDateAfter("")}>
                after:{dateAfter} ×
              </span>
            )}
            {dateBefore && (
              <span className={styles.activeFilterChip} onClick={() => setDateBefore("")}>
                before:{dateBefore} ×
              </span>
            )}
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>Clear all</button>
          </div>
        )}

        {/* ── Expanded filter panel ── */}
        {filterOpen && (
          <div className={styles.filterPanel}>
            {availableTags.length > 0 && (
              <div className={styles.filterSection}>
                <p className={styles.filterSectionLabel}>Tags</p>
                <div className={styles.tagCloud}>
                  {availableTags.slice(0, 30).map((tag) => (
                    <button
                      key={tag}
                      className={`${styles.tagChip} ${selectedTags.includes(tag) ? styles.tagChipActive : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.filterSection}>
              <p className={styles.filterSectionLabel}>Date range</p>
              <div className={styles.dateRow}>
                <label className={styles.dateLabel}>After</label>
                <input type="date" className={styles.dateInput} value={dateAfter} onChange={(e) => setDateAfter(e.target.value)} />
                <label className={styles.dateLabel}>Before</label>
                <input type="date" className={styles.dateInput} value={dateBefore} onChange={(e) => setDateBefore(e.target.value)} />
              </div>
            </div>
            <div className={styles.filterSection}>
              <p className={styles.filterSectionLabel}>Syntax</p>
              <div className={styles.syntaxHints}>
                <code className={styles.syntaxChip}>tag:invoice</code>
                <code className={styles.syntaxChip}>"exact phrase"</code>
                <code className={styles.syntaxChip}>-exclude</code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      {!loading && totalHits !== null && (query || hasActiveFilters) && (
        <div className={styles.statsRow}>
          <span className={styles.statChip}>
            <strong>{groups.length}</strong> {groups.length === 1 ? "document" : "documents"}
          </span>
          <span className={styles.statChip}>
            <strong>{totalHits}</strong> page {totalHits === 1 ? "hit" : "hits"}
          </span>
          {processingMs !== null && (
            <span className={styles.statChip}>{processingMs}ms</span>
          )}
        </div>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      {/* ── No results ── */}
      {!loading && (query || hasActiveFilters) && groups.length === 0 && !error && (
        <div className={styles.empty}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>No results for <strong>"{query}"</strong></p>
          <div className={styles.hints}>
            <span className={styles.hintChip}>try fewer words</span>
            <span className={styles.hintChip}>check spelling</span>
            <span className={styles.hintChip}>tag:invoice</span>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {groups.length > 0 && (
        <div className={styles.results}>
          {groups.map(({ filepath, pages, matchingPageIdxs }) => {
            const best = pages.find((p) => p.ocr?.lines?.length) ?? pages[0];
            const filename = getFilename(filepath, best?.assigned_tags ?? []);
            const ext = filepath.split(".").pop()?.toUpperCase() ?? "";
            const snippet =
              best?.ocr?.lines
                ?.flatMap((l) => l.boxes.map((b) => b.text))
                .join(" ")
                .slice(0, 220) ?? "";
            const tags = best?.assigned_tags ?? [];

            return (
              <div
                key={filepath}
                className={styles.resultCard}
                onClick={() => openOverlay(best, best.pageIdx, matchingPageIdxs)}
              >
                {/* Thumbnail */}
                <div className={styles.thumb}>
                  {best?.banner_img ? (
                    <AuthImg
                      src={best.banner_img}
                      alt={filename}
                      className={styles.thumbImg}
                      skeletonClass={styles.thumbImg}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                      fallback={
                        <div className={styles.thumbFallback}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                      }
                    />
                  ) : (
                    <div className={styles.thumbFallback}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                  )}
                  <span className={styles.extBadge}>{ext}</span>
                </div>

                {/* Content */}
                <div className={styles.content}>
                  <div className={styles.contentTop}>
                    <span className={styles.filename} title={filepath}>{filename}</span>
                    <div className={styles.meta}>
                      <span className={styles.pageBadge}>{pages.length} p.</span>
                      {best?.created_at && (
                        <span className={styles.dateBadge}>
                          {new Date(best.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {snippet && (
                    <p className={styles.snippet}>
                      <Highlight text={snippet} terms={terms} />
                    </p>
                  )}

                  <div className={styles.cardFooter}>
                    {/* Tags (click to filter) */}
                    {tags.length > 0 && (
                      <div className={styles.tags}>
                        {tags.slice(0, 4).map((tag) => (
                          <span key={tag}
                            className={`${styles.tag} ${selectedTags.includes(tag) ? styles.tagActive : ""}`}
                            onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                          >{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Page hit buttons */}
                    <div className={styles.pageHits}>
                      {pages.slice(0, 6).map((p) => (
                        <button key={p.pageIdx}
                          className={styles.pageHitBtn}
                          onClick={(e) => { e.stopPropagation(); openOverlay(p, p.pageIdx, matchingPageIdxs); }}
                          title={`Page ${p.pageIdx + 1}`}
                        >p.{p.pageIdx + 1}</button>
                      ))}
                      {pages.length > 6 && (
                        <span className={styles.morePages}>+{pages.length - 6}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.openArrow}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty / landing state ── */}
      {showEmpty && (
        <div className={styles.landing}>
          <div className={styles.landingIcon}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p className={styles.landingTitle}>Full-text document search</p>
          <p className={styles.landingSubtitle}>Powered by MeiliSearch + OCR</p>

          {recent.length > 0 && (
            <div className={styles.recentSection}>
              <p className={styles.recentLabel}>Recent</p>
              <div className={styles.recentList}>
                {recent.map((r) => (
                  <button key={r} className={styles.recentChip} onClick={() => setQuery(r)}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/>
                    </svg>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.syntaxGuide}>
            <p className={styles.syntaxGuideLabel}>Query syntax</p>
            <div className={styles.syntaxRows}>
              <div className={styles.syntaxRow}><code>tag:invoice</code><span>filter by tag</span></div>
              <div className={styles.syntaxRow}><code>"exact phrase"</code><span>phrase search</span></div>
              <div className={styles.syntaxRow}><code>-word</code><span>exclude term</span></div>
            </div>
          </div>
        </div>
      )}

      {overlayHit && (
        <OcrOverlay
          hit={overlayHit}
          initialPageIdx={overlayPageIdx}
          matchingPageIdxs={overlayMatchPages}
          query={query}
          onClose={() => {
            setOverlayHit(null);
            navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
          }}
        />
      )}
    </div>
  );
}
