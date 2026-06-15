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
  } catch {
    // quota exceeded — best effort
  }
}

export function useLocalStore(filepath: string | null) {
  const [store, setStore] = useState<Store>(() => load());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORE_KEY) setStore(load());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
