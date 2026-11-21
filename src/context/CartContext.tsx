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
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Cart } from "@/types";

interface CartContextValue {
  cart: Cart | null;
  cartId: string | null;
  count: number;
  total: number;
  loading: boolean;
  /** product ids currently being mutated (for per-row spinners) */
  busy: Set<string>;
  clearing: boolean;
  refresh: () => Promise<void>;
  add: (productId: string) => Promise<boolean>;
  setQuantity: (productId: string, count: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : "Something went wrong";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const reset = useCallback(() => {
    setCart(null);
    setCartId(null);
    setCount(0);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      reset();
      return;
    }
    try {
      const res = await api.getCart();
      setCart(res.data);
      setCartId(res.cartId ?? res.data?._id ?? null);
      setCount(res.numOfCartItems ?? res.data?.products?.length ?? 0);
    } catch (e) {
      // A user without a cart gets a 404 – that simply means "empty".
      if (e instanceof ApiError && (e.status === 404 || e.status === 400)) reset();
      else if (e instanceof ApiError && e.status !== 401) toast.error(errMsg(e));
    }
  }, [token, reset]);

  useEffect(() => {
    if (!ready || !token) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    refresh().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, ready, refresh]);

  const markBusy = (id: string, on: boolean) =>
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const add = useCallback(
    async (productId: string) => {
      if (!token) {
        toast.error("Please log in to add items to your cart");
        return false;
      }
      markBusy(productId, true);
      try {
        await api.addToCart(productId);
        await refresh();
        toast.success("Added to cart");
        return true;
      } catch (e) {
        toast.error(errMsg(e));
        return false;
      } finally {
        markBusy(productId, false);
      }
    },
    [token, refresh],
  );

  const setQuantity = useCallback(
    async (productId: string, next: number) => {
      if (next < 1) return;
      markBusy(productId, true);
      try {
        await api.updateCartQuantity(productId, next);
        await refresh();
      } catch (e) {
        toast.error(errMsg(e));
      } finally {
        markBusy(productId, false);
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (productId: string) => {
      markBusy(productId, true);
      try {
        await api.removeCartItem(productId);
        await refresh();
        toast.success("Item removed");
      } catch (e) {
        toast.error(errMsg(e));
      } finally {
        markBusy(productId, false);
      }
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    setClearing(true);
    try {
      await api.clearCart();
      reset();
      toast.success("Cart cleared");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setClearing(false);
    }
  }, [reset]);

  // Logging out hides the cart immediately; the stored copy is dropped on next login.
  const value = useMemo<CartContextValue>(
    () => ({
      cart: token ? cart : null,
      cartId: token ? cartId : null,
      count: token ? count : 0,
      total: token ? (cart?.totalCartPrice ?? 0) : 0,
      loading: token ? loading : false,
      busy,
      clearing,
      refresh,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [token, cart, cartId, count, loading, busy, clearing, refresh, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
