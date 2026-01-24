"use client";

import { useEffect } from "react";
import { useAuthStore, User } from "@/store/auth";
import { getCurrentUser } from "@/lib/auth/actions";

/**
 * Hook to get and sync user authentication state
 * Automatically fetches user data from server and caches it in Zustand
 * Only fetches if cache is invalid or user is not loaded
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isCacheValid = useAuthStore((state) => state.isCacheValid);

  useEffect(() => {
    // Only fetch if cache is invalid or user is not loaded
    if (isCacheValid() && user) {
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await getCurrentUser();
        setUser(userData as User | null);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, isCacheValid, setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
}
