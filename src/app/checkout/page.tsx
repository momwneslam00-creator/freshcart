"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useCart } from "@/context/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Field, isEgPhone } from "@/components/forms";
import { EmptyState, PageLoader, SectionTitle, Spinner } from "@/components/ui";
import { currency } from "@/lib/utils";

type Method = "cash" | "online";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutView />
    </ProtectedRoute>
  );
}

function CheckoutView() {
  const router = useRouter();
  const { cartId, cart, total, count, loading: cartLoading, refresh } = useCart();
  const addresses = useFetch(() => api.getAddresses(), []);

  const [selected, setSelected] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: "", details: "", phone: "", city: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingAddr, setSavingAddr] = useState(false);
  const [method, setMethod] = useState<Method>("cash");
  const [placing, setPlacing] = useState(false);

  if (cartLoading && !cart) return <PageLoader />;
  if (!cartId || count === 0) {
    return (
      <EmptyState title="Nothing to check out" hint="Your cart is empty.">
        <Link href="/products" className="btn-primary">
          Browse products
        </Link>
      </EmptyState>
    );
  }

  const list = addresses.data?.data ?? [];
  const showForm = adding || (!addresses.loading && list.length === 0);
  const chosen = list.find((a) => a._id === selected) ?? null;

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newAddr.name.trim()) errs.name = "Give this address a name (e.g. Home)";
    if (newAddr.details.trim().length < 5) errs.details = "Enter the full address details";
    if (!isEgPhone(newAddr.phone)) errs.phone = "Enter a valid Egyptian phone number";
    if (!newAddr.city.trim()) errs.city = "City is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingAddr(true);
    try {
      const res = await api.addAddress(newAddr);
      toast.success("Address saved");
      setNewAddr({ name: "", details: "", phone: "", city: "" });
      setAdding(false);
      addresses.reload();
      const last = res.data?.[res.data.length - 1];
      if (last) setSelected(last._id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save address");
    } finally {
      setSavingAddr(false);
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await api.removeAddress(id);
      if (selected === id) setSelected("");
      addresses.reload();
      toast.success("Address removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove address");
    }
  };

  const placeOrder = async () => {
    if (!chosen) return toast.error("Choose or add a shipping address first");
    const shipping = { details: chosen.details, phone: chosen.phone, city: chosen.city };
    setPlacing(true);
    try {
      if (method === "cash") {
        await api.createCashOrder(cartId, shipping);
        await refresh();
        toast.success("Order placed! Pay on delivery.");
        router.replace("/orders");
      } else {
        const res = await api.createCheckoutSession(cartId, shipping, window.location.origin);
        if (!res.session?.url) throw new Error("Could not start the online payment");
        window.location.href = res.session.url;
        return; // keep the spinner while the browser navigates away
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place the order");
    }
    setPlacing(false);
  };

  return (
    <div className="container-page py-10">
      <SectionTitle>Checkout</SectionTitle>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section aria-labelledby="addr-title">
            <h2 id="addr-title" className="mb-3 text-lg font-semibold text-ink">
              1. Shipping address
            </h2>

            {addresses.loading ? (
              <Spinner className="h-6 w-6 text-brand" />
            ) : (
              <ul className="space-y-3">
                {list.map((a) => (
                  <li
                    key={a._id}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      selected === a._id ? "border-brand bg-brand-light" : "border-slate-200"
                    }`}
                  >
                    <input
                      id={`addr-${a._id}`}
                      type="radio"
                      name="address"
                      className="mt-1 accent-brand"
                      checked={selected === a._id}
                      onChange={() => setSelected(a._id)}
                    />
                    <label htmlFor={`addr-${a._id}`} className="flex-1 cursor-pointer text-sm">
                      <span className="block font-semibold text-ink">{a.name}</span>
                      <span className="block text-slate-600">{a.details}, {a.city}</span>
                      <span className="block text-slate-500">{a.phone}</span>
                    </label>
                    <button
                      className="text-xs text-danger hover:underline"
                      onClick={() => removeAddress(a._id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!showForm && (
              <button className="btn-outline mt-3" onClick={() => setAdding(true)}>
                + Add new address
              </button>
            )}

            {showForm && (
              <form onSubmit={saveAddress} className="mt-4 space-y-3 rounded-lg bg-surface p-4" noValidate>
                <Field label="Address name" placeholder="Home" value={newAddr.name} error={errors.name} onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })} />
                <Field label="Details" placeholder="Street, building, apartment" value={newAddr.details} error={errors.details} onChange={(e) => setNewAddr({ ...newAddr, details: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Phone" type="tel" value={newAddr.phone} error={errors.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} />
                  <Field label="City" value={newAddr.city} error={errors.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary" disabled={savingAddr}>
                    {savingAddr && <Spinner className="h-4 w-4" />}
                    Save address
                  </button>
                  {list.length > 0 && (
                    <button type="button" className="btn-outline" onClick={() => setAdding(false)}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          <section aria-labelledby="pay-title">
            <h2 id="pay-title" className="mb-3 text-lg font-semibold text-ink">
              2. Payment method
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { v: "cash", title: "Cash on delivery", hint: "Pay when your order arrives" },
                  { v: "online", title: "Pay online", hint: "Secure card payment via Stripe" },
                ] as const
              ).map((o) => (
                <label
                  key={o.v}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                    method === o.v ? "border-brand bg-brand-light" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    className="mt-1 accent-brand"
                    checked={method === o.v}
                    onChange={() => setMethod(o.v)}
                  />
                  <span className="text-sm">
                    <span className="block font-semibold text-ink">{o.title}</span>
                    <span className="text-slate-500">{o.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-ink">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Items</dt>
              <dd>{count}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-ink">
              <dt>Total</dt>
              <dd>{currency(total)}</dd>
            </div>
          </dl>
          <button className="btn-primary mt-5 w-full py-3" onClick={placeOrder} disabled={placing}>
            {placing ? <Spinner className="h-4 w-4" /> : method === "cash" ? "Place order" : "Continue to payment"}
          </button>
          <Link href="/cart" className="mt-3 block text-center text-sm text-brand hover:underline">
            Back to cart
          </Link>
        </aside>
      </div>
    </div>
  );
}
