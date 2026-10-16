"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

const STORAGE_KEY = "admin_token";

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
};

type AdminAuthCtx = {
  token: string | null;
  user: AdminUser | null;
  loading: boolean;
  authHeaders: Record<string, string>;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<boolean>;
};

const Ctx = createContext<AdminAuthCtx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const persist = useCallback((next: string | null) => {
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
    setToken(next);
  }, []);

  const refreshMe = useCallback(async () => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!saved) {
      setUser(null);
      setToken(null);
      return false;
    }
    const res = await fetch(apiUrl("/v1/auth/me"), {
      headers: { Authorization: `Bearer ${saved}`, Accept: "application/json" },
    });
    if (!res.ok) {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
      return false;
    }
    setToken(saved);
    setUser((await res.json()) as AdminUser);
    return true;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  useEffect(() => {
    if (loading) return;
    const isAuthPage =
      pathname?.startsWith("/admin/login") || pathname?.startsWith("/admin/signup");
    if (!token && pathname?.startsWith("/admin") && !isAuthPage) {
      router.replace("/admin/login");
    }
    if (token && isAuthPage) {
      router.replace("/admin");
    }
  }, [loading, token, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(apiUrl("/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Login failed");
      persist(data.access_token);
      setUser(data.user as AdminUser);
      router.replace("/admin");
    },
    [persist, router]
  );

  const signup = useCallback(
    async (fullName: string, email: string, password: string) => {
      const res = await fetch(apiUrl("/v1/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((d: { msg?: string }) => d.msg).join(", ")
          : data.detail;
        throw new Error(detail || "Signup failed");
      }
      persist(data.access_token);
      setUser(data.user as AdminUser);
      router.replace("/admin");
    },
    [persist, router]
  );

  const logout = useCallback(() => {
    persist(null);
    setUser(null);
    router.replace("/admin/login");
  }, [persist, router]);

  const value = useMemo<AdminAuthCtx>(() => {
    const authHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
      : { Accept: "application/json" };
    return {
      token,
      user,
      loading,
      authHeaders,
      login,
      signup,
      logout,
      refreshMe,
    };
  }, [token, user, loading, login, signup, logout, refreshMe]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth requires AdminAuthProvider");
  return ctx;
}
