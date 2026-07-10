// The ingestion pipeline appends a "-<uuid>" and/or "-<iso-timestamp>" suffix
// to de-duplicate uploads on disk. Files that went through a format
// conversion (e.g. .epub -> .pdf) can end up with BOTH suffixes stacked, in
// either order, so this strips them in a loop rather than a single
// fixed-order pass — a single pass left the uuid behind whenever the
// timestamp suffix came after it.
const UUID_SUFFIX = /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const TIMESTAMP_SUFFIX =
  /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}(?:\.\d+)?Z?$/i;

/**
 * Strip synthetic uuid/timestamp suffixes from a file key so the UI can show
 * a clean, human-readable name. The raw, unmodified key is always still
 * available wherever a component shows an "info" panel, tooltip, or copy
 * button — this only ever affects the friendly display name.
 */
export function cleanFileName(key: string | null | undefined): string {
  if (!key) return "";
  const base = key.split("/").pop() ?? key;
  const dot = base.lastIndexOf(".");
  const hasExt = dot > 0;
  const ext = hasExt ? base.slice(dot) : "";
  let stem = hasExt ? base.slice(0, dot) : base;

  for (let i = 0; i < 4; i++) {
    const before = stem;
    stem = stem.replace(UUID_SUFFIX, "").replace(TIMESTAMP_SUFFIX, "");
    if (stem === before) break;
  }
  return (stem || base) + ext;
}
