import { useSettingsStore } from "../store/settings";
import { useUrlPromptStore } from "../store/urlPrompt";

/** Extract scheme://host:port from a URL string, or null if unparsable. */
export function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Apply any accepted origin substitutions to a URL used for *fetching*
 * (banner images, page thumbnails, PDF/file downloads). Never call this when
 * building an upload request — substitutions intentionally only affect reads.
 *
 * Backend responses (main_page/pages banner_img, download links, etc.) embed
 * absolute URLs pointing at whatever host the server resolved for S3/nginx —
 * which can differ from whatever address the browser actually used to reach
 * the app (LAN IP vs. Tailscale hostname vs. a domain), triggering CORS
 * failures since that's a genuine cross-origin request. Substituting it for
 * the page's own origin turns it back into a same-origin request.
 */
export function applyUrlSubstitutions(url: string): string {
  const subs = useSettingsStore.getState().urlSubstitutions;
  for (const { from, to } of subs) {
    if (url.startsWith(from)) {
      return to + url.slice(from.length);
    }
  }
  maybeRequestSubstitution(url);
  return url;
}

function maybeRequestSubstitution(url: string) {
  if (typeof window === "undefined") return;
  const origin = originOf(url);
  const pageOrigin = window.location.origin;
  if (!origin || origin === pageOrigin) return;
  const { dismissedOrigins } = useSettingsStore.getState();
  if (dismissedOrigins.includes(origin)) return;
  useUrlPromptStore.getState().requestSubstitution(origin);
}
