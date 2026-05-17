import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../lib/AppContext";
import styles from "./Dashboard.module.css";

interface DashStats {
  total_documents: number;
  added_last_1h: number;
  added_last_24h: number;
  added_last_7d: number;
  docs_per_minute: number;
  ocr_queue_length: number;
  merge_queue_length: number;
  ocr_workers_active: number;
  merge_workers_active: number;
  ocr_workers_total: number;
  merge_workers_total: number;
  currently_processing: number;
}

/** -1 is a backend sentinel for "not implemented" */
function fmt(v: number | undefined, suffix = ""): string {
  if (v === undefined || v === null) return "—";
  if (v === -1) return "N/A";
  return v.toLocaleString("de-DE") + suffix;
}
function fmtFloat(v: number | undefined, decimals = 1, suffix = ""): string {
  if (v === undefined || v === null) return "—";
  if (v === -1) return "N/A";
  return v.toFixed(decimals) + suffix;
}

function StatCard({
  label,
  value,
  sub,
  accent,
  warn,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.statCardAccent : ""} ${warn ? styles.statCardWarn : ""}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={`${styles.statValue} ${value === "N/A" ? styles.statValueNa : ""}`}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  );
}

function WorkerDots({ active, total }: { active: number; total: number }) {
  const n = Math.max(total, active, 1);
  return (
    <div className={styles.workerDots}>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className={`${styles.workerDot} ${i < active ? styles.workerDotActive : ""}`}
        />
      ))}
    </div>
  );
}

function QueueViz({ length, label, color }: { length: number; label: string; color: string }) {
  const MAX_SHOWN = 14;
  const shown = Math.min(length, MAX_SHOWN);
  const overflow = length > MAX_SHOWN ? length - MAX_SHOWN : 0;

  return (
    <div className={styles.queueWrap}>
      <div className={styles.queueHeader}>
        <span className={styles.queueLabel}>{label}</span>
        <span className={styles.queueCount} style={{ color }}>
          {length} items
        </span>
      </div>
      <div className={styles.queueTrack}>
        <div className={styles.queueArrow} style={{ color }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
        <div className={styles.queueItems}>
          {Array.from({ length: shown }).map((_, i) => (
            <div
              key={i}
              className={styles.queueItem}
              style={{ background: color, animationDelay: `${i * 0.15}s`, opacity: 0.6 + (i / Math.max(shown, 1)) * 0.4 }}
            />
          ))}
          {overflow > 0 && (
            <div className={styles.queueOverflow} style={{ color }}>+{overflow}</div>
          )}
        </div>
        <div className={styles.queueWorker} style={{ borderTopColor: color }} />
      </div>
      {length === 0 && <p className={styles.queueEmpty}>Leer ✓</p>}
    </div>
  );
}

/** Proper sparkline with fill + grid lines + labels */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 100, H = 56;
  const max = Math.max(...data, 0.01);
  const nonZero = data.filter((v) => v > 0);
  const hasData = nonZero.length > 0;

  const pts = data.map((v, i) => ({
    x: (i / Math.max(data.length - 1, 1)) * W,
    y: H - (v / max) * H,
  }));

  const polylinePts = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const fillPts = `0,${H} ${polylinePts} ${W},${H}`;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={styles.sparkline}
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <line
          key={frac}
          x1="0"
          y1={H * frac}
          x2={W}
          y2={H * frac}
          stroke="currentColor"
          strokeWidth="0.4"
          strokeDasharray="2 3"
          opacity="0.2"
        />
      ))}
      {hasData && (
        <>
          <polygon points={fillPts} fill="url(#sparkGrad)" />
          <polyline
            points={polylinePts}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Only show dots at peaks / endpoints */}
          {[0, data.length - 1].map((i) => (
            <circle key={i} cx={pts[i].x} cy={pts[i].y} r="2" fill={color} opacity="0.9" />
          ))}
        </>
      )}
      {!hasData && (
        <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="6" fill="currentColor" opacity="0.3">
          keine Daten
        </text>
      )}
    </svg>
  );
}

