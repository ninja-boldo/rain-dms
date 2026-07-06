import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  darken,
  withAlpha,
  pickForeground,
  isValidHex,
  normalizeHex,
} from "../utils/color";

const ACCENT_PRESETS = {
  amber: {
    accent: "#e8973a",
    dim: "#c9772a",
    glow: "rgba(232,151,58,0.14)",
    fg: "#1a0e00",
  },
  teal: {
    accent: "#14b8a6",
    dim: "#0d9488",
    glow: "rgba(20,184,166,0.12)",
    fg: "#0c1a1a",
  },
  sky: {
    accent: "#38bdf8",
    dim: "#0284c7",
    glow: "rgba(56,189,248,0.12)",
    fg: "#0c1a2e",
  },
  violet: {
    accent: "#a78bfa",
    dim: "#7c3aed",
    glow: "rgba(167,139,250,0.12)",
    fg: "#0c0c1a",
  },
  rose: {
    accent: "#fb7185",
    dim: "#e11d48",
    glow: "rgba(251,113,133,0.12)",
    fg: "#1a0c0e",
  },
  lime: {
    accent: "#84cc16",
    dim: "#65a30d",
    glow: "rgba(132,204,22,0.12)",
    fg: "#0e1a02",
  },
} as const;

export type AccentKey = keyof typeof ACCENT_PRESETS | "custom";
export type Lang = "en" | "de";
export { ACCENT_PRESETS };

export interface UrlSubstitution {
  /** Origin (scheme://host:port) to replace, e.g. https://192.168.1.188:7443 */
  from: string;
  /** Origin to replace it with — normally window.location.origin at the time it was accepted. */
  to: string;
}

function paletteFor(hex: string) {
  return {
    accent: hex,
    dim: darken(hex, 0.16),
    glow: withAlpha(hex, 0.14),
    fg: pickForeground(hex),
  };
}

function applyAccent(accent: AccentKey, customAccent: string | null) {
  const preset =
    accent === "custom" && customAccent && isValidHex(customAccent)
      ? paletteFor(normalizeHex(customAccent))
      : ACCENT_PRESETS[
          (accent === "custom"
            ? "amber"
            : accent) as keyof typeof ACCENT_PRESETS
        ];
  const r = document.documentElement;
  r.style.setProperty("--accent", preset.accent);
  r.style.setProperty("--accent-dim", preset.dim);
  r.style.setProperty("--accent-glow", preset.glow);
  r.style.setProperty("--accent-fg", preset.fg);
  // Keep the OCR-overlay accent family visually coherent with whatever the
  // person picked, while leaving confidence colors (green/amber/red) and the
  // marker-annotation amber alone since those carry independent meaning.
  r.style.setProperty("--ocr-match-border", withAlpha(preset.accent, 0.95));
  r.style.setProperty("--ocr-match-bg", withAlpha(preset.accent, 0.22));
  r.style.setProperty("--ocr-active-border", preset.accent);
  r.style.setProperty("--ocr-active-bg", withAlpha(preset.accent, 0.42));
  r.style.setProperty("--ocr-halo-strong", withAlpha(preset.accent, 0.85));
  r.style.setProperty("--ocr-halo-soft", withAlpha(preset.accent, 0.3));
  r.style.setProperty("--ocr-halo-none", withAlpha(preset.accent, 0));
  r.style.setProperty("--ocr-pill-ring", withAlpha(preset.accent, 0.3));
  r.style.setProperty("--ocr-pill-ring-fade", withAlpha(preset.accent, 0));
  r.style.setProperty("--ocr-tooltip-border", preset.accent);
}

function defaultApiUrl(): string {
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "https://localhost:3000/api";
}

interface SettingsState {
  theme: "dark" | "light";
  apiUrl: string;
  accent: AccentKey;
  customAccent: string | null;
  lang: Lang;
  simulatedTagPaths: string[];
  /** Allowed upload file extensions including dot, e.g. [".pdf", ".png"]. Empty = use default blocklist. */
  allowedUploadExtensions: string[];
  /**
   * Accepted base-URL substitutions for *fetching* (banner images, PDFs, downloads) only —
   * never applied to uploads. Each entry replaces `from` with `to` for outgoing GET requests.
   */
  urlSubstitutions: UrlSubstitution[];
  /** Origins the user has explicitly declined to substitute, so we don't ask again this browser. */
  dismissedOrigins: string[];

  toggleTheme: () => void;
  setApiUrl: (url: string) => void;
  setAccent: (key: AccentKey) => void;
  setCustomAccent: (hex: string) => void;
  setLang: (lang: Lang) => void;
  setSimulatedTagPaths: (paths: string[]) => void;
  setAllowedUploadExtensions: (exts: string[]) => void;
  addUrlSubstitution: (from: string, to: string) => void;
  removeUrlSubstitution: (from: string) => void;
  dismissOrigin: (origin: string) => void;
}

export function apiUrlToNginxBase(apiBase: string): string {
  return apiBase.replace("/api", "");
}
export function apiUrlToS3Base(apiBase: string): string {
  return `${apiUrlToNginxBase(apiBase)}/s3`;
}

export const DEFAULT_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".tiff",
  ".tif",
  ".bmp",
  ".webp",
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      apiUrl: defaultApiUrl(),
      accent: "amber",
      customAccent: null,
      lang: "en",
      simulatedTagPaths: [],
      allowedUploadExtensions: DEFAULT_ALLOWED_EXTENSIONS,
      urlSubstitutions: [],
      dismissedOrigins: [],

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        if (next === "light") document.documentElement.classList.add("light");
        else document.documentElement.classList.remove("light");
      },
      setApiUrl: (url) => set({ apiUrl: url.replace(/\/+$/, "") }),
      setAccent: (key) => {
        set({ accent: key });
        applyAccent(key, get().customAccent);
      },
      setCustomAccent: (hex) => {
        set({ accent: "custom", customAccent: hex });
        applyAccent("custom", hex);
      },
      setLang: (lang) => set({ lang }),
      setSimulatedTagPaths: (paths) => set({ simulatedTagPaths: paths }),
      setAllowedUploadExtensions: (exts) =>
        set({ allowedUploadExtensions: exts }),
      addUrlSubstitution: (from, to) => {
        const existing = get().urlSubstitutions.filter((s) => s.from !== from);
        set({
          urlSubstitutions: [...existing, { from, to }],
          dismissedOrigins: get().dismissedOrigins.filter((o) => o !== from),
        });
      },
      removeUrlSubstitution: (from) =>
        set({
          urlSubstitutions: get().urlSubstitutions.filter(
            (s) => s.from !== from,
          ),
        }),
      dismissOrigin: (origin) => {
        if (get().dismissedOrigins.includes(origin)) return;
        set({ dismissedOrigins: [...get().dismissedOrigins, origin] });
      },
    }),
    { name: "rain-dms-settings" },
  ),
);

if (typeof window !== "undefined") {
  setTimeout(() => {
    const s = useSettingsStore.getState();
    applyAccent(s.accent, s.customAccent);
    if (s.theme === "light") document.documentElement.classList.add("light");
  }, 0);
}
