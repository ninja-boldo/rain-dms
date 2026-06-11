import React, { useState, useCallback, useEffect } from "react";
import { useApp } from "../lib/AppContext";
import { useDocuments } from "../hooks/useApi";
import DocumentCard from "../components/documents/DocumentCard";
import styles from "./Home.module.css";
import type {
  HomeView,
  HomeSort,
  HomePageSize,
  CardDensity,
} from "../lib/AppContext";

const DENSITY_HEIGHTS: Record<CardDensity, number> = {
  small: 100,
  medium: 140,
  large: 200,
};

const SortIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const GridIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const ListIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

export default function Home() {
  const { t, language, settings, setSettings } = useApp();
  const [page, setPage] = useState(0);

  const view = settings.homeView;

  // ── Vault-wide stats (total docs, pages, OCR coverage) ──
  const [vaultStats, setVaultStats] = useState<{
    total: number | null;
    pages: number | null;
    ocrPct: number | null;
  }>({ total: null, pages: null, ocrPct: null });

  useEffect(() => {
    fetch(`${settings.serverUrl}/stats`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) setVaultStats({
          total: d.total_documents ?? null,
          pages: d.total_pages ?? null,
          ocrPct: d.ocr_coverage_pct ?? null,
        });
      })
      .catch(() => null);
  }, [settings.serverUrl]);


  const sort = settings.homeSort;
  const pageSize = settings.homePageSize;
  const density = settings.cardDensity;

  const {
    data: rawDocs,
    setData,
    loading,
    error,
    hasMore,
    totalCount,
  } = useDocuments(page, pageSize);

  const docs = [...rawDocs].sort((a, b) => {
    if (sort === "newest")
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    if (sort === "oldest")
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    if (sort === "pages_desc") return (b.page_count ?? 1) - (a.page_count ?? 1);
    if (sort === "pages_asc") return (a.page_count ?? 1) - (b.page_count ?? 1);
    return 0;
  });

  const setView = (v: HomeView) => setSettings({ ...settings, homeView: v });
  const setSort = (s: HomeSort) => {
    setSettings({ ...settings, homeSort: s });
    setPage(0);
  };
  const setPageSize = (n: HomePageSize) => {
    setSettings({ ...settings, homePageSize: n });
    setPage(0);
  };
  const setDensity = (d: CardDensity) =>
    setSettings({ ...settings, cardDensity: d });

  const handleDeleted = useCallback(
    (filepath: string) => {
      setData((prev) => prev.filter((d) => d.filepath !== filepath));
    },
    [setData],
  );

  const thumbH = DENSITY_HEIGHTS[density];

  const sortLabels: Record<HomeSort, string> = {
    newest: t.search.newest,
    oldest: t.search.oldest,
    pages_desc: "Seiten ↓",
    pages_asc: "Seiten ↑",
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{t.home.title}</h1>
          {totalCount !== null && (
            <span className={styles.totalBadge}>{totalCount}</span>
          )}
        </div>
        {/* ── Vault stats strip ── */}
        {(vaultStats.total !== null || vaultStats.pages !== null) && (
          <div className={styles.vaultStats}>
            {vaultStats.total !== null && (
              <span className={styles.vaultStat}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <strong>{vaultStats.total.toLocaleString()}</strong> documents
              </span>
            )}
            {vaultStats.pages !== null && (
              <span className={styles.vaultStat}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                <strong>{vaultStats.pages.toLocaleString()}</strong> pages
              </span>
            )}
            {vaultStats.ocrPct !== null && (
              <span className={styles.vaultStat}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <strong>{vaultStats.ocrPct}%</strong> OCR
              </span>
            )}
          </div>
        )}
        <div className={styles.controls}>
          {/* Sort */}
          <div className={styles.controlGroup}>
            <SortIcon />
            {(
              ["newest", "oldest", "pages_desc", "pages_asc"] as HomeSort[]
            ).map((s) => (
              <button
                key={s}
                className={`${styles.chip} ${sort === s ? styles.chipActive : ""}`}
                onClick={() => setSort(s)}
              >
                {sortLabels[s]}
              </button>
            ))}
          </div>

          {/* Page size */}
          <div className={styles.controlGroup}>
            {([25, 50, 100] as HomePageSize[]).map((n) => (
              <button
                key={n}
                className={`${styles.chip} ${pageSize === n ? styles.chipActive : ""}`}
                onClick={() => setPageSize(n)}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Density (grid only) */}
          {view === "grid" && (
            <div className={styles.controlGroup}>
              {(["small", "medium", "large"] as CardDensity[]).map((d) => (
                <button
                  key={d}
                  className={`${styles.chip} ${density === d ? styles.chipActive : ""}`}
                  onClick={() => setDensity(d)}
                >
                  {d === "small" ? "S" : d === "medium" ? "M" : "L"}
                </button>
              ))}
            </div>
          )}

          {/* View toggle */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("grid")}
              title="Grid"
            >
              <GridIcon />
            </button>
            <button
              className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("list")}
              title="Liste"
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div
          className={styles.loadingGrid}
          style={{ gridTemplateColumns: view === "grid" ? undefined : "1fr" }}
        >
          {Array.from({ length: pageSize > 25 ? 12 : 8 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={view === "grid" ? { height: thumbH + 60 } : { height: 60 }}
            />
          ))}
        </div>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      {!loading && !error && docs.length === 0 && (
        <div className={styles.empty}>
          <p>{t.home.noDocuments}</p>
        </div>
      )}

      {!loading &&
        docs.length > 0 &&
        (view === "grid" ? (
          <div className={styles.grid}>
            {docs.map((doc) => (
              <DocumentCard
                key={doc.filepath}
                doc={doc}
                lang={language}
                thumbHeight={thumbH}
                onDeleted={handleDeleted}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {docs.map((doc) => (
              <DocumentCard
                key={doc.filepath}
                doc={doc}
                lang={language}
                onDeleted={handleDeleted}
                viewMode="list"
              />
            ))}
          </div>
        ))}

      {/* Pagination */}
      {!loading &&
        (totalCount !== null ? docs.length > 0 : docs.length > 0) && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← {t.home.page === "Seite" ? "Zurück" : "Back"}
            </button>
            <span className={styles.pageInfo}>
              {t.home.page} {page + 1}
              {totalCount !== null &&
                ` ${t.home.of} ${Math.ceil(totalCount / pageSize)}`}
            </span>
            <button
              className={styles.pageBtn}
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              {t.home.loadMore} →
            </button>
          </div>
        )}
    </div>
  );
}
