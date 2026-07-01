import { create } from "zustand";
import { useAuthStore } from "./auth";
import { useSettingsStore } from "./settings";
import { computeFileSha256 } from "../utils/hash";
import { checkHashExists } from "../api/client";
import { reportError, reportSuccess } from "./toast";
import { getI18n } from "../i18n";

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
  /** How many upload/check requests are in flight right now (0..CONCURRENCY). */
  activeWorkers: number;
  /** Rolling estimate of requests started per second — updated ~4x/sec while running. */
  requestsPerSecond: number;

  addFiles: (files: { file: File; relativePath: string }[]) => void;
  start: () => void;
  abort: () => void;
  clearFinished: () => void;
  toggle: () => void;
  minimize: (v: boolean) => void;
  removeJob: (id: string) => void;
}

// How many files upload in parallel. Kept modest so a single self-hosted box
// (nginx + Bun + SeaweedFS) isn't hammered, while still being visibly concurrent.
export const UPLOAD_CONCURRENCY = 4;

// Kept outside the store so we can actually cancel an in-flight run.
let _abortFlag = false;

// Rolling window of request start timestamps, used to compute req/s for the badge.
const _requestTimestamps: number[] = [];
let _rateInterval: ReturnType<typeof setInterval> | null = null;

function trackRequestStart() {
  _requestTimestamps.push(Date.now());
}

function pruneAndComputeRate(): number {
  const cutoff = Date.now() - 1000;
  while (_requestTimestamps.length && _requestTimestamps[0] < cutoff) {
    _requestTimestamps.shift();
  }
  return _requestTimestamps.length;
}

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

/** Uploads via XHR (not fetch) so we get real byte-level progress events for the progress bar. */
function uploadWithProgress(
  url: string,
  form: FormData,
  headers: Record<string, string>,
  onProgress: (pct: number) => void,
): Promise<{ ok: boolean; status: number; text: string }> {
  trackRequestStart();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    for (const [k, v] of Object.entries(headers)) {
      if (v) xhr.setRequestHeader(k, v);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, text: xhr.responseText });
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onabort = () => reject(new Error("Aborted"));
    xhr.send(form);
  });
}

export const useUploadStore = create<UploadState>((set, get) => ({
  jobs: [],
  isOpen: false,
  isMinimized: false,
  running: false,
  lastCompletedAt: null,
  activeWorkers: 0,
  requestsPerSecond: 0,

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
    const queue = jobs.filter((j) => j.status.state === "pending");
    if (!queue.length) return;

    _abortFlag = false;
    set({ running: true, activeWorkers: 0 });

    if (_rateInterval) clearInterval(_rateInterval);
    _rateInterval = setInterval(() => {
      set({ requestsPerSecond: pruneAndComputeRate() });
    }, 250);

    function mutate(id: string, status: UploadStatus) {
      set((s) => ({
        jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)),
      }));
    }

    async function runOne(job: UploadJob) {
      if (_abortFlag) return;
      set((s) => ({ activeWorkers: s.activeWorkers + 1 }));

      // Hashing
      mutate(job.id, { state: "hashing" });
      let hash: string;
      try {
        hash = await computeFileSha256(job.file);
      } catch {
        mutate(job.id, { state: "error", message: "Hashing failed" });
        set((s) => ({ activeWorkers: Math.max(0, s.activeWorkers - 1) }));
        return;
      }
      if (_abortFlag) {
        set((s) => ({ activeWorkers: Math.max(0, s.activeWorkers - 1) }));
        return;
      }

      // Duplicate check
      try {
        trackRequestStart();
        const { exists } = await checkHashExists(hash);
        if (exists) {
          mutate(job.id, { state: "duplicate" });
          set((s) => ({ activeWorkers: Math.max(0, s.activeWorkers - 1) }));
          return;
        }
      } catch {
        /* proceed — treat check failure as "not a duplicate" */
      }
      if (_abortFlag) {
        set((s) => ({ activeWorkers: Math.max(0, s.activeWorkers - 1) }));
        return;
      }

      // Upload
      mutate(job.id, { state: "uploading", progress: 0 });
      try {
        const { apiUrl } = useSettingsStore.getState();
        const { token, username } = useAuthStore.getState();
        const form = new FormData();
        form.append("file", job.file);
        form.append("relativePath", job.relativePath);

        const res = await uploadWithProgress(
          `${apiUrl}/upload`,
          form,
          { Authorization: token ?? "", "X-Username": username ?? "" },
          (pct) => mutate(job.id, { state: "uploading", progress: pct }),
        );

        if (!res.ok) {
          mutate(job.id, {
            state: "error",
            message: `HTTP ${res.status}: ${res.text.slice(0, 80)}`,
          });
        } else {
          mutate(job.id, { state: "done" });
          set({ lastCompletedAt: Date.now() });
        }
      } catch (e: any) {
        mutate(job.id, { state: "error", message: e.message ?? "Upload failed" });
      } finally {
        set((s) => ({ activeWorkers: Math.max(0, s.activeWorkers - 1) }));
      }
    }

    (async () => {
      let cursor = 0;
      const startedAt = Date.now();

      async function worker() {
        while (!_abortFlag) {
          const idx = cursor++;
          if (idx >= queue.length) return;
          await runOne(queue[idx]);
        }
      }

      const workerCount = Math.min(UPLOAD_CONCURRENCY, queue.length);
      await Promise.all(Array.from({ length: workerCount }, () => worker()));

      if (_rateInterval) {
        clearInterval(_rateInterval);
        _rateInterval = null;
      }
      set({ running: false, activeWorkers: 0, requestsPerSecond: 0 });

      // Batch summary toast — the per-row status list is easy to lose track of
      // once dozens of files are involved, so surface a single clear result.
      if (!_abortFlag && queue.length > 1) {
        const finalJobs = get().jobs;
        const batchIds = new Set(queue.map((j) => j.id));
        const errored = finalJobs.filter(
          (j) => batchIds.has(j.id) && j.status.state === "error",
        ).length;
        const done = finalJobs.filter(
          (j) => batchIds.has(j.id) && j.status.state === "done",
        ).length;
        const elapsedS = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const t = getI18n();
        if (errored > 0) {
          reportError(t.toast_error, t.ul_batchErr(done, queue.length, errored, elapsedS));
        } else if (done > 0) {
          reportSuccess(t.toast_success, t.ul_batchOk(done, queue.length, elapsedS));
        }
      }
    })();
  },

  abort() {
    _abortFlag = true;
    if (_rateInterval) {
      clearInterval(_rateInterval);
      _rateInterval = null;
    }
    set({ running: false, activeWorkers: 0, requestsPerSecond: 0 });
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
