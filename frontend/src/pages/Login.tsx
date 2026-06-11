import React, { useState } from "react";
import { useApp } from "../lib/AppContext";
import { login as doLogin } from "../lib/utils";
import styles from "./Login.module.css";

export default function Login() {
  const { settings, setSettings, login, t } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [serverInput, setServerInput] = useState(settings.serverUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);
    const serverUrl = advanced ? serverInput.trim() : settings.serverUrl;
    if (advanced && serverInput.trim() !== settings.serverUrl) {
      setSettings({ ...settings, serverUrl: serverInput.trim() });
    }
    const result = await doLogin(username.trim(), password.trim(), serverUrl);
    if (result.ok && result.token) {
      await login(username.trim(), result.token);
    } else {
      setError(result.error ?? t.auth.loginFailed);
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>
            rain<span className={styles.logoAccent}>.dms</span>
          </span>
          <p className={styles.subtitle}>{t.auth.subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>{t.auth.username}</label>
            <input
              className={styles.input}
              type="text"
              autoComplete="username"
              placeholder={t.auth.usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.auth.password}</label>
            <div className={styles.pwWrap}>
              <input
                className={styles.input}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
              >
                {showPw ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? t.auth.signingIn : t.auth.signIn}
          </button>
        </form>

        <button
          className={styles.advancedToggle}
          onClick={() => setAdvanced((v) => !v)}
        >
          {advanced ? "▲" : "▼"} {t.auth.advancedSettings}
        </button>

        {advanced && (
          <div className={styles.advanced}>
            <label className={styles.label}>{t.auth.serverUrl}</label>
            <input
              className={styles.input}
              type="text"
              value={serverInput}
              onChange={(e) => setServerInput(e.target.value)}
              spellCheck={false}
            />
            <p className={styles.hint}>{t.auth.newUserHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
