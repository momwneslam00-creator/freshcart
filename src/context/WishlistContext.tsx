"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types";

interface WishlistContextValue {
  items: Product[];
  ids: Set<string>;
  loading: boolean;
  busy: Set<string>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    try {
      const res = await api.getWishlist();
      setItems(res.data ?? []);
    } catch {
      setItems([]);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    refresh().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, refresh]);

  const ids = useMemo(() => new Set(items.map((p) => p._id)), [items]);

  const markBusy = (id: string, on: boolean) =>
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const remove = useCallback(
    async (productId: string) => {
      markBusy(productId, true);
      try {
        await api.removeFromWishlist(productId);
        setItems((prev) => prev.filter((p) => p._id !== productId));
        toast.success("Removed from wishlist");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        markBusy(productId, false);
      }
    },
    [],
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!token) {
        toast.error("Please log in to use your wishlist");
        return;
      }
      if (ids.has(productId)) return remove(productId);
      markBusy(productId, true);
      try {
        await api.addToWishlist(productId);
        await refresh(); // gives us the populated product for the wishlist page
        toast.success("Added to wishlist");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        markBusy(productId, false);
      }
    },
    [token, ids, remove, refresh],
  );

  const has = useCallback((id: string) => ids.has(id), [ids]);

  const value = useMemo<WishlistContextValue>(
    () => ({ items, ids, loading, busy, has, toggle, remove, refresh }),
    [items, ids, loading, busy, has, toggle, remove, refresh],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
