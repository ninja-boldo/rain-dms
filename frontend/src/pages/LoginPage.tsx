import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signIn, signUp } from "../api/client";
import { useAuthStore } from "../store/auth";
import { useSettingsStore } from "../store/settings";
import { decryptMainEncryptionKey } from "../utils/crypto";
import { useI18n } from "../i18n";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const t = useI18n();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const apiUrl = useSettingsStore((s) => s.apiUrl);
  const setApiUrl = useSettingsStore((s) => s.setApiUrl);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);

  const nextPath = (() => {
    const raw = searchParams.get("next");
    if (!raw) return "/";
    try {
      const decoded = decodeURIComponent(raw);
      if (!decoded.startsWith("/")) return "/";
      return decoded;
    } catch {
      return "/";
    }
  })();

  const reason = searchParams.get("reason");

  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdv, setShowAdv] = useState(false);
  const [apiDraft, setApiDraft] = useState(apiUrl);

  function saveApi() {
    setApiUrl(apiDraft);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Apply any unsaved API URL changes
    if (apiDraft !== apiUrl) setApiUrl(apiDraft);

    try {
      if (mode === "signup") {
        await signUp(username.trim(), password);
        setMode("signin");
        setPassword("");
        setLoading(false);
        return;
      }

      const res = await signIn(username.trim(), password);

      let mainKey: string | null = null;
      if (res.encrypted_encrytion_key) {
        try {
          mainKey = await decryptMainEncryptionKey(
            res.encrypted_encrytion_key,
            password,
          );
        } catch (err) {
          console.warn("[login] main key decrypt failed:", err);
        }
      }

      setAuth(res.token, username.trim(), mainKey);
      nav(nextPath, { replace: true });
    } catch (err: any) {
      setError(err.message ?? t.lg_something);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Language toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
            marginBottom: 12,
          }}
        >
          {(["en", "de"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                background: lang === l ? "var(--accent-glow)" : "none",
                border: `1px solid ${lang === l ? "var(--accent)" : "var(--border-soft)"}`,
                borderRadius: 5,
                cursor: "pointer",
                color: lang === l ? "var(--accent)" : "var(--text-3)",
                fontSize: "0.68rem",
                fontWeight: 600,
                padding: "2px 9px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <RainLogo />
          <h1
            style={{
              margin: "10px 0 4px",
              fontSize: "1.65rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-1)",
            }}
          >
            rain<span style={{ color: "var(--accent)" }}>-dms</span>
          </h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-3)" }}>
            {t.lg_dmsSub}
          </p>
        </div>

        {reason === "unauth" && (
          <p
            style={{
              margin: "0 0 14px",
              padding: "8px 12px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 6,
              color: "var(--warn)",
              fontSize: "0.78rem",
              textAlign: "center",
            }}
          >
            {t.lg_sessionExpired}
          </p>
        )}

        {/* Card */}
        <div className="card" style={{ padding: "24px 24px 20px" }}>
          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-raised)",
              borderRadius: 7,
              padding: 3,
              marginBottom: 20,
            }}
          >
            {(["signin", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                style={{
                  flex: 1,
                  padding: "6px",
                  border: "none",
                  borderRadius: 5,
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  background: mode === m ? "var(--bg-surface)" : "transparent",
                  color: mode === m ? "var(--text-1)" : "var(--text-3)",
                  boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                }}
              >
                {m === "signin" ? t.lg_signin : t.lg_signup}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 13 }}
          >
            <div>
              <label className="label">{t.lg_username}</label>
              <input
                className="input"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">{t.lg_password}</label>
              <input
                className="input"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p
                style={{
                  margin: 0,
                  padding: "8px 12px",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: 6,
                  color: "var(--danger)",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </p>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{
                justifyContent: "center",
                padding: "9px",
                marginTop: 2,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? t.lg_working
                : mode === "signin"
                  ? t.lg_signin
                  : t.lg_create}
            </button>
          </form>

          {/* Advanced / API URL */}
          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid var(--border-soft)",
              paddingTop: 12,
            }}
          >
            <button
              onClick={() => setShowAdv((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transition: "transform 0.15s",
                  transform: showAdv ? "rotate(90deg)" : "none",
                }}
              >
                ›
              </span>{" "}
              {t.lg_advanced}
            </button>

            {showAdv && (
              <div style={{ marginTop: 10 }}>
                <label className="label">{t.lg_apiUrl}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="input"
                    value={apiDraft}
                    onChange={(e) => setApiDraft(e.target.value)}
                    placeholder={t.lg_apiUrlPh}
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.75rem",
                    }}
                  />
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={saveApi}
                    style={{ flexShrink: 0, fontSize: "0.78rem" }}
                  >
                    {t.lg_save}
                  </button>
                </div>
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "0.7rem",
                    color: "var(--text-3)",
                  }}
                >
{t.lg_apiUrlHint(window.location.origin)}
                </p>
              </div>
            )}
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: "0.7rem",
            color: "var(--text-3)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {t.lg_tagline}
        </p>
      </div>
    </div>
  );
}

function RainLogo() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ margin: "0 auto", display: "block" }}
    >
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
      <line x1="8" y1="16" x2="8" y2="22" />
      <line x1="8" y1="22" x2="6" y2="19" />
      <line x1="12" y1="17" x2="12" y2="23" />
      <line x1="12" y1="23" x2="10" y2="20" />
      <line x1="16" y1="16" x2="16" y2="22" />
      <line x1="16" y1="22" x2="14" y2="19" />
    </svg>
  );
}
