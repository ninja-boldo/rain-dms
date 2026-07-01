import { useState } from "react";
import { useAuthStore } from "../store/auth";
import { useSettingsStore, ACCENT_PRESETS } from "../store/settings";
import type { AccentKey } from "../store/settings";
import type { Lang } from "../store/settings";
import { DEFAULT_ALLOWED_EXTENSIONS } from "../store/settings";
import { useI18n } from "../i18n";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "0.68rem",
          fontWeight: 600,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {title}
      </h3>
      <div className="card" style={{ overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  sub,
  last,
  children,
}: {
  label: string;
  sub?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "11px 14px",
        borderBottom: last ? "none" : "1px solid var(--border-soft)",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-raised)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.83rem",
            color: "var(--text-1)",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        {sub && (
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.7rem",
              color: "var(--text-3)",
              lineHeight: 1.4,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 38,
        height: 20,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: value ? "var(--accent)" : "var(--bg-hover)",
        position: "relative",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: value ? 19 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

const ACCENT_LABELS: Record<AccentKey, string> = {
  amber: "Amber",
  teal: "Teal",
  sky: "Sky",
  violet: "Violet",
  rose: "Rose",
  lime: "Lime",
  custom: "Custom",
};

export default function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const apiUrl = useSettingsStore((s) => s.apiUrl);
  const setApiUrl = useSettingsStore((s) => s.setApiUrl);
  const accent = useSettingsStore((s) => s.accent);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const customAccent = useSettingsStore((s) => s.customAccent);
  const setCustomAccent = useSettingsStore((s) => s.setCustomAccent);
  const urlSubstitutions = useSettingsStore((s) => s.urlSubstitutions);
  const removeUrlSubstitution = useSettingsStore((s) => s.removeUrlSubstitution);
  const simulatedTagPaths = useSettingsStore((s) => s.simulatedTagPaths);
  const setSimulatedTagPaths = useSettingsStore((s) => s.setSimulatedTagPaths);
  const lang = useSettingsStore((s) => s.lang);
  const setLang = useSettingsStore((s) => s.setLang);
  const allowedUploadExtensions = useSettingsStore(
    (s) => s.allowedUploadExtensions,
  );
  const setAllowedUploadExtensions = useSettingsStore(
    (s) => s.setAllowedUploadExtensions,
  );
  const t = useI18n();

  const username = useAuthStore((s) => s.username);
  const mainKey = useAuthStore((s) => s.mainEncryptionKey);
  const encEnabled = useAuthStore((s) => s.encryptionEnabled);
  const setEncEnabled = useAuthStore((s) => s.setEncryptionEnabled);

  const [apiDraft, setApiDraft] = useState(apiUrl);
  const [saved, setSaved] = useState(false);
  const [simDraft, setSimDraft] = useState(simulatedTagPaths.join("\n"));
  const [simSaved, setSimSaved] = useState(false);

  function saveApi() {
    setApiUrl(apiDraft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveSimulated() {
    const lines = simDraft
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setSimulatedTagPaths(lines);
    setSimSaved(true);
    setTimeout(() => setSimSaved(false), 2000);
  }

  return (
    <div
      style={{
        padding: "22px",
        maxWidth: 580,
        margin: "0 auto",
        overflowY: "auto",
        height: "100%",
      }}
    >
      <h2 style={{ margin: "0 0 20px", fontSize: "0.95rem", fontWeight: 700 }}>
        Settings
      </h2>

      {/* Appearance */}
      <Section title={t.st_language}>
        <Row label={t.st_language} sub={t.st_langSub} last>
          <div style={{ display: "flex", gap: 5 }}>
            {(["en", "de"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="btn"
                style={{
                  fontSize: "0.78rem",
                  padding: "4px 12px",
                  background:
                    lang === l ? "var(--accent-glow)" : "var(--bg-raised)",
                  border: `1px solid ${lang === l ? "var(--accent)" : "var(--border)"}`,
                  color: lang === l ? "var(--accent)" : "var(--text-2)",
                }}
              >
                {l === "en" ? t.st_english : t.st_german}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Upload filters">
        <Row
          label="Allowed file extensions"
          sub="Only files with these extensions will be accepted. One per line (with dot). Clear to disable filter."
          last
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <textarea
              className="input"
              style={{
                minHeight: 80,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.75rem",
                resize: "vertical",
              }}
              value={allowedUploadExtensions.join("\n")}
              onChange={(e) => {
                const lines = e.target.value
                  .split("\n")
                  .map((l) => l.trim().toLowerCase())
                  .filter((l) => l.startsWith("."));
                setAllowedUploadExtensions(lines);
              }}
              placeholder=".pdf&#10;.png&#10;.jpg"
            />
            <div style={{ display: "flex", gap: 5 }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.72rem" }}
                onClick={() =>
                  setAllowedUploadExtensions(DEFAULT_ALLOWED_EXTENSIONS)
                }
              >
                Reset to defaults
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.72rem" }}
                onClick={() => setAllowedUploadExtensions([])}
              >
                Clear (block-list mode)
              </button>
            </div>
            <p
              style={{ margin: 0, fontSize: "0.66rem", color: "var(--text-3)" }}
            >
              Current:{" "}
              {allowedUploadExtensions.length
                ? allowedUploadExtensions.join(" ")
                : "using built-in block-list"}
            </p>
          </div>
        </Row>
      </Section>

      <Section title="Appearance">
        <Row label="Theme" sub={`Currently ${theme} mode`}>
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            style={{ fontSize: "0.78rem" }}
          >
            {theme === "dark" ? "☀ Light" : "☾ Dark"}
          </button>
        </Row>
        <div style={{ padding: "12px 14px" }}>
          <p
            style={{
              margin: "0 0 9px",
              fontSize: "0.83rem",
              fontWeight: 500,
              color: "var(--text-1)",
            }}
          >
            {t.st_accent}
          </p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
            {(Object.keys(ACCENT_PRESETS) as (keyof typeof ACCENT_PRESETS)[]).map((key) => {
              const p = ACCENT_PRESETS[key];
              const active = accent === key;
              return (
                <button
                  key={key}
                  onClick={() => setAccent(key)}
                  title={ACCENT_LABELS[key]}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 11px",
                    border: `2px solid ${active ? p.accent : "transparent"}`,
                    borderRadius: 7,
                    background: active ? p.glow : "var(--bg-raised)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: p.accent,
                      flexShrink: 0,
                      boxShadow: `0 0 5px ${p.accent}77`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: active ? p.accent : "var(--text-2)",
                    }}
                  >
                    {ACCENT_LABELS[key]}
                  </span>
                </button>
              );
            })}

            {/* Custom accent — any color, palette derived automatically */}
            <label
              title={t.st_accentCustom}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 11px",
                border: `2px solid ${accent === "custom" ? (customAccent ?? "var(--accent)") : "transparent"}`,
                borderRadius: 7,
                background: accent === "custom" ? "var(--accent-glow)" : "var(--bg-raised)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background:
                    accent === "custom" && customAccent ? customAccent : "conic-gradient(from 0deg, #f59e0b, #fb7185, #a78bfa, #38bdf8, #84cc16, #f59e0b)",
                  flexShrink: 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <input
                  type="color"
                  value={customAccent ?? "#e8973a"}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  style={{
                    position: "absolute",
                    inset: -4,
                    opacity: 0,
                    cursor: "pointer",
                    width: 18,
                    height: 18,
                  }}
                />
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: accent === "custom" ? "var(--accent)" : "var(--text-2)",
                }}
              >
                {t.st_accentCustom}
              </span>
            </label>
          </div>
          <p
            style={{
              margin: "7px 0 0",
              fontSize: "0.67rem",
              color: "var(--text-3)",
            }}
          >
            {t.st_accentHint} {t.st_accentCustomHint}
          </p>
        </div>
      </Section>

      {/* Base URL substitutions — CORS fix for banner images / downloads */}
      <Section title={t.st_urlSubs}>
        <div style={{ padding: "12px 14px" }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "0.72rem",
              color: "var(--text-3)",
              lineHeight: 1.5,
            }}
          >
            {t.st_urlSubsHint}
          </p>
          {urlSubstitutions.length === 0 ? (
            <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-3)" }}>
              {t.st_urlSubsEmpty}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {urlSubstitutions.map((sub) => (
                <div
                  key={sub.from}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 7,
                    fontSize: "0.72rem",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  <span style={{ color: "var(--text-2)", wordBreak: "break-all" }}>
                    {sub.from}
                  </span>
                  <span style={{ color: "var(--text-3)", flexShrink: 0 }}>→</span>
                  <span style={{ color: "var(--accent)", wordBreak: "break-all", flex: 1 }}>
                    {sub.to}
                  </span>
                  <button
                    className="btn btn-ghost"
                    onClick={() => removeUrlSubstitution(sub.from)}
                    style={{
                      fontSize: "0.68rem",
                      padding: "2px 8px",
                      color: "var(--danger)",
                      flexShrink: 0,
                    }}
                  >
                    {t.st_urlSubsRevoke}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Simulated tag structure */}
      <Section title={t.st_tree}>
        <div style={{ padding: "12px 14px" }}>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "0.83rem",
              color: "var(--text-1)",
              fontWeight: 500,
            }}
          >
            Virtual folder paths
          </p>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "0.72rem",
              color: "var(--text-3)",
              lineHeight: 1.5,
            }}
          >
            Enter one tag path per line. Use{" "}
            <span className="mono" style={{ color: "var(--text-2)" }}>
              /
            </span>{" "}
            to nest folders, e.g.{" "}
            <span className="mono" style={{ color: "var(--text-2)" }}>
              Finance/2024/Q1
            </span>
            . These appear as <em>italic</em> ghost folders in the tag tree —
            useful for planning your structure without touching any documents.
          </p>
          <textarea
            value={simDraft}
            onChange={(e) => setSimDraft(e.target.value)}
            placeholder={"Finance/2024/Q1\nLegal/Contracts\nHR/Onboarding"}
            rows={5}
            style={{
              width: "100%",
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text-1)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.75rem",
              padding: "8px 10px",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.7,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 8,
              gap: 6,
            }}
          >
            {simulatedTagPaths.length > 0 && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.75rem" }}
                onClick={() => {
                  setSimDraft("");
                  setSimulatedTagPaths([]);
                }}
              >
                Clear
              </button>
            )}
            <button
              className="btn btn-primary"
              style={{ fontSize: "0.75rem" }}
              onClick={saveSimulated}
            >
              {simSaved ? "✓ Saved" : "Apply"}
            </button>
          </div>
          {simulatedTagPaths.length > 0 && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "0.68rem",
                color: "var(--text-3)",
              }}
            >
              {simulatedTagPaths.length} simulated path
              {simulatedTagPaths.length !== 1 ? "s" : ""} active. Switch to Tree
              → By tags in Documents to preview.
            </p>
          )}
        </div>
      </Section>

      {/* Connection */}
      <Section title="Connection">
        <div style={{ padding: "12px 14px" }}>
          <label className="label">API base URL</label>
          <div style={{ display: "flex", gap: 7, marginTop: 4 }}>
            <input
              className="input"
              value={apiDraft}
              onChange={(e) => setApiDraft(e.target.value)}
              placeholder="https://192.168.1.188:7443/api"
              style={{
                flex: 1,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.75rem",
              }}
            />
            <button
              className="btn btn-primary"
              onClick={saveApi}
              style={{ flexShrink: 0, fontSize: "0.78rem" }}
            >
              {saved ? "✓" : "Save"}
            </button>
          </div>
          <p
            style={{
              margin: "5px 0 0",
              fontSize: "0.67rem",
              color: "var(--text-3)",
            }}
          >
            Auto-detected from{" "}
            <span className="mono" style={{ color: "var(--text-2)" }}>
              {window.location.origin}/api
            </span>{" "}
            on first load.
          </p>
        </div>
      </Section>

      {/* Encryption */}
      <Section title="Encryption">
        <Row
          label="Client-side decryption"
          sub="Decrypt files and banner images in-browser using your password-derived key"
        >
          <Toggle value={encEnabled} onChange={setEncEnabled} />
        </Row>
        <div style={{ padding: "10px 14px" }}>
          <p
            style={{
              margin: "0 0 5px",
              fontSize: "0.78rem",
              color: "var(--text-2)",
              fontWeight: 500,
            }}
          >
            Main encryption key
          </p>
          <div
            className="mono"
            style={{
              padding: "7px 9px",
              background: "var(--bg-raised)",
              borderRadius: 6,
              fontSize: "0.68rem",
              border: "1px solid var(--border)",
              color: mainKey ? "var(--success)" : "var(--text-3)",
              wordBreak: "break-all",
            }}
          >
            {mainKey
              ? `${mainKey.slice(0, 16)}… (${mainKey.length} chars) — unlocked ✓`
              : "Not available — sign in again to derive from password"}
          </div>
        </div>
      </Section>

      {/* Account */}
      <Section title="Account">
        <Row label="Signed in as" sub="JWT stored in localStorage" last>
          <span
            className="mono"
            style={{ fontSize: "0.8rem", color: "var(--accent)" }}
          >
            {username ?? "—"}
          </span>
        </Row>
      </Section>

      {/* About */}
      <Section title="About">
        <Row label="rain·dms" sub="Self-hosted document management system">
          <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
            v1.0.0
          </span>
        </Row>
        <Row
          label="Stack"
          sub="Bun · Hono · SeaweedFS · RabbitMQ · PaddleOCR · Meilisearch"
        >
          <span
            className="mono"
            style={{ fontSize: "0.67rem", color: "var(--text-3)" }}
          >
            self-hosted
          </span>
        </Row>
        <Row
          label="OCR format"
          sub="upLeftPoint / downRightPoint bounding boxes · PP-OCRv5"
          last
        >
          <a
            href="https://github.com/ninja-boldo"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: "0.72rem", textDecoration: "none" }}
          >
            GitHub ↗
          </a>
        </Row>
      </Section>
    </div>
  );
}
