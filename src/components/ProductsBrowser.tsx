"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useDebounce } from "@/hooks/useDebounce";
import ProductCard from "@/components/ProductCard";
import { EmptyState, ErrorBox, GridSkeleton, Pagination } from "@/components/ui";

const PAGE_SIZE = 12;

const SORTS = [
  { value: "", label: "Default" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-ratingsAverage", label: "Top rated" },
  { value: "-sold", label: "Best selling" },
];

interface Props {
  /** When set, the list is locked to this brand / category (detail pages). */
  brandId?: string;
  categoryId?: string;
  showFilters?: boolean;
}

export default function ProductsBrowser({ brandId, categoryId, showFilters = true }: Props) {
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [page, setPage] = useState(1);

  const dKeyword = useDebounce(keyword);
  const dMin = useDebounce(minPrice);
  const dMax = useDebounce(maxPrice);

  const lockedFilters = !!(brandId || categoryId);
  const categories = useFetch(
    () => (showFilters && !lockedFilters ? api.getCategories({ limit: 50 }) : Promise.resolve(null)),
    [showFilters, lockedFilters],
  );
  const brands = useFetch(
    () => (showFilters && !lockedFilters ? api.getBrands({ limit: 100 }) : Promise.resolve(null)),
    [showFilters, lockedFilters],
  );

  const effBrand = brandId ?? brand;
  const effCategory = categoryId ?? category;

  const { data, error, loading, reload } = useFetch(
    () =>
      api.getProducts({
        limit: PAGE_SIZE,
        page,
        sort,
        // The API's keyword search matches the title, so trim stray spaces.
        keyword: dKeyword.trim(),
        brand: effBrand,
        category: effCategory,
        priceGte: dMin,
        priceLte: dMax,
      }),
    [page, sort, dKeyword, dMin, dMax, effBrand, effCategory],
  );

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const pages = data?.metadata?.numberOfPages ?? 1;

  return (
    <div>
      {showFilters && (
        <div className="mb-8 grid gap-3 rounded-lg bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6">
          <input
            type="search"
            placeholder="Search products…"
            aria-label="Search products"
            className="input lg:col-span-2"
            value={keyword}
            onChange={(e) => resetPage(setKeyword)(e.target.value)}
          />
          <select
            aria-label="Sort"
            className="input"
            value={sort}
            onChange={(e) => resetPage(setSort)(e.target.value)}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {!lockedFilters && (
            <>
              <select
                aria-label="Category"
                className="input"
                value={category}
                onChange={(e) => resetPage(setCategory)(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.data?.data.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Brand"
                className="input"
                value={brand}
                onChange={(e) => resetPage(setBrand)(e.target.value)}
              >
                <option value="">All brands</option>
                {brands.data?.data.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <div className="flex gap-2 lg:col-span-2">
            <input
              type="number"
              min={0}
              placeholder="Min price"
              aria-label="Minimum price"
              className="input"
              value={minPrice}
              onChange={(e) => resetPage(setMinPrice)(e.target.value)}
            />
            <input
              type="number"
              min={0}
              placeholder="Max price"
              aria-label="Maximum price"
              className="input"
              value={maxPrice}
              onChange={(e) => resetPage(setMaxPrice)(e.target.value)}
            />
          </div>
        </div>
      )}

      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading ? (
        <GridSkeleton count={8} />
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.data.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </>
      ) : (
        <EmptyState title="No products found" hint="Try changing your search or filters." />
      )}
    </div>
  );
}
