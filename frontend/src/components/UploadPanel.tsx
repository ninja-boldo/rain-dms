import { useCallback, useRef, useState } from "react";
import { useUploadStore, type UploadJob } from "../store/uploads";
import { useI18n } from "../i18n";

async function collectEntries(
  entry: FileSystemEntry,
  prefix = "",
): Promise<{ file: File; relativePath: string }[]> {
  if (entry.isFile) {
    return new Promise((res, rej) =>
      (entry as FileSystemFileEntry).file(
        (f) => res([{ file: f, relativePath: prefix + f.name }]),
        rej,
      ),
    );
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const all: FileSystemEntry[] = [];
    await new Promise<void>((res, rej) => {
      function readBatch() {
        reader.readEntries((entries) => {
          if (!entries.length) {
            res();
            return;
          }
          all.push(...entries);
          readBatch();
        }, rej);
      }
      readBatch();
    });
    const nested = await Promise.all(
      all.map((e) => collectEntries(e, prefix + entry.name + "/")),
    );
    return nested.flat();
  }
  return [];
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)}MB`;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "var(--text-3)",
  hashing: "var(--warn)",
  duplicate: "var(--text-3)",
  uploading: "var(--accent)",
  done: "var(--success)",
  skipped: "var(--text-3)",
  error: "var(--danger)",
};

const STATUS_LABEL = (j: UploadJob): string => {
  const s = j.status;
  if (s.state === "error") return `✗ ${s.message.slice(0, 50)}`;
  if (s.state === "skipped") return "— skipped";
  if (s.state === "uploading") return `↑ ${s.progress}%`;
  return (
    { pending: "·", hashing: "⟳ hashing…", duplicate: "= dup", done: "✓ done" }[
      s.state
    ] ?? s.state
  );
};

export default function UploadPanel() {
  const t = useI18n();
  const {
    jobs,
    isOpen,
    isMinimized,
    running,
    addFiles,
    start,
    abort,
    clearFinished,
    toggle,
    minimize,
    removeJob,
  } = useUploadStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const pending = jobs.filter((j) => j.status.state === "pending").length;
  const active = jobs.filter(
    (j) => j.status.state === "uploading" || j.status.state === "hashing",
  ).length;
  const done = jobs.filter((j) => j.status.state === "done").length;
  const errors = jobs.filter((j) => j.status.state === "error").length;
  const total = jobs.length;

  const [isDragging, setIsDragging] = useState(false);

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addFiles(files.map((f) => ({ file: f, relativePath: f.name })));
    e.target.value = "";
  };
  const onFolderPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addFiles(
      files.map((f) => ({
        file: f,
        relativePath: (f as any).webkitRelativePath || f.name,
      })),
    );
    e.target.value = "";
  };
  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const items = Array.from(e.dataTransfer.items);
      const collected: { file: File; relativePath: string }[] = [];
      for (const item of items) {
        if (item.kind !== "file") continue;
        const entry = item.webkitGetAsEntry?.();
        if (entry) collected.push(...(await collectEntries(entry)));
        else {
          const f = item.getAsFile();
          if (f) collected.push({ file: f, relativePath: f.name });
        }
      }
      if (collected.length) addFiles(collected);
    },
    [addFiles],
  );

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div
        onClick={() => minimize(false)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 200,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "8px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          userSelect: "none",
        }}
      >
        <UploadIco />
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-1)",
          }}
        >
          Uploads
        </span>
        {active > 0 && (
          <span
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              borderRadius: 999,
              padding: "1px 7px",
              fontSize: "0.65rem",
              fontWeight: 700,
            }}
          >
            {active}
          </span>
        )}
        {errors > 0 && (
          <span
            style={{
              background: "var(--danger)",
              color: "#fff",
              borderRadius: 999,
              padding: "1px 7px",
              fontSize: "0.65rem",
              fontWeight: 700,
            }}
          >
            {errors}
          </span>
        )}
        {running && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)",
              animation: "pulse 1s infinite",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 200,
        width: 400,
        maxWidth: "calc(100vw - 40px)",
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <UploadIco />
        <span style={{ fontWeight: 600, fontSize: "0.85rem", flex: 1 }}>
          Uploads
          {total > 0 && (
            <span
              style={{
                marginLeft: 6,
                fontSize: "0.68rem",
                color: "var(--text-3)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {done}/{total}
              {errors > 0 && (
                <span style={{ color: "var(--danger)", marginLeft: 4 }}>
                  · {errors} err
                </span>
              )}
            </span>
          )}
        </span>
        {running ? (
          <button
            onClick={abort}
            style={{
              ...btnSm,
              color: "var(--danger)",
              borderColor: "rgba(248,113,113,0.3)",
            }}
            title="Abort"
          >
            ■ Stop
          </button>
        ) : pending > 0 ? (
          <button
            onClick={start}
            style={{
              ...btnSm,
              background: "var(--accent-glow)",
              color: "var(--accent)",
              borderColor: "var(--accent)",
            }}
          >
            ▶ {t.ul_upload(pending)}
          </button>
        ) : null}
        {total > 0 && (
          <button
            onClick={clearFinished}
            style={btnSm}
            title="Clear done/error"
          >
            ✕ clear
          </button>
        )}
        <button
          onClick={() => minimize(true)}
          style={{ ...btnSm, fontSize: "0.7rem" }}
          title="Minimize"
        >
          ▼
        </button>
        <button
          onClick={toggle}
          style={{ ...btnSm, fontSize: "0.7rem" }}
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        style={{
          margin: "8px 10px 0",
          border: `1.5px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 7,
          padding: "10px 8px",
          textAlign: "center",
          background: isDragging ? "var(--accent-glow)" : "transparent",
          transition: "border-color 0.12s, background 0.12s",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: "0.75rem",
            color: "var(--text-2)",
            fontWeight: 500,
          }}
        >
          {t.ul_dropHere}
        </p>
        <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.7rem", padding: "3px 9px" }}
            onClick={() => fileInputRef.current?.click()}
          >
            {t.ul_browseFiles}
          </button>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.7rem", padding: "3px 9px" }}
            onClick={() => folderInputRef.current?.click()}
          >
            {t.ul_browseFolder}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={onFilePick}
        />
        {/* @ts-ignore */}
        <input
          ref={folderInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          {...{ webkitdirectory: "true", directory: "true" }}
          onChange={onFolderPick}
        />
      </div>

      {/* Queue */}
      {jobs.length > 0 && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "6px 10px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 7px",
                background: "var(--bg-raised)",
                borderRadius: 5,
                minWidth: 0,
              }}
            >
              {/* Progress line for uploading */}
              {job.status.state === "uploading" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: `${job.status.progress}%`,
                    background: "var(--accent)",
                    borderRadius: 1,
                    transition: "width 0.2s",
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.73rem",
                    color: "var(--text-1)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {job.file.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.61rem",
                    color: "var(--text-3)",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {fmt(job.file.size)}
                  {job.relativePath !== job.file.name && (
                    <span
                      style={{
                        marginLeft: 4,
                        color: "var(--text-3)",
                        fontSize: "0.58rem",
                      }}
                    >
                      → {job.relativePath}
                    </span>
                  )}
                </p>
              </div>
              <span
                style={{
                  fontSize: "0.65rem",
                  color: STATUS_COLOR[job.status.state] ?? "var(--text-3)",
                  flexShrink: 0,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {STATUS_LABEL(job)}
              </span>
              {(job.status.state === "error" ||
                job.status.state === "skipped") && (
                <button
                  onClick={() => removeJob(job.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-3)",
                    fontSize: "0.6rem",
                    padding: "0 2px",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnSm: React.CSSProperties = {
  background: "var(--bg-raised)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  cursor: "pointer",
  color: "var(--text-2)",
  fontSize: "0.65rem",
  padding: "2px 7px",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

function UploadIco() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
