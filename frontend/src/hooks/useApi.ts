import {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { Document, SearchResponse, DocPage } from "../types";
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

/**
 * Build the effective Meilisearch query string.
 *
 * Meilisearch boolean operators (AND/OR/NOT) are document-level:
 * both terms must appear *somewhere* in the document. They do NOT
 * work across nested JSON objects as separate sub-queries.
 *
 * The raw query is forwarded as-is so Meilisearch handles it; we
 * just normalise AND/OR/NOT to uppercase so "mathe and vektoren"
 * works the same as "mathe AND vektoren".
 */
export function buildMeilisearchQuery(raw: string): string {
  // Uppercase boolean operators that appear as standalone words
  return raw.replace(/\b(and|or|not)\b/gi, (m) => m.toUpperCase());
}

export function useSearch(
  query: string,
  limit: number = 100
): {
  data: SearchResponse | null;
  loading: boolean;
  error: string | null;
  effectiveQuery: string;
} {
  const { settings } = useApp();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  const effectiveQuery = buildMeilisearchQuery(query);

  useEffect(() => {
    if (!query.trim()) {
      setData(null);
      setLoading(false);
      return;
    }

    const timerId = setTimeout(() => {
      const reqId = ++reqIdRef.current;
      setLoading(true);
      setError(null);

      const q = buildMeilisearchQuery(query);
      fetch(
        `${settings.serverUrl}/search?query=${encodeURIComponent(q)}&limit=${limit}`
      )
        .then((r) => r.json())
        .then((d: SearchResponse) => {
          if (reqId === reqIdRef.current) {
            setData(d);
            setLoading(false);
          }
        })
        .catch((e) => {
          if (reqId === reqIdRef.current) {
            setError(e.message);
            setLoading(false);
          }
        });
    }, 280);

    return () => clearTimeout(timerId);
  }, [query, limit, settings.serverUrl]);

  return { data, loading, error, effectiveQuery };
}

/**
 * Fetch all pages for a document by filepath.
 *
 * Strategy: GET /pages?filepath=... (new backend endpoint).
 * Falls back to searching by filename if that 404s.
 *
 * The backend endpoint should return:
 *   { pages: Array<{ pageIdx, banner_img, ocr }> }
 *
 * NOTE: Add this to your Hono backend:
 *
 *   app.get("/pages", async (c) => {
 *     const filepath = c.req.query("filepath");
 *     if (!filepath) return c.json({ error: "Missing filepath" }, 400);
 *     const res = await db
 *       .select({
 *         pageIdx: pagesTable.page_idx,
 *         banner_img: pagesTable.page_banner_url,
 *         ocr: pagesTable.ocr,
 *       })
 *       .from(pagesTable)
 *       .innerJoin(documentsTable, eq(pagesTable.file_id, documentsTable.file_id))
 *       .where(eq(documentsTable.filepath, filepath))
 *       .orderBy(asc(pagesTable.page_idx));
 *     return c.json({ pages: res });
 *   });
 */
export function useDocPages(
  filepath: string | null,
  serverUrl: string
): { pages: DocPage[]; loading: boolean; error: string | null } {
  const [pages, setPages] = useState<DocPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filepath) {
      setPages([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Primary: dedicated /pages endpoint
    fetch(`${serverUrl}/pages?filepath=${encodeURIComponent(filepath)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        const sorted = (d.pages as DocPage[]).sort(
          (a, b) => a.pageIdx - b.pageIdx
        );
        setPages(sorted);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: search by filename (less reliable for multi-page)
        const filename = filepath.split(/[/\\]/).pop() ?? filepath;
        fetch(`${serverUrl}/search?query=${encodeURIComponent(filename)}&limit=500`)
          .then((r) => r.json())
          .then((d: SearchResponse) => {
            const hits = (d.hits ?? [])
              .filter((h) => h.filepath === filepath)
              .sort((a, b) => (a.pageIdx ?? 0) - (b.pageIdx ?? 0));

            // Deduplicate by pageIdx
            const seen = new Set<number>();
            const unique = hits.filter((h) => {
              const idx = h.pageIdx ?? 0;
              if (seen.has(idx)) return false;
              seen.add(idx);
              return true;
            });

            setPages(
              unique.map((h) => ({
                pageIdx: h.pageIdx ?? 0,
                banner_img: h.banner_img,
                ocr: h.ocr,
              }))
            );
            setLoading(false);
          })
          .catch((e) => {
            setError(e.message);
            setLoading(false);
          });
      });
  }, [filepath, serverUrl]);

  return { pages, loading, error };
}
