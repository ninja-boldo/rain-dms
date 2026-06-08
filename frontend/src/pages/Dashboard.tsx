import React, { useEffect, useRef, useState, useCallback } from "react";
import { useApp } from "../lib/AppContext";
import styles from "./Dashboard.module.css";

// ─── Types ────────────────────────────────────────────────────
interface DashStats {
  total_documents: number; added_last_1h: number; added_last_24h: number;
  added_last_7d: number; added_last_30d: number;
  total_pages: number; pages_with_ocr: number; ocr_coverage_pct: number | null;
  by_extension: Record<string, number>;
  pages_per_minute_30s: number | null; pages_per_minute_60s: number | null;
  agent_downloads_per_minute_30s: number | null; agent_downloads_per_minute_60s: number | null;
  currently_processing: number; eta_seconds: number | null;
  ocr_queue_length: number; merge_queue_length: number;
  ocr_workers_active: number; ocr_workers_total: number;
  merge_workers_active: number; merge_workers_total: number;
}

interface WorkerDetail {
  consumerTag: string; queue: string;
  peerHost: string; peerPort: number;
  prefetchCount: number; channelNumber: number;
  connectionName: string; ackRate: number;
  publishRate: number; unacked: number;
}

interface PeekedMessage { payload: string; size: number; redelivered: boolean; routingKey: string; }

// ─── Helpers ─────────────────────────────────────────────────
function isAvail(n: number | null | undefined): n is number {
  return n !== null && n !== undefined && n !== -1;
}
function fmtNum(n: number | null | undefined, locale: string): string {
  if (!isAvail(n)) return "—";
  return n.toLocaleString(locale);
}
function fmtRate(n: number | null | undefined): string {
  if (!isAvail(n)) return "—";
  return `${n.toFixed(1)}/min`;
}
function fmtEta(secs: number | null): string {
  if (secs === null) return "—";
  if (secs < 60) return `~${secs}s`;
  if (secs < 3600) return `~${Math.round(secs / 60)}min`;
  return `~${Math.floor(secs / 3600)}h ${Math.round((secs % 3600) / 60)}min`;
}
function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

// Extract file path from queue message payload (JSON or raw)
function extractQueueFilepath(payload: string): string {
  try {
    const json = JSON.parse(payload);
    const fp = json.filepath || json.path || json.filename || json.file || json.filePath || "";
    if (fp) {
      // Show just the filename without UUID suffixes
      const parts = fp.split(/[/\\]/);
      const name = parts[parts.length - 1];
      return name
        .replace(/-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i, ".$1")
        .replace(/-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[.\dZ]*\.(pdf|png|jpe?g)$/i, ".$1")
        .replace(/[_-]+/g, " ").trim();
    }
    return JSON.stringify(json).slice(0, 80);
  } catch {
    return payload.length > 60 ? payload.slice(0, 58) + "…" : payload;
  }
}

// Short unique ID from consumer tag
function workerShortId(consumerTag: string): string {
  if (!consumerTag) return "?";
  // amq.ctag-XXXX → last 8 chars
  const m = consumerTag.match(/amq\.ctag-(.+)/);
  if (m) return m[1].slice(-8).toUpperCase();
  return consumerTag.slice(-8).toUpperCase();
}

// Adaptive polling interval
function getPollingMs(stats: DashStats | null): number {
  if (!stats) return 5000;
  const active = (stats.pages_per_minute_30s ?? 0) > 0 ||
    (stats.ocr_queue_length ?? 0) > 0 ||
    (stats.currently_processing ?? 0) > 0;
  return active ? 3000 : 12000;
}

// ─── Sub-components ───────────────────────────────────────────

function StatCard({ label, value, sub, accent, dim }: {
  label: string; value: string; sub?: string; accent?: boolean; dim?: boolean;
}) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.statCardAccent : ""} ${dim ? styles.statCardDim : ""}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  );
}

function CoverageRing({ pct }: { pct: number }) {
  const r = 22; const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color = pct >= 90 ? "var(--accent)" : pct >= 60 ? "#e3b341" : "var(--text-muted)";
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        transform="rotate(-90 30 30)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="30" y="35" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>{pct}%</text>
    </svg>
  );
}

