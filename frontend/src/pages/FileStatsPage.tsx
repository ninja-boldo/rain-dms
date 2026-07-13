import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDocument, getPages, getStats } from "../api/client";
import type { Document } from "../api/client";
import { useLocalStore, type LocalMarker } from "../store/localData";
import { useI18n } from "../i18n";
import { reportSuccess } from "../store/toast";
import { cleanFileName } from "../utils/filename";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtRel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Duration between pipeline spawn and doc creation — "how long did OCR/ingest actually take". */
function fmtDuration(
  fromIso: string | null | undefined,
  toIso: string | null | undefined,
): string | null {
  if (!fromIso || !toIso) return null;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  const diffMs = to - from;
  if (diffMs < 0) return null;
  if (diffMs < 1000) return `${diffMs}ms`;
  if (diffMs < 60_000) return `${(diffMs / 1000).toFixed(1)}s`;
  if (diffMs < 3_600_000)
    return `${Math.floor(diffMs / 60_000)}m ${Math.round((diffMs % 60_000) / 1000)}s`;
  return `${Math.floor(diffMs / 3_600_000)}h ${Math.floor((diffMs % 3_600_000) / 60_000)}m`;
}

function diffSeconds(
  fromIso: string | null | undefined,
  toIso: string | null | undefined,
): number | null {
  if (!fromIso || !toIso) return null;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  const diffMs = to - from;
  return diffMs >= 0 ? diffMs / 1000 : null;
}

interface Stats {
  doc: Document | null;
  pageCount: number;
  totalBoxes: number;
  pagesWithOcr: number;
}

function countOcrBoxes(pages: { ocr: any }[]): number {
  let n = 0;
  function walk(node: any) {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object") return;
    if (Array.isArray((node as any).boxes)) {
      n += (node as any).boxes.length;
      (node as any).boxes.forEach(walk);
      return;
    }
    if (Array.isArray((node as any).lines)) {
      (node as any).lines.forEach(walk);
      return;
    }
    if (Array.isArray((node as any).words)) {
      (node as any).words.forEach(walk);
    }
  }
  pages.forEach((p) => walk(p.ocr));
  return n;
}

function countPagesWithOcr(pages: { ocr: any }[]): number {
  return pages.filter((p) => countOcrBoxes([p]) > 0).length;
}

