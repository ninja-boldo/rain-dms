import { useCallback, useRef, useState } from "react";
import { checkHashExists } from "../api/client";
import { computeFileSha256 } from "../utils/hash";
import { useAuthStore } from "../store/auth";
import { useSettingsStore } from "../store/settings";

interface Props {
  onClose: () => void;
  onUploaded?: () => void;
}

type FileStatus =
  | { state: "pending" }
  | { state: "hashing" }
  | { state: "duplicate" }
  | { state: "uploading"; progress: number }
  | { state: "done" }
  | { state: "error"; message: string };

interface QueuedFile {
  file: File;
  id: string;
  relativePath: string; // folder-relative path incl. subfolders
  status: FileStatus;
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/** Recursively traverse a FileSystemDirectoryEntry and collect all File objects with their paths */
async function collectEntries(
  entry: FileSystemEntry,
  prefix = "",
): Promise<{ file: File; relativePath: string }[]> {
  if (entry.isFile) {
    return new Promise((res, rej) => {
      (entry as FileSystemFileEntry).file(
        (f) => res([{ file: f, relativePath: prefix + f.name }]),
        rej,
      );
    });
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

export default function UploadModal({ onClose, onUploaded }: Props) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const runningRef = useRef(false);

  const { token, username } = useAuthStore.getState();
  const { apiUrl } = useSettingsStore.getState();

  const updateStatus = (id: string, status: FileStatus) =>
    setQueue((q) => q.map((f) => (f.id === id ? { ...f, status } : f)));

  const addFilesWithPaths = useCallback(
    (items: { file: File; relativePath: string }[]) => {
      const queued: QueuedFile[] = items.map(({ file, relativePath }) => ({
        file,
        id: crypto.randomUUID(),
        relativePath,
        status: { state: "pending" },
      }));
      setQueue((q) => [...q, ...queued]);
    },
    [],
  );

  // Plain file picker (no folders)
  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addFilesWithPaths(files.map((f) => ({ file: f, relativePath: f.name })));
    e.target.value = "";
  };

  // Folder picker (webkitdirectory)
  const onFolderPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // webkitRelativePath includes the root folder name, e.g. "MyFolder/sub/file.pdf"
    addFilesWithPaths(
      files.map((f) => ({
        file: f,
        relativePath: (f as any).webkitRelativePath || f.name,
      })),
    );
    e.target.value = "";
  };

  // Drag & drop — handles both files and directories
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const items = Array.from(e.dataTransfer.items);
    const collected: { file: File; relativePath: string }[] = [];

    for (const item of items) {
      if (item.kind !== "file") continue;
      const entry = item.webkitGetAsEntry?.();
      if (entry) {
        const results = await collectEntries(entry);
        collected.push(...results);
      } else {
        const f = item.getAsFile();
        if (f) collected.push({ file: f, relativePath: f.name });
      }
    }
    if (collected.length) addFilesWithPaths(collected);
  };

  const processQueue = async (currentQueue: QueuedFile[]) => {
    if (runningRef.current) return;
    runningRef.current = true;

    for (const item of currentQueue) {
      if (item.status.state !== "pending") continue;

      updateStatus(item.id, { state: "hashing" });
      let hash: string;
      try {
        hash = await computeFileSha256(item.file);
      } catch {
        updateStatus(item.id, { state: "error", message: "Hashing failed" });
        continue;
      }

      try {
        const { exists } = await checkHashExists(hash);
        if (exists) {
          updateStatus(item.id, { state: "duplicate" });
          continue;
        }
      } catch {
        /* proceed */
      }

      updateStatus(item.id, { state: "uploading", progress: 0 });
      try {
        const form = new FormData();
        form.append("file", item.file);
        // relativePath tells the server where in the folder tree to put this file
        form.append("relativePath", item.relativePath);

        const res = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          headers: {
            Authorization: token ?? "",
            "X-Username": username ?? "",
            username: username ?? "",
          },
          body: form,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          updateStatus(item.id, {
            state: "error",
            message: `HTTP ${res.status}: ${text.slice(0, 80)}`,
          });
        } else {
          updateStatus(item.id, { state: "done" });
          onUploaded?.();
        }
      } catch (e: any) {
        updateStatus(item.id, { state: "error", message: e.message });
      }
    }
    runningRef.current = false;
  };

  const hasPending = queue.some((f) => f.status.state === "pending");
  const pendingCount = queue.filter((f) => f.status.state === "pending").length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{
          width: 540,
          maxWidth: "95vw",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
            Upload files
          </span>
          <button
            className="btn btn-ghost"
            style={{ padding: "2px 7px" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Drop zone */}
        <div style={{ padding: "14px 18px" }}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8,
              padding: "20px 14px",
              textAlign: "center",
              background: dragging ? "var(--accent-glow)" : "transparent",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <UploadIcon />
            <p
              style={{
                margin: "8px 0 4px",
                fontSize: "0.83rem",
                color: "var(--text-1)",
                fontWeight: 500,
              }}
            >
              Drop files or folders here
            </p>
            <p
              style={{
                margin: "0 0 10px",
                fontSize: "0.72rem",
                color: "var(--text-3)",
              }}
            >
              Folder structures are preserved under your username on the server
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.75rem" }}
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.75rem" }}
                onClick={() => folderInputRef.current?.click()}
              >
                Browse folder
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              onChange={onFilePick}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              style={{ display: "none" }}
              // @ts-ignore
              webkitdirectory="true"
              directory="true"
              onChange={onFolderPick}
            />
          </div>
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0 18px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            {queue.map((item) => (
              <FileRow key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "10px 18px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          {hasPending && (
            <button
              className="btn btn-primary"
              onClick={() => processQueue(queue)}
            >
              Upload {pendingCount} file{pendingCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FileRow({ item }: { item: QueuedFile }) {
  const s = item.status;
  const colors: Record<string, string> = {
    pending: "var(--text-3)",
    hashing: "var(--warn)",
    duplicate: "var(--text-3)",
    uploading: "var(--accent)",
    done: "var(--success)",
    error: "var(--danger)",
  };
  const labels: Record<string, string> = {
    pending: "pending",
    hashing: "hashing…",
    duplicate: "duplicate",
    uploading: "uploading…",
    done: "done",
    error: s.state === "error" ? s.message : "error",
  };
  // Show folder path if it differs from just the filename
  const showPath = item.relativePath !== item.file.name;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "5px 9px",
        background: "var(--bg-raised)",
        borderRadius: 6,
      }}
    >
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.78rem",
            color: "var(--text-1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.file.name}
        </p>
        <p style={{ margin: 0, fontSize: "0.67rem", color: "var(--text-3)" }}>
          {fmt(item.file.size)}
          {showPath && (
            <span
              className="mono"
              style={{
                marginLeft: 5,
                color: "var(--text-3)",
                fontSize: "0.62rem",
              }}
            >
              → {item.relativePath}
            </span>
          )}
        </p>
      </div>
      <span
        style={{
          fontSize: "0.7rem",
          color: colors[s.state] ?? "var(--text-3)",
          flexShrink: 0,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {labels[s.state] ?? s.state}
      </span>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ margin: "0 auto", display: "block" }}
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
