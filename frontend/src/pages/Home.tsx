import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useApp } from "../lib/AppContext";
import { useDocuments } from "../hooks/useApi";
import DocumentCard from "../components/documents/DocumentCard";
import type { CardDensity, HomeSort, HomeView } from "../lib/AppContext";
import { Document } from "../types";
import styles from "./Home.module.css";

const ChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const DENSITY_MIN: Record<CardDensity, number> = { small: 110, medium: 170, large: 260 };
const DENSITY_THUMB: Record<CardDensity, number> = { small: 70, medium: 130, large: 220 };

const GridIcon = ({ active }: { active: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor" opacity={active ? 1 : 0.45}>
    <rect x="0" y="0" width="5" height="5" rx="1" />
    <rect x="7" y="0" width="5" height="5" rx="1" />
    <rect x="0" y="7" width="5" height="5" rx="1" />
    <rect x="7" y="7" width="5" height="5" rx="1" />
  </svg>
);
const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={active ? 1 : 0.45}>
    <line x1="4" y1="2" x2="11" y2="2" />
    <line x1="4" y1="6" x2="11" y2="6" />
    <line x1="4" y1="10" x2="11" y2="10" />
    <circle cx="1.5" cy="2" r="1" fill="currentColor" stroke="none" />
    <circle cx="1.5" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="1.5" cy="10" r="1" fill="currentColor" stroke="none" />
  </svg>
);

function sortDocuments(docs: Document[], sort: HomeSort): Document[] {
  const sorted = [...docs];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case "newest":
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case "pages_desc":
      return sorted.sort((a, b) => (b.page_count ?? 0) - (a.page_count ?? 0));
    case "pages_asc":
      return sorted.sort((a, b) => (a.page_count ?? 0) - (b.page_count ?? 0));
    default:
      return sorted;
  }
}

const SORT_LABELS: Record<HomeSort, string> = {
  newest: "Neueste",
  oldest: "Älteste",
  pages_desc: "Meiste S.",
  pages_asc: "Wenigste S.",
};

