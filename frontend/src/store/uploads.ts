import { create } from "zustand";
import { useAuthStore } from "./auth";
import { useSettingsStore } from "./settings";
import { computeFileSha256 } from "../utils/hash";
import { checkHashExists } from "../api/client";

export type UploadStatus =
  | { state: "pending" }
  | { state: "hashing" }
  | { state: "duplicate" }
  | { state: "uploading"; progress: number }
  | { state: "done" }
  | { state: "skipped"; reason: string }
  | { state: "error"; message: string };

export interface UploadJob {
  id: string;
  file: File;
  relativePath: string;
  status: UploadStatus;
}

interface UploadState {
  jobs: UploadJob[];
  isOpen: boolean;
  isMinimized: boolean;
  running: boolean;
  lastCompletedAt: number | null;

  addFiles: (files: { file: File; relativePath: string }[]) => void;
  start: () => void;
  abort: () => void;
  clearFinished: () => void;
  toggle: () => void;
  minimize: (v: boolean) => void;
  removeJob: (id: string) => void;
}

// Kept outside store so we can actually cancel the loop
let _abortFlag = false;
let _running = false;

const BLOCKED_EXTENSIONS = new Set([
  ".ds_store",
  ".css",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".html",
  ".htm",
  ".xml",
  ".json",
  ".yaml",
  ".yml",
  ".sh",
  ".bat",
  ".cmd",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".zip",
  ".tar",
  ".gz",
  ".bz2",
  ".7z",
  ".rar",
  ".map",
  ".lock",
  ".log",
  ".git",
  ".gitignore",
  ".env",
  ".ono",
  ".ini",
  ".cfg",
  ".conf",
  ".toml",
  ".rs",
  ".go",
  ".py",
  ".java",
  ".class",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".md",
  ".txt",
  ".csv",
  ".xls",
  ".xlsx",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
]);

function getExt(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return "";
  return name.slice(dot).toLowerCase();
}

function isBlocked(name: string, allowedExts: string[]): boolean {
  const base = name.split("/").pop() ?? name;
  // Hidden system files
  if (base.startsWith(".")) return true;
  const ext = getExt(base);
  if (!ext) return true; // no extension = skip
  // If allowedExts is configured, only allow those
  if (allowedExts.length > 0) {
    return !allowedExts.includes(ext);
  }
  // Otherwise use blocklist
  return BLOCKED_EXTENSIONS.has(ext);
}

export const useUploadStore = create<UploadState>((set, get) => ({
  jobs: [],
  isOpen: false,
  isMinimized: false,
  running: false,
  lastCompletedAt: null,

  addFiles(files) {
    const allowed = useSettingsStore.getState().allowedUploadExtensions ?? [];
    const valid: UploadJob[] = [];
    const skipped: UploadJob[] = [];

    for (const { file, relativePath } of files) {
      const id = crypto.randomUUID();
      if (isBlocked(file.name, allowed)) {
        skipped.push({
          id,
          file,
          relativePath,
          status: { state: "skipped", reason: "extension" },
        });
      } else {
        valid.push({ id, file, relativePath, status: { state: "pending" } });
      }
    }

    // Sort valid files by size ascending (smallest first, largest last)
    valid.sort((a, b) => a.file.size - b.file.size);

    set((s) => ({
      jobs: [...s.jobs, ...valid, ...skipped],
      isOpen: true,
      isMinimized: false,
    }));
  },

  start() {
    const { jobs, running } = get();
    if (running) return;
    const pending = jobs.filter((j) => j.status.state === "pending");
    if (!pending.length) return;

    _abortFlag = false;
    _running = true;
    set({ running: true });

    (async () => {
      const { apiUrl } = useSettingsStore.getState();
      const { token, username } = useAuthStore.getState();

      for (const job of pending) {
        if (_abortFlag) break;

        // Hashing
        mutate(job.id, { state: "hashing" });
        let hash: string;
        try {
          hash = await computeFileSha256(job.file);
        } catch {
          mutate(job.id, { state: "error", message: "Hashing failed" });
          continue;
        }
        if (_abortFlag) break;

        // Duplicate check
        try {
          const { exists } = await checkHashExists(hash);
          if (exists) {
            mutate(job.id, { state: "duplicate" });
            continue;
          }
        } catch {
          /* proceed */
        }
        if (_abortFlag) break;

        // Upload
        mutate(job.id, { state: "uploading", progress: 0 });
        try {
          const form = new FormData();
          form.append("file", job.file);
          form.append("relativePath", job.relativePath);

          const res = await fetch(`${apiUrl}/upload`, {
            method: "POST",
            headers: {
              Authorization: token ?? "",
              "X-Username": username ?? "",
            },
            body: form,
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            mutate(job.id, {
              state: "error",
              message: `HTTP ${res.status}: ${text.slice(0, 80)}`,
            });
          } else {
            mutate(job.id, { state: "done" });
            set({ lastCompletedAt: Date.now() });
          }
        } catch (e: any) {
          mutate(job.id, { state: "error", message: e.message });
        }
      }

      _running = false;
      set({ running: false });
    })();

    function mutate(id: string, status: UploadStatus) {
      set((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)),
      }));
    }
  },

  abort() {
    _abortFlag = true;
    _running = false;
    set({ running: false });
  },

  clearFinished() {
    set((s) => ({
      jobs: s.jobs.filter(
        (j) =>
          j.status.state === "pending" ||
          j.status.state === "hashing" ||
          j.status.state === "uploading",
      ),
    }));
  },

  toggle() {
    set((s) => ({ isOpen: !s.isOpen, isMinimized: false }));
  },
  minimize(v) {
    set({ isMinimized: v });
  },
  removeJob(id) {
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
  },
}));
