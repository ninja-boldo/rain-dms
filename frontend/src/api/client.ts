import { useAuthStore } from "../store/auth";
import { useSettingsStore } from "../store/settings";
import { reportError, reportInfo } from "../store/toast";
import { getI18n } from "../i18n";
import { applyUrlSubstitutions } from "../utils/urlSubstitution";

export type {
  Document,
  Page,
  MainPageResponse,
  SearchResponse,
  TagEntry,
  PageOcr,
  LineOcr,
  BoxOcr,
  BoundingBoxOcr,
  Point,
  RawBlockNormalized,
} from "./types";

// ── internal helpers ──────────────────────────────────────────────────────────

function baseUrl(): string {
  return useSettingsStore.getState().apiUrl;
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const { token, username } = useAuthStore.getState();
  const h: Record<string, string> = {};
  if (token) h["Authorization"] = token;
  // Server reads X-Username ?? username — send one canonical header only
  if (username) h["X-Username"] = username;
  return { ...h, ...extra };
}

/**
 * When the server says we're not authenticated any more, clear the local
 * auth state. PrivateRoute watches `token` and will redirect to /login.
 */
let lastUnauthAt = 0;
export function handleUnauth(status: number) {
  if (status !== 401 && status !== 403) return;
  const now = Date.now();
  if (now - lastUnauthAt < 500) return;
  lastUnauthAt = now;
  const { token, logout } = useAuthStore.getState();
  if (!token) return;
  logout();
  reportInfo(getI18n().toast_info, getI18n().err_unauth);
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    const next = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.assign(`/login?next=${next}&reason=unauth`);
  }
}

/**
 * Options for apiFetch.
 * `silent` skips the toast — used for calls that are expected to fail
 * routinely (e.g. per-file duplicate-hash checks during upload) where the
 * calling code already has its own, more specific way of surfacing errors.
 */
interface FetchOpts {
  silent?: boolean;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  opts?: FetchOpts,
): Promise<T> {
  const url = `${baseUrl()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(init?.headers as Record<string, string>),
      },
    });
  } catch (networkErr: any) {
    if (!opts?.silent) {
      reportError(getI18n().toast_error, `${getI18n().err_network} — ${path}`);
    }
    throw networkErr instanceof Error
      ? networkErr
      : new Error(getI18n().err_network);
  }
  if (!res.ok) {
    handleUnauth(res.status);
    const text = await res.text().catch(() => "");
    const message = `HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`;
    // 401/403 already surfaced via handleUnauth's own toast — don't double up.
    if (!opts?.silent && res.status !== 401 && res.status !== 403) {
      reportError(getI18n().toast_error, message);
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ── auth ──────────────────────────────────────────────────────────────────────

/**
 * Server returns { token, encrypted_encrytion_key } — the typo is intentional
 * and matches the server's response field name exactly (src/index.ts).
 */
export const signIn = (username: string, password: string) =>
  apiFetch<{ token: string; encrypted_encrytion_key: string }>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const signUp = (username: string, password: string) =>
  apiFetch<{ message: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// ── documents ─────────────────────────────────────────────────────────────────

import type {
  Document,
  Page,
  MainPageResponse,
  SearchResponse,
  TagEntry,
} from "./types";

export type MainPageSort =
  | "date_desc"
  | "date_asc"
  | "pages_desc"
  | "pages_asc"
  | "name_asc"
  | "name_desc";

export async function getMainPage(
  pageIdx = 0,
  limit = 50,
  tag?: string,
  sort: MainPageSort = "date_desc",
): Promise<MainPageResponse> {
  const p = new URLSearchParams({
    pageIdx: String(pageIdx),
    limit: String(limit),
    sort,
  });
  if (tag) p.set("tag", tag);

  const url = `${baseUrl()}/main_page?${p}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: authHeaders() });
  } catch (e: any) {
    reportError(getI18n().toast_error, getI18n().err_network);
    throw e instanceof Error ? e : new Error(getI18n().err_network);
  }
  if (!res.ok) {
    handleUnauth(res.status);
    if (res.status !== 401 && res.status !== 403) {
      reportError(getI18n().toast_error, `HTTP ${res.status}`);
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const data: Document[] = await res.json();
  const totalCount = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
  const pageCount = parseInt(res.headers.get("X-Page-Count") ?? "0", 10);
  return { data, totalCount, pageCount };
}

export const searchDocuments = (
  query: string,
  params?: Record<string, string>,
) => {
  const p = new URLSearchParams({ query, ...params });
  return apiFetch<SearchResponse>(`/search?${p}`);
};

/**
 * `includeOcr` controls whether the (potentially huge) per-page OCR JSON is
 * fetched at all — the server skips selecting that column entirely when
 * it's false, which is what keeps opening a long document fast. Pass
 * `offset`/`limit` to fetch a single page's OCR on demand (e.g. only for
 * pages currently scrolled into view) instead of the whole document at once.
 */
export const getPages = (
  filepath: string,
  opts?: { includeOcr?: boolean; offset?: number; limit?: number },
) => {
  const p = new URLSearchParams({ filepath });
  if (opts?.includeOcr) p.set("includeOcr", "true");
  if (opts?.offset != null) p.set("offset", String(opts.offset));
  if (opts?.limit != null) p.set("limit", String(opts.limit));
  return apiFetch<{ pages: Page[]; total: number; filepath: string }>(
    `/pages?${p}`,
  );
};

export const getDocument = (filepath: string) =>
  apiFetch<Document>(`/document?filepath=${encodeURIComponent(filepath)}`);

export const getTags = () => apiFetch<{ tags: TagEntry[] }>("/tags");
export const getStats = () => apiFetch<any>("/stats");
export const getWorkers = () => apiFetch<any>("/workers");
export const getDashboard = () => apiFetch<any>("/dashboard");
export const getWorkerDownloadStats = () =>
  apiFetch<any>("/worker-download-stats");

export const deleteDocument = (filepath: string) =>
  apiFetch<{ deleted: boolean }>(
    `/delete/consume?filepath=${encodeURIComponent(filepath)}`,
    { method: "DELETE" },
  );

export const checkHashExists = (hash: string) =>
  apiFetch<{ exists: boolean }>(
    "/check/hash_exists",
    { method: "POST", body: JSON.stringify({ hash }) },
    { silent: true },
  );

// ── upload ────────────────────────────────────────────────────────────────────

/**
 * Generic upload helper. Pass relativePath to preserve folder structure
 * (server reads form.get("relativePath") to place the file under uploadDir/username/path).
 */
export async function uploadFile(
  file: File,
  relativePath?: string,
): Promise<Response> {
  const form = new FormData();
  form.append("file", file);
  form.append("relativePath", relativePath ?? file.name);
  const res = await fetch(`${baseUrl()}/upload`, {
    method: "POST",
    headers: authHeaders(), // no Content-Type; browser sets multipart boundary
    body: form,
  });
  if (!res.ok) handleUnauth(res.status);
  return res;
}

// ── binary / image fetch with auth ───────────────────────────────────────────

export async function fetchBinary(url: string): Promise<Response> {
  const res = await fetch(applyUrlSubstitutions(url), {
    headers: authHeaders(),
  });
  if (!res.ok) handleUnauth(res.status);
  return res;
}

/**
 * FIX: Server's /download endpoint reads query param "fileKey", NOT "filepath".
 * Previous code sent "?filepath=…" which caused 400 errors on every download.
 */
export function buildDownloadUrl(filepath: string): string {
  return applyUrlSubstitutions(
    `${baseUrl()}/download?fileKey=${encodeURIComponent(filepath)}`,
  );
}