"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { Spinner, Stars } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { categoryOf, effectivePrice } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { add, busy } = useCart();
  const wishlist = useWishlist();
  const cat = categoryOf(product);
  const inWishlist = wishlist.has(product._id);
  const hasDiscount =
    product.priceAfterDiscount !== undefined && product.priceAfterDiscount < product.price;

  return (
    <article className="group relative flex flex-col rounded-lg border border-slate-100 bg-surface p-4 transition-shadow hover:shadow-md">
      <button
        onClick={() => wishlist.toggle(product._id)}
        disabled={wishlist.busy.has(product._id)}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={inWishlist}
        className="absolute right-6 top-6 z-10 rounded-full bg-white/90 p-2 shadow-sm transition hover:scale-110 disabled:opacity-60"
      >
        <Heart
          className={`h-5 w-5 ${inWishlist ? "fill-danger text-danger" : "text-slate-500"}`}
        />
      </button>

      <Link href={`/products/${product._id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded bg-white">
          <Image
            src={product.imageCover}
            alt={product.title}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {cat && <p className="mt-3 text-sm text-brand">{cat.name}</p>}
        <h3 className="mt-1 line-clamp-1 font-medium text-ink">{product.title}</h3>
        <div className="mt-2">
          <Stars value={product.ratingsAverage} count={product.ratingsQuantity} />
        </div>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <div>
          <span className="text-lg font-medium text-ink">
            {effectivePrice(product)} <span className="text-base">Egp</span>
          </span>
          {hasDiscount && (
            <span className="ml-2 text-xs text-slate-400 line-through">{product.price}</span>
          )}
        </div>
        <button
          onClick={() => add(product._id)}
          disabled={busy.has(product._id)}
          className="btn-primary"
        >
          {busy.has(product._id) ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          Add To Cart
        </button>
      </div>
    </article>
  );
}
