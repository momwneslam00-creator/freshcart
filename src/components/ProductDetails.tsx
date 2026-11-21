"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ErrorBox, PageLoader, Spinner, Stars } from "@/components/ui";
import Reviews from "@/components/Reviews";
import ProductCard from "@/components/ProductCard";
import { brandOf, categoryOf, currency, effectivePrice } from "@/lib/utils";

export default function ProductDetails({ id }: { id: string }) {
  const { data, error, loading, reload } = useFetch(() => api.getProduct(id), [id]);
  const { add, busy } = useCart();
  const wishlist = useWishlist();
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);

  const product = data?.data;
  const category = product ? categoryOf(product) : null;

  const related = useFetch(
    () =>
      category
        ? api.getProducts({ category: category._id, limit: 5 })
        : Promise.resolve(null),
    [category?._id],
  );

  if (loading) return <PageLoader />;
  if (error || !product) return <ErrorBox message={error ?? "Product not found"} onRetry={reload} />;

  const images = [product.imageCover, ...(product.images ?? [])].filter(
    (v, i, a) => a.indexOf(v) === i,
  );
  const brand = brandOf(product);
  const inWishlist = wishlist.has(product._id);
  const isBusy = busy.has(product._id);

  const addMany = async () => {
    // The v2 cart endpoint adds one unit per call and then sets the quantity.
    const ok = await add(product._id);
    if (ok && qty > 1) await api.updateCartQuantity(product._id, qty).catch(() => undefined);
  };

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
            <Image
              src={images[selected]}
              alt={product.title}
              fill
              priority
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-contain"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setSelected(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === selected}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded border-2 bg-surface ${
                    i === selected ? "border-brand" : "border-transparent"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2 text-sm">
            {category && (
              <Link href={`/categories/${category._id}`} className="rounded-full bg-brand-light px-3 py-1 text-brand">
                {category.name}
              </Link>
            )}
            {brand && (
              <Link href={`/brands/${brand._id}`} className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {brand.name}
              </Link>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-ink">{product.title}</h1>
          <div className="mt-3">
            <Stars value={product.ratingsAverage} count={product.ratingsQuantity} />
          </div>
          <p className="mt-5 leading-relaxed text-slate-600">{product.description}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink">{currency(effectivePrice(product))}</span>
            {product.priceAfterDiscount !== undefined && product.priceAfterDiscount < product.price && (
              <span className="text-slate-400 line-through">{currency(product.price)}</span>
            )}
          </div>
          <p className={`mt-1 text-sm ${product.quantity > 0 ? "text-brand" : "text-danger"}`}>
            {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-md border border-slate-300">
              <button
                aria-label="Decrease quantity"
                className="p-3 hover:bg-slate-50 disabled:opacity-40"
                disabled={qty <= 1}
                onClick={() => setQty((q) => q - 1)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center" aria-live="polite">{qty}</span>
              <button
                aria-label="Increase quantity"
                className="p-3 hover:bg-slate-50 disabled:opacity-40"
                disabled={qty >= product.quantity}
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              className="btn-primary px-6 py-3 text-base"
              disabled={isBusy || product.quantity < 1}
              onClick={addMany}
            >
              {isBusy ? <Spinner className="h-4 w-4" /> : <ShoppingCart className="h-5 w-5" />}
              Add To Cart
            </button>

            <button
              className="btn-outline px-4 py-3"
              onClick={() => wishlist.toggle(product._id)}
              disabled={wishlist.busy.has(product._id)}
              aria-pressed={inWishlist}
            >
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-danger text-danger" : ""}`} />
              {inWishlist ? "In wishlist" : "Wishlist"}
            </button>
          </div>
        </div>
      </div>

      <Reviews productId={product._id} />

      {related.data && related.data.data.filter((p) => p._id !== product._id).length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-bold text-ink">You may also like</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.data.data
              .filter((p) => p._id !== product._id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
