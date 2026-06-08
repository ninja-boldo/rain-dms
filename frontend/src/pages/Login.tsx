import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { login as apiLogin } from "../lib/utils";
import { useApp } from "../lib/AppContext";

const EyeOpenIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    style={{
      transform: open ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Login() {
  const { settings, setSettings, login, t } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [serverUrlDraft, setServerUrlDraft] = useState(settings.serverUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Persist any server URL change before attempting auth
    const activeUrl = serverUrlDraft.trim() || settings.serverUrl;
    if (activeUrl !== settings.serverUrl) {
      setSettings({ ...settings, serverUrl: activeUrl });
    }

    const result = await apiLogin(username, password, activeUrl);
    setLoading(false);

    if (result.ok && result.token) {
      await login(username, result.token);
      navigate("/");
    } else {
      setError(result.error ?? t.auth.loginFailed);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <span className={styles.logo}>
            rain<span className={styles.logoAccent}>.dms</span>
          </span>
        </div>
        <p className={styles.subtitle}>{t.auth.subtitle}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t.auth.username}</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              spellCheck={false}
              placeholder={t.auth.usernamePlaceholder}
              disabled={loading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t.auth.password}</label>
            <div className={styles.passWrap}>
              <input
                className={styles.input}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder={t.auth.passwordPlaceholder}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                title={showPass ? t.auth.hidePassword : t.auth.showPassword}
              >
                {showPass ? <EyeOffIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
            type="submit"
            disabled={loading || !username || !password}
          >
            {loading ? <span className={styles.spinner} /> : t.auth.signIn}
          </button>
        </form>

        {/* Advanced settings toggle */}
        <button
          className={styles.advancedToggle}
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <ChevronIcon open={showAdvanced} />
          {t.auth.advancedSettings}
        </button>

        {showAdvanced && (
          <div className={styles.advancedPanel}>
            <label className={styles.advancedLabel}>{t.auth.serverUrl}</label>
            <input
              className={styles.advancedInput}
              type="text"
              value={serverUrlDraft}
              onChange={(e) => setServerUrlDraft(e.target.value)}
              spellCheck={false}
              placeholder="https://localhost:3000"
            />
          </div>
        )}

        <p className={styles.hintRow}>{t.auth.newUserHint}</p>
      </div>
    </div>
  );
}
