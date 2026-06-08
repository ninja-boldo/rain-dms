import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { Document, SearchResponse } from "../types";
import { useApp } from "../lib/AppContext";

export function useDocuments(pageIdx: number, limit: number = 50): {
  data: Document[];
  setData: Dispatch<SetStateAction<Document[]>>;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number | null;
} {
  const { settings, getAuthHeaders } = useApp();
  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(
      `${settings.serverUrl}/main_page?pageIdx=${pageIdx}&limit=${limit}`,
      { headers: getAuthHeaders() },
    )
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: Not authorized or server error`);
        const total = r.headers.get("X-Total-Count");
        const totalNum = total ? Number(total) : null;
        setTotalCount(totalNum);
        return { json: r.json(), total: totalNum };
      })
      .then(({ json, total }) =>
        json.then((d: Document[]) => {
          if (Array.isArray(d)) {
            setData(d);
            // Use total count header for accurate hasMore — server currently hardcodes limit=50,
            // so use totalCount if available, otherwise fall back to length heuristic
            if (total !== null) {
              setHasMore((pageIdx + 1) * Math.max(limit, d.length) < total);
            } else {
              setHasMore(d.length > 0 && d.length >= 50); // server hardcodes 50
            }
          } else {
            setData([]); setHasMore(false);
          }
          setLoading(false);
        })
      )
      .catch((e) => {
        setError(e.message);
        setData([]);
        setLoading(false);
      });
  }, [pageIdx, limit, settings.serverUrl, getAuthHeaders]);

  return { data, setData, loading, error, hasMore, totalCount };
}

export function useSearch(query: string): {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
} {
  const { settings, getAuthHeaders } = useApp();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(
    (q: string) => {
      if (!q.trim()) { setData(null); return; }
      setLoading(true); setError(null);
      fetch(`${settings.serverUrl}/search?query=${encodeURIComponent(q)}`, {
        headers: getAuthHeaders(),
      })
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((d: SearchResponse) => { setData(d); setLoading(false); })
        .catch((e) => { setError(e.message); setData(null); setLoading(false); });
    },
    [settings.serverUrl, getAuthHeaders],
  );

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return { data, loading, error };
}
