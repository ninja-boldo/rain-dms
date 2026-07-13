import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useToastStore } from "../store/toast";
import { useI18n } from "../i18n";

function BellIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default function ErrorLogMenu() {
  const t = useI18n();
  const errorLog = useToastStore((s) => s.errorLog);
  const markRead = useToastStore((s) => s.markRead);
  const markAllRead = useToastStore((s) => s.markAllRead);
  const clearLog = useToastStore((s) => s.clearLog);

  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const DROPDOWN_WIDTH = 320;

  const unreadCount = errorLog.filter((e) => !e.read).length;

  function computePos() {
    if (!btnRef.current) return null;
    const rect = btnRef.current.getBoundingClientRect();
    // Anchor to the button's left edge and extend rightward, clamped so it
    // never runs off either edge of the viewport. `right: innerWidth - rect.right`
    // used to be assumed to sit near the right edge of the screen — but this
    // button can live anywhere (e.g. the left sidebar), which pushed the
    // dropdown back over whatever's to the left of it instead of opening
    // next to the bell.
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - DROPDOWN_WIDTH - 12,
    );
    return { top: rect.bottom + 6, left };
  }

  function toggle() {
    if (!open) {
      setPos(computePos());
      markAllRead();
    }
    setOpen((v) => !v);
  }

  // Keep the dropdown pinned under the bell if the viewport resizes while open.
  useEffect(() => {
    if (!open) return;
    function reposition() {
      setPos(computePos());
    }
    window.addEventListener("resize", reposition);
    return () => window.removeEventListener("resize", reposition);
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        onClick={toggle}
        title={t.err_menuTitle}
        aria-label={t.err_menuTitle}
        style={{
          position: "relative",
          background: "none",
          border: "1px solid var(--border-soft)",
          borderRadius: 8,
          padding: "6px 9px",
          cursor: "pointer",
          color: unreadCount > 0 ? "var(--danger)" : "var(--text-2)",
          display: "flex",
        }}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "var(--danger)",
              color: "#fff",
              borderRadius: 999,
              fontSize: "0.58rem",
              fontWeight: 700,
              minWidth: 14,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open &&
        pos &&
        createPortal(
          <>
            <div
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 900 }}
            />
            <div
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: DROPDOWN_WIDTH,
                maxWidth: "calc(100vw - 24px)",
                maxHeight: "min(420px, calc(100vh - 80px))",
                overflowY: "auto",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
                zIndex: 901,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-1)",
                  }}
                >
                  {t.err_menuTitle}
                </span>
                {errorLog.length > 0 && (
                  <button
                    onClick={clearLog}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-3)",
                      fontSize: "0.68rem",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {t.err_clearAll}
                  </button>
                )}
              </div>

              {errorLog.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    padding: "18px 12px",
                    fontSize: "0.76rem",
                    color: "var(--text-3)",
                    textAlign: "center",
                  }}
                >
                  {t.err_menuEmpty}
                </p>
              ) : (
                errorLog.map((e) => {
                  const isExpanded = expandedId === e.id;
                  return (
                    <div
                      key={e.id}
                      style={{ borderBottom: "1px solid var(--border-soft)" }}
                    >
                      <button
                        onClick={() => {
                          markRead(e.id);
                          setExpandedId((prev) =>
                            prev === e.id ? null : e.id,
                          );
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "8px 12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            color: "var(--text-1)",
                          }}
                        >
                          {!e.read && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "var(--danger)",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          {e.title}
                          {e.count > 1 && (
                            <span
                              style={{
                                color: "var(--text-3)",
                                fontWeight: 400,
                              }}
                            >
                              ×{e.count}
                            </span>
                          )}
                        </span>
                        <span
                          style={{
                            fontSize: "0.64rem",
                            color: "var(--text-3)",
                          }}
                        >
                          {new Date(e.createdAt).toLocaleString()}
                        </span>
                      </button>
                      {isExpanded && (
                        <div style={{ padding: "0 12px 10px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "0.7rem",
                              color: "var(--text-2)",
                              fontFamily: "JetBrains Mono, monospace",
                              background: "var(--bg-raised)",
                              border: "1px solid var(--border-soft)",
                              borderRadius: 6,
                              padding: "8px 9px",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {e.message || t.err_menuEmpty}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
