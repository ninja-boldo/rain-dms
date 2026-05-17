/**
 * Sanitize a filename from the DMS filepath.
 * Raw: "Skript-0a88d768-85cd-4cdd-...-2026-05-17T13-17-26.751Z.pdf"
 * Clean: "Skript"
 */
export function sanitizeName(filepath: string): string {
  if (!filepath) return "Unknown";
  const parts = filepath.split(/[/\\]/);
  let name = parts[parts.length - 1];
  // Remove UUID + timestamp suffix before extension
  name = name.replace(
    /-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-\d{4}-\d{2}-\d{2}T[\d\-:.Z]+(\.[^.]+)$/i,
    "$1"
  );
  // Fallback: remove generic timestamp suffix
  name = name.replace(/-\[object Object\]-[\d\-T.Z]+(\.[^.]+)$/i, "$1");
  // Remove extension for display
  name = name.replace(/\.(pdf|png|jpg|jpeg)$/i, "");
  return name || parts[parts.length - 1];
}

export function getRawFilename(filepath: string): string {
  if (!filepath) return "";
  const parts = filepath.split(/[/\\]/);
  return parts[parts.length - 1];
}

export function getExt(filepath: string): string {
  const m = filepath.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : "FILE";
}

export function parseTags(raw: string[] | string | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    // Sometimes the array contains a JSON string itself
    if (raw.length === 1 && typeof raw[0] === "string") {
      try {
        const parsed = JSON.parse(raw[0]);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {}
    }
    return raw.map(String).filter(Boolean);
  }
  if (typeof raw === "string") {
    // Try JSON parse
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      return [raw].filter(Boolean);
    } catch {}
    // Comma-separated fallback
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
