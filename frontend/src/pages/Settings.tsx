import React, { useState } from "react";
import { useApp } from "../lib/AppContext";
import styles from "./Settings.module.css";

export default function Settings() {
  const { t, theme, setTheme, language, setLanguage, settings, setSettings } =
    useApp();

  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [uploadDir, setUploadDir] = useState(settings.uploadDir);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSettings({ serverUrl, uploadDir });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.settings.title}</h1>
      </header>

      <div className={styles.sections}>
        {/* Appearance */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.appearance}</h2>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>{t.settings.theme}</label>
            </div>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${theme === "light" ? styles.toggleActive : ""}`}
                onClick={() => setTheme("light")}
              >
                <span className={styles.toggleIcon}>☀</span>{" "}
                {t.settings.themeLight}
              </button>
              <button
                className={`${styles.toggleBtn} ${theme === "dark" ? styles.toggleActive : ""}`}
                onClick={() => setTheme("dark")}
              >
                <span className={styles.toggleIcon}>◐</span>{" "}
                {t.settings.themeDark}
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <label className={styles.rowLabel}>{t.settings.language}</label>
            </div>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${language === "de" ? styles.toggleActive : ""}`}
                onClick={() => setLanguage("de")}
              >
                🇩🇪 Deutsch
              </button>
              <button
                className={`${styles.toggleBtn} ${language === "en" ? styles.toggleActive : ""}`}
                onClick={() => setLanguage("en")}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </section>

        {/* Server */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.server}</h2>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t.settings.serverUrl}</label>
            <input
              type="text"
              className={styles.input}
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              spellCheck={false}
              placeholder="http://localhost:3000"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>{t.settings.uploadDir}</label>
            <input
              type="text"
              className={styles.input}
              value={uploadDir}
              onChange={(e) => setUploadDir(e.target.value)}
              spellCheck={false}
              placeholder="/path/to/upload/dir"
            />
            <p className={styles.fieldHint}>
              Das Verzeichnis, in das hochgeladene Dokumente verschoben werden.
            </p>
          </div>

          <button
            className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ""}`}
            onClick={handleSave}
          >
            {saved ? `✓ ${t.settings.saved}` : t.settings.save}
          </button>
        </section>
      </div>
    </div>
  );
}
