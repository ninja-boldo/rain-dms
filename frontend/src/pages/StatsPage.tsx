import { useEffect, useRef, useState } from "react";
import { getDashboard } from "../api/client";

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}
function fmtEta(secs: number): string {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.round(secs / 60)}m ${secs % 60}s`;
  return `${(secs / 3600).toFixed(1)}h`;
}
function fmtRate(r: number | null | undefined): string {
  if (!r) return "—";
  return `${r.toFixed(1)} p/min`;
}

/* ── animated queue bar ───────────────────────────────────────────── */
function QueueBar({
  value,
  max,
  warn,
}: {
  value: number;
  max: number;
  warn?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      style={{
        height: 8,
        background: "var(--bg-raised)",
        borderRadius: 999,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: warn && pct > 60 ? "var(--warn)" : "var(--accent)",
          borderRadius: 999,
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: pct > 0 ? `0 0 6px var(--accent)` : "none",
        }}
      />
    </div>
  );
}

/* ── sparkline ────────────────────────────────────────────────────── */
function Sparkline({ data }: { data: number[] }) {
  if (!data.length)
    return (
      <div
        style={{
          height: 36,
          color: "var(--text-3)",
          fontSize: "0.7rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        no data
      </div>
    );
  const max = Math.max(...data, 1);
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 36 }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          title={`${v} docs`}
          style={{
            flex: 1,
            minWidth: 3,
            height: `${Math.max(4, (v / max) * 100)}%`,
            background: v > 0 ? "var(--accent)" : "var(--bg-raised)",
            borderRadius: "2px 2px 0 0",
            opacity: 0.7 + (i / data.length) * 0.3,
            transition: "height 0.4s",
          }}
        />
      ))}
    </div>
  );
}

/* ── animated number counter ──────────────────────────────────────── */
function AnimNum({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [disp, setDisp] = useState(0);
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    const target = value;
    const duration = 700;
    const start = performance.now();
    const from = disp;
    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisp(Math.round(from + (target - from) * eased));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <>
      {disp.toLocaleString()}
      {suffix}
    </>
  );
}

/* ── stat card ────────────────────────────────────────────────────── */
function Stat({
  label,
  value,
  sub,
  accent,
  warn,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <p
        style={{
          margin: 0,
          fontSize: "0.63rem",
          color: "var(--text-3)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "5px 0 0",
          fontSize: "1.45rem",
          fontWeight: 700,
          lineHeight: 1,
          color: warn
            ? "var(--warn)"
            : accent
              ? "var(--accent)"
              : "var(--text-1)",
          fontFamily: mono ? "JetBrains Mono, monospace" : undefined,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.67rem",
            color: "var(--text-3)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── worker card ──────────────────────────────────────────────────── */
function WorkerCard({ worker, type }: { worker: any; type: "ocr" | "merge" }) {
  const isActive = worker.active || worker.ack_per_sec > 0;
  return (
    <div
      className="card"
      style={{
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          flexShrink: 0,
          background: isActive ? "var(--success)" : "var(--text-3)",
          boxShadow: isActive ? "0 0 6px var(--success)" : "none",
          transition: "background 0.4s, box-shadow 0.4s",
        }}
      />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p
          className="mono"
          style={{
            margin: 0,
            fontSize: "0.72rem",
            color: "var(--text-1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {worker.peerHost ?? worker.ip ?? worker.id}
        </p>
        <p style={{ margin: 0, fontSize: "0.65rem", color: "var(--text-3)" }}>
          {type === "ocr" ? "OCR" : "Merge"} · pf {worker.prefetch ?? "—"}
          {worker.unacked > 0 && (
            <span style={{ color: "var(--warn)", marginLeft: 6 }}>
              {worker.unacked} unacked
            </span>
          )}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.72rem",
            color: isActive ? "var(--accent)" : "var(--text-3)",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {worker.ack_per_sec > 0
            ? `${worker.ack_per_sec.toFixed(2)}/s`
            : "idle"}
        </p>
      </div>
    </div>
  );
}

/* ── section heading ──────────────────────────────────────────────── */
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          margin: "0 0 10px",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {label}
        <div style={{ flex: 1, height: 1, background: "var(--border-soft)" }} />
      </h3>
      {children}
    </div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const d = await getDashboard();
      setData(d);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const s = data?.stats ?? {};
  const workers = data?.workers ?? {};
  const ocrWorkers: any[] = workers.ocr ?? [];
  const mergeWorkers: any[] = workers.merge ?? [];
  const sparkline: number[] = s.sparkline ?? [];
  const byExt: Record<string, number> = s.by_extension ?? {};
  const biggestFiles: any[] = s.biggest_files ?? [];

  // Estimated avg webp size — based on page count assumption
  const avgWebpKb =
    s.total_pages > 0
      ? Math.round((s.total_size_bytes ?? 0) / s.total_pages / 1024)
      : null;

  // OCR throughput info
  const rate30 = s.pages_per_minute_30s;
  const rate60 = s.pages_per_minute_60s;
  const etaSecs = s.eta_seconds;

  // Queue fill pct (against a "normal max" baseline of 100)
  const ocrQueueLen = s.ocr_queue_length ?? 0;
  const mergeQueueLen = s.merge_queue_length ?? 0;
  const maxForBar = Math.max(100, ocrQueueLen, mergeQueueLen);

  return (
    <div style={{ padding: "18px 24px", overflowY: "auto", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-1)",
          }}
        >
          System Stats
        </h2>
        <button
          className="btn btn-ghost"
          onClick={load}
          disabled={loading}
          style={{ fontSize: "0.72rem", padding: "3px 8px" }}
        >
          {loading ? "…" : "↻ Refresh"}
        </button>
        {lastRefresh && (
          <span
            style={{
              fontSize: "0.64rem",
              color: "var(--text-3)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            auto-refresh 5s · last {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "9px 13px",
            background: "rgba(248,113,113,0.07)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 7,
            color: "var(--danger)",
            fontSize: "0.8rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Documents */}
      <Section label="Documents">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <Stat
            label="Total"
            value={<AnimNum value={s.total_documents ?? 0} />}
            accent
          />
          <Stat label="+1h" value={<AnimNum value={s.added_last_1h ?? 0} />} />
          <Stat
            label="+24h"
            value={<AnimNum value={s.added_last_24h ?? 0} />}
          />
          <Stat label="+7d" value={<AnimNum value={s.added_last_7d ?? 0} />} />
          <Stat
            label="+30d"
            value={<AnimNum value={s.added_last_30d ?? 0} />}
          />
          <Stat
            label="Total pages"
            value={<AnimNum value={s.total_pages ?? 0} />}
            sub={`avg ${s.avg_pages_per_doc?.toFixed(1) ?? "—"} p/doc`}
          />
          <Stat
            label="OCR coverage"
            value={
              s.ocr_coverage_pct != null ? <>{s.ocr_coverage_pct}%</> : "—"
            }
            sub={`${s.pages_with_ocr ?? 0} / ${s.total_pages ?? 0} pages`}
            accent={s.ocr_coverage_pct === 100}
            warn={s.ocr_coverage_pct != null && s.ocr_coverage_pct < 50}
          />
          <Stat
            label="Est. storage"
            value={fmt(s.total_size_bytes ?? 0)}
            sub={avgWebpKb ? `~${avgWebpKb} KB/page` : undefined}
            mono
          />
        </div>

        {/* Sparkline */}
        {sparkline.length > 0 && (
          <div className="card" style={{ padding: "12px 14px" }}>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "0.63rem",
                color: "var(--text-3)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Documents added — last 24h (by hour)
            </p>
            <Sparkline data={sparkline} />
          </div>
        )}
      </Section>

      {/* OCR Pipeline */}
      <Section label="OCR Pipeline">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <Stat
            label="OCR queue"
            value={<AnimNum value={ocrQueueLen} />}
            warn={ocrQueueLen > 20}
            mono
          />
          <Stat
            label="Merge queue"
            value={<AnimNum value={mergeQueueLen} />}
            warn={mergeQueueLen > 10}
            mono
          />
          <Stat
            label="Processing"
            value={<AnimNum value={s.currently_processing ?? 0} />}
            accent={s.currently_processing > 0}
            mono
          />
          <Stat label="30s rate" value={fmtRate(rate30)} mono />
          <Stat label="60s rate" value={fmtRate(rate60)} mono />
          <Stat
            label="ETA"
            value={etaSecs != null ? fmtEta(etaSecs) : "—"}
            warn={etaSecs != null && etaSecs > 600}
            mono
          />
        </div>

        {/* Animated queue bars */}
        <div
          className="card"
          style={{
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-2)",
                  fontWeight: 600,
                }}
              >
                OCR queue
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-3)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {ocrQueueLen} jobs
              </span>
            </div>
            <QueueBar value={ocrQueueLen} max={maxForBar} warn />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-2)",
                  fontWeight: 600,
                }}
              >
                Merge queue
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-3)",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {mergeQueueLen} jobs
              </span>
            </div>
            <QueueBar value={mergeQueueLen} max={maxForBar} />
          </div>
          {(rate30 || rate60) && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-2)",
                    fontWeight: 600,
                  }}
                >
                  Throughput (30s vs 60s)
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-3)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {fmtRate(rate30)} · {fmtRate(rate60)}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "var(--bg-raised)",
                  borderRadius: 999,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, ((rate30 ?? 0) / Math.max(rate30 ?? 1, rate60 ?? 1, 1)) * 100)}%`,
                    background: "var(--accent)",
                    borderRadius: 999,
                    transition: "width 0.6s",
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Workers */}
      {(ocrWorkers.length > 0 || mergeWorkers.length > 0) && (
        <Section
          label={`Workers (${ocrWorkers.length} OCR · ${mergeWorkers.length} merge)`}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 8,
            }}
          >
            {ocrWorkers.map((w) => (
              <WorkerCard key={w.id} worker={w} type="ocr" />
            ))}
            {mergeWorkers.map((w) => (
              <WorkerCard key={w.id} worker={w} type="merge" />
            ))}
          </div>
        </Section>
      )}

      {/* File breakdown */}
      {Object.keys(byExt).length > 0 && (
        <Section label="By extension">
          <div
            className="card"
            style={{
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {Object.entries(byExt)
              .sort(([, a], [, b]) => b - a)
              .map(([ext, count]) => {
                const total = Object.values(byExt).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={ext}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-2)",
                          fontFamily: "JetBrains Mono, monospace",
                          fontWeight: 600,
                        }}
                      >
                        .{ext}
                      </span>
                      <span
                        style={{
                          fontSize: "0.67rem",
                          color: "var(--text-3)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {count} · {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "var(--bg-raised)",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--accent)",
                          borderRadius: 999,
                          transition: "width 0.6s",
                          opacity: 0.75,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Section>
      )}

      {/* Biggest files */}
      {biggestFiles.length > 0 && (
        <Section label="Largest files (by page count)">
          <div
            className="card"
            style={{
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {biggestFiles.slice(0, 10).map((f, i) => (
              <div
                key={f.filepath}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "3px 0",
                  borderBottom: i < 9 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.61rem",
                    color: "var(--text-3)",
                    fontFamily: "JetBrains Mono, monospace",
                    width: 16,
                    flexShrink: 0,
                  }}
                >
                  #{i + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.7rem",
                    color: "var(--text-2)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  title={f.filepath}
                >
                  {f.filepath?.split("/").pop() ?? f.filepath}
                </span>
                <span
                  style={{
                    fontSize: "0.66rem",
                    color: "var(--text-3)",
                    flexShrink: 0,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {f.page_count}p
                </span>
                <span
                  style={{
                    fontSize: "0.64rem",
                    color: "var(--text-3)",
                    flexShrink: 0,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {fmt(f.size_bytes ?? 0)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
