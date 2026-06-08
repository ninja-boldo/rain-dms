import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useApp } from "../lib/AppContext";
import { SearchHit } from "../types";
import OcrOverlay from "../components/documents/OcrOverlay";
import styles from "./Search.module.css";

// ── Icons ─────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const SortIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <polyline points="3 6 4 7 6 4" /><polyline points="3 12 4 13 6 10" /><polyline points="3 18 4 19 6 16" />
  </svg>
);
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const Spinner = () => <div className={styles.spinner} />;

// ── Helpers ───────────────────────────────────────────────────
function getFilename(filepath?: string): string {
  if (!filepath) return "Unknown Document";
  const parts = filepath.split(/[\\\/]/);
  const name = parts[parts.length - 1];
  return name
    .replace(/-\[object Object\]-[\d-T:.Z]+\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[.\dZ]*\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(/\.(pdf|png|jpe?g)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function getExt(filepath?: string): string {
  if (!filepath) return "FILE";
  const m = filepath.match(/\.(pdf|png|jpg|jpeg)$/i);
  return m ? m[1].toUpperCase() : "FILE";
}

function getMatchCount(hit: SearchHit, terms: string[]): number {
  if (!terms.length) return 0;
  if (hit.searchable_text) {
    const lower = hit.searchable_text.toLowerCase();
    return terms.reduce((count, term) => {
      const t = term.toLowerCase();
      let matches = 0; let pos = lower.indexOf(t);
      while (pos !== -1) { matches++; pos = lower.indexOf(t, pos + 1); }
      return count + matches;
    }, 0);
  }
  return hit.ocr?.lines?.flatMap((l) => l.boxes)
    .filter((b) => terms.some((t) => b.text.toLowerCase().includes(t.toLowerCase()))).length ?? 0;
}

function buildSnippet(hit: SearchHit, terms: string[], maxChars = 280): React.ReactNode[] {
  let rawText = hit.searchable_text ?? "";
  if (!rawText) {
    rawText = hit.ocr?.lines?.flatMap((l) => l.boxes.map((b) => b.text)).join(" ") ?? "";
  }
  if (!rawText) return ["Kein Text verfügbar"];
  if (!terms.length) return [rawText.slice(0, maxChars) + (rawText.length > maxChars ? "…" : "")];

  const lower = rawText.toLowerCase();
  let start = 0;
  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx !== -1) { start = Math.max(0, idx - 80); break; }
  }
  const slice = rawText.slice(start, start + maxChars);
  const prefix = start > 0 ? "…" : "";
  const suffix = start + maxChars < rawText.length ? "…" : "";

  const regex = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = slice.split(regex);
  const nodes: React.ReactNode[] = [prefix];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const isMatch = terms.some((t) => part.toLowerCase() === t.toLowerCase());
    nodes.push(isMatch ? <mark key={i} className={styles.highlight}>{part}</mark> : part);
  }
  nodes.push(suffix);
  return nodes;
}