export default function FileStatsPage() {
  const t = useI18n();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const filepath = searchParams.get("filepath") ?? "";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderDraft, setReminderDraft] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [sysIngestAvgSec, setSysIngestAvgSec] = useState<number | null>(null);

  const { markers, reminder, setMarkers, setReminder } = useLocalStore(
    filepath || null,
  );

  useEffect(() => {
    getStats()
      .then((s: any) => {
        const avg = s?.ingest_duration?.avg_seconds;
        if (typeof avg === "number" && avg > 0) setSysIngestAvgSec(avg);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!filepath) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getDocument(filepath),
      getPages(filepath, { includeOcr: true }),
    ])
      .then(([d, p]) => {
        setStats({
          doc: d,
          pageCount: p.pages.length,
          totalBoxes: countOcrBoxes(p.pages),
          pagesWithOcr: countPagesWithOcr(p.pages),
        });
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filepath]);

  useEffect(() => {
    setReminderDraft(toDatetimeLocal(reminder.at));
    setReminderNote(reminder.note ?? "");
  }, [reminder.at, reminder.note]);

  function saveReminder() {
    const iso =
      reminderDraft && reminderDraft.length > 0
        ? new Date(reminderDraft).toISOString()
        : null;
    setReminder({
      at: iso,
      note: reminderNote || null,
      done_at: reminder.done_at,
      created_at: reminder.created_at ?? new Date().toISOString(),
    });
  }

  function markDone() {
    setReminder({
      at: reminder.at,
      note: reminder.note,
      done_at: new Date().toISOString(),
    });
  }

  function removeMarker(marker: LocalMarker) {
    setMarkers((prev) => prev.filter((m) => m.box_key !== marker.box_key));
  }

  function clearMarkers() {
    if (typeof window !== "undefined" && !window.confirm(t.fs_removeAllConfirm))
      return;
    setMarkers([]);
  }

  if (!filepath) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "var(--danger)" }}>{t.fs_missing}</p>
        <button className="btn btn-ghost" onClick={() => nav(-1)}>
          {t.fs_back}
        </button>
      </div>
    );
  }

  const displayName = cleanFileName(filepath);
  const doc = stats?.doc;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
          background: "var(--bg-surface)",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => nav(-1)}
          style={{ padding: "3px 8px", fontSize: "0.78rem" }}
        >
          {t.fs_back}
        </button>
        <button
          className="btn btn-ghost"
          onClick={() =>
            nav(`/document?filepath=${encodeURIComponent(filepath)}`)
          }
          style={{ padding: "3px 8px", fontSize: "0.78rem" }}
        >
          {t.fs_open}
        </button>
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <p
            className="mono"
            style={{
              margin: 0,
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--text-1)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={filepath}
          >
            {displayName}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.64rem",
              color: "var(--text-3)",
              fontFamily: "JetBrains Mono, monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={filepath}
          >
            {filepath}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
        {loading && !stats && (
          <p style={{ color: "var(--text-3)" }}>{t.fs_loading}</p>
        )}
        {error && (
          <p
            style={{
              color: "var(--danger)",
              padding: "8px 12px",
              background: "rgba(248,113,113,0.07)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 6,
              fontSize: "0.8rem",
              marginBottom: 14,
            }}
          >
            {error}
          </p>
        )}
        {stats && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <StatCard label={t.fs_pages} value={String(stats.pageCount)} />
              <StatCard
                label={t.fs_ocrBoxes}
                value={stats.totalBoxes.toLocaleString()}
              />
              <StatCard
                label={t.fs_markers}
                value={String(markers.length)}
                accent={markers.length > 0}
              />
              <StatCard
                label={t.fs_tags}
                value={String(doc?.assigned_tags?.length ?? 0)}
              />
              <StatCard
                label={t.fs_encrypted}
                value={(doc as any)?.encrypted_file_key ? t.fs_yes : t.fs_no}
              />
            </div>

            <Section title={t.fs_timeline}>
              <KV
                label={t.fs_created}
                value={fmtDate(doc?.created_at)}
                hint={fmtRel(doc?.created_at)}
              />
              {(doc as any)?.spawned_time && (
                <KV
                  label={t.fs_pipelineAt}
                  value={fmtDate((doc as any).spawned_time)}
                  hint={
                    fmtDuration((doc as any).spawned_time, doc?.created_at)
                      ? `${fmtRel((doc as any).spawned_time)} · ${fmtDuration((doc as any).spawned_time, doc?.created_at)}`
                      : fmtRel((doc as any).spawned_time)
                  }
                />
              )}
              {(() => {
                const durationSec = diffSeconds(
                  (doc as any)?.spawned_time,
                  doc?.created_at,
                );
                if (durationSec == null || durationSec <= 0) return null;
                const pagesPerSec = stats.pageCount / durationSec;
                const pagesPerSecLabel =
                  pagesPerSec >= 1
                    ? `${pagesPerSec.toFixed(2)} ${t.fs_pagesPerSec}`
                    : `${(1 / pagesPerSec).toFixed(1)} ${t.fs_secPerPage}`;
                let relHint: string | undefined;
                if (sysIngestAvgSec && sysIngestAvgSec > 0) {
                  const deltaPct = Math.round(
                    ((sysIngestAvgSec - durationSec) / sysIngestAvgSec) * 100,
                  );
                  if (Math.abs(deltaPct) < 5) relHint = t.fs_aboutAvgSpeed;
                  else if (deltaPct > 0)
                    relHint = t.fs_fasterThanAvg(Math.abs(deltaPct));
                  else relHint = t.fs_slowerThanAvg(Math.abs(deltaPct));
                }
                return (
                  <KV
                    label={t.fs_throughput}
                    value={pagesPerSecLabel}
                    hint={relHint}
                  />
                );
              })()}
              <KV
                label={t.fs_ocrPages}
                value={`${stats.pagesWithOcr} / ${stats.pageCount}`}
                hint={
                  stats.pageCount > 0
                    ? `${Math.round((stats.pagesWithOcr / stats.pageCount) * 100)}%`
                    : undefined
                }
              />
              <KV
                label={t.fs_fileId}
                value={doc?.file_id != null ? String(doc.file_id) : "—"}
              />
              <KV
                label={t.fs_path}
                value={
                  <button
                    onClick={() => {
                      if (filepath) {
                        navigator.clipboard
                          ?.writeText(filepath)
                          .catch(() => {});
                        reportSuccess(t.toast_success, filepath);
                      }
                    }}
                    title={filepath}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "var(--text-2)",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.72rem",
                      textAlign: "left",
                      maxWidth: 340,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                  >
                    {filepath} ⧉
                  </button>
                }
              />
              {doc?.assigned_tags && doc.assigned_tags.length > 0 && (
                <KV
                  label={t.fs_tags}
                  value={
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {doc.assigned_tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  }
                />
              )}
            </Section>

            <Section
              title={t.fs_reminder}
              right={
                reminder.at && !reminder.done_at ? (
                  <span
                    style={{
                      color: "var(--accent)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    {t.fs_active}
                  </span>
                ) : reminder.done_at ? (
                  <span
                    style={{
                      color: "var(--success)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    {t.fs_done}
                  </span>
                ) : (
                  <span style={{ color: "var(--text-3)", fontSize: "0.7rem" }}>
                    {t.fs_no}
                  </span>
                )
              }
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="datetime-local"
                  className="input"
                  value={reminderDraft}
                  onChange={(e) => setReminderDraft(e.target.value)}
                  style={{ width: 230, fontSize: "0.78rem" }}
                />
                <input
                  type="text"
                  className="input"
                  placeholder={t.fs_reminderNote}
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  style={{ flex: 1, minWidth: 200, fontSize: "0.78rem" }}
                />
                <button
                  className="btn btn-primary"
                  onClick={saveReminder}
                  style={{ fontSize: "0.78rem" }}
                >
                  {t.fs_saveReminder}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={markDone}
                  disabled={!reminder.at}
                  style={{ fontSize: "0.78rem" }}
                >
                  {t.fs_markDone}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setReminder(null)}
                  disabled={!reminder.at && !reminder.note}
                  style={{ fontSize: "0.78rem" }}
                >
                  {t.st_clear}
                </button>
              </div>
              {reminder.at && (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "0.7rem",
                    color: "var(--text-3)",
                  }}
                >
                  {fmtDate(reminder.at)}
                  {reminder.done_at && (
                    <>
                      {" "}
                      · {t.fs_done.toLowerCase()} {fmtRel(reminder.done_at)}
                    </>
                  )}
                </p>
              )}
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "0.65rem",
                  color: "var(--text-3)",
                }}
              >
                {t.fs_reminderHint}
              </p>
            </Section>

            <Section
              title={t.fs_markersTitle(markers.length)}
              right={
                markers.length > 0 ? (
                  <button
                    className="btn btn-ghost"
                    onClick={clearMarkers}
                    style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                  >
                    {t.fs_removeAll}
                  </button>
                ) : undefined
              }
            >
              {markers.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.78rem",
                    color: "var(--text-3)",
                  }}
                >
                  {t.fs_noMarkers}
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  {markers.map((m) => (
                    <div
                      key={m.box_key}
                      className="card-sm"
                      style={{
                        padding: 9,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.6rem",
                            padding: "1px 5px",
                            borderRadius: 3,
                            background:
                              m.kind === "drawn"
                                ? "var(--warn)"
                                : "var(--accent-glow)",
                            color:
                              m.kind === "drawn"
                                ? "var(--bg-base)"
                                : "var(--accent)",
                            fontFamily: "JetBrains Mono, monospace",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          {m.kind === "drawn" ? t.fs_drawn : t.fs_ocr}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-2)",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {t.fs_pageN(m.page_idx + 1)}
                        </span>
                      </div>
                      {m.note && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.74rem",
                            color: "var(--text-1)",
                            lineHeight: 1.4,
                            wordBreak: "break-word",
                          }}
                        >
                          {m.note}
                        </p>
                      )}
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.62rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {t.fs_xy(m.x, m.y, m.w, m.h)}
                      </p>
                      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() =>
                            (window.location.href = `/document?filepath=${encodeURIComponent(
                              filepath,
                            )}&page=${m.page_idx}`)
                          }
                          style={{
                            fontSize: "0.7rem",
                            padding: "3px 8px",
                            flex: 1,
                          }}
                        >
                          {t.fs_openBtn}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => removeMarker(m)}
                          style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        padding: "11px 13px",
        borderColor: accent ? "var(--accent)" : undefined,
      }}
    >
      <div
        style={{
          fontSize: "0.62rem",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--text-3)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: "1.05rem",
          fontWeight: 700,
          color: accent ? "var(--accent)" : "var(--text-1)",
          fontFamily: "JetBrains Mono, monospace",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: "14px 16px", marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-1)",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function KV({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        padding: "5px 0",
        borderTop: "1px solid var(--border-soft)",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 130,
          flexShrink: 0,
          fontSize: "0.7rem",
          color: "var(--text-3)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: "0.78rem",
          color: "var(--text-1)",
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{ fontSize: "0.68rem", color: "var(--text-3)", flexShrink: 0 }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