/* Backend endpoint docs */
const BACKEND_SNIPPET = `// Add to your Hono index.ts:

app.get("/pages", async (c) => {
  const filepath = c.req.query("filepath");
  if (!filepath) return c.json({ error: "Missing filepath" }, 400);
  const res = await db
    .select({
      pageIdx: pagesTable.page_idx,
      banner_img: pagesTable.page_banner_url,
      ocr: pagesTable.ocr,
    })
    .from(pagesTable)
    .innerJoin(documentsTable, eq(pagesTable.file_id, documentsTable.file_id))
    .where(eq(documentsTable.filepath, filepath))
    .orderBy(asc(pagesTable.page_idx));
  return c.json({ pages: res });
});

// Also fix /main_page to return X-Total-Count:
app.get("/main_page", async (c) => {
  // ... existing query ...
  const countRes = await db
    .select({ count: sql\`count(*)\`.mapWith(Number) })
    .from(documentsTable);
  return c.json(res, 200, {
    "X-Total-Count": String(countRes[0].count),
  });
});

// Fix /stats sentinel values:
// docs_per_minute: compute from createdAt timestamps in last 5min
// currently_processing: ocr_queue_length + merge_queue_length`;

export default function Dashboard() {
  const { settings } = useApp();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [throughputHistory, setThroughputHistory] = useState<number[]>(Array(30).fill(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTotalRef = useRef<number | null>(null);
  const [showBackendDocs, setShowBackendDocs] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${settings.serverUrl}/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DashStats = await res.json();
      setStats(data);
      setError(null);

      // Compute docs_per_minute ourselves if backend returns -1
      const dpm = data.docs_per_minute === -1
        ? (prevTotalRef.current !== null && prevTotalRef.current !== data.total_documents
          ? ((data.total_documents - prevTotalRef.current) / (3 / 60))
          : 0)
        : data.docs_per_minute;

      prevTotalRef.current = data.total_documents;
      setThroughputHistory((prev) => [...prev.slice(1), Math.max(0, dpm)]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchStats();
    intervalRef.current = setInterval(fetchStats, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [settings.serverUrl]);

  const accentColor = "var(--accent)";
  const blueColor = "#58a6ff";

  const processingValue = stats?.currently_processing === -1
    ? fmt(
        (stats?.ocr_queue_length ?? 0) > 0 || (stats?.merge_queue_length ?? 0) > 0
          ? (stats?.ocr_queue_length ?? 0) + (stats?.merge_queue_length ?? 0)
          : 0
      )
    : fmt(stats?.currently_processing);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Live · alle 3 Sekunden</p>
        </div>
        <div className={styles.headerRight}>
          {error && (
            <div className={styles.errorBadge}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
          <div className={styles.pulse}>
            <span className={styles.pulseDot} />
            LIVE
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Gesamt-Dokumente" value={fmt(stats?.total_documents)} accent />
        <StatCard label="Letzte Stunde" value={fmt(stats?.added_last_1h)} sub="neue Dokumente" />
        <StatCard label="Letzte 24h" value={fmt(stats?.added_last_24h)} sub="neue Dokumente" />
        <StatCard label="Letzte 7 Tage" value={fmt(stats?.added_last_7d)} sub="neue Dokumente" />
        <StatCard
          label="Durchsatz"
          value={fmtFloat(
            stats?.docs_per_minute === -1 ? 0 : stats?.docs_per_minute,
            1, "/min"
          )}
          sub="Dokumente/Minute"
          warn={stats?.docs_per_minute === -1}
        />
        <StatCard
          label="In Bearbeitung"
          value={processingValue}
          sub="aktive Jobs"
        />
      </div>

      {/* Throughput sparkline — full width */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>Durchsatz-Verlauf</p>
          <div className={styles.sparkLegend}>
            <span className={styles.sparkLegendDot} style={{ background: accentColor }} />
            <span className={styles.sparkLegendLabel}>docs/min · letzte 90 Sekunden</span>
          </div>
        </div>
        <div className={styles.sparklineWrap}>
          <Sparkline data={throughputHistory} color="var(--accent)" />
          <div className={styles.sparklineAxisY}>
            <span>{Math.max(...throughputHistory, 0.01).toFixed(1)}</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Workers */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Worker-Status</p>
        <div className={styles.workersRow}>
          <div className={styles.workerBlock}>
            <div className={styles.workerBlockHeader}>
              <span className={styles.workerName}>OCR Workers</span>
              <span className={styles.workerActive} style={{ color: accentColor }}>
                {fmt(stats?.ocr_workers_active)} / {fmt(stats?.ocr_workers_total)} aktiv
              </span>
            </div>
            <WorkerDots active={stats?.ocr_workers_active ?? 0} total={stats?.ocr_workers_total ?? 1} />
          </div>
          <div className={styles.workerBlock}>
            <div className={styles.workerBlockHeader}>
              <span className={styles.workerName}>Merge Worker</span>
              <span className={styles.workerActive} style={{ color: blueColor }}>
                {fmt(stats?.merge_workers_active)} / {fmt(stats?.merge_workers_total)} aktiv
              </span>
            </div>
            <WorkerDots active={stats?.merge_workers_active ?? 0} total={stats?.merge_workers_total ?? 1} />
          </div>
        </div>
      </div>

      {/* Queues */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Warteschlangen</p>
        <div className={styles.queuesRow}>
          <QueueViz length={stats?.ocr_queue_length ?? 0} label="OCR-Queue → Worker" color={accentColor} />
          <div className={styles.queueConnector}>
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
              <line x1="0" y1="12" x2="28" y2="12" stroke="var(--border-accent)" strokeWidth="1.5" strokeDasharray="4 3"/>
              <polyline points="20 5 28 12 20 19" stroke="var(--border-accent)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <QueueViz length={stats?.merge_queue_length ?? 0} label="Merge-Queue → DB" color={blueColor} />
        </div>
      </div>

      {/* Backend docs */}
      <div className={styles.section}>
        <button
          className={styles.backendDocsToggle}
          onClick={() => setShowBackendDocs(!showBackendDocs)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points={showBackendDocs ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
          </svg>
          Backend-Änderungen die du machen musst
        </button>

        {showBackendDocs && (
          <div className={styles.backendDocsBody}>
            <p className={styles.backendDocsIntro}>
              Folgende Endpoints fehlen oder liefern Sentinel-Werte (<code>-1</code>).
              Füge diese zu deinem <code>index.ts</code> (Hono) hinzu:
            </p>
            <pre className={styles.apiCode}>{BACKEND_SNIPPET}</pre>
            <div className={styles.backendIssues}>
              <div className={styles.backendIssue}>
                <span className={styles.issueLabel}>❌ /pages</span>
                <span className={styles.issueDesc}>Fehlt komplett — nötig damit der Multi-Page-Viewer im Overlay funktioniert</span>
              </div>
              <div className={styles.backendIssue}>
                <span className={styles.issueLabel}>⚠ /stats docs_per_minute</span>
                <span className={styles.issueDesc}>Liefert -1 — berechne aus <code>created_at</code> Timestamps der letzten 5 Minuten</span>
              </div>
              <div className={styles.backendIssue}>
                <span className={styles.issueLabel}>⚠ /stats currently_processing</span>
                <span className={styles.issueDesc}>Liefert -1 — nutze <code>ocr_queue_length + merge_queue_length</code> als Proxy</span>
              </div>
              <div className={styles.backendIssue}>
                <span className={styles.issueLabel}>⚠ /main_page</span>
                <span className={styles.issueDesc}>Kein <code>X-Total-Count</code> Header — Gesamtanzahl im Archiv fehlt</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
