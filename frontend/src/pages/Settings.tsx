import React, { useState } from "react";
import { useApp } from "../lib/AppContext";
import type { HomePageSize, HomeView, HomeSort, CardDensity } from "../lib/AppContext";
import type { ColorTheme } from "../types";
import styles from "./Settings.module.css";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const KeyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
const ResetIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);

const COLOR_THEMES: { id: ColorTheme; label: string; dark: string; light: string }[] = [
  { id: "violet", label: "Violet",  dark: "#8b5cf6", light: "#7c3aed" },
  { id: "blue",   label: "Blue",    dark: "#60a5fa", light: "#2563eb" },
  { id: "teal",   label: "Teal",    dark: "#2dd4bf", light: "#0d9488" },
  { id: "rose",   label: "Rose",    dark: "#fb7185", light: "#e11d48" },
  { id: "orange", label: "Orange",  dark: "#fb923c", light: "#ea580c" },
  { id: "forest", label: "Forest",  dark: "#4ade80", light: "#16a34a" },
];

type ConnectionStatus = "idle" | "testing" | "ok" | "fail";


function PathPrefixEditor() {
  const [prefixes, setPrefixes] = React.useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("rain-dms-path-prefixes") ?? "[]"); } catch { return []; }
  });
  const [newPrefix, setNewPrefix] = React.useState("");

  const save = (next: string[]) => {
    setPrefixes(next);
    localStorage.setItem("rain-dms-path-prefixes", JSON.stringify(next));
  };

  const add = () => {
    const v = newPrefix.trim();
    if (!v || prefixes.includes(v)) return;
    save([...prefixes, v]);
    setNewPrefix("");
  };

  return (
    <>
      <div className={styles.prefixList}>
        {prefixes.map((p, i) => (
          <div key={i} className={styles.prefixRow}>
            <span className={styles.prefixText}>{p}</span>
            <button className={styles.prefixDel} onClick={() => save(prefixes.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        {prefixes.length === 0 && (
          <p style={{fontSize:"0.72rem", color:"var(--text-muted)", fontFamily:"var(--font-mono)"}}>
            No prefixes configured. Example: <code>/Users/bennetjollenbeck/Desktop</code>
          </p>
        )}
      </div>
      <div className={styles.addPrefixRow}>
        <input className={styles.input} placeholder="/Users/you/Documents"
          value={newPrefix} onChange={(e) => setNewPrefix(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          style={{flex:1}}
        />
        <button className={styles.addPrefixBtn} onClick={add}>+ Add</button>
      </div>
    </>
  );
}

export default function Settings() {
  const {
    t, theme, setTheme, colorTheme, setColorTheme,
    language, setLanguage, settings, setSettings, resetServerUrl, auth, logout,
  } = useApp();

  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [uploadDir, setUploadDir] = useState(settings.uploadDir);
  const [saved, setSaved] = useState(false);
  const [connStatus, setConnStatus] = useState<ConnectionStatus>("idle");

  const isDirty = serverUrl !== settings.serverUrl || uploadDir !== settings.uploadDir;

  const handleSave = () => {
    setSettings({ ...settings, serverUrl, uploadDir });
    setSaved(true);
    setConnStatus("idle");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetServerUrl();
    const builtIn = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? "https://192.168.1.163:7443";
    setServerUrl(builtIn);
    setConnStatus("idle");
  };

  const testConnection = async () => {
    setConnStatus("testing");
    try {
      const res = await fetch(`${serverUrl}/stats`, { signal: AbortSignal.timeout(4000) });
      setConnStatus(res.ok ? "ok" : "fail");
    } catch {
      setConnStatus("fail");
    }
    setTimeout(() => setConnStatus("idle"), 3000);
  };

  const maskedToken = (() => {
    if (!auth?.token) return null;
    const parts = auth.token.split(".");
    if (parts.length < 2) return auth.token.slice(0, 12) + "…";
    return parts[0] + "." + parts[1].slice(0, 8) + "…";
  })();

  const homePageSize = settings.homePageSize ?? 50;
  const homeView = settings.homeView ?? "grid";
  const homeSort = settings.homeSort ?? "newest";
  const cardDensity = settings.cardDensity ?? "medium";

  const setPageSize = (n: HomePageSize) => setSettings({ ...settings, homePageSize: n });
  const setView = (v: HomeView) => setSettings({ ...settings, homeView: v });
  const setSort = (s: HomeSort) => setSettings({ ...settings, homeSort: s });
  const setDensity = (d: CardDensity) => setSettings({ ...settings, cardDensity: d });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.settings.title}</h1>
      </header>

      <div className={styles.sections}>

        {/* ── Account ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.account}</h2>
          {auth ? (
            <div className={styles.accountCard}>
              <div className={styles.accountAvatar}><UserIcon /></div>
              <div className={styles.accountInfo}>
                <div className={styles.accountName}>{auth.username}</div>
                <div className={styles.accountMeta}>
                  <span className={styles.accountBadge}>
                    <span className={styles.accountBadgeDot} />
                    {t.settings.session}
                  </span>
                  {maskedToken && (
                    <span className={styles.tokenBadge} title={t.settings.tokenInfo}>
                      <KeyIcon /> <code className={styles.tokenCode}>{maskedToken}</code>
                    </span>
                  )}
                </div>
              </div>
              <button className={styles.logoutBtn} onClick={logout}>
                <LogoutIcon /> {t.settings.logout}
              </button>
            </div>
          ) : (
            <div className={styles.accountCardEmpty}>
              <p className={styles.accountEmptyText}>{t.settings.noSession}</p>
            </div>
          )}
        </section>

        {/* ── Appearance ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.appearance}</h2>

          {/* Light / Dark */}
          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>{t.settings.theme}</label>
            </div>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${theme === "light" ? styles.toggleActive : ""}`}
                onClick={() => setTheme("light")}
              >
                <span className={styles.toggleIcon}>☀</span> {t.settings.themeLight}
              </button>
              <button
                className={`${styles.toggleBtn} ${theme === "dark" ? styles.toggleActive : ""}`}
                onClick={() => setTheme("dark")}
              >
                <span className={styles.toggleIcon}>◐</span> {t.settings.themeDark}
              </button>
            </div>
          </div>

          {/* Color theme swatches */}
          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>Accent Color</label>
              <p className={styles.rowHint}>Applied across the entire UI</p>
            </div>
            <div className={styles.colorSwatches}>
              {COLOR_THEMES.map((ct) => {
                const hex = theme === "dark" ? ct.dark : ct.light;
                const active = colorTheme === ct.id;
                return (
                  <button
                    key={ct.id}
                    className={`${styles.swatch} ${active ? styles.swatchActive : ""}`}
                    onClick={() => setColorTheme(ct.id)}
                    title={ct.label}
                    style={{ "--swatch-color": hex } as React.CSSProperties}
                  >
                    <span className={styles.swatchDot} />
                    {active && <span className={styles.swatchCheck}><CheckIcon /></span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.colorLabel}>
            <span className={styles.colorLabelActive}>
              {COLOR_THEMES.find(c => c.id === colorTheme)?.label ?? "Violet"}
            </span>
          </div>

          {/* Language */}
          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>{t.settings.language}</label>
            </div>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${language === "de" ? styles.toggleActive : ""}`}
                onClick={() => setLanguage("de")}
              >🇩🇪 Deutsch</button>
              <button
                className={`${styles.toggleBtn} ${language === "en" ? styles.toggleActive : ""}`}
                onClick={() => setLanguage("en")}
              >🇬🇧 English</button>
            </div>
          </div>
        </section>

        {/* ── Archive view ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Archive View</h2>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>Items per page</label>
            </div>
            <div className={styles.toggleGroup}>
              {([25, 50, 100] as HomePageSize[]).map((n) => (
                <button key={n}
                  className={`${styles.toggleBtn} ${homePageSize === n ? styles.toggleActive : ""}`}
                  onClick={() => setPageSize(n)}
                >{n}</button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>Default view</label>
            </div>
            <div className={styles.toggleGroup}>
              <button className={`${styles.toggleBtn} ${homeView === "grid" ? styles.toggleActive : ""}`} onClick={() => setView("grid")}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="0" y="0" width="5" height="5" rx="1"/><rect x="7" y="0" width="5" height="5" rx="1"/><rect x="0" y="7" width="5" height="5" rx="1"/><rect x="7" y="7" width="5" height="5" rx="1"/></svg> Grid
              </button>
              <button className={`${styles.toggleBtn} ${homeView === "list" ? styles.toggleActive : ""}`} onClick={() => setView("list")}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="2" x2="11" y2="2"/><line x1="4" y1="6" x2="11" y2="6"/><line x1="4" y1="10" x2="11" y2="10"/><circle cx="1.5" cy="2" r="1" fill="currentColor" stroke="none"/><circle cx="1.5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="1.5" cy="10" r="1" fill="currentColor" stroke="none"/></svg> List
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>Default sort</label>
            </div>
            <div className={styles.toggleGroup}>
              {(["newest", "oldest", "pages_desc", "pages_asc"] as HomeSort[]).map((s) => (
                <button key={s}
                  className={`${styles.toggleBtn} ${homeSort === s ? styles.toggleActive : ""}`}
                  onClick={() => setSort(s)}
                >
                  {s === "newest" ? "Newest" : s === "oldest" ? "Oldest" : s === "pages_desc" ? "Most pages" : "Fewest pages"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>Card size (grid)</label>
            </div>
            <div className={styles.toggleGroup}>
              {(["small", "medium", "large"] as CardDensity[]).map((d) => (
                <button key={d}
                  className={`${styles.toggleBtn} ${cardDensity === d ? styles.toggleActive : ""}`}
                  onClick={() => setDensity(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Server ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.server}</h2>
          <div className={styles.fieldGroup}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <label className={styles.fieldLabel} style={{ margin: 0 }}>{t.settings.serverUrl}</label>
              {isDirty && <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>● unsaved</span>}
            </div>
            <div className={styles.inputWithAction}>
              <input type="text" className={styles.input} value={serverUrl}
                onChange={(e) => { setServerUrl(e.target.value); setConnStatus("idle"); }}
                spellCheck={false} placeholder="https://localhost:3000"
              />
              <button
                className={`${styles.testBtn} ${connStatus === "ok" ? styles.testBtnOk : ""} ${connStatus === "fail" ? styles.testBtnFail : ""}`}
                onClick={testConnection} disabled={connStatus === "testing"}
              >
                {connStatus === "testing" && <span className={styles.testSpinner} />}
                {connStatus === "ok" && <CheckIcon />}
                {connStatus === "fail" && <AlertIcon />}
                {connStatus === "idle" && t.settings.testConnection}
                {connStatus === "testing" && t.settings.testing}
                {connStatus === "ok" && t.settings.connected}
                {connStatus === "fail" && t.settings.disconnected}
              </button>
              <button className={styles.testBtn} onClick={handleReset} title="Reset to build default" style={{ gap: 4, opacity: 0.75 }}>
                <ResetIcon /> Reset
              </button>
            </div>
            <p className={styles.fieldHint}>Persisted in localStorage. Default: <code>VITE_SERVER_URL</code>.</p>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t.settings.uploadDir}</label>
            <input type="text" className={styles.input} value={uploadDir}
              onChange={(e) => setUploadDir(e.target.value)}
              spellCheck={false} placeholder="/path/to/upload/dir"
            />
            <p className={styles.fieldHint}>{t.settings.uploadDirHint}</p>
          </div>

          <button className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ""}`} onClick={handleSave}>
            {saved ? `✓ ${t.settings.saved}` : t.settings.save}
          </button>
        </section>

        {/* ── Path display ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Path Display</h2>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Path prefixes to strip</label>
            <p className={styles.fieldHint}>
              These prefixes are removed from file paths when displaying documents.
              Path segments matching your tags are also automatically hidden.
            </p>
            <PathPrefixEditor />
          </div>
        </section>

      </div>
    </div>
  );
}
