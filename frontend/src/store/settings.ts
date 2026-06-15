import { create } from "zustand";
import { persist } from "zustand/middleware";

const ACCENT_PRESETS = {
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
  amber: {
    accent: "#f59e0b",
    dim: "#d97706",
    glow: "rgba(245,158,11,0.12)",
    fg: "#1a0e00",
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

export type AccentKey = keyof typeof ACCENT_PRESETS;
export type Lang = "en" | "de";
export { ACCENT_PRESETS };

function applyAccent(key: AccentKey) {
  const p = ACCENT_PRESETS[key];
  const r = document.documentElement;
  r.style.setProperty("--accent", p.accent);
  r.style.setProperty("--accent-dim", p.dim);
  r.style.setProperty("--accent-glow", p.glow);
  r.style.setProperty("--accent-fg", p.fg);
}

function defaultApiUrl(): string {
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "https://localhost:3000/api";
}

interface SettingsState {
  theme: "dark" | "light";
  apiUrl: string;
  accent: AccentKey;
  lang: Lang;
  simulatedTagPaths: string[];
  /** Allowed upload file extensions including dot, e.g. [".pdf", ".png"]. Empty = use default blocklist. */
  allowedUploadExtensions: string[];
  toggleTheme: () => void;
  setApiUrl: (url: string) => void;
  setAccent: (key: AccentKey) => void;
  setLang: (lang: Lang) => void;
  setSimulatedTagPaths: (paths: string[]) => void;
  setAllowedUploadExtensions: (exts: string[]) => void;
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
      accent: "teal",
      lang: "en",
      simulatedTagPaths: [],
      allowedUploadExtensions: DEFAULT_ALLOWED_EXTENSIONS,

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        if (next === "light") document.documentElement.classList.add("light");
        else document.documentElement.classList.remove("light");
      },
      setApiUrl: (url) => set({ apiUrl: url.replace(/\/+$/, "") }),
      setAccent: (key) => {
        set({ accent: key });
        applyAccent(key);
      },
      setLang: (lang) => set({ lang }),
      setSimulatedTagPaths: (paths) => set({ simulatedTagPaths: paths }),
      setAllowedUploadExtensions: (exts) =>
        set({ allowedUploadExtensions: exts }),
    }),
    { name: "rain-dms-settings" },
  ),
);

if (typeof window !== "undefined") {
  setTimeout(() => {
    applyAccent(useSettingsStore.getState().accent);
    if (useSettingsStore.getState().theme === "light")
      document.documentElement.classList.add("light");
  }, 0);
}
