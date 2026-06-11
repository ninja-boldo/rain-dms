import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import styles from "./Tags.module.css";

interface Tag {
  tag: string;
  doc_count: number;
}

export default function Tags() {
  const { settings, getAuthHeaders } = useApp();
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"count" | "alpha">("count");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`${settings.serverUrl}/tags`, { headers: getAuthHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — check server auth`);
        return r.json();
      })
      .then((d) => { if (d?.tags) setTags(d.tags); else setFetchError("No tags in response"); })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, [settings.serverUrl]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = q ? tags.filter((t) => t.tag.toLowerCase().includes(q)) : tags;
    return [...list].sort((a, b) =>
      sort === "count" ? b.doc_count - a.doc_count : a.tag.localeCompare(b.tag),
    );
  }, [tags, search, sort]);

  const totalDocs = useMemo(() => {
    const seen = new Set<string>();
    // doc_count per tag can overlap; just sum unique tag counts for display
    return tags.reduce((s, t) => s + t.doc_count, 0);
  }, [tags]);

  const max = useMemo(() => Math.max(...tags.map((t) => t.doc_count), 1), [tags]);

  const toggleSelect = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const searchSelected = () => {
    if (!selected.size) return;
    const q = [...selected].map((t) => `tag:${t}`).join(" ");
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const searchTag = (tag: string) => {
    navigate(`/search?q=${encodeURIComponent(`tag:${tag}`)}`);
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Tags</h1>
          <div className={styles.meta}>
            <span className={styles.badge}>{tags.length} tags</span>
            <span className={styles.badge}>{totalDocs} tag-doc associations</span>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Filter tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch("")}>×</button>
            )}
          </div>

          <div className={styles.sortGroup}>
            <button
              className={`${styles.sortBtn} ${sort === "count" ? styles.sortBtnActive : ""}`}
              onClick={() => setSort("count")}
            >by count</button>
            <button
              className={`${styles.sortBtn} ${sort === "alpha" ? styles.sortBtnActive : ""}`}
              onClick={() => setSort("alpha")}
            >A–Z</button>
          </div>

          {selected.size > 0 && (
            <button className={styles.searchSelectedBtn} onClick={searchSelected}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Search {selected.size} selected
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading tags…</span>
        </div>
      ) : fetchError ? (
        <div className={styles.fetchError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className={styles.fetchErrorTitle}>Failed to load tags</p>
            <p className={styles.fetchErrorDetail}>{fetchError}</p>
            <button className={styles.retryBtn} onClick={() => { setFetchError(null); setLoading(true); setTags([]);
              fetch(`${settings.serverUrl}/tags`, { headers: getAuthHeaders() })
                .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
                .then(d => { if (d?.tags) setTags(d.tags); })
                .catch(e => setFetchError(String(e)))
                .finally(() => setLoading(false));
            }}>Retry</button>
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 && (
            <div className={styles.empty}>No tags match "{search}"</div>
          )}

          <div className={styles.grid}>
            {filtered.map(({ tag, doc_count }) => {
              const pct = Math.max(8, Math.round((doc_count / max) * 100));
              const sel = selected.has(tag);
              return (
                <div
                  key={tag}
                  className={`${styles.card} ${sel ? styles.cardSelected : ""}`}
                  onClick={() => toggleSelect(tag)}
                  onDoubleClick={() => searchTag(tag)}
                  title={`Double-click to search · Click to select`}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.tagName}>{tag}</span>
                    <span className={styles.docCount}>{doc_count}</span>
                    {sel && (
                      <span className={styles.checkmark}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%` }} />
                  </div>
                  <button
                    className={styles.searchBtn}
                    onClick={(e) => { e.stopPropagation(); searchTag(tag); }}
                    title="Search this tag"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    Search
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
