import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useI18n } from "../i18n";
import {
  useAllReminders,
  useAllMarkers,
  markReminderDone,
  deleteMarkerGlobal,
  type GlobalReminder,
  type GlobalMarker,
} from "../store/localData";
import { cleanFileName } from "../utils/filename";

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--text-3)",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function ReminderRow({
  reminder,
  onOpen,
}: {
  reminder: GlobalReminder;
  onOpen: (path: string) => void;
}) {
  const t = useI18n();
  const name = cleanFileName(
    reminder.filepath.split("/").pop() ?? reminder.filepath,
  );
  const isOverdue = reminder.at
    ? new Date(reminder.at).getTime() < Date.now()
    : false;

  return (
    <div
      className="card-sm"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
      }}
    >
      <div
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        onClick={() => onOpen(reminder.filepath)}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-1)",
            fontFamily: "JetBrains Mono, monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={reminder.filepath}
        >
          {name}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "0.68rem",
            color: isOverdue ? "var(--danger)" : "var(--text-3)",
          }}
        >
          {reminder.at
            ? new Date(reminder.at).toLocaleString()
            : t.st_reminderNoDate}
          {isOverdue && ` · ${t.st_reminderOverdue}`}
          {reminder.note ? ` · ${reminder.note}` : ""}
        </p>
        <p
          style={{
            margin: "1px 0 0",
            fontSize: "0.6rem",
            color: "var(--text-3)",
          }}
        >
          {t.st_reminderSetAt}:{" "}
          {reminder.created_at
            ? new Date(reminder.created_at).toLocaleString()
            : t.st_unknown}
          {reminder.done_at &&
            ` · ${t.st_reminderMarkDone.toLowerCase()} ${new Date(reminder.done_at).toLocaleString()}`}
        </p>
      </div>
      <button
        className="btn btn-ghost"
        style={{ fontSize: "0.7rem", padding: "3px 9px", flexShrink: 0 }}
        onClick={() => onOpen(reminder.filepath)}
      >
        {t.st_reminderOpenFile}
      </button>
      {!reminder.done_at && (
        <button
          className="btn btn-ghost"
          style={{ fontSize: "0.7rem", padding: "3px 9px", flexShrink: 0 }}
          onClick={() => markReminderDone(reminder.filepath)}
        >
          {t.st_reminderMarkDone}
        </button>
      )}
    </div>
  );
}

function MarkerRow({
  marker,
  onOpen,
  onDelete,
}: {
  marker: GlobalMarker;
  onOpen: (path: string, pageIdx: number) => void;
  onDelete: (path: string, boxKey: string) => void;
}) {
  const t = useI18n();
  const name = cleanFileName(
    marker.filepath.split("/").pop() ?? marker.filepath,
  );

  return (
    <div
      className="card-sm"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
      }}
    >
      <div
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        onClick={() => onOpen(marker.filepath, marker.page_idx)}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-1)",
            fontFamily: "JetBrains Mono, monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={marker.filepath}
        >
          {name}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "0.68rem",
            color: "var(--text-3)",
          }}
        >
          {t.mm_page(marker.page_idx + 1)} ·{" "}
          {marker.kind === "ocr" ? t.mm_kindOcr : t.mm_kindDrawn}
          {marker.note ? ` · ${marker.note}` : ""}
        </p>
        <p
          style={{
            margin: "1px 0 0",
            fontSize: "0.6rem",
            color: "var(--text-3)",
          }}
        >
          {new Date(marker.created_at).toLocaleString()}
        </p>
      </div>
      <button
        className="btn btn-ghost"
        style={{ fontSize: "0.7rem", padding: "3px 9px", flexShrink: 0 }}
        onClick={() => onOpen(marker.filepath, marker.page_idx)}
      >
        {t.st_reminderOpenFile}
      </button>
      <button
        className="btn btn-danger"
        style={{ fontSize: "0.7rem", padding: "3px 9px", flexShrink: 0 }}
        onClick={() => onDelete(marker.filepath, marker.box_key)}
      >
        {t.mm_delete}
      </button>
    </div>
  );
}

export default function RemindersMarkersPage() {
  const t = useI18n();
  const nav = useNavigate();
  const allReminders = useAllReminders();
  const allMarkers = useAllMarkers();
  const [showAllReminders, setShowAllReminders] = useState(false);

  const pendingReminders = allReminders
    .filter((r) => !r.done_at)
    .sort((a, b) => {
      if (!a.at && !b.at) return 0;
      if (!a.at) return 1;
      if (!b.at) return -1;
      return new Date(a.at).getTime() - new Date(b.at).getTime();
    });
  const doneReminders = allReminders
    .filter((r) => r.done_at)
    .sort(
      (a, b) =>
        new Date(b.done_at as string).getTime() -
        new Date(a.done_at as string).getTime(),
    );
  const remindersToShow = showAllReminders
    ? [...pendingReminders, ...doneReminders]
    : pendingReminders;

  const sortedMarkers = [...allMarkers].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  function openFile(filepath: string, pageIdx?: number) {
    nav(
      `/document?filepath=${encodeURIComponent(filepath)}${
        pageIdx != null ? `&page=${pageIdx}` : ""
      }`,
    );
  }

  return (
    <div style={{ padding: "18px 24px", overflowY: "auto", height: "100%" }}>
      <h1
        style={{
          margin: "0 0 4px",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text-1)",
        }}
      >
        {t.mm_title}
      </h1>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: "0.76rem",
          color: "var(--text-3)",
        }}
      >
        {t.mm_subtitle}
      </p>

      <Section
        label={
          pendingReminders.length > 0
            ? `${t.st_reminders} (${pendingReminders.length})`
            : t.st_reminders
        }
      >
        {doneReminders.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={() => setShowAllReminders((v) => !v)}
            style={{ fontSize: "0.68rem", padding: "3px 9px", marginBottom: 8 }}
          >
            {showAllReminders
              ? t.st_remindersShowPendingOnly
              : `${t.st_remindersShowAll} (${doneReminders.length} ${t.st_done.toLowerCase()})`}
          </button>
        )}
        {remindersToShow.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {remindersToShow.map((r) => (
              <ReminderRow key={r.filepath} reminder={r} onOpen={openFile} />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-3)" }}>
            {t.st_remindersEmpty}
          </p>
        )}
      </Section>

      <Section
        label={
          sortedMarkers.length > 0
            ? `${t.mm_markers} (${sortedMarkers.length})`
            : t.mm_markers
        }
      >
        {sortedMarkers.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sortedMarkers.map((m) => (
              <MarkerRow
                key={`${m.filepath}:${m.box_key}`}
                marker={m}
                onOpen={openFile}
                onDelete={(path, boxKey) => deleteMarkerGlobal(path, boxKey)}
              />
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-3)" }}>
            {t.mm_markersEmpty}
          </p>
        )}
      </Section>
    </div>
  );
}