function groupByFile(hits: SearchHit[]): Map<string, SearchHit[]> {
  const map = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const key = hit.filepath ?? `__unknown_${hit.id}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(hit);
  }
  return map;
}

// ── Query parser ─────────────────────────────────────────────
interface Token { type: "text" | "tag" | "boolean"; raw: string; value: string; }
function parseQuery(raw: string): { tokens: Token[]; textTerms: string[]; tags: string[] } {
  const normalized = raw
    .replace(/\bUND\b/gi, "AND").replace(/\bODER\b/gi, "OR")
    .replace(/\bNICHT\b/gi, "NOT").replace(/\bschlagwort:/gi, "tag:");
  const tokenRegex = /tag:[^\s]+|AND|OR|NOT|"[^"]+"|[\S]+/g;
  const parts = normalized.match(tokenRegex) ?? [];
  const tokens: Token[] = [];
  for (const part of parts) {
    if (part.startsWith("tag:")) tokens.push({ type: "tag", raw: part, value: part.slice(4) });
    else if (["AND","OR","NOT"].includes(part.toUpperCase())) tokens.push({ type: "boolean", raw: part, value: part.toUpperCase() });
    else tokens.push({ type: "text", raw: part, value: part.replace(/^"|"$/g, "") });
  }
  return {
    tokens,
    textTerms: tokens.filter((t) => t.type === "text").map((t) => t.value),
    tags: tokens.filter((t) => t.type === "tag").map((t) => t.value),
  };
}

function buildFilter(tags: string[], extraTags: string[]): string[][] | undefined {
  const allTags = [...new Set([...tags, ...extraTags])];
  if (!allTags.length) return undefined;
  return allTags.map((tag) => [`assigned_tags = '${tag}'`]);
}

type SortMode = "relevance" | "newest" | "oldest";

function sortGroups(groups: [string, SearchHit[]][], mode: SortMode, textTerms: string[]): [string, SearchHit[]][] {
  if (mode === "relevance") {
    return [...groups].sort((a, b) => {
      const aScore = a[1].reduce((s, p) => s + getMatchCount(p, textTerms), 0);
      const bScore = b[1].reduce((s, p) => s + getMatchCount(p, textTerms), 0);
      return bScore - aScore;
    });
  }
  return [...groups].sort((a, b) => {
    const aDate = new Date(a[1][0]?.created_at ?? 0).getTime();
    const bDate = new Date(b[1][0]?.created_at ?? 0).getTime();
    return mode === "newest" ? bDate - aDate : aDate - bDate;
  });
}

// ── useSearch hook ────────────────────────────────────────────
function useSearchData(rawQuery: string, activeTagFilters: string[], dateFrom: string, dateTo: string) {
  const { settings, getAuthHeaders } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastParsed, setLastParsed] = useState({ textTerms: [] as string[], tags: [] as string[] });

  useMemo(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { textTerms, tags } = parseQuery(rawQuery);
      if (!rawQuery.trim() && activeTagFilters.length === 0) { setData(null); setLoading(false); return; }
      setLoading(true); setError(null); setLastParsed({ textTerms, tags });
      const filter = buildFilter(tags, activeTagFilters);
      try {
        const params = new URLSearchParams();
        params.set("query", textTerms.join(" ") || " ");
        if (filter) params.set("filter", JSON.stringify(filter));
        params.set("limit", "200");
        const res = await fetch(`${settings.serverUrl}/search?${params.toString()}`, { headers: getAuthHeaders() });
        const json = await res.json();
        setData(json); setLoading(false);
      } catch (e: any) { setError(e.message); setLoading(false); }
    }, 250);
  }, [rawQuery, activeTagFilters, settings.serverUrl]);

  return { data, loading, error, lastParsed };
}

// ── GroupedResult ─────────────────────────────────────────────
function GroupedResult({ filepath, pages, textTerms, showAllPages }: {
  filepath: string; pages: SearchHit[]; textTerms: string[]; showAllPages: boolean;
}) {
  const { settings } = useApp();

  const matchingIdxs = useMemo(() =>
    pages.map((p, i) => ({ i, count: getMatchCount(p, textTerms) }))
      .filter((x) => x.count > 0).map((x) => x.i),
    [pages, textTerms]);

  const bestPageIdx = useMemo(() => {
    if (!textTerms.length) return 0;
    let best = 0, bestScore = -1;
    pages.forEach((p, i) => { const s = getMatchCount(p, textTerms); if (s > bestScore) { bestScore = s; best = i; } });
    return best;
  }, [pages, textTerms]);

  const visibleIdxs = showAllPages ? pages.map((_, i) => i)
    : matchingIdxs.length > 0 ? matchingIdxs : pages.map((_, i) => i);

  const [visPos, setVisPos] = useState(() => {
    const pos = visibleIdxs.indexOf(bestPageIdx);
    return pos >= 0 ? pos : 0;
  });
  const pageIdx = visibleIdxs[Math.min(visPos, visibleIdxs.length - 1)] ?? 0;

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayStart, setOverlayStart] = useState(0);
  const [imgError, setImgError] = useState(false);

  const currentHit = pages[pageIdx];
  const filename = getFilename(filepath);
  const ext = getExt(filepath);
  const totalMatches = pages.reduce((acc, p) => acc + getMatchCount(p, textTerms), 0);
  const currentMatches = getMatchCount(currentHit, textTerms);
  const canPrev = visPos > 0;
  const canNext = visPos < visibleIdxs.length - 1;

  // Rewrite banner URL
  const getBannerUrl = (raw: string) => {
    if (!raw) return "";
    try {
      const url = new URL(raw);
      return url.pathname.startsWith("/s3/") ? `${settings.serverUrl}${url.pathname}` : raw;
    } catch { return raw; }
  };
  const thumbSrc = getBannerUrl(currentHit?.banner_img ?? "");

  const openAt = useCallback((pg: number) => { setOverlayStart(pg); setOverlayOpen(true); }, []);

  return (
    <>
      <div
        className={styles.groupCard}
        onClick={() => openAt(pageIdx)}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openAt(pageIdx)}
      >
        {/* Thumbnail */}
        <div className={styles.groupThumb}>
          {thumbSrc && !imgError ? (
            <img src={thumbSrc} alt={filename} onError={() => setImgError(true)} className={styles.groupThumbImg} />
          ) : (
            <div className={styles.groupThumbFallback}><span className={styles.groupThumbExt}>{ext}</span></div>
          )}
          <div className={styles.groupThumbOverlay}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
          {/* Page position indicator on thumb */}
          {pages.length > 1 && (
            <div className={styles.groupThumbPage}>{pageIdx + 1}/{pages.length}</div>
          )}
        </div>

        <div className={styles.groupContent}>
          {/* Header row */}
          <div className={styles.groupHeader}>
            <div className={styles.groupTitleRow}>
              <span className={styles.groupExtBadge}>{ext}</span>
              <p className={styles.groupFilename}>{filename}</p>
            </div>
            <div className={styles.groupBadges}>
              {totalMatches > 0 && (
                <span className={styles.matchBadge}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {totalMatches}
                </span>
              )}
              {pages.length > 1 && (
                <span className={styles.pageBadge}>{pages.length} S.</span>
              )}
            </div>
          </div>

          {/* Page navigator (only if multi-page match) */}
          {visibleIdxs.length > 1 && (
            <div className={styles.pageNav} onClick={(e) => e.stopPropagation()}>
              <button className={styles.pageNavBtn} disabled={!canPrev} onClick={() => canPrev && setVisPos((p) => p - 1)}>‹</button>
              <span className={styles.pageNavInfo}>
                Seite {pageIdx + 1} von {pages.length}
                {currentMatches > 0 && <span className={styles.pageNavMatches}> · {currentMatches} hier</span>}
              </span>
              <button className={styles.pageNavBtn} disabled={!canNext} onClick={() => canNext && setVisPos((p) => p + 1)}>›</button>
            </div>
          )}

          {/* Snippet */}
          <p className={styles.groupSnippet}>
            {buildSnippet(currentHit, textTerms)}
          </p>

          {/* Footer */}
          <div className={styles.groupFooter}>
            <span className={styles.groupDate}>
              {new Date(currentHit?.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            {currentHit?.assigned_tags?.length > 0 && (
              <div className={styles.groupTags}>
                {currentHit.assigned_tags.map((tag) => (
                  <span key={tag} className={styles.groupTag}>{tag}</span>
                ))}
              </div>
            )}
            <span className={styles.viewHint}>OCR öffnen →</span>
          </div>
        </div>
      </div>

      {overlayOpen && (
        <OcrOverlay
          hit={pages[overlayStart]}
          initialPageIdx={pages[overlayStart]?.pageIdx ?? 0}
          matchingPageIdxs={matchingIdxs.map((i) => pages[i]?.pageIdx).filter((idx): idx is number => idx !== undefined)}
          query={textTerms.join(" ")}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}

// ── Filter sidebar ────────────────────────────────────────────
function FilterSidebar({ sort, setSort, activeTagFilters, setActiveTagFilters, availableTags, dateFrom, setDateFrom, dateTo, setDateTo, onClear, hasFilters }: {
  sort: SortMode; setSort: (s: SortMode) => void;
  activeTagFilters: string[]; setActiveTagFilters: (t: string[]) => void;
  availableTags: string[];
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  onClear: () => void; hasFilters: boolean;
}) {
  const { t } = useApp();
  const toggleTag = (tag: string) => {
    setActiveTagFilters(activeTagFilters.includes(tag)
      ? activeTagFilters.filter((t) => t !== tag)
      : [...activeTagFilters, tag]);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}><FilterIcon /> {t.search.filterSort}</span>
        {hasFilters && <button className={styles.clearFiltersBtn} onClick={onClear}>{t.search.reset}</button>}
      </div>

      <div className={styles.filterSection}>
        <p className={styles.filterSectionLabel}><SortIcon /> {t.search.sort}</p>
        <div className={styles.sortBtns}>
          {(["relevance","newest","oldest"] as SortMode[]).map((mode) => (
            <button key={mode}
              className={`${styles.sortBtn} ${sort === mode ? styles.sortBtnActive : ""}`}
              onClick={() => setSort(mode)}>
              {mode === "relevance" ? t.search.relevance : mode === "newest" ? t.search.newest : t.search.oldest}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <p className={styles.filterSectionLabel}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {t.search.date}
        </p>
        <input className={styles.dateInput} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <span className={styles.dateSep}>{t.search.to}</span>
        <input className={styles.dateInput} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {availableTags.length > 0 && (
        <div className={styles.filterSection}>
          <p className={styles.filterSectionLabel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            {t.search.tags}
          </p>
          <div className={styles.tagFilterList}>
            {availableTags.map((tag) => (
              <button key={tag}
                className={`${styles.tagFilterBtn} ${activeTagFilters.includes(tag) ? styles.tagFilterBtnActive : ""}`}
                onClick={() => toggleTag(tag)}>
                {tag}{activeTagFilters.includes(tag) && <CloseIcon />}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function Search() {
  const { t } = useApp();
  const [query, setQuery] = useState("");
  const [showAllPages, setShowAllPages] = useState(false);
  const [sort, setSort] = useState<SortMode>("relevance");
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data, loading, error, lastParsed } = useSearchData(query, activeTagFilters, dateFrom, dateTo);
  const { tokens } = useMemo(() => parseQuery(query), [query]);

  const availableTags = useMemo(() => {
    if (!data?.hits) return [];
    const tags = new Set<string>();
    for (const hit of data.hits as SearchHit[]) (hit.assigned_tags ?? []).forEach((t: string) => tags.add(t));
    return Array.from(tags).sort();
  }, [data]);

  const rawGrouped = useMemo(() => {
    if (!data?.hits) return [];
    let hits = data.hits as SearchHit[];
    if (dateFrom) { const from = new Date(dateFrom).getTime(); hits = hits.filter((h) => new Date(h.created_at).getTime() >= from); }
    if (dateTo) { const to = new Date(dateTo).getTime() + 86400000; hits = hits.filter((h) => new Date(h.created_at).getTime() <= to); }
    return Array.from(groupByFile(hits).entries());
  }, [data, dateFrom, dateTo]);

  const grouped = useMemo(() => sortGroups(rawGrouped, sort, lastParsed.textTerms), [rawGrouped, sort, lastParsed.textTerms]);

  const hasTagTokens = tokens.some((t) => t.type === "tag");
  const hasFilters = activeTagFilters.length > 0 || !!dateFrom || !!dateTo || sort !== "relevance";
  const clearFilters = () => { setActiveTagFilters([]); setDateFrom(""); setDateTo(""); setSort("relevance"); };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            ref={inputRef} type="text" className={styles.input}
            placeholder={t.search.placeholder}
            value={query} onChange={(e) => setQuery(e.target.value)}
            autoFocus spellCheck={false}
          />
          {loading && <span className={styles.spinnerWrap}><Spinner /></span>}
          {query && !loading && <button className={styles.clearBtn} onClick={() => setQuery("")}><CloseIcon /></button>}
        </div>
        <button
          className={`${styles.filterToggle} ${sidebarOpen ? styles.filterToggleActive : ""} ${hasFilters ? styles.filterToggleDot : ""}`}
          onClick={() => setSidebarOpen((v) => !v)} title="Filter & Sort"
        >
          <FilterIcon />
          {hasFilters && <span className={styles.filterDot} />}
        </button>
      </div>

      {/* Token chips */}
      {query && tokens.length > 0 && (hasTagTokens || tokens.some((t) => t.type === "boolean")) && (
        <div className={styles.tokenRow}>
          {tokens.map((tok, i) => (
            <span key={i} className={`${styles.token} ${styles[`token_${tok.type}`]}`}>
              {tok.type === "tag" ? (<><span className={styles.tokenPrefix}>tag:</span>{tok.value}</>) : tok.value}
            </span>
          ))}
        </div>
      )}

      {/* Active tag filters */}
      {activeTagFilters.length > 0 && (
        <div className={styles.activeFiltersRow}>
          <span className={styles.activeFiltersLabel}>Filter:</span>
          {activeTagFilters.map((tag) => (
            <button key={tag} className={styles.activeFilterChip}
              onClick={() => setActiveTagFilters(activeTagFilters.filter((t) => t !== tag))}>
              {tag} <CloseIcon />
            </button>
          ))}
        </div>
      )}

      <div className={styles.body}>
        {sidebarOpen && (
          <FilterSidebar
            sort={sort} setSort={setSort}
            activeTagFilters={activeTagFilters} setActiveTagFilters={setActiveTagFilters}
            availableTags={availableTags}
            dateFrom={dateFrom} setDateFrom={setDateFrom}
            dateTo={dateTo} setDateTo={setDateTo}
            onClear={clearFilters} hasFilters={hasFilters}
          />
        )}

        <div className={styles.results}>
          {/* Meta bar */}
          {(data || loading) && (
            <div className={styles.meta}>
              {loading ? (
                <span className={styles.hitCount}>{t.search.searchRunning}</span>
              ) : (
                <>
                  <span className={styles.hitCount}>
                    <strong>{grouped.length}</strong> {t.search.documents}
                    {data?.estimatedTotalHits > 0 && <> · <strong>{data.estimatedTotalHits}</strong> {t.search.pages}</>}
                  </span>
                  {data?.processingTimeMs !== undefined && (
                    <span className={styles.timing}>{data.processingTimeMs}ms</span>
                  )}
                  {data?.hits?.length > 0 && (
                    <label className={styles.toggle} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={showAllPages}
                        onChange={(e) => setShowAllPages(e.target.checked)} className={styles.toggleInput} />
                      <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                      <span className={styles.toggleLabel}>Alle Seiten</span>
                    </label>
                  )}
                </>
              )}
            </div>
          )}

          {error && <div className={styles.error}>{t.common.error}: {error}</div>}

          {grouped.length > 0 && (
            <div className={styles.resultList}>
              {grouped.map(([filepath, pages]) => (
                <GroupedResult
                  key={filepath}
                  filepath={filepath} pages={pages}
                  textTerms={lastParsed.textTerms}
                  showAllPages={showAllPages}
                />
              ))}
            </div>
          )}

          {data && grouped.length === 0 && !loading && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><SearchIcon /></div>
              <p>{t.search.noResultsFor} <strong>„{query}"</strong></p>
              {hasTagTokens && (
                <p className={styles.emptyHint}>
                  {t.search.tags}: {tokens.filter((t) => t.type === "tag").map((t) => t.value).join(" AND ")}
                </p>
              )}
              {hasFilters && <button className={styles.clearFiltersBtn} onClick={clearFilters}>{t.search.resetFilters}</button>}
            </div>
          )}

          {!query && activeTagFilters.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><SearchIcon /></div>
              <p>{t.search.ocrSearch}</p>
              <div className={styles.hints}>
                <div className={styles.hintItem}><code>Rechnung 2024</code><span>Alle Wörter müssen vorkommen</span></div>
                <div className={styles.hintItem}><code>tag:Rechnung</code><span>Filter nach Tag</span></div>
                <div className={styles.hintItem}><code>"exakter Satz"</code><span>Phrasensuche</span></div>
                <div className={styles.hintItem}><code>-unwanted</code><span>Wort ausschließen</span></div>
              </div>
              <p className={styles.kbdHint}>{t.search.pressSlash} <kbd>/</kbd> {t.search.pressSlashFocus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
