import { create } from "zustand";

export type ToastKind = "error" | "success" | "info";

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  createdAt: number;
  /** How many times this exact title+message has fired while still visible — collapses spam into one badge. */
  count: number;
}

export interface ErrorLogEntry extends ToastItem {
  read: boolean;
}

const MAX_LOG = 50;

interface ToastState {
  toasts: ToastItem[];
  /** Errors persist here even after their toast auto-dismisses, until the person opens and reads them. */
  errorLog: ErrorLogEntry[];
  push: (kind: ToastKind, title: string, message?: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearLog: () => void;
}

const TIMERS = new Map<string, ReturnType<typeof setTimeout>>();

function ttlFor(kind: ToastKind): number {
  if (kind === "error") return 8000;
  if (kind === "info") return 5000;
  return 3500;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  errorLog: [],

  push: (kind, title, message) => {
    // Collapse identical, still-visible toasts instead of stacking duplicates —
    // keeps a burst of e.g. failed uploads from flooding the screen.
    const existing = get().toasts.find(
      (t) => t.kind === kind && t.title === title && t.message === message,
    );
    if (existing) {
      set((s) => ({
        toasts: s.toasts.map((t) =>
          t.id === existing.id
            ? { ...t, count: t.count + 1, createdAt: Date.now() }
            : t,
        ),
        errorLog: s.errorLog.map((e) =>
          e.id === existing.id
            ? { ...e, count: e.count + 1, createdAt: Date.now(), read: false }
            : e,
        ),
      }));
      const timer = TIMERS.get(existing.id);
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(
        () => get().dismiss(existing.id),
        ttlFor(kind),
      );
      TIMERS.set(existing.id, newTimer);
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    const item: ToastItem = {
      id,
      kind,
      title,
      message,
      createdAt: Date.now(),
      count: 1,
    };
    set((s) => ({
      toasts: [...s.toasts, item],
      // Errors get archived into a small persistent log so they don't just
      // vanish — visible via a menu icon until the person actually reads them.
      errorLog:
        kind === "error"
          ? [{ ...item, read: false }, ...s.errorLog].slice(0, MAX_LOG)
          : s.errorLog,
    }));
    const timer = setTimeout(() => get().dismiss(id), ttlFor(kind));
    TIMERS.set(id, timer);
  },

  dismiss: (id) => {
    const timer = TIMERS.get(id);
    if (timer) clearTimeout(timer);
    TIMERS.delete(id);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  clear: () => {
    TIMERS.forEach((t) => clearTimeout(t));
    TIMERS.clear();
    set({ toasts: [] });
  },

  markRead: (id) =>
    set((s) => ({
      errorLog: s.errorLog.map((e) => (e.id === id ? { ...e, read: true } : e)),
    })),
  markAllRead: () =>
    set((s) => ({ errorLog: s.errorLog.map((e) => ({ ...e, read: true })) })),
  clearLog: () => set({ errorLog: [] }),
}));

/** Fire-and-forget helpers usable from non-component code (api/client.ts, stores). */
export function reportError(title: string, err: unknown) {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : undefined;
  useToastStore.getState().push("error", title, message);
}
export function reportInfo(title: string, message?: string) {
  useToastStore.getState().push("info", title, message);
}
export function reportSuccess(title: string, message?: string) {
  useToastStore.getState().push("success", title, message);
}
