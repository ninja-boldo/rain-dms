import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../lib/AppContext";
import styles from "./Dashboard.module.css";

// ─── Types ────────────────────────────────────────────────────

interface DashStats {
  total_documents: number;
  added_last_1h: number;
  added_last_24h: number;
  added_last_7d: number;
  // null = nothing happened in this window (show "—")
  pages_per_minute_30s: number | null;
  pages_per_minute_60s: number | null;
  agent_downloads_per_minute_30s: number | null;
  agent_downloads_per_minute_60s: number | null;
  currently_processing: number;
  eta_seconds: number | null;
  ocr_queue_length: number;
  merge_queue_length: number;
  ocr_workers_active: number;
  ocr_workers_total: number;
  merge_workers_active: number;
  merge_workers_total: number;
}

interface WorkerDetail {
  consumerTag: string;
  queue: string;
  peerHost: string;
  peerPort: number;
  prefetchCount: number;
  channelNumber: number;
  connectionName: string;
  ackRate: number;
  publishRate: number;
  unacked: number;
}

interface PeekedMessage {
  payload: string;
  size: number;
  redelivered: boolean;
  routingKey: string;
}

interface WorkerDownloadEntry {
  filename: string;
  bytes: number;
  at: number;
}

interface WorkerDownloadRecord {
  ip: string;
  totalDownloads: number;
  totalBytes: number;
  firstSeenAt: number;
  lastSeenAt: number;
  recentFiles: WorkerDownloadEntry[];
  /** Enriched by /worker-download-stats */
  isConnected: boolean;
  currentlyProcessing: number;
}

// ─── Helpers ─────────────────────────────────────────────────

function isAvail(n: number | null | undefined): n is number {
  return n !== null && n !== undefined && n !== -1;
}

function fmtNum(n: number | null | undefined): string {
  if (!isAvail(n)) return "—";
  return n.toLocaleString("de-DE");
}

function fmtRate(n: number | null | undefined): string {
  if (!isAvail(n) || n === null) return "—";
  return `${n.toFixed(1)}/min`;
}

function fmtEta(secs: number | null): string {
  if (secs === null) return "—";
  if (secs < 60) return `~${secs}s`;
  if (secs < 3600) return `~${Math.round(secs / 60)}min`;
  const h = Math.floor(secs / 3600);
  const m = Math.round((secs % 3600) / 60);
  return `~${h}h ${m}min`;
}

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function fmtRelTime(ms: number): string {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 5) return "gerade eben";
  if (secs < 60) return `vor ${secs}s`;
  if (secs < 3600) return `vor ${Math.floor(secs / 60)}min`;
  return `vor ${Math.floor(secs / 3600)}h`;
}

// ─── Sub-components ───────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
  dim,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={`${styles.statCard} ${accent ? styles.statCardAccent : ""} ${dim ? styles.statCardDim : ""}`}
    >
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  );
}

function ThroughputCard({
  label30,
  label60,
  rate30,
  rate60,
  active,
}: {
  label30: string;
  label60: string;
  rate30: number | null;
  rate60: number | null;
  active: boolean;
}) {
  const anyActive = rate30 !== null || rate60 !== null;
  return (
    <div
      className={`${styles.statCard} ${!anyActive ? styles.statCardDim : ""}`}
    >
      <p className={styles.statLabel}>{anyActive ? label30 : "Durchsatz"}</p>
      <p className={styles.statValue}>{fmtRate(rate30 ?? rate60)}</p>
      {anyActive && rate30 !== null && rate60 !== null && (
        <p className={styles.statSub}>
          30s: {fmtRate(rate30)} · 1min: {fmtRate(rate60)}
        </p>
      )}
      {!anyActive && <p className={styles.statSub}>kein Traffic</p>}
    </div>
  );
}

