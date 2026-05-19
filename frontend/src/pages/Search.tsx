import React, { useState, useMemo, useRef, useCallback } from "react";
import { useApp } from "../lib/AppContext";
import { SearchHit } from "../types";
import OcrOverlay from "../components/documents/OcrOverlay";
import styles from "./Search.module.css";

const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const Spinner = () => (
  <div
    style={{
      width: 18,
      height: 18,
      border: "2px solid var(--border-accent)",
      borderTopColor: "var(--accent)",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }}
  />
);

function getFilename(filepath?: string): string {
  if (!filepath) return "Unknown Document";
  const parts = filepath.split(/[\\\/]/);
  const name = parts[parts.length - 1];
  return name
    .replace(/-\[object Object\]-[\d-T:.Z]+\.(pdf|png|jpe?g)$/i, ".$1")
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i,
      ".$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[.\dZ]*\.(pdf|png|jpe?g)$/i,
      ".$1",
    )
    .replace(/\.(pdf|png|jpe?g)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function getMatchCount(hit: SearchHit, query: string): number {
  if (!query) return 0;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return (
    hit.ocr?.lines
      ?.flatMap((l) => l.boxes)
      .filter((b) => terms.some((t) => b.text.toLowerCase().includes(t)))
      .length ?? 0
  );
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

interface Token {
  type: "text" | "tag" | "boolean";
  raw: string;
  value: string;
}

function parseQuery(raw: string): {
  tokens: Token[];
  textTerms: string[];
  tags: string[];
} {
  const normalized = raw
    .replace(/\bUND\b/gi, "AND")
    .replace(/\bODER\b/gi, "OR")
    .replace(/\bNICHT\b/gi, "NOT")
    .replace(/\bschlagwort:/gi, "tag:");

  const tokenRegex = /tag:[^\s]+|AND|OR|NOT|[^\s]+/g;
  const parts = normalized.match(tokenRegex) ?? [];
  const tokens: Token[] = [];

  for (const part of parts) {
    if (part.startsWith("tag:")) {
      tokens.push({ type: "tag", raw: part, value: part.slice(4) });
    } else if (["AND", "OR", "NOT"].includes(part.toUpperCase())) {
      tokens.push({ type: "boolean", raw: part, value: part.toUpperCase() });
    } else {
      tokens.push({ type: "text", raw: part, value: part });
    }
  }

  // Text terms = non-boolean, non-tag tokens
  const textTerms = tokens.filter((t) => t.type === "text").map((t) => t.value);
  const tags = tokens.filter((t) => t.type === "tag").map((t) => t.value);

  return { tokens, textTerms, tags };
}

// Multi-tag AND: each tag is its own sub-array → Meilisearch AND semantics
function buildFilter(tags: string[]): string[][] | undefined {
  if (tags.length === 0) return undefined;
  return tags.map((tag) => [`assigned_tags = '${tag}'`]);
}

function useSearch(rawQuery: string) {
  const { settings } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastParsed, setLastParsed] = useState({
    textTerms: [] as string[],
    tags: [] as string[],
  });

  useMemo(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!rawQuery.trim()) {
        setData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      const { textTerms, tags } = parseQuery(rawQuery);
      setLastParsed({ textTerms, tags });

      // Meilisearch text query: join text terms with space (it handles multi-word AND natively)
      // For explicit AND between specific terms: send them space-separated, Meilisearch
      // matchingStrategy:"all" means ALL text terms must appear → that's AND.
      const textQuery = textTerms.join(" ");
      const filter = buildFilter(tags);

      try {
        const params = new URLSearchParams();
        params.set("query", textQuery || " ");
        if (filter) params.set("filter", JSON.stringify(filter));

        const res = await fetch(
          `${settings.serverUrl}/search?${params.toString()}`,
        );
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (e: any) {
        setError(e.message);
        setLoading(false);
      }
    }, 300);
  }, [rawQuery, settings.serverUrl]);

  return { data, loading, error, lastParsed };
}

// ─── GroupedResult ─────────────────────────────────────────────
interface GroupedResultProps {
  filepath: string;
  pages: SearchHit[];
  textTerms: string[];
  showAllPages: boolean;
}

