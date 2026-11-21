"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import ProductsBrowser from "@/components/ProductsBrowser";
import { ErrorBox, PageLoader } from "@/components/ui";

export default function CategoryDetails({ id }: { id: string }) {
  const { data, error, loading, reload } = useFetch(() => api.getCategory(id), [id]);
  // There is no "subcategories of a category" endpoint in the spec, so fetch the
  // list and keep the ones that belong to this category.
  const subs = useFetch(() => api.getSubCategories({ limit: 100 }), []);

  if (loading) return <PageLoader />;
  if (error || !data) return <ErrorBox message={error ?? "Category not found"} onRetry={reload} />;
  const category = data.data;
  const subcategories = subs.data?.data.filter((s) => s.category === id) ?? [];

  return (
    <div className="container-page py-10">
      <Link href="/categories" className="text-sm text-brand hover:underline">
        ← All categories
      </Link>
      <div className="mt-4 mb-6 flex items-center gap-6 rounded-lg bg-surface p-6">
        <div className="relative h-24 w-24 overflow-hidden rounded bg-white">
          <Image src={category.image} alt={category.name} fill sizes="96px" className="object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-ink">{category.name}</h1>
      </div>

      {subcategories.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-ink">Subcategories</h2>
          <ul className="flex flex-wrap gap-2">
            {subcategories.map((s) => (
              <li key={s._id} className="rounded-full border border-brand/30 bg-brand-light px-4 py-1.5 text-sm text-brand">
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ProductsBrowser categoryId={id} />
    </div>
  );
}
