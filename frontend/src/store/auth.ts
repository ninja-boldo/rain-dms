import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  /** Decrypted AES-256 main encryption key (hex). Persisted for session convenience. */
  mainEncryptionKey: string | null;
  encryptionEnabled: boolean;

  setAuth: (token: string, username: string, mainKey: string | null) => void;
  setEncryptionEnabled: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      mainEncryptionKey: null,
      encryptionEnabled: true, // default ON — most installs use ENCRYPT_AT_REST=true

      setAuth: (token, username, mainKey) =>
        set({ token, username, mainEncryptionKey: mainKey }),

      setEncryptionEnabled: (encryptionEnabled) => set({ encryptionEnabled }),

      logout: () =>
        set({ token: null, username: null, mainEncryptionKey: null }),
    }),
    {
      name: "rain-dms-auth",
      // mainEncryptionKey is persisted so images decrypt after page refresh.
      // Acceptable for self-hosted behind nginx auth.
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        mainEncryptionKey: state.mainEncryptionKey,
        encryptionEnabled: state.encryptionEnabled,
      }),
    },
  ),
);
