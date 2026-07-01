import { useSettingsStore } from "../store/settings";
import { useUrlPromptStore } from "../store/urlPrompt";
import { useI18n } from "../i18n";

/**
 * Whenever a banner image, page thumbnail, or file download resolves to a
 * URL whose origin differs from the page's own — a common source of CORS
 * failures for self-hosted setups reachable through several hostnames/IPs —
 * this offers a one-time substitution. Accepted substitutions are stored in
 * settings (revocable there); declining records the origin so we don't ask
 * again this browser. Never applied to uploads — reads only.
 */
export default function UrlSubstitutionPrompt() {
  const t = useI18n();
  const pendingOrigin = useUrlPromptStore((s) => s.pendingOrigin);
  const clearPending = useUrlPromptStore((s) => s.clearPending);
  const addUrlSubstitution = useSettingsStore((s) => s.addUrlSubstitution);
  const dismissOrigin = useSettingsStore((s) => s.dismissOrigin);

  if (!pendingOrigin || typeof window === "undefined") return null;
  const pageOrigin = window.location.origin;

  return (
    <div
      role="alertdialog"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 500,
        maxWidth: 480,
        margin: "0 auto",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg, 14px)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        padding: "14px 16px",
      }}
    >
      <p
        style={{
          margin: "0 0 4px",
          fontSize: "0.85rem",
          fontWeight: 700,
          color: "var(--text-1)",
        }}
      >
        {t.url_mismatchTitle}
      </p>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "0.76rem",
          color: "var(--text-2)",
          lineHeight: 1.5,
        }}
      >
        {t.url_mismatchBody(pendingOrigin, pageOrigin)}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          className="btn btn-ghost"
          style={{ fontSize: "0.78rem" }}
          onClick={() => {
            dismissOrigin(pendingOrigin);
            clearPending();
          }}
        >
          {t.url_decline}
        </button>
        <button
          className="btn btn-primary"
          style={{ fontSize: "0.78rem" }}
          onClick={() => {
            addUrlSubstitution(pendingOrigin, pageOrigin);
            clearPending();
          }}
        >
          {t.url_accept}
        </button>
      </div>
    </div>
  );
}
