import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastFetched: number | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  // Check if cache is still valid (5 minutes)
  isCacheValid: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastFetched: null,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          lastFetched: user ? Date.now() : null,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          lastFetched: null,
        }),
      isCacheValid: () => {
        const state = get();
        if (!state.lastFetched) return false;
        return Date.now() - state.lastFetched < CACHE_DURATION;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
