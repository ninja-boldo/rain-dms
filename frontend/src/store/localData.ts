import { useCallback, useEffect, useState } from "react";

export interface LocalMarker {
  box_key: string;
  page_idx: number;
  kind: "ocr" | "drawn";
  x: number;
  y: number;
  w: number;
  h: number;
  note: string | null;
  created_at: string;
}

export interface LocalReminder {
  at: string | null;
  note: string | null;
  done_at: string | null;
}

const STORE_KEY = "rain-dms-local";
const CHANGE_EVENT = "rain-dms-local-change";

interface Store {
  markers: Record<string, LocalMarker[]>;
  reminders: Record<string, LocalReminder>;
}

function empty(): Store {
  return { markers: {}, reminders: {} };
}

function load(): Store {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return empty();
    return {
      markers: parsed.markers ?? {},
      reminders: parsed.reminders ?? {},
    };
  } catch {
    return empty();
  }
}

function save(s: Store) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
    // "storage" events only fire in *other* tabs — dispatch our own so
    // same-tab consumers (e.g. a global reminders list) update immediately.
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // quota exceeded — best effort
  }
}

export interface GlobalReminder extends LocalReminder {
  filepath: string;
}

/** All reminders across every file, for a global "pending reminders" view. */
export function getAllReminders(): GlobalReminder[] {
  const s = load();
  return Object.entries(s.reminders).map(([filepath, r]) => ({
    filepath,
    ...r,
  }));
}

export function useAllReminders(): GlobalReminder[] {
  const [reminders, setReminders] = useState<GlobalReminder[]>(() =>
    getAllReminders(),
  );

  useEffect(() => {
    function refresh() {
      setReminders(getAllReminders());
    }
    window.addEventListener("storage", refresh);
    window.addEventListener(CHANGE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CHANGE_EVENT, refresh);
    };
  }, []);

  return reminders;
}

/** Mark a reminder done from anywhere (e.g. a global reminders list), without mounting a per-file hook. */
export function markReminderDone(filepath: string) {
  const s = load();
  const existing = s.reminders[filepath];
  if (!existing) return;
  save({
    ...s,
    reminders: {
      ...s.reminders,
      [filepath]: { ...existing, done_at: new Date().toISOString() },
    },
  });
}

export function useLocalStore(filepath: string | null) {
  const [store, setStore] = useState<Store>(() => load());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORE_KEY) setStore(load());
    }
    function onLocalChange() {
      setStore(load());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(CHANGE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CHANGE_EVENT, onLocalChange);
    };
  }, []);

  const write = useCallback((updater: (s: Store) => Store) => {
    setStore((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, []);

  const markers: LocalMarker[] = filepath
    ? (store.markers[filepath] ?? [])
    : [];
  const reminder: LocalReminder = filepath
    ? (store.reminders[filepath] ?? {
        at: null,
        note: null,
        done_at: null,
      })
    : { at: null, note: null, done_at: null };

  const setMarkers = useCallback(
    (next: LocalMarker[] | ((prev: LocalMarker[]) => LocalMarker[])) => {
      if (!filepath) return;
      write((s) => {
        const updater = typeof next === "function" ? next : () => next;
        return {
          ...s,
          markers: {
            ...s.markers,
            [filepath]: updater(s.markers[filepath] ?? []),
          },
        };
      });
    },
    [filepath, write],
  );

  const setReminder = useCallback(
    (next: LocalReminder | null) => {
      if (!filepath) return;
      write((s) => {
        const reminders = { ...s.reminders };
        if (next == null) delete reminders[filepath];
        else reminders[filepath] = next;
        return { ...s, reminders };
      });
    },
    [filepath, write],
  );

  return { store, markers, reminder, setMarkers, setReminder };
}
