import React, { useState, useMemo } from "react";
import { useApp } from "../lib/AppContext";
import { useSearch, useDocPages } from "../hooks/useApi";
import { SearchHit } from "../types";
import OcrOverlay from "../components/documents/OcrOverlay";
import { sanitizeName, parseTags } from "../lib/utils";
import styles from "./Search.module.css";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const Spinner = () => (
  <div style={{ width: 18, height: 18, border: "2px solid var(--border-accent)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
);

function getMatchCount(hit: SearchHit, query: string): number {
  if (!query || !hit.ocr?.lines) return 0;
  // Match against individual words from the query (ignoring AND/OR/NOT operators)
  const words = query
    .replace(/\b(AND|OR|NOT)\b/gi, " ")
    .split(/\s+/)
    .map((w) => w.toLowerCase().trim())
    .filter(Boolean);
  if (words.length === 0) return 0;
  return hit.ocr.lines
    .flatMap((l) => l.boxes)
    .filter((b) => words.some((w) => b.text.toLowerCase().includes(w))).length;
}

function groupByFile(hits: SearchHit[]): Map<string, SearchHit[]> {
  const map = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const key = hit.filepath ?? `__unknown_${hit.id}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(hit);
  }
  for (const [, pages] of map) {
    pages.sort((a, b) => (a.pageIdx ?? 0) - (b.pageIdx ?? 0));
  }
  return map;
}

interface GroupedResultProps {
  filepath: string;
  pages: SearchHit[];
  query: string;
}

function GroupedResult({ filepath, pages, query }: GroupedResultProps) {
  const { settings } = useApp();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { pages: allPages, loading: pagesLoading } = useDocPages(
    overlayOpen ? filepath : null,
    settings.serverUrl
  );

  const matchingPages = pages.filter((p) => getMatchCount(p, query) > 0);
  const previewHit = matchingPages[0] ?? pages[0];
  const totalMatches = pages.reduce((acc, p) => acc + getMatchCount(p, query), 0);
  const cleanName = sanitizeName(filepath);
  const tags = parseTags(previewHit?.assigned_tags);
  const pagesWithMatches = pages.filter((p) => getMatchCount(p, query) > 0);

  return (
    <>
      <div
        className={styles.groupCard}
        onClick={() => setOverlayOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOverlayOpen(true)}
      >
        <div className={styles.groupThumb}>
          {previewHit?.banner_img && !imgError ? (
            <img
              src={previewHit.banner_img}
              alt={cleanName}
              onError={() => setImgError(true)}
              className={styles.groupThumbImg}
            />
          ) : (
            <div className={styles.groupThumbFallback}><span>PDF</span></div>
          )}
          <div className={styles.groupThumbOverlay}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </div>
        </div>

        <div className={styles.groupContent}>
          <div className={styles.groupHeader}>
            <p className={styles.groupFilename}>{cleanName}</p>
            <div className={styles.groupBadges}>
              {totalMatches > 0 && (
                <span className={styles.matchBadge}>{totalMatches} Treffer</span>
              )}
              {pages.length > 1 && (
                <span className={styles.pageBadge}>{pages.length} Seiten indiziert</span>
              )}
            </div>
          </div>

          {pagesWithMatches.length > 0 && (
            <div className={styles.pageMatchRow}>
              {pagesWithMatches.map((p) => (
                <span key={p.pageIdx ?? p.id} className={styles.pageMatchChip}>
                  S.{(p.pageIdx ?? 0) + 1}: {getMatchCount(p, query)}✓
                </span>
              ))}
            </div>
          )}

          {previewHit?.ocr?.lines && previewHit.ocr.lines.length > 0 && (
            <p className={styles.groupSnippet}>
              {previewHit.ocr.lines
                .flatMap((l) => l.boxes.map((b) => b.text))
                .join(" ")
                .slice(0, 200)}…
            </p>
          )}

          {tags.length > 0 && (
            <div className={styles.groupTags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.groupTag}>{tag}</span>
              ))}
            </div>
          )}

          <div className={styles.groupFooter}>
            <span className={styles.groupDate}>
              {new Date(previewHit?.created_at ?? "").toLocaleDateString("de-DE", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </span>
            <span className={styles.viewHint}>Öffnen →</span>
          </div>
        </div>
      </div>

      {overlayOpen && (
        <OcrOverlay
          hit={{ ...previewHit, filepath }}
          query={query}
          onClose={() => setOverlayOpen(false)}
          allPages={
            allPages.length > 0
              ? allPages
              : pages.map((p) => ({
                  pageIdx: p.pageIdx ?? 0,
                  banner_img: p.banner_img,
                  ocr: p.ocr,
                }))
          }
          pagesLoading={pagesLoading && allPages.length === 0}
        />
      )}
    </>
  );
}

export default function Search() {
  const { t, settings } = useApp();
  const [query, setQuery] = useState("");
  const { data, loading, error, effectiveQuery } = useSearch(query, settings.searchLimit);

  const grouped = useMemo(() => {
    if (!data?.hits) return [];
    const map = groupByFile(data.hits);
    return Array.from(map.entries());
  }, [data]);

  const showQueryDiff = settings.showRawQuery && effectiveQuery !== query;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.search.title}</h1>
      </header>

      <div className={styles.searchBar}>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          type="text"
          className={styles.input}
          placeholder={`${t.search.placeholder} · tag:Rechnung · mathe AND vektoren`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          spellCheck={false}
        />
        {loading && <span className={styles.spinnerWrap}><Spinner /></span>}
        {query && !loading && (
          <button className={styles.clearBtn} onClick={() => setQuery("")}>✕</button>
        )}
      </div>

      {/* Raw query preview if enabled in settings */}
      {settings.showRawQuery && query && (
        <div className={styles.queryPreview}>
          <span className={styles.queryPreviewLabel}>Meilisearch-Query:</span>
          <code className={styles.queryPreviewCode}>{effectiveQuery}</code>
          {showQueryDiff && (
            <span className={styles.queryPreviewDiff}>
              (normalisiert von „{query}")
            </span>
          )}
        </div>
      )}

      {error && <div className={styles.error}>{t.common.error}: {error}</div>}

      {data && (
        <div className={styles.meta}>
          <span className={styles.hitCount}>
            {grouped.length} Dokumente · {data.estimatedTotalHits} {t.search.hits}
            {data.estimatedTotalHits >= settings.searchLimit && (
              <span className={styles.limitWarning}>
                {" "}(Limit: {settings.searchLimit} — erhöhe in Einstellungen)
              </span>
            )}
          </span>
          <span className={styles.timing}>{data.processingTimeMs}{t.search.ms}</span>
        </div>
      )}

      {data && grouped.length === 0 && query && !loading && (
        <div className={styles.empty}>
          <p>{t.search.noResults} <strong>„{query}"</strong></p>
          <p className={styles.emptyHint2}>
            Tipp: AND/OR/NOT funktioniert dokumentweit, nicht pro Feld. Für Phrasen einfach Wörter nebeneinander schreiben.
          </p>
        </div>
      )}

      {grouped.length > 0 && (
        <div className={styles.results}>
          {grouped.map(([filepath, pages]) => (
            <GroupedResult
              key={`${filepath}-${data?.query}`}
              filepath={filepath}
              pages={pages}
              query={query}
            />
          ))}
        </div>
      )}

      {!query && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><SearchIcon /></div>
          <p>{t.search.placeholder}</p>
          <p className={styles.emptyHint}>
            <code>mathe AND vektoren</code> · <code>tag:Rechnung</code> · <code>NOT Entwurf</code>
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