function ExtensionBar({ byExt }: { byExt: Record<string, number> }) {
  const entries = Object.entries(byExt).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  const total = entries.reduce((s, [, c]) => s + c, 0);
  const colors: Record<string, string> = { pdf: "#e74c3c", png: "#3498db", jpg: "#2ecc71", jpeg: "#27ae60" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {entries.map(([ext, count]) => {
        const pct = (count / total) * 100;
        const color = colors[ext] ?? "var(--accent)";
        return (
          <div key={ext} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 32, fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{ext}</span>
            <div style={{ flex: 1, height: 6, background: "var(--bg-overlay)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 28, textAlign: "right" }}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function QueuePills({ length, color }: { length: number; color: string }) {
  const MAX = 10; const shown = Math.min(length, MAX); const overflow = length - shown;
  if (length === 0) return <span className={styles.queueEmptyPill}>leer</span>;
  return (
    <div className={styles.queuePillRow}>
      {Array.from({ length: shown }).map((_, i) => (
        <span key={i} className={styles.queuePill} style={{ background: color, animationDelay: `${i * 0.12}s` }} />
      ))}
      {overflow > 0 && <span className={styles.queueOverflow} style={{ color }}>+{overflow}</span>}
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 0.01);
  const W = 140, H = 40;
  const pts = data.map((v, i) => `${(i / Math.max(data.length - 1, 1)) * W},${H - (v / max) * H}`).join(" ");
  if (!data.some((v) => v > 0)) return null;
  return (
    <svg width={W} height={H} className={styles.sparkline}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Worker card — uses port + tag as identifier since all IPs are same Docker bridge ──
function WorkerCard({ worker, color, rank, maxAckRate }: {
  worker: WorkerDetail; color: string; rank: number; maxAckRate: number;
}) {
  const productivity = maxAckRate > 0 ? worker.ackRate / maxAckRate : 0;
  const isActive = worker.unacked > 0 || worker.ackRate > 0;
  const shortId = workerShortId(worker.consumerTag);

  return (
    <div className={`${styles.workerCard} ${isActive ? styles.workerCardActive : ""}`}>
      <div className={styles.workerCardHeader}>
        <span className={styles.workerRank} style={{ color }}>#{rank}</span>
        {/* Port is the real differentiator when all workers share same Docker bridge IP */}
        <span className={styles.workerIp} title={`${worker.peerHost}:${worker.peerPort}`}>
          :{worker.peerPort}
        </span>
        <span className={styles.workerTagBadge}>{shortId}</span>
        {isActive && <span className={styles.workerActiveDot} style={{ background: color }} />}
        {!isActive && <span className={styles.workerIdleDot} />}
      </div>
      <div className={styles.workerStats}>
        <div className={styles.workerStat}>
          <span className={styles.workerStatLabel}>ACK/S</span>
          <span className={styles.workerStatValue} style={{ color }}>{worker.ackRate.toFixed(2)}</span>
        </div>
        <div className={styles.workerStat}>
          <span className={styles.workerStatLabel}>UNACKED</span>
          <span className={styles.workerStatValue}>{worker.unacked}</span>
        </div>
        <div className={styles.workerStat}>
          <span className={styles.workerStatLabel}>PREFETCH</span>
          <span className={styles.workerStatValue}>{worker.prefetchCount}</span>
        </div>
      </div>
      {productivity > 0 && (
        <div className={styles.workerBarWrap}>
          <div className={styles.workerBar} style={{ width: `${productivity * 100}%`, background: color }} />
        </div>
      )}
      <p className={styles.workerTag}>{worker.consumerTag?.slice(0, 34) ?? "—"}</p>
    </div>
  );
}

// ── Queue peek panel — shows filenames, not raw JSON ──
function QueueFilePanel({ messages, loading }: { messages: PeekedMessage[]; loading: boolean }) {
  if (loading) return <p className={styles.peekLoading}>Lade…</p>;
  if (!messages.length) return <p className={styles.peekEmpty}>Warteschlange leer</p>;
  return (
    <div className={styles.peekList}>
      {messages.map((m, i) => {
        const name = extractQueueFilepath(m.payload);
        const ext = name.match(/\.(pdf|png|jpg|jpeg)$/i)?.[1]?.toUpperCase() ?? "?";
        return (
          <div key={i} className={styles.peekItem}>
            <div className={styles.peekItemLeft}>
              <span className={styles.peekIdx}>#{i + 1}</span>
              <span className={styles.peekExt}>{ext}</span>
              <span className={styles.peekFilename} title={m.payload}>{name}</span>
            </div>
            <div className={styles.peekItemRight}>
              <span className={styles.peekSize}>{fmtBytes(m.size)}</span>
              {m.redelivered && <span className={styles.peekRedelivered}>requeue</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Dashboard() {
  const { settings, t, language, getAuthHeaders } = useApp();
  const locale = language === "de" ? "de-DE" : "en-US";

  const [stats, setStats] = useState<DashStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sparkHistory, setSparkHistory] = useState<number[]>(Array(30).fill(0));
  const [ocrWorkers, setOcrWorkers] = useState<WorkerDetail[]>([]);
  const [mergeWorkers, setMergeWorkers] = useState<WorkerDetail[]>([]);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const [ocrPeek, setOcrPeek] = useState<PeekedMessage[]>([]);
  const [peekLoading, setPeekLoading] = useState(false);
  const [showOcrPeek, setShowOcrPeek] = useState(false);
  const [mergePeek, setMergePeek] = useState<PeekedMessage[]>([]);
  const [showMergePeek, setShowMergePeek] = useState(false);

  const statsRef = useRef<DashStats | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${settings.serverUrl}/stats`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DashStats = await res.json();
      setStats(data); setError(null); statsRef.current = data;
      const rate = data.pages_per_minute_30s ?? data.pages_per_minute_60s;
      setSparkHistory((prev) => [...prev.slice(1), rate ?? 0]);
    } catch (e: any) { setError(e.message); }
  }, [settings.serverUrl, getAuthHeaders]);

  const fetchWorkers = useCallback(async () => {
    try {
      const res = await fetch(`${settings.serverUrl}/workers`, { headers: getAuthHeaders() });
      const d = await res.json();
      setOcrWorkers(d.ocr ?? []); setMergeWorkers(d.merge ?? []);
      setWorkersError(d.error ?? null);
    } catch (e: any) { setWorkersError(e.message); }
  }, [settings.serverUrl, getAuthHeaders]);

  const fetchOcrPeek = useCallback(async () => {
    if (peekLoading) return;
    setPeekLoading(true);
    try {
      const res = await fetch(`${settings.serverUrl}/queue-peek?target=ocr&count=8`, { headers: getAuthHeaders() });
      const d = await res.json();
      setOcrPeek(Array.isArray(d.ocr) ? d.ocr : []);
    } catch { /* non-fatal */ }
    setPeekLoading(false);
  }, [settings.serverUrl, getAuthHeaders, peekLoading]);

  const fetchMergePeek = useCallback(async () => {
    try {
      const res = await fetch(`${settings.serverUrl}/queue-peek?target=merge&count=8`, { headers: getAuthHeaders() });
      const d = await res.json();
      setMergePeek(Array.isArray(d.merge) ? d.merge : []);
    } catch { /* non-fatal */ }
  }, [settings.serverUrl, getAuthHeaders]);

  const fetchAll = useCallback(() => {
    fetchStats(); fetchWorkers();
  }, [fetchStats, fetchWorkers]);

  // Adaptive interval: faster when active, slower when idle
  const reschedule = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const ms = getPollingMs(statsRef.current);
    intervalRef.current = setInterval(() => {
      fetchAll();
      reschedule(); // re-evaluate interval each tick
    }, ms);
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
    reschedule();

    // Pause polling when tab is hidden
    const onVisibility = () => {
      if (document.hidden) { if (intervalRef.current) clearInterval(intervalRef.current); }
      else { fetchAll(); reschedule(); }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [settings.serverUrl]);

  // Auto-fetch queue peek when there's a queue
  useEffect(() => {
    if ((stats?.ocr_queue_length ?? 0) > 0) fetchOcrPeek();
    if ((stats?.merge_queue_length ?? 0) > 0) fetchMergePeek();
  }, [stats?.ocr_queue_length, stats?.merge_queue_length]);

  const anyActivity = stats !== null && (
    stats.pages_per_minute_30s !== null || stats.pages_per_minute_60s !== null
  );
  const ocrBusy = (stats?.ocr_queue_length ?? 0) > 0;
  const mergeBusy = (stats?.merge_queue_length ?? 0) > 0;
  const maxOcrAck = Math.max(...ocrWorkers.map((w) => w.ackRate), 0.01);
  const maxMergeAck = Math.max(...mergeWorkers.map((w) => w.ackRate), 0.01);
  const hasByExt = stats?.by_extension && Object.keys(stats.by_extension).length > 0;
  const pollingMs = getPollingMs(stats);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.dashboard.title}</h1>
          <p className={styles.subtitle}>{t.dashboard.subtitle}</p>
        </div>
        {error && (
          <div className={styles.errorBadge}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
        <div className={styles.pulse}>
          <span className={styles.pulseDot} />
          LIVE · {pollingMs / 1000}s
        </div>
      </header>

      {/* ── Stats grid ── */}
      <div className={styles.statsGrid}>
        <StatCard label={t.dashboard.total} value={fmtNum(stats?.total_documents, locale)} accent />
        <StatCard label={t.dashboard.lastHour} value={fmtNum(stats?.added_last_1h, locale)} sub={t.dashboard.documents} />
        <StatCard label={t.dashboard.last24h} value={fmtNum(stats?.added_last_24h, locale)} sub={t.dashboard.documents} />
        <StatCard label={t.dashboard.last7d} value={fmtNum(stats?.added_last_7d, locale)} sub={t.dashboard.documents} />
        <StatCard label={t.dashboard.inProgress} value={stats ? fmtNum(stats.currently_processing, locale) : "—"} sub={t.dashboard.activeJobs} dim={stats !== null && stats.currently_processing === 0} />
        <StatCard
          label={t.dashboard.ocrThroughput}
          value={fmtRate(stats?.pages_per_minute_30s ?? stats?.pages_per_minute_60s)}
          sub={anyActivity ? `60s: ${fmtRate(stats?.pages_per_minute_60s)}` : t.dashboard.noTraffic}
          dim={!anyActivity}
        />
        <StatCard
          label={t.dashboard.agentDownloads}
          value={fmtRate(stats?.agent_downloads_per_minute_30s ?? stats?.agent_downloads_per_minute_60s)}
          sub="S3 downloads/min"
          dim={!isAvail(stats?.agent_downloads_per_minute_30s) && !isAvail(stats?.agent_downloads_per_minute_60s)}
        />
      </div>

      {/* ── Sparkline ── */}
      {anyActivity && (
        <div className={styles.section}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>{t.dashboard.sparklineTitle}</p>
            <Sparkline data={sparkHistory} color="var(--accent)" />
          </div>
        </div>
      )}

      {/* ── Page stats + OCR coverage ── */}
      {stats && (stats.total_pages > 0 || hasByExt) && (
        <div className={styles.section}>
          <div className={styles.sectionRow}><p className={styles.sectionTitle}>Seiten &amp; OCR</p></div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
              {[["Gesamt Seiten", fmtNum(stats.total_pages, locale)], ["Mit OCR", fmtNum(stats.pages_with_ocr, locale)], ["Letzte 30 Tage", fmtNum(stats.added_last_30d, locale)]].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <strong style={{ color: label === "Mit OCR" ? "var(--accent)" : undefined }}>{val}</strong>
                </div>
              ))}
            </div>
            {stats.ocr_coverage_pct !== null && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <CoverageRing pct={stats.ocr_coverage_pct} />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>OCR-Abdeckung</span>
              </div>
            )}
            {hasByExt && (
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Nach Format</p>
                <ExtensionBar byExt={stats.by_extension} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Queues ── */}
      <div className={styles.section}>
        <div className={styles.sectionRow}>
          <p className={styles.sectionTitle}>{t.dashboard.queues}</p>
          {stats?.eta_seconds && ocrBusy && (
            <span className={styles.etaBadge}>
              ETA {fmtEta(stats.eta_seconds)}
            </span>
          )}
        </div>
        <div className={styles.queuesGrid}>
          {/* OCR queue */}
          <div className={styles.queueBlock}>
            <div className={styles.queueBlockHeader}>
              <span className={styles.queueBlockTitle}>{t.dashboard.ocrQueue}</span>
              <span className={styles.queueBlockCount} style={{ color: ocrBusy ? "var(--accent)" : "var(--text-muted)" }}>
                {stats?.ocr_queue_length ?? 0} msgs
              </span>
              <button className={styles.peekBtn} onClick={() => { setShowOcrPeek((v) => !v); if (!showOcrPeek) fetchOcrPeek(); }}>
                {showOcrPeek ? "▲ schließen" : "▼ Dateien"}
              </button>
            </div>
            <QueuePills length={stats?.ocr_queue_length ?? 0} color="var(--accent)" />
            {showOcrPeek && <QueueFilePanel messages={ocrPeek} loading={peekLoading} />}
          </div>

          <div className={styles.queueArrowCol}>
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
              <line x1="0" y1="10" x2="24" y2="10" stroke="var(--border-accent)" strokeWidth="1.5" strokeDasharray="4 3" />
              <polyline points="16 3 24 10 16 17" stroke="var(--border-accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Merge queue */}
          <div className={styles.queueBlock}>
            <div className={styles.queueBlockHeader}>
              <span className={styles.queueBlockTitle}>{t.dashboard.mergeQueue}</span>
              <span className={styles.queueBlockCount} style={{ color: mergeBusy ? "#58a6ff" : "var(--text-muted)" }}>
                {stats?.merge_queue_length ?? 0} msgs
              </span>
              <button className={styles.peekBtn} onClick={() => { setShowMergePeek((v) => !v); if (!showMergePeek) fetchMergePeek(); }}>
                {showMergePeek ? "▲ schließen" : "▼ Dateien"}
              </button>
            </div>
            <QueuePills length={stats?.merge_queue_length ?? 0} color="#58a6ff" />
            {showMergePeek && <QueueFilePanel messages={mergePeek} loading={peekLoading} />}
          </div>
        </div>
      </div>

      {/* ── OCR Workers ── */}
      <div className={styles.section}>
        <div className={styles.sectionRow}>
          <p className={styles.sectionTitle}>{t.dashboard.ocrWorkers}</p>
          {workersError && <span className={styles.unavailBadge}>{t.dashboard.managementApiError} {workersError}</span>}
          {isAvail(stats?.ocr_workers_total) && (
            <span className={styles.workerSummary} style={{ color: "var(--accent)" }}>
              {fmtNum(stats?.ocr_workers_active, locale)} / {fmtNum(stats?.ocr_workers_total, locale)} aktiv
            </span>
          )}
          <span className={styles.workerNote}>Port = eindeutige ID (alle Worker selbe Docker-Bridge-IP)</span>
        </div>
        {ocrWorkers.length > 0 ? (
          <div className={styles.workerCards}>
            {ocrWorkers.sort((a, b) => b.ackRate - a.ackRate).map((w, i) => (
              <WorkerCard key={w.consumerTag || i} worker={w} color="var(--accent)" rank={i + 1} maxAckRate={maxOcrAck} />
            ))}
          </div>
        ) : (
          <p className={styles.workerNone}>{t.dashboard.noWorkers}</p>
        )}
      </div>

      {/* ── Merge Workers ── */}
      {(mergeWorkers.length > 0 || isAvail(stats?.merge_workers_total)) && (
        <div className={styles.section}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>{t.dashboard.mergeWorkers}</p>
            {isAvail(stats?.merge_workers_total) && (
              <span className={styles.workerSummary} style={{ color: "#58a6ff" }}>
                {fmtNum(stats?.merge_workers_active, locale)} / {fmtNum(stats?.merge_workers_total, locale)} aktiv
              </span>
            )}
          </div>
          {mergeWorkers.length > 0 ? (
            <div className={styles.workerCards}>
              {mergeWorkers.sort((a, b) => b.ackRate - a.ackRate).map((w, i) => (
                <WorkerCard key={w.consumerTag || i} worker={w} color="#58a6ff" rank={i + 1} maxAckRate={maxMergeAck} />
              ))}
            </div>
          ) : (
            <p className={styles.workerNone}>{t.dashboard.noWorkers}</p>
          )}
        </div>
      )}
    </div>
  );
}
