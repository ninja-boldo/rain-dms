import { useToastStore } from "../store/toast";
import type { ToastKind } from "../store/toast";
import { useI18n } from "../i18n";

const KIND_STYLE: Record<
  ToastKind,
  { border: string; bg: string; fg: string }
> = {
  error: {
    border: "rgba(248,113,113,0.4)",
    bg: "rgba(248,113,113,0.1)",
    fg: "var(--danger)",
  },
  success: {
    border: "rgba(52,211,153,0.4)",
    bg: "rgba(52,211,153,0.1)",
    fg: "var(--success)",
  },
  info: {
    border: "rgba(56,189,248,0.4)",
    bg: "rgba(56,189,248,0.1)",
    fg: "#38bdf8",
  },
};

function KindIcon({ kind }: { kind: ToastKind }) {
  if (kind === "error") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (kind === "success") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default function ToastHost() {
  const t = useI18n();
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: 340,
        maxWidth: "calc(100vw - 28px)",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        const style = KIND_STYLE[toast.kind];
        return (
          <div
            key={toast.id}
            role="alert"
            style={{
              pointerEvents: "auto",
              background: "var(--bg-surface)",
              border: `1px solid ${style.border}`,
              borderRadius: 9,
              boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
              padding: "9px 10px 9px 11px",
              display: "flex",
              gap: 9,
              alignItems: "flex-start",
              animation: "toast-in 0.16s ease-out",
            }}
          >
            <div style={{ color: style.fg, flexShrink: 0, marginTop: 1 }}>
              <KindIcon kind={toast.kind} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-1)",
                }}
              >
                {toast.title}
                {toast.count > 1 && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      color: style.fg,
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      borderRadius: 999,
                      padding: "0 5px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    ×{toast.count}
                  </span>
                )}
              </div>
              {toast.message && (
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "0.71rem",
                    color: "var(--text-2)",
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              title={t.err_dismiss}
              aria-label={t.err_dismiss}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-3)",
                cursor: "pointer",
                fontSize: "0.75rem",
                padding: "0 2px",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
