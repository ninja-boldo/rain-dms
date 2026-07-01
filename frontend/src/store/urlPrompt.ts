import { create } from "zustand";

interface UrlPromptState {
  /** Origin currently awaiting a yes/no from the user, or null if none pending. */
  pendingOrigin: string | null;
  requestSubstitution: (origin: string) => void;
  clearPending: () => void;
}

export const useUrlPromptStore = create<UrlPromptState>((set, get) => ({
  pendingOrigin: null,
  requestSubstitution: (origin) => {
    if (get().pendingOrigin) return; // one prompt at a time
    set({ pendingOrigin: origin });
  },
  clearPending: () => set({ pendingOrigin: null }),
}));
