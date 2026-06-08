import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../lib/AppContext";
import { SearchHit } from "../../types";
import styles from "./SearchModal.module.css";

// ── Icons ───────────────────────────────────────────────────
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
const DocIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ArrowIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function getFilename(filepath?: string): string {
  if (!filepath) return "Unknown Document";
  const parts = filepath.split(/[/\\]/);
  return parts[parts.length - 1]
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
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function buildSnippet(
  hit: SearchHit,
  terms: string[],
  maxChars = 120,
): React.ReactNode[] {
  const rawText =
    hit.ocr?.lines?.flatMap((l) => l.boxes.map((b) => b.text)).join(" ") ?? "";
  if (!rawText) return [""];

  const lower = rawText.toLowerCase();
  let start = 0;
  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx !== -1) {
      start = Math.max(0, idx - 40);
      break;
    }
  }
  const slice = rawText.slice(start, start + maxChars);
  const prefix = start > 0 ? "…" : "";
  const suffix = start + maxChars < rawText.length ? "…" : "";

  if (!terms.length) return [prefix + slice + suffix];

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
    nodes.push(
      isMatch ? (
        <mark key={i} className={styles.highlight}>
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }
  nodes.push(suffix);
  return nodes;
}

// ── Result item ────────────────────────────────────────────
function ResultItem({
  filepath,
  pages,
  textTerms,
  isActive,
  onClick,
}: {
  filepath: string;
  pages: SearchHit[];
  textTerms: string[];
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const bestPage = pages.find((p) => p.ocr?.lines?.length) ?? pages[0];
  const filename = getFilename(filepath);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ block: "nearest" });
  }, [isActive]);

  return (
    <button
      ref={ref}
      className={`${styles.resultItem} ${isActive ? styles.resultItemActive : ""}`}
      onClick={onClick}
    >
      <div className={styles.resultThumb}>
        {bestPage?.banner_img && !imgError ? (
          <img
            src={bestPage.banner_img}
            alt={filename}
            onError={() => setImgError(true)}
            className={styles.resultThumbImg}
          />
        ) : (
          <div className={styles.resultThumbFallback}>
            <DocIcon />
          </div>
        )}
      </div>
      <div className={styles.resultContent}>
        <div className={styles.resultHeader}>
          <span className={styles.resultFilename}>{filename}</span>
          {pages.length > 1 && (
            <span className={styles.resultPages}>{pages.length}p</span>
          )}
        </div>
        <p className={styles.resultSnippet}>
          {buildSnippet(bestPage, textTerms)}
        </p>
      </div>
      <ArrowIcon />
    </button>
  );
}

// ── Main modal ─────────────────────────────────────────────
interface Props {
  onClose: () => void;
}

export default function SearchModal({ onClose }: Props) {
  const { settings, getAuthHeaders, t, language } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Live search with debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ query, limit: "8" });
        const res = await fetch(`${settings.serverUrl}/search?${params}`, {
          headers: getAuthHeaders(),
        });
        setData(await res.json());
        setActiveIdx(0);
      } catch {
        /* silent */
      }
      setLoading(false);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, settings.serverUrl]);

  // Group hits by file
  const groups = useMemo<[string, SearchHit[]][]>(() => {
    if (!data?.hits) return [];
    const map = new Map<string, SearchHit[]>();
    for (const hit of data.hits as SearchHit[]) {
      const key = hit.filepath ?? `__${hit.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(hit);
    }
    return Array.from(map.entries()).slice(0, 6);
  }, [data]);

  const textTerms = useMemo(
    () => query.trim().split(/\s+/).filter(Boolean),
    [query],
  );

  const goToSearch = useCallback(() => {
    if (!query.trim()) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }, [query, navigate, onClose]);

  const openResult = useCallback(
    (filepath: string) => {
      onClose();
      navigate(
        `/search?q=${encodeURIComponent(query)}&file=${encodeURIComponent(filepath)}`,
      );
    },
    [query, navigate, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, groups.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (groups.length > 0 && groups[activeIdx])
        openResult(groups[activeIdx][0]);
      else goToSearch();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Input */}
        <div className={styles.inputRow}>
          <span className={styles.searchIconWrap}>
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder={t.search.quickPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
          {loading && <span className={styles.spinner} />}
          {query && !loading && (
            <button className={styles.clearBtn} onClick={() => setQuery("")}>
              <CloseIcon />
            </button>
          )}
          <kbd className={styles.escKbd} onClick={onClose}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        {groups.length > 0 && (
          <div className={styles.results}>
            {groups.map(([filepath, pages], i) => (
              <ResultItem
                key={filepath}
                filepath={filepath}
                pages={pages}
                textTerms={textTerms}
                isActive={i === activeIdx}
                onClick={() => openResult(filepath)}
              />
            ))}
          </div>
        )}

        {/* No results */}
        {query && !loading && data && groups.length === 0 && (
          <div className={styles.empty}>
            <p>
              {t.search.noResultsFor} <strong>„{query}"</strong>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          {groups.length > 0 ? (
            <>
              <span className={styles.footerCount}>
                <strong>{groups.length}</strong> {t.search.documents}
                {data?.estimatedTotalHits > groups.length &&
                  ` / ${data.estimatedTotalHits}`}
              </span>
              <button className={styles.allResultsBtn} onClick={goToSearch}>
                {t.search.seeAllResults} <ArrowIcon />
              </button>
            </>
          ) : (
            <div className={styles.footerHints}>
              <span className={styles.hintChip}>tag:Rechnung</span>
              <span className={styles.hintChip}>UND · ODER · NICHT</span>
              <span className={styles.hintChip}>"exakte Phrase"</span>
            </div>
          )}
          <div className={styles.footerKeys}>
            <span className={styles.kbdPair}>
              <kbd>↑↓</kbd> navigieren
            </span>
            <span className={styles.kbdPair}>
              <kbd>↵</kbd> öffnen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
