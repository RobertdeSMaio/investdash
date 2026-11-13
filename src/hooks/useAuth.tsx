import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { SESSION_EXPIRED_EVENT, tokenStorage } from "../services/tokenStorage";
import type { User } from "../types";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await authService.getProfile());
    } catch {
      setUser(null);
      tokenStorage.clear();
    }
  }, []);

  useEffect(() => {
    if (tokenStorage.hasSession()) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const { user: u, tokens } = await authService.login({ email, password });
    tokenStorage.set(tokens.accessToken, tokens.refreshToken);
    setUser(u);
  };

  const logout = useCallback(async () => {
    const rt = tokenStorage.getRefresh();
    try {
      if (rt) await authService.logout(rt);
    } catch {
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let last = Date.now();
    const touch = () => {
      last = Date.now();
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - last > IDLE_TIMEOUT_MS) logout();
    }, 60 * 1000);
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, touch));
      window.clearInterval(timer);
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
