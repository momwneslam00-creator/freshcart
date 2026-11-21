import type { User } from "@/types";

/**
 * Tiny localStorage-backed store for the session. It is read through
 * useSyncExternalStore, so server render / hydration see "not ready"
 * (undefined) and the client then switches to the stored value.
 */

const KEY = "fc_auth";

export interface StoredSession {
  token: string;
  user: User | null;
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Raw string snapshot (primitive, so it is stable between renders). */
export function getSnapshot(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function getServerSnapshot(): string | null | undefined {
  return undefined;
}

export function parseSession(raw: string | null | undefined): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  return parseSession(getSnapshot());
}

export function writeSession(session: StoredSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable (private mode) – session lives only until reload */
  }
  emit();
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}
