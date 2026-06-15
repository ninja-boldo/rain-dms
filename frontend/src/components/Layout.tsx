import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useSettingsStore } from "../store/settings";
import { useUploadStore } from "../store/uploads";
import UploadPanel from "./UploadPanel";

export default function Layout() {
  const logout = useAuthStore((s) => s.logout);
  const username = useAuthStore((s) => s.username);
  const theme = useSettingsStore((s) => s.theme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const nav = useNavigate();

  const { isOpen, toggle, running, jobs } = useUploadStore();

  const activeCount = jobs.filter(
    (j) => j.status.state === "uploading" || j.status.state === "hashing",
  ).length;
  const pendingCount = jobs.filter((j) => j.status.state === "pending").length;
  const errorCount = jobs.filter((j) => j.status.state === "error").length;
  const badgeCount = running ? activeCount : pendingCount + errorCount;

  function handleLogout() {
    logout();
    nav("/login", { replace: true });
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 210,
          flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "16px 18px 12px",
            borderBottom: "1px solid var(--border-soft)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RainLogo />
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--text-1)",
                letterSpacing: "-0.02em",
              }}
            >
              rain<span style={{ color: "var(--accent)" }}>·dms</span>
            </span>
          </div>
          {username && (
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "0.68rem",
                color: "var(--text-3)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {username}
            </p>
          )}
        </div>

        {/* Upload button with badge */}
        <div style={{ padding: "10px 10px 4px" }}>
          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              gap: 6,
              padding: "8px",
              position: "relative",
            }}
            onClick={toggle}
          >
            <PlusIcon /> Upload
            {badgeCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: running
                    ? "var(--accent)"
                    : errorCount > 0
                      ? "var(--danger)"
                      : "var(--warn)",
                  color: running ? "var(--accent-fg)" : "#fff",
                  borderRadius: 999,
                  minWidth: 17,
                  height: 17,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  border: "2px solid var(--bg-surface)",
                  animation: running
                    ? "pulse 1.2s ease-in-out infinite"
                    : "none",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {badgeCount}
              </span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "4px 6px",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <SideLink to="/" label="Documents" icon={<DocsIcon />} end />
          <SideLink to="/search" label="Search" icon={<SearchIcon />} />
          <SideLink to="/stats" label="Stats" icon={<StatsIcon />} />
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: "6px",
            borderTop: "1px solid var(--border-soft)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <SideLink to="/settings" label="Settings" icon={<GearIcon />} />
          <button
            className="btn btn-ghost"
            style={{
              justifyContent: "flex-start",
              gap: 8,
              padding: "6px 10px",
              fontSize: "0.82rem",
            }}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            className="btn btn-ghost"
            style={{
              justifyContent: "flex-start",
              gap: 8,
              padding: "6px 10px",
              color: "var(--danger)",
              fontSize: "0.82rem",
            }}
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main — no key/refresh, pages auto-refresh via upload store lastCompletedAt */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "auto",
          background: "var(--bg-base)",
        }}
      >
        <Outlet />
      </main>

      {/* Persistent upload panel */}
      <UploadPanel />
    </div>
  );
}

function SideLink({
  to,
  label,
  icon,
  end,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 6,
        textDecoration: "none",
        fontSize: "0.82rem",
        fontWeight: 500,
        color: isActive ? "var(--accent)" : "var(--text-2)",
        background: isActive ? "var(--accent-glow)" : "transparent",
        transition: "background 0.1s, color 0.1s",
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
}

function RainLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
function PlusIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function DocsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function StatsIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
