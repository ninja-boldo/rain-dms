import React, { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../lib/AppContext";
import styles from "./Dashboard.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatsData {
  total_documents?: number;
  total_pages?: number;
  pages_with_ocr?: number;
  ocr_coverage_pct?: number;
  avg_pages_per_doc?: number;
  total_size_bytes?: number;
  added_last_1h?: number;
  added_last_24h?: number;
  added_last_7d?: number;
  added_last_30d?: number;
  in_progress?: number;
  ocr_throughput?: number;
  pages_per_minute_30s?: number;
  pages_per_minute_60s?: number;
  currently_processing?: number;
  eta_seconds?: number;
  ocr_queue_length?: number;
  merge_queue_length?: number;
  ocr_workers_active?: number;
  ocr_workers_total?: number;
  merge_workers_active?: number;
  merge_workers_total?: number;
  sparkline?: number[];
  by_extension?: Record<string, number>;
  biggest_files?: Array<{
    filepath: string;
    size_bytes: number;
    page_count?: number;
  }>;
  ext_distribution?: Record<string, number>;
}

interface QueueMsg {
  payload: string;
  redelivered?: boolean;
}
interface QueueData {
  ocr_queue: { messages: number; messages_ready: number; preview?: QueueMsg[] };
  merge_queue: {
    messages: number;
    messages_ready: number;
    preview?: QueueMsg[];
  };
}

interface WorkerEntry {
  id: string;
  port: number;
  tag: string;
  ack_per_sec: number;
  unacked: number;
  prefetch: number;
  consumer_tag?: string;
  last_seen?: string;
  ip?: string;
  peerHost?: string;
  peerPort?: number;
  active?: boolean;
}

interface WorkerData {
  ocr: WorkerEntry[];
  merge: WorkerEntry[];
}

interface DlWorker {
  id: string;
  tag: string;
  downloads: number;
  bytes: number;
  last_seen?: string;
  ip?: string;
}
interface DownloadStatsData {
  workers: DlWorker[];
  total: number;
  total_bytes?: number;
}

