"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/lib/auth";
import { getMe } from "@/lib/api";
import type { AuthUser } from "@/types";

interface UseSessionReturn {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
}

export function useSession(): UseSessionReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(authStore.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authStore.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((me) => {
        authStore.setAuth(token, me);
        setUser(me);
      })
      .catch(() => {
        authStore.clearAuth();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = useCallback(() => {
    authStore.clearAuth();
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, loading, logout };
}
