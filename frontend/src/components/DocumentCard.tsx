import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Document } from "../api/client";
import AuthImage from "./AuthImage";
import { useI18n } from "../i18n";

interface Props {
  doc: Document;
}

function ext(key: string): string {
  if (!key) return "?";
  const parts = key.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "?";
}

function cleanFileName(key: string): string {
  if (!key) return "Unknown";
  const base = key.split("/").pop() ?? key;
  return base
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}(\.[^.]+)$/i,
      "$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[\.\dZ]*(\.[^.]+)$/i,
      "$1",
    );
}

function relTime(iso: string): string {
  if (!iso) return "—";
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}

export default function DocumentCard({ doc }: Props) {
  const t = useI18n();
  const nav = useNavigate();
  const [showPath, setShowPath] = useState(false);
  const e = ext(doc.fileS3Key ?? "");
  const name = cleanFileName(doc.fileS3Key ?? "");

  if (!doc.fileS3Key) return null;

  return (
    <div
      className="doc-card card cursor-pointer"
      onClick={() =>
        nav(`/document?filepath=${encodeURIComponent(doc.fileS3Key)}`)
      }
      style={{ minWidth: 0, overflow: "hidden" }}
    >
      {/* Banner */}
      <div
        style={{
          height: 130,
          overflow: "hidden",
          borderRadius: "9px 9px 0 0",
          background: "var(--bg-raised)",
          position: "relative",
        }}
      >
        {doc.banner_img ? (
          <AuthImage
            src={doc.banner_img}
            encryptedFileKey={doc.encrypted_file_key}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-3)",
              fontSize: "1.6rem",
              fontFamily: "JetBrains Mono, monospace",
              letterSpacing: "0.05em",
            }}
          >
            {e}
          </div>
        )}

        {/* Extension badge */}
        <span
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            background: "var(--badge-bg)",
            backdropFilter: "blur(8px)",
            color: "var(--accent)",
            fontSize: "0.62rem",
            fontWeight: 700,
            fontFamily: "JetBrains Mono, monospace",
            padding: "2px 5px",
            borderRadius: 4,
            letterSpacing: "0.05em",
            zIndex: 3,
          }}
        >
          {e}
        </span>

        {/* Stats button */}
        <button
          title={t.ft_openStats}
          aria-label={t.ft_openStats}
          onClick={(ev) => {
            ev.stopPropagation();
            nav(`/file-stats?filepath=${encodeURIComponent(doc.fileS3Key)}`);
          }}
          style={{
            position: "absolute",
            top: 7,
            right: 38,
            background: "var(--badge-bg)",
            backdropFilter: "blur(8px)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            color: "var(--text-1)",
            fontSize: "0.72rem",
            padding: "3px 6px",
            lineHeight: 1,
            zIndex: 4,
          }}
        >
          ⎙
        </button>

        {/* ⓘ path reveal */}
        <button
          title={t.ft_showPath}
          aria-label={t.ft_showPath}
          onClick={(ev) => {
            ev.stopPropagation();
            setShowPath((v) => !v);
          }}
          style={{
            position: "absolute",
            top: 7,
            left: 7,
            background: "var(--badge-bg)",
            backdropFilter: "blur(8px)",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            color: "var(--text-1)",
            fontSize: "0.72rem",
            padding: "3px 6px",
            lineHeight: 1,
            opacity: showPath ? 1 : 0.65,
            transition: "opacity 0.15s",
            zIndex: 4,
          }}
          className="card-info-btn"
        >
          ⓘ
        </button>

        {/* Full path overlay */}
        {showPath && (
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--overlay-bg)",
              backdropFilter: "blur(3px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px",
              gap: 6,
              zIndex: 5,
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                fontFamily: "JetBrains Mono, monospace",
                color: "var(--text-1)",
                wordBreak: "break-all",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {doc.fileS3Key}
            </span>
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                setShowPath(false);
              }}
              className="btn btn-ghost"
              style={{ fontSize: "0.65rem", padding: "2px 8px" }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Meta */}
      <div
        style={{ padding: "9px 11px 11px", minWidth: 0, overflow: "hidden" }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "JetBrains Mono, monospace",
          }}
          title={name}
        >
          {name}
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>
            {relTime(doc.created_at)}
          </span>
          <span
            style={{
              fontSize: "0.68rem",
              color: "var(--text-3)",
              marginLeft: "auto",
            }}
          >
            {doc.page_count}p
          </span>
        </div>

        {doc.assigned_tags?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              marginTop: 7,
              minWidth: 0,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {doc.assigned_tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="tag"
                style={{
                  pointerEvents: "none",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
                title={t}
              >
                {t}
              </span>
            ))}
            {doc.assigned_tags.length > 3 && (
              <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>
                +{doc.assigned_tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <style>{`.doc-card:hover .card-info-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}