// Queue pills — only animate when there's actually stuff in there
function QueuePills({ length, color }: { length: number; color: string }) {
  const MAX = 10;
  const shown = Math.min(length, MAX);
  const overflow = length - shown;
  if (length === 0) return <span className={styles.queueEmptyPill}>leer</span>;
  return (
    <div className={styles.queuePillRow}>
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className={styles.queuePill}
          style={{ background: color, animationDelay: `${i * 0.12}s` }}
        />
      ))}
      {overflow > 0 && (
        <span className={styles.queueOverflow} style={{ color }}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

// ETA bar
function EtaBar({
  eta,
  queueLen,
  active,
}: {
  eta: number | null;
  queueLen: number;
  active: boolean;
}) {
  if (!active || queueLen === 0) return null;
  return (
    <div className={styles.etaBar}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>
        Fertig in: <strong>{fmtEta(eta)}</strong>
        {eta === null && (
          <span className={styles.etaMuted}> (Rate unbekannt)</span>
        )}
      </span>
    </div>
  );
}

// Worker card with IP, stats, productivity bar
function WorkerCard({
  worker,
  color,
  rank,
  maxAckRate,
}: {
  worker: WorkerDetail;
  color: string;
  rank: number;
  maxAckRate: number;
}) {
  const productivity = maxAckRate > 0 ? worker.ackRate / maxAckRate : 0;
  const isActive = worker.unacked > 0 || worker.ackRate > 0;

  return (
    <div
      className={`${styles.workerCard} ${isActive ? styles.workerCardActive : ""}`}
    >
      <div className={styles.workerCardHeader}>
        <span className={styles.workerRank} style={{ color }}>
          #{rank}
        </span>
        <span className={styles.workerIp}>{worker.peerHost}</span>
        <span className={styles.workerPort}>:{worker.peerPort}</span>
        {isActive && (
          <span
            className={styles.workerActiveDot}
            style={{ background: color }}
          />
        )}
      </div>
      <div className={styles.workerStats}>
        <div className={styles.workerStat}>
          <span className={styles.workerStatLabel}>Ack/s</span>
          <span className={styles.workerStatValue} style={{ color }}>
            {worker.ackRate.toFixed(2)}
          </span>
        </div>
        <div className={styles.workerStat}>
          <span className={styles.workerStatLabel}>Unacked</span>
          <span className={styles.workerStatValue}>{worker.unacked}</span>
        </div>
        <div className={styles.workerStat}>
          <span className={styles.workerStatLabel}>Prefetch</span>
          <span className={styles.workerStatValue}>{worker.prefetchCount}</span>
        </div>
      </div>
      <div className={styles.workerBarWrap}>
        <div
          className={styles.workerBar}
          style={{ width: `${productivity * 100}%`, background: color }}
        />
      </div>
      <p className={styles.workerTag}>{worker.consumerTag.slice(0, 32)}</p>
    </div>
  );
}

// Queue message peek panel
function PeekPanel({
  messages,
  loading,
  error,
}: {
  messages: PeekedMessage[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) return <p className={styles.peekLoading}>Lade Vorschau…</p>;
  if (error) return <p className={styles.peekError}>{error}</p>;
  if (messages.length === 0)
    return <p className={styles.peekEmpty}>Queue leer</p>;
  return (
    <div className={styles.peekList}>
      {messages.map((m, i) => (
        <div key={i} className={styles.peekItem}>
          <div className={styles.peekMeta}>
            <span className={styles.peekIdx}>#{i + 1}</span>
            <span className={styles.peekSize}>{fmtBytes(m.size)}</span>
            {m.redelivered && (
              <span className={styles.peekRedelivered}>↩ redelivered</span>
            )}
          </div>
          <pre className={styles.peekPayload}>{m.payload}</pre>
        </div>
      ))}
    </div>
  );
}

// Sparkline
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 0.01);
  const W = 140,
    H = 40;
  const pts = data
    .map(
      (v, i) =>
        `${(i / Math.max(data.length - 1, 1)) * W},${H - (v / max) * H}`,
    )
    .join(" ");
  const hasData = data.some((v) => v > 0);
  if (!hasData) return null;
  return (
    <svg width={W} height={H} className={styles.sparkline}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={(i / Math.max(data.length - 1, 1)) * W}
          cy={H - (v / max) * H}
          r="2"
          fill={color}
          opacity={v > 0 ? 0.8 : 0}
        />
      ))}
    </svg>
  );
}