function GroupedResult({
  filepath,
  pages,
  textTerms,
  showAllPages,
}: GroupedResultProps) {
  const queryForMatch = textTerms.join(" ");

  // Pages that have at least one match
  const matchingIdxs = useMemo(
    () =>
      pages
        .map((p, i) => ({ i, count: getMatchCount(p, queryForMatch) }))
        .filter((x) => x.count > 0)
        .map((x) => x.i),
    [pages, queryForMatch],
  );

  const visibleIdxs = showAllPages
    ? pages.map((_, i) => i)
    : matchingIdxs.length > 0
      ? matchingIdxs
      : pages.map((_, i) => i);
  const [visPos, setVisPos] = useState(0);
  const pageIdx = visibleIdxs[Math.min(visPos, visibleIdxs.length - 1)] ?? 0;

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayStart, setOverlayStart] = useState(0);
  const [imgError, setImgError] = useState(false);

  const currentHit = pages[pageIdx];
  const filename = getFilename(filepath);
  const totalMatches = pages.reduce(
    (acc, p) => acc + getMatchCount(p, queryForMatch),
    0,
  );
  const currentMatches = getMatchCount(currentHit, queryForMatch);

  const canPrev = visPos > 0;
  const canNext = visPos < visibleIdxs.length - 1;

  const openAt = useCallback((pgIdx: number) => {
    setOverlayStart(pgIdx);
    setOverlayOpen(true);
  }, []);

  return (
    <>
      <div
        className={styles.groupCard}
        onClick={() => openAt(pageIdx)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && openAt(pageIdx)}
      >
        <div className={styles.groupThumb}>
          {currentHit.banner_img && !imgError ? (
            <img
              src={currentHit.banner_img}
              alt={filename}
              onError={() => setImgError(true)}
              className={styles.groupThumbImg}
            />
          ) : (
            <div className={styles.groupThumbFallback}>
              <span>PDF</span>
            </div>
          )}
          <div className={styles.groupThumbOverlay}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </div>
        </div>

        <div className={styles.groupContent}>
          <div className={styles.groupHeader}>
            <p className={styles.groupFilename}>{filename}</p>
            <div className={styles.groupBadges}>
              {totalMatches > 0 && (
                <span className={styles.matchBadge}>
                  {totalMatches} Treffer
                </span>
              )}
              {pages.length > 1 && (
                <span className={styles.pageBadge}>{pages.length} Seiten</span>
              )}
            </div>
          </div>

          {visibleIdxs.length > 1 && (
            <div
              className={styles.pageNav}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.pageNavBtn}
                disabled={!canPrev}
                onClick={() => canPrev && setVisPos((p) => p - 1)}
              >
                ‹
              </button>
              <span className={styles.pageNavLabel}>
                Seite {pageIdx + 1}/{pages.length}
                {currentMatches > 0 && (
                  <span className={styles.pageMatchBadge}>
                    {" "}
                    · {currentMatches}✓
                  </span>
                )}
                <span
                  style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}
                >
                  {" "}
                  ({visPos + 1}/{visibleIdxs.length})
                </span>
              </span>
              <button
                className={styles.pageNavBtn}
                disabled={!canNext}
                onClick={() => canNext && setVisPos((p) => p + 1)}
              >
                ›
              </button>
              <button
                className={styles.pageNavBtn}
                style={{ width: "auto", padding: "0 8px", fontSize: "0.65rem" }}
                onClick={() => openAt(pageIdx)}
                title="Jetzt öffnen"
              >
                ↗
              </button>
            </div>
          )}

          <p className={styles.groupSnippet}>
            {currentHit.ocr?.lines
              ?.flatMap((l) => l.boxes.map((b) => b.text))
              .join(" ")
              .slice(0, 160)}
            …
          </p>

          <div className={styles.groupFooter}>
            <span className={styles.groupDate}>
              {new Date(currentHit.created_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            {currentHit.assigned_tags?.length > 0 && (
              <div className={styles.groupTags}>
                {currentHit.assigned_tags.map((tag) => (
                  <span key={tag} className={styles.groupTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <span className={styles.viewHint}>OCR ansehen →</span>
          </div>
        </div>
      </div>

      {overlayOpen && (
        <OcrOverlay
          hit={pages[overlayStart]}
          allPages={pages}
          initialPageIdx={overlayStart}
          matchingPageIdxs={matchingIdxs}
          query={queryForMatch}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}

// ─── Main Search page ──────────────────────────────────────────
export default function Search() {
  const { t } = useApp();
  const [query, setQuery] = useState("");
  const [showAllPages, setShowAllPages] = useState(false);
  const { data, loading, error, lastParsed } = useSearch(query);
  const { tokens } = useMemo(() => parseQuery(query), [query]);

  const grouped = useMemo(() => {
    if (!data?.hits) return [];
    return Array.from(groupByFile(data.hits).entries());
  }, [data]);

  const hasTagTokens = tokens.some((t) => t.type === "tag");
  const hasBooleans = tokens.some((t) => t.type === "boolean");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.search.title}</h1>
      </header>

      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          className={styles.input}
          placeholder={`${t.search.placeholder} · tag:Rechnung · tag:A tag:B (AND Tags)`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          spellCheck={false}
        />
        {loading && (
          <span className={styles.spinnerWrap}>
            <Spinner />
          </span>
        )}
        {query && !loading && (
          <button className={styles.clearBtn} onClick={() => setQuery("")}>
            ✕
          </button>
        )}
      </div>

      {query && tokens.length > 0 && (hasTagTokens || hasBooleans) && (
        <div className={styles.tokenRow}>
          {tokens.map((tok, i) => (
            <span
              key={i}
              className={`${styles.token} ${styles[`token_${tok.type}`]}`}
            >
              {tok.type === "tag" ? (
                <>
                  <span className={styles.tokenPrefix}>tag:</span>
                  {tok.value}
                </>
              ) : (
                tok.value
              )}
            </span>
          ))}
          {lastParsed.textTerms.length > 0 && (
            <span className={styles.queryPreview}>
              Text: <code>{lastParsed.textTerms.join(" AND ")}</code>
            </span>
          )}
          {lastParsed.tags.length > 1 && (
            <span
              className={styles.queryPreview}
              style={{ color: "var(--accent)" }}
            >
              Tag-AND aktiv ({lastParsed.tags.length} Tags)
            </span>
          )}
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {t.common.error}: {error}
        </div>
      )}

      {data && (
        <div className={styles.meta}>
          <span className={styles.hitCount}>
            {grouped.length} Dokumente · {data.estimatedTotalHits}{" "}
            {t.search.hits}
          </span>
          <span className={styles.timing}>
            {data.processingTimeMs}
            {t.search.ms}
          </span>
          {data.hits.length > 0 && (
            <label
              className={styles.toggle}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={showAllPages}
                onChange={(e) => setShowAllPages(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleTrack}>
                <span className={styles.toggleThumb} />
              </span>
              <span className={styles.toggleLabel}>Alle Seiten</span>
            </label>
          )}
        </div>
      )}

      {data && grouped.length === 0 && query && !loading && (
        <div className={styles.empty}>
          <p>
            {t.search.noResults} <strong>„{query}"</strong>
          </p>
          {hasTagTokens && (
            <p className={styles.emptyHint}>
              Tag-Filter:{" "}
              {tokens
                .filter((t) => t.type === "tag")
                .map((t) => t.value)
                .join(" AND ")}
            </p>
          )}
        </div>
      )}

      {grouped.length > 0 && (
        <div className={styles.results}>
          {grouped.map(([filepath, pages]) => (
            <GroupedResult
              key={filepath}
              filepath={filepath}
              pages={pages}
              textTerms={lastParsed.textTerms}
              showAllPages={showAllPages}
            />
          ))}
        </div>
      )}

      {!query && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <SearchIcon />
          </div>
          <p>{t.search.placeholder}</p>
          <p className={styles.emptyHint}>
            <code>tag:Rechnung tag:2024</code> = AND ·{" "}
            <code>heinrich leistung</code> = beide Wörter ·{" "}
            <code>schlagwort:Foo</code>
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
