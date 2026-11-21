"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmptyState, PageLoader, SectionTitle, Spinner } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { effectivePrice } from "@/lib/utils";

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistView />
    </ProtectedRoute>
  );
}

function WishlistView() {
  const { items, loading, remove, busy } = useWishlist();
  const cart = useCart();

  if (loading && items.length === 0) return <PageLoader />;

  return (
    <div className="container-page py-10">
      <SectionTitle>My Wishlist</SectionTitle>
      {items.length === 0 ? (
        <EmptyState title="Your wishlist is empty" hint="Tap the heart on any product to save it here.">
          <Link href="/products" className="btn-primary">
            Browse products
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {items.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center gap-4 p-4">
              <Link href={`/products/${p._id}`} className="relative h-24 w-24 shrink-0 bg-surface">
                <Image src={p.imageCover} alt={p.title} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${p._id}`} className="font-semibold text-ink hover:text-brand">
                  {p.title}
                </Link>
                <p className="mt-1 text-sm font-medium text-brand">{effectivePrice(p)} EGP</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-primary"
                  onClick={() => cart.add(p._id)}
                  disabled={cart.busy.has(p._id)}
                >
                  {cart.busy.has(p._id) ? <Spinner className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                  Add to cart
                </button>
                <button
                  className="btn-outline text-danger"
                  onClick={() => remove(p._id)}
                  disabled={busy.has(p._id)}
                  aria-label={`Remove ${p.title} from wishlist`}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
