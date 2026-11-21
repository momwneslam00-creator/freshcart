"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import ProductsBrowser from "@/components/ProductsBrowser";
import { ErrorBox, PageLoader } from "@/components/ui";

export default function BrandDetails({ id }: { id: string }) {
  const { data, error, loading, reload } = useFetch(() => api.getBrand(id), [id]);
  if (loading) return <PageLoader />;
  if (error || !data) return <ErrorBox message={error ?? "Brand not found"} onRetry={reload} />;
  const brand = data.data;

  return (
    <div className="container-page py-10">
      <Link href="/brands" className="text-sm text-brand hover:underline">
        ← All brands
      </Link>
      <div className="mt-4 mb-10 flex items-center gap-6 rounded-lg bg-surface p-6">
        <div className="relative h-24 w-32 rounded bg-white">
          <Image src={brand.image} alt={brand.name} fill sizes="128px" className="object-contain p-2" />
        </div>
        <h1 className="text-3xl font-bold text-ink">{brand.name}</h1>
      </div>
      <ProductsBrowser brandId={id} />
    </div>
  );
}
