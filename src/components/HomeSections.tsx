"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import ProductCard from "@/components/ProductCard";
import { ErrorBox, GridSkeleton, SectionTitle } from "@/components/ui";

export function CategoriesSection() {
  const { data, error, loading, reload } = useFetch(() => api.getCategories({ limit: 20 }), []);

  return (
    <section className="container-page py-12">
      <SectionTitle>Browse By Category</SectionTitle>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {data?.data.map((c) => (
            <Link
              key={c._id}
              href={`/categories/${c._id}`}
              className="group overflow-hidden rounded-lg border border-slate-100 bg-surface transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-white">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 16vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="p-3 text-center text-sm font-medium text-ink">{c.name}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function BrandsSection() {
  const { data, loading } = useFetch(() => api.getBrands({ limit: 12 }), []);
  if (loading || !data?.data.length) return null;
  return (
    <section className="container-page py-12">
      <SectionTitle>Popular Brands</SectionTitle>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {data.data.map((b) => (
          <Link
            key={b._id}
            href={`/brands/${b._id}`}
            className="relative aspect-3/2 rounded-lg border border-slate-100 bg-white p-3 transition-shadow hover:shadow-md"
            aria-label={b.name}
          >
            <Image src={b.image} alt={b.name} fill sizes="16vw" className="object-contain p-3" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const { data, error, loading, reload } = useFetch(
    () => api.getProducts({ limit: 12, sort: "-ratingsAverage" }),
    [],
  );

  return (
    <section className="container-page py-12">
      <div className="mb-6 flex items-end justify-between">
        <SectionTitle>Featured Products</SectionTitle>
        <Link href="/products" className="mb-6 text-sm font-medium text-brand hover:underline">
          View all →
        </Link>
      </div>
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading ? (
        <GridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {data?.data.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
