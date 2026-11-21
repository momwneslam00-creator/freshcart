"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { api, setUnauthorizedHandler } from "@/lib/api";
import {
  clearSession,
  getServerSnapshot,
  getSnapshot,
  parseSession,
  subscribe,
  writeSession,
} from "@/lib/authStore";
import type { JwtPayload, User } from "@/types";

interface AuthContextValue {
  /** false until localStorage has been read on the client */
  ready: boolean;
  token: string | null;
  user: User | null;
  userId: string | null;
  isLoggedIn: boolean;
  login: (token: string, user?: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decode(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = raw !== undefined;
  const session = useMemo(() => parseSession(raw), [raw]);
  const token = session?.token ?? null;
  const payload = useMemo(() => decode(token), [token]);

  const login = useCallback((newToken: string, user?: User | null) => {
    const payloadUser = decode(newToken);
    writeSession({
      token: newToken,
      user: user ?? (payloadUser ? { name: payloadUser.name, email: "" } : null),
    });
  }, []);

  const logout = useCallback(() => clearSession(), []);

  // An expired / revoked token anywhere in the app logs the user out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // On load, confirm the stored token is still valid (Verify Token endpoint).
  useEffect(() => {
    if (!token) return;
    const expired = payload?.exp ? payload.exp * 1000 < Date.now() : false;
    if (expired) {
      clearSession();
      return;
    }
    api.verifyToken().catch((e: { status?: number }) => {
      if (e?.status === 401 || e?.status === 403) clearSession();
    });
  }, [token, payload]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      token,
      user: session?.user ?? (payload ? { name: payload.name, email: "" } : null),
      userId: payload?.id ?? null,
      isLoggedIn: !!token,
      login,
      logout,
    }),
    [ready, token, session, payload, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
