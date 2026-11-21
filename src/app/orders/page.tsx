"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/useFetch";
import ProtectedRoute from "@/components/ProtectedRoute";
import { EmptyState, ErrorBox, PageLoader, SectionTitle } from "@/components/ui";
import { currency, unwrapList } from "@/lib/utils";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersView />
    </ProtectedRoute>
  );
}

function Badge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-brand-light text-brand" : "bg-amber-50 text-amber-700"
      }`}
    >
      {ok ? yes : no}
    </span>
  );
}

function OrdersView() {
  const { userId } = useAuth();
  const { data, error, loading, reload } = useFetch(
    () => (userId ? api.getUserOrders(userId) : Promise.resolve(null)),
    [userId],
  );

  if (loading || !userId) return <PageLoader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const orders = unwrapList(data).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );

  return (
    <div className="container-page py-10">
      <SectionTitle>My Orders</SectionTitle>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" hint="When you place an order it will appear here.">
          <Link href="/products" className="btn-primary">
            Start shopping
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <article key={o._id} className="overflow-hidden rounded-lg border border-slate-200">
              <header className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 text-sm">
                <div>
                  <p className="font-semibold text-ink">Order #{o.id ?? o._id.slice(-6)}</p>
                  <p className="text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {o.paymentMethodType === "cash" ? "Cash on delivery" : "Paid online"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge ok={o.isPaid} yes="Paid" no="Unpaid" />
                  <Badge ok={o.isDelivered} yes="Delivered" no="Not delivered" />
                </div>
                <p className="font-semibold text-ink">{currency(o.totalOrderPrice)}</p>
              </header>

              <ul className="divide-y divide-slate-100">
                {o.cartItems?.map((it) => (
                  <li key={it._id} className="flex items-center gap-4 p-4">
                    <div className="relative h-16 w-16 shrink-0 bg-surface">
                      {it.product?.imageCover && (
                        <Image src={it.product.imageCover} alt="" fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {it.product?.title ?? "Product"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {it.count} × {it.price}
                    </p>
                  </li>
                ))}
              </ul>

              {o.shippingAddress && (
                <footer className="border-t border-slate-100 p-4 text-xs text-slate-500">
                  Ships to {o.shippingAddress.details}, {o.shippingAddress.city} ·{" "}
                  {o.shippingAddress.phone}
                </footer>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
