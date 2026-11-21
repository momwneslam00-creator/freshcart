"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmptyState, PageLoader, Spinner } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { currency } from "@/lib/utils";
import type { Product } from "@/types";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartView />
    </ProtectedRoute>
  );
}

function CartView() {
  const { cart, count, total, loading, busy, clearing, setQuantity, remove, clear } = useCart();

  if (loading && !cart) return <PageLoader />;

  const items = cart?.products ?? [];
  if (items.length === 0) {
    return (
      <EmptyState title="Your cart is empty" hint="Add some products and they'll show up here.">
        <Link href="/products" className="btn-primary">
          Start shopping
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
      <div>
        <button
          className="btn-danger mb-5 px-5 py-2.5"
          onClick={() => window.confirm("Remove every item from your cart?") && clear()}
          disabled={clearing}
        >
          {clearing ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          Clear Cart
        </button>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-white">
              <tr>
                <th className="w-32 p-4" />
                <th className="p-4 font-semibold text-ink">Product Name</th>
                <th className="p-4 font-semibold text-ink">Qty</th>
                <th className="p-4 font-semibold text-ink">Price</th>
                <th className="p-4 font-semibold text-ink">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const p = typeof item.product === "object" ? (item.product as Product) : null;
                const id = p?._id ?? (item.product as string);
                const isBusy = busy.has(id);
                return (
                  <tr key={item._id} className="border-b border-slate-100 last:border-0">
                    <td className="p-4">
                      {p && (
                        <Link href={`/products/${id}`} className="relative block h-24 w-24 bg-surface">
                          <Image src={p.imageCover} alt={p.title} fill sizes="96px" className="object-cover" />
                        </Link>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-ink">{p?.title ?? "Product"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          aria-label="Decrease quantity"
                          className="rounded-full border border-slate-300 p-1.5 hover:bg-slate-50 disabled:opacity-40"
                          disabled={isBusy || item.count <= 1}
                          onClick={() => setQuantity(id, item.count - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center" aria-live="polite">
                          {isBusy ? <Spinner className="h-3.5 w-3.5" /> : item.count}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          className="rounded-full border border-slate-300 p-1.5 hover:bg-slate-50 disabled:opacity-40"
                          disabled={isBusy}
                          onClick={() => setQuantity(id, item.count + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-ink">{item.price * item.count}</td>
                    <td className="p-4">
                      <button
                        className="font-medium text-danger hover:underline disabled:opacity-40"
                        disabled={isBusy}
                        onClick={() => remove(id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-ink">Total Price</h2>
        <p className="mt-1 text-sm text-slate-500">{count} item{count === 1 ? "" : "s"}</p>
        <p className="mt-4 font-semibold text-ink">{currency(total)}</p>
        <Link href="/checkout" className="btn-primary mt-5 px-6 py-2.5">
          Pay Now
        </Link>
      </aside>
    </div>
  );
}
