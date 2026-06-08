import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Theme, Language } from "../types";
import { translations } from "../i18n/translations";

const BUILTIN_SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ??
  "https://192.168.1.163:7443";

export type CardDensity = "small" | "medium" | "large";
export type HomeView = "grid" | "list";
export type HomeSort = "newest" | "oldest" | "pages_desc" | "pages_asc";
export type HomePageSize = 25 | 50 | 100;

interface Settings {
  serverUrl: string;
  uploadDir: string;
  cardDensity: CardDensity;
  homePageSize: HomePageSize;
  homeView: HomeView;
  homeSort: HomeSort;
}

interface AuthState {
  username: string;
  token: string;
}

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: typeof translations.de;
  settings: Settings;
  setSettings: (s: Settings) => void;
  resetServerUrl: () => void;
  auth: AuthState | null;
  login: (username: string, token: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => HeadersInit;
}

const AppContext = createContext<AppContextValue | null>(null);

function defaultSettings(): Settings {
  return {
    serverUrl: BUILTIN_SERVER_URL,
    uploadDir: "",
    cardDensity: "medium",
    homePageSize: 50,
    homeView: "grid",
    homeSort: "newest",
  };
}

async function getSwController(): Promise<ServiceWorker | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.active ?? null;
}

async function postSwAuth(token: string, username: string): Promise<void> {
  const sw = await getSwController();
  if (!sw) return;
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      if (event.data?.type === "PONG") resolve();
    };
    sw.postMessage({ type: "SET_AUTH", token, username });
    sw.postMessage({ type: "PING" }, [channel.port2]);
    setTimeout(resolve, 500);
  });
}

function postSwClear() {
  getSwController().then((sw) => {
    sw?.postMessage({ type: "CLEAR_AUTH" });
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem("rain-dms-theme") as Theme) ?? "dark";
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("rain-dms-lang") as Language) ?? "de";
  });

  const [settings, setSettingsState] = useState<Settings>(() => {
    const stored = localStorage.getItem("rain-dms-settings");
    if (stored) {
      try {
        return { ...defaultSettings(), ...JSON.parse(stored) };
      } catch {}
    }
    return defaultSettings();
  });

  const [auth, setAuth] = useState<AuthState | null>(() => {
    const stored = localStorage.getItem("rain-dms-auth");
    return stored ? JSON.parse(stored) : null;
  });

  const [swReady, setSwReady] = useState(!("serviceWorker" in navigator));

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let isMounted = true;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        const activate = async () => {
          const sw = reg.active;
          if (!sw) { if (isMounted) setSwReady(true); return; }
          const stored = localStorage.getItem("rain-dms-auth");
          if (stored) {
            const { token, username } = JSON.parse(stored);
            sw.postMessage({ type: "SET_AUTH", token, username });
          }
          const channel = new MessageChannel();
          channel.port1.onmessage = (event) => {
            if (event.data?.type === "PONG" && isMounted) setSwReady(true);
          };
          sw.postMessage({ type: "PING" }, [channel.port2]);
          setTimeout(() => { if (isMounted) setSwReady(true); }, 1000);
        };

        if (reg.active) {
          activate();
        } else {
          const installing = reg.installing ?? reg.waiting;
          installing?.addEventListener("statechange", function handler() {
            if (this.state === "activated") {
              activate();
              installing.removeEventListener("statechange", handler);
            }
          });
        }
      })
      .catch((err) => {
        console.warn("SW registration failed:", err);
        if (isMounted) setSwReady(true);
      });

    const timeout = setTimeout(() => { if (isMounted) setSwReady(true); }, 2000);
    return () => { isMounted = false; clearTimeout(timeout); };
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("rain-dms-theme", t);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("rain-dms-lang", l);
  };

  const setSettings = useCallback((s: Settings) => {
    setSettingsState(s);
    localStorage.setItem("rain-dms-settings", JSON.stringify(s));
  }, []);

  const resetServerUrl = useCallback(() => {
    setSettingsState((prev) => {
      const next = { ...prev, serverUrl: BUILTIN_SERVER_URL };
      localStorage.setItem("rain-dms-settings", JSON.stringify(next));
      return next;
    });
  }, []);

  const getAuthHeaders = useCallback((): HeadersInit => {
    if (!auth) return {};
    return {
      username: auth.username,
      "X-Username": auth.username,
      Authorization: auth.token,
    };
  }, [auth]);

  const login = useCallback(async (username: string, token: string) => {
    const newAuth: AuthState = { username, token };
    localStorage.setItem("rain-dms-auth", JSON.stringify(newAuth));
    await postSwAuth(token, username);
    setAuth(newAuth);
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem("rain-dms-auth");
    postSwClear();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const t = translations[language];
  if (!swReady) return null;

  return (
    <AppContext.Provider
      value={{
        theme, setTheme,
        language, setLanguage,
        t, settings, setSettings, resetServerUrl,
        auth, login, logout, getAuthHeaders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