// ─── Worker Download Card ────────────────────────────────────

function WorkerDownloadCard({
  worker,
  totalSystemDownloads,
  rank,
}: {
  worker: WorkerDownloadRecord;
  totalSystemDownloads: number;
  rank: number;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const share =
    totalSystemDownloads > 0 ? worker.totalDownloads / totalSystemDownloads : 0;
  const isActive = worker.isConnected || worker.currentlyProcessing > 0;
  const isProcessing = worker.currentlyProcessing > 0;

  return (
    <div
      className={`${styles.dlWorkerCard} ${isActive ? styles.dlWorkerCardActive : ""} ${isProcessing ? styles.dlWorkerCardProcessing : ""}`}
    >
      {/* Header */}
      <div className={styles.dlWorkerHeader}>
        <span className={styles.dlWorkerRank}>#{rank}</span>
        <span className={styles.dlWorkerIp}>{worker.ip}</span>
        <div className={styles.dlWorkerBadges}>
          {isProcessing && (
            <span className={styles.dlWorkerBadgeProcessing}>
              <span className={styles.dlWorkerSpinner} />
              {worker.currentlyProcessing} aktiv
            </span>
          )}
          {worker.isConnected && !isProcessing && (
            <span className={styles.dlWorkerBadgeConnected}>verbunden</span>
          )}
          {!worker.isConnected && (
            <span className={styles.dlWorkerBadgeIdle}>idle</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.dlWorkerStats}>
        <div className={styles.dlWorkerStat}>
          <span className={styles.dlWorkerStatLabel}>Downloads</span>
          <span className={styles.dlWorkerStatValue}>
            {worker.totalDownloads.toLocaleString("de-DE")}
          </span>
        </div>
        <div className={styles.dlWorkerStat}>
          <span className={styles.dlWorkerStatLabel}>Volumen</span>
          <span className={styles.dlWorkerStatValue}>
            {fmtBytes(worker.totalBytes)}
          </span>
        </div>
        <div className={styles.dlWorkerStat}>
          <span className={styles.dlWorkerStatLabel}>Zuletzt</span>
          <span className={styles.dlWorkerStatValue}>
            {fmtRelTime(worker.lastSeenAt)}
          </span>
        </div>
        <div className={styles.dlWorkerStat}>
          <span className={styles.dlWorkerStatLabel}>Anteil</span>
          <span
            className={styles.dlWorkerStatValue}
            style={{ color: "var(--accent)" }}
          >
            {(share * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Share bar */}
      <div className={styles.dlShareBarWrap}>
        <div
          className={styles.dlShareBar}
          style={{ width: `${share * 100}%` }}
        />
      </div>

      {/* Recent files (toggle) */}
      {worker.recentFiles.length > 0 && (
        <>
          <button
            className={styles.dlToggleBtn}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded
              ? "▲ schließen"
              : `▼ letzte ${worker.recentFiles.length} Dateien`}
          </button>
          {expanded && (
            <div className={styles.dlFileList}>
              {[...worker.recentFiles]
                .reverse()
                .slice(0, 10)
                .map((f, i) => (
                  <div key={i} className={styles.dlFileEntry}>
                    <span className={styles.dlFileName} title={f.filename}>
                      {f.filename.length > 40
                        ? `…${f.filename.slice(-38)}`
                        : f.filename}
                    </span>
                    <span className={styles.dlFileBytes}>
                      {fmtBytes(f.bytes)}
                    </span>
                    <span className={styles.dlFileTime}>
                      {fmtRelTime(f.at)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Download Distribution Bar ───────────────────────────────

function DownloadDistributionBar({
  workers,
}: {
  workers: WorkerDownloadRecord[];
}) {
  const total = workers.reduce((s, w) => s + w.totalDownloads, 0);
  if (total === 0 || workers.length === 0) return null;

  // Assign each worker a hue band
  const hues = [210, 160, 45, 280, 10, 180, 340, 90];
  const sorted = [...workers].sort(
    (a, b) => b.totalDownloads - a.totalDownloads,
  );

  return (
    <div className={styles.distBarWrap}>
      <div className={styles.distBar}>
        {sorted.map((w, i) => {
          const pct = (w.totalDownloads / total) * 100;
          const hue = hues[i % hues.length];
          return (
            <div
              key={w.ip}
              className={styles.distBarSegment}
              style={{
                width: `${pct}%`,
                background: `hsl(${hue} 60% 55%)`,
              }}
              title={`${w.ip}: ${w.totalDownloads} Downloads (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>
      <div className={styles.distLegend}>
        {sorted.map((w, i) => {
          const hue = hues[i % hues.length];
          const pct = ((w.totalDownloads / total) * 100).toFixed(1);
          return (
            <div key={w.ip} className={styles.distLegendItem}>
              <span
                className={styles.distLegendDot}
                style={{ background: `hsl(${hue} 60% 55%)` }}
              />
              <span className={styles.distLegendIp}>{w.ip}</span>
              <span className={styles.distLegendPct}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────

export default function Dashboard() {
  const { settings } = useApp();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Sparkline history — only push real non-null values
  const [sparkHistory, setSparkHistory] = useState<number[]>(Array(30).fill(0));

  // Worker panels
  const [ocrWorkers, setOcrWorkers] = useState<WorkerDetail[]>([]);
  const [mergeWorkers, setMergeWorkers] = useState<WorkerDetail[]>([]);
  const [workersError, setWorkersError] = useState<string | null>(null);

  // Download stats per OCR worker
  const [workerDownloadStats, setWorkerDownloadStats] = useState<
    WorkerDownloadRecord[]
  >([]);

  // Peek panels
  const [ocrPeek, setOcrPeek] = useState<PeekedMessage[]>([]);
  const [mergePeek, setMergePeek] = useState<PeekedMessage[]>([]);
  const [peekLoading, setPeekLoading] = useState(false);
  const [peekError, setPeekError] = useState<string | null>(null);
  const [showOcrPeek, setShowOcrPeek] = useState(false);
  const [showMergePeek, setShowMergePeek] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${settings.serverUrl}/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DashStats = await res.json();
      setStats(data);
      setError(null);
      // Only push to sparkline when there's actual throughput
      const rate = data.pages_per_minute_30s ?? data.pages_per_minute_60s;
      setSparkHistory((prev) => [...prev.slice(1), rate ?? 0]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${settings.serverUrl}/workers`);
      const d = await res.json();
      setOcrWorkers(d.ocr ?? []);
      setMergeWorkers(d.merge ?? []);
      setWorkersError(d.error ?? null);
    } catch (e: any) {
      setWorkersError(e.message);
    }
  };

  const fetchWorkerDownloadStats = async () => {
    try {
      const res = await fetch(`${settings.serverUrl}/worker-download-stats`);
      const d = await res.json();
      setWorkerDownloadStats(d.workers ?? []);
    } catch {
      // non-fatal — section just stays empty
    }
  };

  const fetchPeek = async (queue: "ocr" | "merge") => {
    setPeekLoading(true);
    setPeekError(null);
    try {
      const res = await fetch(
        `${settings.serverUrl}/queue-peek?target=${queue}&count=5`,
      );
      const d = await res.json();
      const queueData = d[queue];
      if (!queueData) {
        setPeekError("Keine Antwort vom Server");
      } else if (queueData.error) {
        setPeekError(queueData.error);
      } else {
        if (queue === "ocr")
          setOcrPeek(Array.isArray(queueData) ? queueData : []);
        else setMergePeek(Array.isArray(queueData) ? queueData : []);
      }
    } catch (e: any) {
      setPeekError(e.message);
    } finally {
      setPeekLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchWorkers();
    fetchWorkerDownloadStats();
    intervalRef.current = setInterval(() => {
      fetchStats();
      fetchWorkers();
      fetchWorkerDownloadStats();
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.serverUrl]);

  const queueAvail = stats !== null && isAvail(stats.ocr_workers_total);
  const anyActivity =
    stats !== null &&
    (stats.pages_per_minute_30s !== null ||
      stats.pages_per_minute_60s !== null);
  const ocrBusy = (stats?.ocr_queue_length ?? 0) > 0;
  const mergeBusy = (stats?.merge_queue_length ?? 0) > 0;
  const maxOcrAck = Math.max(...ocrWorkers.map((w) => w.ackRate), 0.01);
  const maxMergeAck = Math.max(...mergeWorkers.map((w) => w.ackRate), 0.01);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Live · alle 5s</p>
        </div>
        {error && (
          <div className={styles.errorBadge}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}
        <div className={styles.pulse}>
          <span className={styles.pulseDot} />
          LIVE
        </div>
      </header>
      {/* Document stats */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Gesamt"
          value={fmtNum(stats?.total_documents)}
          accent
        />
        <StatCard
          label="Letzte Stunde"
          value={fmtNum(stats?.added_last_1h)}
          sub="Dokumente"
        />
        <StatCard
          label="Letzte 24h"
          value={fmtNum(stats?.added_last_24h)}
          sub="Dokumente"
        />
        <StatCard
          label="Letzte 7 Tage"
          value={fmtNum(stats?.added_last_7d)}
          sub="Dokumente"
        />
        <StatCard
          label="In Bearbeitung"
          value={stats ? fmtNum(stats.currently_processing) : "—"}
          sub="aktive Jobs"
          dim={stats !== null && stats.currently_processing === 0}
        />
        <ThroughputCard
          label30="Seiten/min (OCR)"
          label60="Seiten/min (OCR)"
          rate30={stats?.pages_per_minute_30s ?? null}
          rate60={stats?.pages_per_minute_60s ?? null}
          active={anyActivity}
        />
        <ThroughputCard
          label30="Agent-DL/min"
          label60="Agent-DL/min"
          rate30={stats?.agent_downloads_per_minute_30s ?? null}
          rate60={stats?.agent_downloads_per_minute_60s ?? null}
          active={
            stats?.agent_downloads_per_minute_30s !== null ||
            stats?.agent_downloads_per_minute_60s !== null
          }
        />
      </div>
      {/* Sparkline — only when active */}
      {anyActivity && (
        <div className={styles.section}>
          <div className={styles.sectionRow}>
            <p className={styles.sectionTitle}>
              OCR-Durchsatz (letzte 2.5 min)
            </p>
            <Sparkline data={sparkHistory} color="var(--accent)" />
          </div>
        </div>
      )}
      {/* Queues + ETA */}
      <div className={styles.section}>
        <div className={styles.sectionRow}>
          <p className={styles.sectionTitle}>Warteschlangen</p>
          {!queueAvail && stats !== null && (
            <span className={styles.unavailBadge}>
              RabbitMQ Management nicht erreichbar
            </span>
          )}
        </div>

        <div className={styles.queuesGrid}>
          {/* OCR Queue */}
          <div className={styles.queueBlock}>
            <div className={styles.queueBlockHeader}>
              <span className={styles.queueBlockTitle}>OCR-Queue</span>
              <span
                className={styles.queueBlockCount}
                style={{
                  color: ocrBusy ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {stats?.ocr_queue_length ?? 0} Nachrichten
              </span>
              <button
                className={styles.peekBtn}
                onClick={() => {
                  setShowOcrPeek((v) => !v);
                  if (!showOcrPeek) fetchPeek("ocr");
                }}
              >
                {showOcrPeek ? "▲ schließen" : "▼ Vorschau"}
              </button>
            </div>
            <QueuePills
              length={stats?.ocr_queue_length ?? 0}
              color="var(--accent)"
            />
            <EtaBar
              eta={stats?.eta_seconds ?? null}
              queueLen={stats?.ocr_queue_length ?? 0}
              active={anyActivity}
            />
            {showOcrPeek && (
              <PeekPanel
                messages={ocrPeek}
                loading={peekLoading}
                error={peekError}
              />
            )}
          </div>

          <div className={styles.queueArrowCol}>
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
              <line
                x1="0"
                y1="10"
                x2="24"
                y2="10"
                stroke="var(--border-accent)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <polyline
                points="16 3 24 10 16 17"
                stroke="var(--border-accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Merge Queue */}
          <div className={styles.queueBlock}>
            <div className={styles.queueBlockHeader}>
              <span className={styles.queueBlockTitle}>Merge-Queue</span>
              <span
                className={styles.queueBlockCount}
                style={{ color: mergeBusy ? "#58a6ff" : "var(--text-muted)" }}
              >
                {stats?.merge_queue_length ?? 0} Nachrichten
              </span>
              <button
                className={styles.peekBtn}
                onClick={() => {
                  setShowMergePeek((v) => !v);
                  if (!showMergePeek) fetchPeek("merge");
                }}
              >
                {showMergePeek ? "▲ schließen" : "▼ Vorschau"}
              </button>
            </div>
            <QueuePills
              length={stats?.merge_queue_length ?? 0}
              color="#58a6ff"
            />
            {showMergePeek && (
              <PeekPanel
                messages={mergePeek}
                loading={peekLoading}
                error={peekError}
              />
            )}
          </div>
        </div>
      </div>
      {/* OCR Workers */}
      <div className={styles.section}>
        <div className={styles.sectionRow}>
          <p className={styles.sectionTitle}>OCR Workers</p>
          {workersError && (
            <span className={styles.unavailBadge}>
              Management API: {workersError}
            </span>
          )}
          {queueAvail && (
            <span
              className={styles.workerSummary}
              style={{ color: "var(--accent)" }}
            >
              {fmtNum(stats?.ocr_workers_active)} /{" "}
              {fmtNum(stats?.ocr_workers_total)} aktiv
            </span>
          )}
        </div>
        {ocrWorkers.length > 0 ? (
          <div className={styles.workerCards}>
            {ocrWorkers
              .sort((a, b) => b.ackRate - a.ackRate)
              .map((w, i) => (
                <WorkerCard
                  key={w.consumerTag}
                  worker={w}
                  color="var(--accent)"
                  rank={i + 1}
                  maxAckRate={maxOcrAck}
                />
              ))}
          </div>
        ) : (
          <p className={styles.workerNone}>Keine Worker registriert</p>
        )}
      </div>
      {/* Worker Download Distribution */}
      <div className={styles.section}>
        <div className={styles.sectionRow}>
          <p className={styles.sectionTitle}>Worker Download-Verteilung</p>
          {workerDownloadStats.length > 0 && (
            <span className={styles.unavailBadge}>
              {workerDownloadStats
                .reduce((s, w) => s + w.totalDownloads, 0)
                .toLocaleString("de-DE")}{" "}
              total ·{" "}
              {fmtBytes(
                workerDownloadStats.reduce((s, w) => s + w.totalBytes, 0),
              )}
            </span>
          )}
        </div>

        {workerDownloadStats.length === 0 ? (
          <p className={styles.workerNone}>
            Noch keine Downloads aufgezeichnet
          </p>
        ) : (
          <>
            <DownloadDistributionBar workers={workerDownloadStats} />
            <div className={styles.dlWorkerCards}>
              {workerDownloadStats.map((w, i) => (
                <WorkerDownloadCard
                  key={w.ip}
                  worker={w}
                  totalSystemDownloads={workerDownloadStats.reduce(
                    (s, x) => s + x.totalDownloads,
                    0,
                  )}
                  rank={i + 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {/* Merge Workers */}{" "}
      <div className={styles.section}>
        <div className={styles.sectionRow}>
          <p className={styles.sectionTitle}>Merge Worker</p>
          {queueAvail && (
            <span className={styles.workerSummary} style={{ color: "#58a6ff" }}>
              {fmtNum(stats?.merge_workers_active)} /{" "}
              {fmtNum(stats?.merge_workers_total)} aktiv
            </span>
          )}
        </div>
        {mergeWorkers.length > 0 ? (
          <div className={styles.workerCards}>
            {mergeWorkers
              .sort((a, b) => b.ackRate - a.ackRate)
              .map((w, i) => (
                <WorkerCard
                  key={w.consumerTag}
                  worker={w}
                  color="#58a6ff"
                  rank={i + 1}
                  maxAckRate={maxMergeAck}
                />
              ))}
          </div>
        ) : (
          <p className={styles.workerNone}>Keine Worker registriert</p>
        )}
      </div>
    </div>
  );
}