interface QueueHealth {
  status: "healthy" | "warning" | "critical";
  message: string;
  suggestions: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n?: number | null) {
  if (n === undefined || n === null) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function fmtBytes(b?: number | null) {
  if (!b) return "0 B";
  if (b >= 1024 ** 4) return (b / 1024 ** 4).toFixed(2) + " TB";
  if (b >= 1024 ** 3) return (b / 1024 ** 3).toFixed(2) + " GB";
  if (b >= 1024 ** 2) return (b / 1024 ** 2).toFixed(1) + " MB";
  if (b >= 1024) return (b / 1024).toFixed(0) + " KB";
  return b + " B";
}

function fmtDuration(seconds?: number | null) {
  if (!seconds || seconds < 0) return "N/A";
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function fmtRate(pages?: number | null) {
  if (!pages || pages < 0) return "0/min";
  return `${pages.toFixed(1)}/min`;
}

function getFilename(fp: string) {
  const name = fp.split(/[/\\]/).pop() ?? fp;
  return name
    .replace(
      /-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\.(pdf|png|jpe?g)$/i,
      ".$1",
    )
    .replace(
      /-\d{4}-\d{2}-\d{2}[T_]\d{2}[:\-]\d{2}[:\-]\d{2}[.\dZ]*\.(pdf|png|jpe?g)$/i,
      ".$1",
    )
    .replace(/\.(pdf|png|jpe?g)$/i, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
    .slice(0, 44);
}

function timeAgo(iso?: string) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function getQueueHealth(
  queueLength: number,
  workersActive: number,
  workersTotal: number,
  rate: number,
): QueueHealth {
  if (queueLength === 0 && workersActive === 0) {
    return {
      status: "healthy",
      message: "Idle",
      suggestions: ["Upload documents to start"],
    };
  }
  if (queueLength === 0) {
    return { status: "healthy", message: "Queue empty", suggestions: [] };
  }
  const eta = rate > 0 ? (queueLength / rate) * 60 : 0;
  if (workersActive === 0) {
    return {
      status: "critical",
      message: `No workers! ${queueLength} waiting`,
      suggestions: ["Start worker processes", "Check connections"],
    };
  }
  if (eta > 3600) {
    return {
      status: "warning",
      message: `~${fmtDuration(eta)} to clear`,
      suggestions: ["Scale up workers", `Rate: ${fmtRate(rate)}`],
    };
  }
  if (workersActive < workersTotal * 0.5 && workersTotal > 0) {
    return {
      status: "warning",
      message: `${workersActive}/${workersTotal} active`,
      suggestions: ["Some workers idle"],
    };
  }
  return {
    status: "healthy",
    message: `${queueLength} items`,
    suggestions: [],
  };
}

function getExtIcon(ext: string): string {
  const icons: Record<string, string> = {
    pdf: "📄",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    doc: "📝",
    docx: "📝",
    txt: "📃",
  };
  return icons[ext.toLowerCase()] || "📁";
}

// ─── Animated number ─────────────────────────────────────────────────────────
function AnimNum({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setDisp(value);
  }, [value]);
  return (
    <span className={styles.animNum}>
      {disp}
      {suffix}
    </span>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({
  data,
  color = "var(--accent)",
}: {
  data: number[];
  color?: string;
}) {
  if (!data?.length) return <span className={styles.sparkEmpty}>no data</span>;
  const max = Math.max(...data, 1);
  const W = 140,
    H = 32,
    pad = 2;
  const pts = data
    .map((v, i) => {
      const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
      const y = H - pad - (v / max) * (H - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const area = `${pad},${H - pad} ${pts} ${W - pad},${H - pad}`;
  const gradientId = `sg-${(Math.random() * 10000).toFixed(0)}`;
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className={styles.sparkSvg}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}

// ─── Progress Ring ───────────────────────────────────────────────────────────
function ProgressRing({
  progress,
  size = 60,
}: {
  progress: number;
  size?: number;
}) {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} className={styles.progressRing}>
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
    </svg>
  );
}

// ─── Health Badge ───────────────────────────────────────────────────────────
function HealthBadge({ health }: { health: QueueHealth }) {
  const statusStyles = {
    healthy: styles.healthBadgeHealthy,
    warning: styles.healthBadgeWarning,
    critical: styles.healthBadgeCritical,
  };
  const colors = {
    healthy: "var(--success)",
    warning: "var(--warning)",
    critical: "var(--danger)",
  };
  return (
    <div className={`${styles.healthBadge} ${statusStyles[health.status]}`}>
      <span
        className={styles.healthDot}
        style={{ background: colors[health.status] }}
      />
      <span className={styles.healthText}>{health.message}</span>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  rawValue,
  icon,
  color = "accent",
}: {
  label: string;
  value: string | React.ReactNode;
  rawValue?: string | number;
  icon?: React.ReactNode;
  color?: "accent" | "success" | "warning" | "danger";
}) {
  const colors = {
    accent: "--accent",
    success: "--success",
    warning: "--warning",
    danger: "--danger",
  };
  const cssVar = colors[color] || colors.accent;
  return (
    <div
      className={styles.statCard}
      title={rawValue !== undefined ? String(rawValue) : undefined}
    >
      <div className={styles.statCardHeader}>
        {icon && (
          <div
            className={styles.statCardIcon}
            style={{ color: `var(${cssVar})` }}
          >
            {icon}
          </div>
        )}
        <span className={styles.statCardLabel}>{label}</span>
      </div>
      <span
        className={styles.statCardValue}
        style={{ color: `var(${cssVar})` }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Queue Peek ─────────────────────────────────────────────────────────────
function QueuePeek({ msgs }: { msgs: QueueMsg[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? msgs : msgs.slice(0, 4);
  return (
    <div className={styles.peekList}>
      {shown.map((m, i) => (
        <div key={i} className={styles.peekRow}>
          {m.redelivered && <span className={styles.redeliveredBadge}>↩</span>}
          <span className={styles.peekText} title={m.payload}>
            {m.payload.length > 72 ? m.payload.slice(0, 72) + "..." : m.payload}
          </span>
        </div>
      ))}
      {msgs.length > 4 && (
        <button className={styles.peekMore} onClick={() => setAll((v) => !v)}>
          {all ? "▲ Show less" : `▼ ${msgs.length - 4} more`}
        </button>
      )}
    </div>
  );
}

// ─── Extension Chart ─────────────────────────────────────────────────────────
function ExtensionChart({ extDist }: { extDist: Record<string, number> }) {
  const entries = Object.entries(extDist).sort((a, b) => b[1] - a[1]);
  const total = Object.values(extDist).reduce((a, b) => a + b, 0);
  if (entries.length === 0) return null;
  return (
    <div className={styles.extChart}>
      {entries.map(([ext, count], i) => {
        const pct = (count / total) * 100;
        const hue = (i * 60) % 360;
        return (
          <div key={ext} className={styles.extChartRow}>
            <span className={styles.extChartLabel}>
              <span>{getExtIcon(ext)}</span> .{ext}
            </span>
            <div className={styles.extChartBarContainer}>
              <div
                className={styles.extChartBar}
                style={{
                  width: `${pct}%`,
                  background: `hsl(${hue}, 70%, 55%)`,
                }}
              />
            </div>
            <span className={styles.extChartCount}>{fmt(count)}</span>
            <span className={styles.extChartPercent}>{pct.toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Throughput Card ────────────────────────────────────────────────────────
function ThroughputCard({
  rate30s,
  rate60s,
  sparkline,
}: {
  rate30s?: number;
  rate60s?: number;
  sparkline?: number[];
}) {
  const rate = rate30s ?? rate60s ?? 0;
  return (
    <div className={styles.throughputCard}>
      <div className={styles.throughputHeader}>
        <span className={styles.throughputTitle}>OCR Throughput</span>
        <span className={styles.throughputRate}>{fmtRate(rate)}</span>
      </div>
      {sparkline && (
        <div className={styles.throughputChart}>
          <Sparkline data={sparkline} />
        </div>
      )}
      <div className={styles.throughputDetails}>
        <span className={styles.throughputDetail}>
          <span className={styles.throughputDetailLabel}>30s:</span>
          <span className={styles.throughputDetailValue}>
            {fmtRate(rate30s)}
          </span>
        </span>
        <span className={styles.throughputDetail}>
          <span className={styles.throughputDetailLabel}>60s:</span>
          <span className={styles.throughputDetailValue}>
            {fmtRate(rate60s)}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Queue Status Grid ──────────────────────────────────────────────────────
function QueueStatusGrid({
  ocrLen,
  mergeLen,
  workersActive,
  workersTotal,
  rate,
}: {
  ocrLen: number;
  mergeLen: number;
  workersActive: number;
  workersTotal: number;
  rate: number;
}) {
  const ocrHealth = getQueueHealth(ocrLen, workersActive, workersTotal, rate);
  const mergeHealth = getQueueHealth(
    mergeLen,
    workersActive,
    workersTotal,
    rate,
  );
  return (
    <div className={styles.queueStatusGrid}>
      <div className={styles.queueStatusItem}>
        <div className={styles.queueStatusHeader}>
          <span className={styles.queueStatusName}>OCR Queue</span>
          <span className={styles.queueStatusCount}>{fmt(ocrLen)}</span>
        </div>
        <HealthBadge health={ocrHealth} />
      </div>
      <div className={styles.queueStatusItem}>
        <div className={styles.queueStatusHeader}>
          <span className={styles.queueStatusName}>Merge Queue</span>
          <span className={styles.queueStatusCount}>{fmt(mergeLen)}</span>
        </div>
        <HealthBadge health={mergeHealth} />
      </div>
      <div className={styles.queueStatusItem}>
        <div className={styles.queueStatusHeader}>
          <span className={styles.queueStatusName}>Workers</span>
          <span className={styles.queueStatusCount}>
            {workersActive}/{workersTotal}
          </span>
        </div>
        <ProgressRing
          progress={(workersActive / Math.max(workersTotal, 1)) * 100}
        />
      </div>
      <div className={styles.queueStatusItem}>
        <div className={styles.queueStatusHeader}>
          <span className={styles.queueStatusName}>Rate</span>
          <span className={styles.queueStatusCount}>{fmtRate(rate)}</span>
        </div>
        <div className={styles.queueRateIndicator}>
          <div
            className={styles.queueRateBar}
            style={{
              width: `${Math.max(0, Math.min(((rate ?? 0) / 10) * 100, 100))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Worker Card ─────────────────────────────────────────────────────────────
function WorkerCard({ worker, index }: { worker: WorkerEntry; index: number }) {
  const isActive = worker.ack_per_sec > 0 || worker.unacked > 0;
  const ago = timeAgo(worker.last_seen);
  const ipDisplay = worker.ip || worker.peerHost || null;
  const portDisplay = worker.peerPort ?? worker.port;
  return (
    <div
      className={`${styles.workerCard} ${isActive ? styles.workerCardActive : styles.workerCardInactive}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className={styles.workerCardTop}>
        {/* IP address as primary identifier */}
        <div className={styles.workerIdent}>
          {ipDisplay ? (
            <span className={styles.workerIpPrimary} title="Worker IP address">
              {ipDisplay}
              {portDisplay && <span className={styles.workerPortSuffix}>:{portDisplay}</span>}
            </span>
          ) : (
            <>
              <span className={styles.workerNum}>#{index + 1}</span>
              <span className={styles.workerPort}>:{portDisplay}</span>
            </>
          )}
        </div>
        <span className={styles.workerTag}>{worker.tag}</span>
        <span
          className={`${styles.workerDot} ${isActive ? styles.workerDotActive : ""}`}
          title={isActive ? "Active" : "Idle"}
        />
      </div>
      <div className={styles.workerMetrics}>
        <div className={styles.metric}>
          <span className={styles.metricVal}>
            {worker.ack_per_sec.toFixed(2)}
          </span>
          <span className={styles.metricLbl}>ACK/s</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metric}>
          <span className={styles.metricVal}>{worker.unacked}</span>
          <span className={styles.metricLbl}>unacked</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metric}>
          <span className={styles.metricVal}>{worker.prefetch}</span>
          <span className={styles.metricLbl}>prefetch</span>
        </div>
      </div>
      {(worker.consumer_tag || ago) && (
        <div className={styles.workerFooter}>
          {worker.consumer_tag && (
            <span className={styles.consumerTag} title={worker.consumer_tag}>
              {worker.consumer_tag.slice(0, 28)}
            </span>
          )}
          {ago && <span className={styles.workerAgo}>{ago}</span>}
        </div>
      )}
    </div>
  );
}

// ─── File Chart ─────────────────────────────────────────────────────────────
function FileChart({
  files,
  maxSize,
  type,
}: {
  files: Array<{ filepath: string; size_bytes: number; page_count?: number }>;
  maxSize: number;
  type: "size" | "pages";
}) {
  const sorted = [...files]
    .sort((a, b) =>
      type === "size"
        ? b.size_bytes - a.size_bytes
        : (b.page_count ?? 0) - (a.page_count ?? 0),
    )
    .slice(0, 8);
  const isPages = type === "pages";
  return (
    <div className={styles.fileChart}>
      {sorted.map((f, i) => {
        const val = isPages ? (f.page_count ?? 0) : f.size_bytes;
        const pct = (val / maxSize) * 100;
        return (
          <div key={i} className={styles.fileChartRow}>
            <span className={styles.fileRank}>#{i + 1}</span>
            <span className={styles.fileChartName} title={f.filepath}>
              {getFilename(f.filepath)}
            </span>
            <div className={styles.fileChartBarContainer}>
              <div
                className={styles.fileChartBar}
                style={{
                  width: `${pct}%`,
                  background: isPages ? "var(--success)" : "var(--accent)",
                }}
              />
            </div>
            <span className={styles.fileChartVal}>
              {isPages ? f.page_count + " pg" : fmtBytes(f.size_bytes)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Download Table ─────────────────────────────────────────────────────────
function DownloadTable({
  workers,
  total,
  totalBytes,
}: {
  workers: DlWorker[];
  total: number;
  totalBytes?: number;
}) {
  return (
    <div className={styles.dlTable}>
      {[...workers]
        .sort((a, b) => b.downloads - a.downloads)
        .map((w, i) => {
          const pct = total > 0 ? (w.downloads / total) * 100 : 0;
          const ago = timeAgo(w.last_seen);
          return (
            <div
              key={w.id}
              className={styles.dlRow}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={styles.dlRowLeft}>
                <span className={styles.dlRank}>#{i + 1}</span>
                <div className={styles.dlWorkerInfo}>
                  {w.ip && <span className={styles.dlIp}>{w.ip}</span>}
                  <span className={styles.dlTag}>{w.tag}</span>
                  {ago && <span className={styles.dlAgo}>{ago}</span>}
                </div>
              </div>
              <div className={styles.dlRowBar}>
                <div className={styles.dlBarTrack}>
                  <div
                    className={styles.dlBarFill}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className={styles.dlRowStats}>
                  <span className={styles.dlCount}>{w.downloads}</span>
                  <span className={styles.dlBytes}>{fmtBytes(w.bytes)}</span>
                  <span className={styles.dlPct}>{pct.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

// ─── Collapsible Section ────────────────────────────────────────────────────
function Section({
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  title: string;
  badge?: string | number | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button
        className={styles.sectionHeader}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={styles.sectionChevron}
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          ›
        </span>
        <span className={styles.sectionTitle}>{title}</span>
        {badge !== undefined && (
          <span className={styles.sectionBadge}>{badge}</span>
        )}
        <span className={styles.sectionLine} />
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`${styles.kpiCard} ${accent ? styles.kpiCardAccent : ""} ${warn ? styles.kpiCardWarn : ""}`}
    >
      <span className={styles.kpiLabel}>{label}</span>
      <AnimNum value={value} />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { settings, getAuthHeaders } = useApp();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [queues, setQueues] = useState<QueueData | null>(null);
  const [workers, setWorkers] = useState<WorkerData | null>(null);
  const [dlStats, setDlStats] = useState<DownloadStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [expandedQueue, setExpandedQueue] = useState<"ocr" | "merge" | null>(
    null,
  );
  const [tick, setTick] = useState(0);

  const fetchAll = useCallback(async () => {
    const base = settings.serverUrl;
    const h = getAuthHeaders();
    // /stats and /worker-download-stats are public (no auth needed).
    // /workers and /queue-peek require auth — send headers explicitly.
    const [statsR, workersR, dlR, qR] = await Promise.allSettled([
      fetch(`${base}/stats`).then((r) => r.ok ? r.json() : null),
      fetch(`${base}/workers`, { headers: h }).then((r) => r.ok ? r.json() : null),
      fetch(`${base}/worker-download-stats`).then((r) => r.ok ? r.json() : null),
      fetch(`${base}/queue-peek`, { headers: h }).then((r) => r.ok ? r.json() : null),
    ]);
    if (statsR.status === "fulfilled" && statsR.value) setStats(statsR.value);
    if (workersR.status === "fulfilled" && workersR.value) setWorkers(workersR.value);
    if (dlR.status === "fulfilled" && dlR.value) setDlStats(dlR.value);
    if (qR.status === "fulfilled" && qR.value) setQueues(qR.value);
    setLastRefresh(new Date());
    setLoading(false);
  }, [settings.serverUrl, getAuthHeaders]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 5000);
    const tid = setInterval(() => setTick((t) => t + 1), 10000);
    return () => {
      clearInterval(id);
      clearInterval(tid);
    };
  }, [fetchAll]);

  const ocrWorkersActive = stats?.ocr_workers_active ?? 0;
  const ocrWorkersTotal = stats?.ocr_workers_total ?? 0;
  const mergeWorkersActive = stats?.merge_workers_active ?? 0;
  const mergeWorkersTotal = stats?.merge_workers_total ?? 0;
  const allWorkers = [...(workers?.ocr ?? []), ...(workers?.merge ?? [])];
  const activeW = allWorkers.filter(
    (w) => w.ack_per_sec > 0 || w.unacked > 0,
  ).length;
  const totalW = allWorkers.length;
  const effectiveActiveW =
    activeW > 0
      ? activeW
      : (ocrWorkersActive > 0 ? ocrWorkersActive : 0) +
        (mergeWorkersActive > 0 ? mergeWorkersActive : 0);
  const effectiveTotalW =
    totalW > 0
      ? totalW
      : (ocrWorkersTotal > 0 ? ocrWorkersTotal : 0) +
        (mergeWorkersTotal > 0 ? mergeWorkersTotal : 0);
  const ocrQ = queues?.ocr_queue;
  const mergeQ = queues?.merge_queue;
  const bigFiles = stats?.biggest_files ?? [];
  const extDist = stats?.by_extension ?? {};
  const totalPages =
    stats?.total_pages ?? bigFiles.reduce((s, f) => s + (f.page_count ?? 0), 0);
  const totalSize = stats?.total_size_bytes ?? dlStats?.total_bytes;
  const pagesWithOcr = stats?.pages_with_ocr ?? 0;
  const ocrCoverage =
    stats?.ocr_coverage_pct ??
    (totalPages && pagesWithOcr
      ? Math.round((pagesWithOcr / totalPages) * 100)
      : 0);
  const ocrQueueLen = ocrQ?.messages ?? 0;
  const mergeQueueLen = mergeQ?.messages ?? 0;
  const processingRate =
    stats?.pages_per_minute_30s ?? stats?.pages_per_minute_60s ?? 0;
  const etaSeconds = stats?.eta_seconds ?? 0;
  const maxFileSize = bigFiles[0]?.size_bytes ?? 1;
  const maxFilePages = Math.max(...bigFiles.map((f) => f.page_count ?? 0), 1);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Dashboard</h1>
          {lastRefresh && (
            <span className={styles.liveChip}>
              <span className={styles.liveDot} />
              <span className={styles.liveText}>
                Live · {lastRefresh.toLocaleTimeString()}
              </span>
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          <HealthBadge
            health={getQueueHealth(
              ocrQueueLen,
              effectiveActiveW,
              effectiveTotalW,
              processingRate,
            )}
          />
          <button className={styles.refreshBtn} onClick={fetchAll}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={styles.skeleton}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.statsHeader}>
            <StatCard
              label="Total Documents"
              value={fmt(stats?.total_documents)}
              rawValue={stats?.total_documents}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
            />
            <StatCard
              label="Total Pages"
              value={fmt(totalPages)}
              rawValue={totalPages}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              }
              color="success"
            />
            <StatCard
              label="OCR Coverage"
              value={`${ocrCoverage}%`}
              rawValue={pagesWithOcr}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              }
              color="accent"
            />
            <StatCard
              label="Storage"
              value={fmtBytes(totalSize)}
              rawValue={totalSize}
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4" />
                </svg>
              }
              color="warning"
            />
          </div>

          <ThroughputCard
            rate30s={stats?.pages_per_minute_30s}
            rate60s={stats?.pages_per_minute_60s}
            sparkline={stats?.sparkline}
          />

          <QueueStatusGrid
            ocrLen={ocrQueueLen}
            mergeLen={mergeQueueLen}
            workersActive={effectiveActiveW}
            workersTotal={effectiveTotalW}
            rate={processingRate}
          />

          <Section
            title="Document Statistics"
            badge={`${fmt(stats?.total_documents)} docs`}
          >
            <div className={styles.kpiRow}>
              <KpiCard
                label="Added last 1h"
                value={fmt(stats?.added_last_1h)}
                accent
              />
              <KpiCard
                label="Added last 24h"
                value={fmt(stats?.added_last_24h)}
                accent
              />
              <KpiCard
                label="Added last 7d"
                value={fmt(stats?.added_last_7d)}
                accent
              />
              <KpiCard
                label="Added last 30d"
                value={fmt(stats?.added_last_30d)}
                accent
              />
              <KpiCard
                label="Avg pages/doc"
                value={
                  stats?.avg_pages_per_doc
                    ? stats.avg_pages_per_doc.toFixed(1)
                    : totalPages && stats?.total_documents
                      ? (totalPages / stats.total_documents).toFixed(1)
                      : "0"
                }
              />
              <KpiCard
                label="Pages with OCR"
                value={fmt(pagesWithOcr)}
                accent
              />
              <KpiCard
                label="In Processing"
                value={fmt(stats?.in_progress ?? stats?.currently_processing)}
                warn={(stats?.in_progress ?? 0) > 0}
              />
              <KpiCard label="ETA" value={fmtDuration(etaSeconds)} />
            </div>
            {Object.keys(extDist).length > 0 && (
              <div className={styles.extRow}>
                <span className={styles.extRowTitle}>
                  File Type Distribution
                </span>
                <ExtensionChart extDist={extDist} />
              </div>
            )}
          </Section>

          <Section
            title="Pipeline Flow"
            badge={`${effectiveActiveW}/${effectiveTotalW} active`}
          >
            <div className={styles.pipeline}>
              <div
                className={`${styles.pipeNode} ${(ocrQ?.messages ?? 0) > 0 ? styles.pipeNodeLit : ""}`}
              >
                <div className={styles.pipeNodeHeader}>
                  <span className={styles.pipeNodeName}>OCR-QUEUE</span>
                  <span
                    className={styles.pipeNodeCount}
                    style={{
                      color:
                        (ocrQ?.messages ?? 0) > 0
                          ? "var(--accent)"
                          : "var(--text-muted)",
                    }}
                  >
                    {fmt(ocrQ?.messages)}
                  </span>
                </div>
                <div className={styles.pipeNodeSub}>
                  {ocrQ?.messages_ready ?? 0} ready
                </div>
                {(ocrQ?.messages ?? 0) > 0 && (
                  <button
                    className={styles.pipeExpandBtn}
                    onClick={() =>
                      setExpandedQueue(expandedQueue === "ocr" ? null : "ocr")
                    }
                  >
                    {expandedQueue === "ocr" ? "▲" : "▼"} peek
                  </button>
                )}
                {expandedQueue === "ocr" && ocrQ?.preview && (
                  <QueuePeek msgs={ocrQ.preview} />
                )}
              </div>
              <div className={styles.pipe}>
                <div
                  className={`${styles.pipeFlow} ${(ocrQ?.messages ?? 0) > 0 ? styles.pipeFlowActive : ""}`}
                />
              </div>
              <div
                className={`${styles.pipeNode} ${styles.pipeNodeWorkers} ${effectiveActiveW > 0 ? styles.pipeNodeLit : ""}`}
              >
                <div className={styles.pipeNodeHeader}>
                  <span className={styles.pipeNodeName}>WORKERS</span>
                  <span
                    className={styles.pipeNodeCount}
                    style={{
                      color:
                        effectiveActiveW > 0
                          ? "var(--success)"
                          : "var(--text-muted)",
                    }}
                  >
                    {effectiveActiveW}/{effectiveTotalW}
                  </span>
                </div>
                <div className={styles.workerDotRow}>
                  {allWorkers.map((w, i) => (
                    <span
                      key={i}
                      className={styles.workerPipeDot}
                      style={{
                        background:
                          w.ack_per_sec > 0
                            ? "var(--success)"
                            : "var(--border-accent)",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.pipe}>
                <div
                  className={`${styles.pipeFlow} ${effectiveActiveW > 0 ? styles.pipeFlowActive : ""}`}
                />
              </div>
              <div
                className={`${styles.pipeNode} ${(mergeQ?.messages ?? 0) > 0 ? styles.pipeNodeLit : ""}`}
              >
                <div className={styles.pipeNodeHeader}>
                  <span className={styles.pipeNodeName}>MERGE-QUEUE</span>
                  <span
                    className={styles.pipeNodeCount}
                    style={{
                      color:
                        (mergeQ?.messages ?? 0) > 0
                          ? "var(--accent)"
                          : "var(--text-muted)",
                    }}
                  >
                    {fmt(mergeQ?.messages)}
                  </span>
                </div>
                <div className={styles.pipeNodeSub}>
                  {(mergeQ?.messages ?? 0) === 0
                    ? "empty"
                    : `${mergeQ?.messages_ready ?? 0} ready`}
                </div>
                {(mergeQ?.messages ?? 0) > 0 && (
                  <button
                    className={styles.pipeExpandBtn}
                    onClick={() =>
                      setExpandedQueue(
                        expandedQueue === "merge" ? null : "merge",
                      )
                    }
                  >
                    {expandedQueue === "merge" ? "▲" : "▼"} peek
                  </button>
                )}
                {expandedQueue === "merge" && mergeQ?.preview && (
                  <QueuePeek msgs={mergeQ.preview} />
                )}
              </div>
            </div>
          </Section>

          {allWorkers.length > 0 && (
            <Section
              title="Worker Details"
              badge={`${effectiveActiveW} active`}
              defaultOpen={effectiveActiveW > 0}
            >
              <div className={styles.workerGrid}>
                {allWorkers.map((w, i) => (
                  <WorkerCard key={w.id} worker={w} index={i} />
                ))}
              </div>
            </Section>
          )}

          {bigFiles.length > 0 && (
            <Section
              title="File Statistics"
              badge={`${bigFiles.length} files`}
              defaultOpen={false}
            >
              <div className={styles.fileStatsGrid}>
                <div className={styles.fileStatPanel}>
                  <div className={styles.fileStatPanelTitle}>By Size</div>
                  <FileChart
                    files={bigFiles}
                    maxSize={maxFileSize}
                    type="size"
                  />
                </div>
                {bigFiles.some((f) => f.page_count) && (
                  <div className={styles.fileStatPanel}>
                    <div className={styles.fileStatPanelTitle}>
                      By Page Count
                    </div>
                    <FileChart
                      files={bigFiles}
                      maxSize={maxFilePages}
                      type="pages"
                    />
                  </div>
                )}
              </div>
            </Section>
          )}

          {dlStats?.workers && dlStats.workers.length > 0 && (
            <Section title="Download Activity" badge={`${dlStats.total} total`}>
              <div className={styles.dlSummary}>
                <span className={styles.dlSummaryItem}>
                  <span className={styles.dlSummaryVal}>{dlStats.total}</span>{" "}
                  Downloads
                </span>
                {dlStats.total_bytes && (
                  <span className={styles.dlSummaryItem}>
                    <span className={styles.dlSummaryVal}>
                      {fmtBytes(dlStats.total_bytes)}
                    </span>{" "}
                    transferred
                  </span>
                )}
              </div>
              <DownloadTable
                workers={dlStats.workers}
                total={dlStats.total}
                totalBytes={dlStats.total_bytes}
              />
            </Section>
          )}
        </>
      )}
    </div>
  );
}