export default function Home() {
  const { language, settings, setSettings } = useApp();
  const [pageIdx, setPageIdx] = useState(0);

  const pageSize = settings.homePageSize ?? 50;
  const homeView = settings.homeView ?? "grid";
  const homeSort = settings.homeSort ?? "newest";
  const density: CardDensity = settings.cardDensity ?? "medium";

  const { data: rawData, setData, loading, error, hasMore, totalCount } =
    useDocuments(pageIdx, pageSize);

  const data = Array.isArray(rawData) ? rawData : [];

  // Client-side sort + slice to page size
  const displayData = useMemo(() => {
    const sorted = sortDocuments(data, homeSort);
    return sorted.slice(0, pageSize);
  }, [data, homeSort, pageSize]);

  const [locatedPath, setLocatedPath] = useState<string | null>(null);
  const locatedRef = useRef<HTMLDivElement | null>(null);
  const locateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleted = useCallback(
    (filepath: string) => {
      setData((prev) => Array.isArray(prev) ? prev.filter((d) => d.filepath !== filepath) : []);
    },
    [setData],
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const { filepath } = (e as CustomEvent).detail;
      setLocatedPath(filepath);
      if (locateTimer.current) clearTimeout(locateTimer.current);
      locateTimer.current = setTimeout(() => setLocatedPath(null), 3500);
    };
    window.addEventListener("dms:locate", handler);
    return () => window.removeEventListener("dms:locate", handler);
  }, []);

  useEffect(() => {
    if (locatedPath && locatedRef.current) {
      locatedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [locatedPath, displayData]);

  const pageStart = pageIdx * pageSize + 1;
  const pageEnd   = pageIdx * pageSize + displayData.length;
  const minW      = DENSITY_MIN[density];
  const thumbH    = DENSITY_THUMB[density];

  const setView = (v: HomeView) => setSettings({ ...settings, homeView: v });
  const setSort = (s: HomeSort) => setSettings({ ...settings, homeSort: s });
  const setDensity = (d: CardDensity) => setSettings({ ...settings, cardDensity: d });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dokumentenarchiv</h1>
          <p className={styles.subtitle}>
            {!loading && displayData.length > 0 && (
              <>{pageStart}–{pageEnd}{totalCount !== null ? ` von ${totalCount.toLocaleString("de-DE")}` : ""} Dokumenten</>
            )}
            {!loading && displayData.length === 0 && !error && "Keine Dokumente"}
            {loading && "Lädt…"}
            {error && "Fehler beim Laden"}
          </p>
        </div>

        <div className={styles.controls}>
          {/* Sort selector */}
          <div className={styles.sortGroup}>
            {(["newest", "oldest", "pages_desc", "pages_asc"] as HomeSort[]).map((s) => (
              <button
                key={s}
                className={`${styles.sortBtn} ${homeSort === s ? styles.sortBtnActive : ""}`}
                onClick={() => setSort(s)}
                title={SORT_LABELS[s]}
              >
                {SORT_LABELS[s]}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className={styles.viewGroup}>
            <button
              className={`${styles.viewBtn} ${homeView === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("grid")}
              title="Rasteransicht"
            >
              <GridIcon active={homeView === "grid"} />
            </button>
            <button
              className={`${styles.viewBtn} ${homeView === "list" ? styles.viewBtnActive : ""}`}
              onClick={() => setView("list")}
              title="Listenansicht"
            >
              <ListIcon active={homeView === "list"} />
            </button>
          </div>

          {/* Density selector (grid only) */}
          {homeView === "grid" && (
            <div className={styles.densityGroup}>
              {(["small", "medium", "large"] as CardDensity[]).map((d) => (
                <button
                  key={d}
                  className={`${styles.densityBtn} ${density === d ? styles.densityBtnActive : ""}`}
                  onClick={() => setDensity(d)}
                  title={d === "small" ? "Klein" : d === "medium" ? "Mittel" : "Groß"}
                >
                  <span className={styles.densityLabel}>
                    {d === "small" ? "S" : d === "medium" ? "M" : "L"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={pageIdx === 0}
              onClick={() => { setPageIdx((p) => p - 1); window.scrollTo(0, 0); }}>
              <ChevLeft />
            </button>
            <span className={styles.pageNum}>{pageIdx + 1}</span>
            <button className={styles.pageBtn} disabled={!hasMore || !!error}
              onClick={() => { setPageIdx((p) => p + 1); window.scrollTo(0, 0); }}>
              <ChevRight />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          <span>Fehler: {error}</span>
          <button className={styles.retryBtn} onClick={() => setPageIdx(pageIdx)}>
            Wiederholen
          </button>
        </div>
      )}

      {loading ? (
        homeView === "list" ? (
          <div className={styles.listContainer}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.listSkeleton} style={{ animationDelay: `${i * 30}ms` }} />
            ))}
          </div>
        ) : (
          <div
            className={styles.grid}
            style={{ "--card-min": `${minW}px`, "--thumb-h": `${thumbH}px` } as React.CSSProperties}
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 35}ms` }} />
            ))}
          </div>
        )
      ) : displayData.length === 0 ? (
        <div className={styles.empty}>
          <p>{error ? "Bitte überprüfe deine Anmeldung (401 Unauthorized)." : "Keine Dokumente vorhanden"}</p>
        </div>
      ) : homeView === "list" ? (
        <div className={styles.listContainer}>
          {displayData.map((doc, i) => {
            const isLocated = locatedPath === doc.filepath;
            return (
              <div key={doc.filepath} style={{ position: "relative" }} ref={isLocated ? locatedRef : null}>
                {isLocated && (
                  <div className={styles.locateArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                )}
                <DocumentCard
                  doc={doc}
                  lang={language}
                  viewMode="list"
                  style={{
                    animationDelay: `${i * 20}ms`,
                    ...(isLocated ? { borderColor: "var(--accent)", boxShadow: "0 0 0 2px var(--accent-dim)" } : {}),
                  }}
                  onDeleted={handleDeleted}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={styles.grid}
          style={{ "--card-min": `${minW}px`, "--thumb-h": `${thumbH}px` } as React.CSSProperties}
        >
          {displayData.map((doc, i) => {
            const isLocated = locatedPath === doc.filepath;
            return (
              <div key={doc.filepath} style={{ position: "relative" }} ref={isLocated ? locatedRef : null}>
                {isLocated && (
                  <div className={styles.locateArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                )}
                <DocumentCard
                  doc={doc}
                  lang={language}
                  thumbHeight={thumbH}
                  viewMode="grid"
                  style={{
                    animationDelay: `${i * 25}ms`,
                    ...(isLocated ? { borderColor: "var(--accent)", boxShadow: "0 0 0 2px var(--accent-dim), var(--shadow-md)" } : {}),
                  }}
                  onDeleted={handleDeleted}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
