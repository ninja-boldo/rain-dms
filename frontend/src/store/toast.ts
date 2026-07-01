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

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastKind, title: string, message?: string) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const TIMERS = new Map<string, ReturnType<typeof setTimeout>>();

function ttlFor(kind: ToastKind): number {
  if (kind === "error") return 8000;
  if (kind === "info") return 5000;
  return 3500;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

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
      }));
      const timer = TIMERS.get(existing.id);
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => get().dismiss(existing.id), ttlFor(kind));
      TIMERS.set(existing.id, newTimer);
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id, kind, title, message, createdAt: Date.now(), count: 1 },
      ],
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
