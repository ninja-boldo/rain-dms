import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Theme, Language } from "../types";
import { translations } from "../i18n/translations";

interface Settings {
  serverUrl: string;
  uploadDir: string;
}

interface AppContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  t: typeof translations.de;
  settings: Settings;
  setSettings: (s: Settings) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_SETTINGS: Settings = {
  serverUrl: "http://localhost:3000",
  // ← CHANGE THIS to your actual upload directory
  uploadDir:
    "/Users/bennetjollenbeck/Desktop/programming/web/react/family_projects/rain-dms/consumed_files",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("rain-dms-theme");
    return (stored as Theme) ?? "dark";
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("rain-dms-lang");
    return (stored as Language) ?? "de";
  });

  const [settings, setSettingsState] = useState<Settings>(() => {
    const stored = localStorage.getItem("rain-dms-settings");
    return stored
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      : DEFAULT_SETTINGS;
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("rain-dms-theme", t);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("rain-dms-lang", l);
  };

  const setSettings = (s: Settings) => {
    setSettingsState(s);
    localStorage.setItem("rain-dms-settings", JSON.stringify(s));
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        t,
        settings,
        setSettings,
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
