import React, { useState, useCallback, useEffect, useRef } from "react";
import { useApp } from "../lib/AppContext";
import { useDocuments } from "../hooks/useApi";
import DocumentCard from "../components/documents/DocumentCard";
import styles from "./Home.module.css";

const ChevLeft = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevRight = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function Home() {
  const { t, language } = useApp();
  const [pageIdx, setPageIdx] = useState(0);
  const { data, setData, loading, error, hasMore, totalCount } =
    useDocuments(pageIdx);
  const [locatedPath, setLocatedPath] = useState<string | null>(null);
  const locatedRef = useRef<HTMLDivElement | null>(null);
  const locateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleted = useCallback(
    (filepath: string) => {
      setData((prev) => prev.filter((d) => d.filepath !== filepath));
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
      locatedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [locatedPath, data]);

  const pageStart = pageIdx * 50 + 1;
  const pageEnd = pageIdx * 50 + data.length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.home.title}</h1>
          <p className={styles.subtitle}>
            {!loading && data.length > 0 && (
              <>
                {pageStart}–{pageEnd}
                {totalCount !== null
                  ? ` von ${totalCount.toLocaleString("de-DE")}`
                  : ""}{" "}
                Dokumenten
              </>
            )}
            {!loading && data.length === 0 && "Keine Dokumente"}
            {loading && "Lädt…"}
          </p>
        </div>
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={pageIdx === 0}
            onClick={() => {
              setPageIdx((p) => p - 1);
              window.scrollTo(0, 0);
            }}
          >
            <ChevLeft />
          </button>
          <span className={styles.pageNum}>{pageIdx + 1}</span>
          <button
            className={styles.pageBtn}
            disabled={!hasMore}
            onClick={() => {
              setPageIdx((p) => p + 1);
              window.scrollTo(0, 0);
            }}
          >
            <ChevRight />
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          <span>
            {t.common.error}: {error}
          </span>
          <button
            className={styles.retryBtn}
            onClick={() => setPageIdx(pageIdx)}
          >
            {t.common.retry}
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className={styles.empty}>
          <p>{t.home.noDocuments}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {data.map((doc, i) => {
            const isLocated = locatedPath === doc.filepath;
            return (
              <div
                key={doc.filepath}
                style={{ position: "relative" }}
                ref={isLocated ? locatedRef : null}
              >
                {isLocated && (
                  <div className={styles.locateArrow}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  </div>
                )}
                <DocumentCard
                  doc={doc}
                  lang={language}
                  style={{
                    animationDelay: `${i * 30}ms`,
                    ...(isLocated
                      ? {
                          borderColor: "var(--accent)",
                          boxShadow:
                            "0 0 0 2px var(--accent-dim), var(--shadow-md)",
                        }
                      : {}),
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
