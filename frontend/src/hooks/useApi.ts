import {
  useState,
  useEffect,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import { Document, SearchResponse } from "../types";
import { useApp } from "../lib/AppContext";

export function useDocuments(pageIdx: number): {
  data: Document[];
  setData: Dispatch<SetStateAction<Document[]>>;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number | null;
} {
  const { settings } = useApp();
  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${settings.serverUrl}/main_page?pageIdx=${pageIdx}`)
      .then((r) => {
        const total = r.headers.get("X-Total-Count");
        if (total) setTotalCount(Number(total));
        return r.json();
      })
      .then((d: Document[]) => {
        setData(d);
        setHasMore(d.length === 50);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [pageIdx, settings.serverUrl]);

  return { data, setData, loading, error, hasMore, totalCount };
}

export function useSearch(query: string): {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
} {
  const { settings } = useApp();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setData(null);
        return;
      }
      setLoading(true);
      setError(null);
      fetch(`${settings.serverUrl}/search?query=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d: SearchResponse) => {
          setData(d);
          setLoading(false);
        })
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        });
    },
    [settings.serverUrl],
  );

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return { data, loading, error };
}
