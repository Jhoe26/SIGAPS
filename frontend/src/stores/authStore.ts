import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UsuarioAuth } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UsuarioAuth | null;
  setSession: (accessToken: string, refreshToken: string, user: UsuarioAuth) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (accessToken, refreshToken, user) => set({ accessToken, refreshToken, user }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: "sigaps-auth" }
  )
);
