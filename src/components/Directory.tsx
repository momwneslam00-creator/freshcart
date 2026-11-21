"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState, ErrorBox, PageLoader, Pagination } from "@/components/ui";

/** Shared grid for the Brands and Categories listing pages. */
export default function Directory({ kind }: { kind: "brands" | "categories" }) {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const dKeyword = useDebounce(keyword);

  const { data, error, loading, reload } = useFetch(
    () =>
      kind === "brands"
        ? api.getBrands({ limit: 20, page, keyword: dKeyword.trim() })
        : api.getCategories({ limit: 20, page, keyword: dKeyword.trim() }),
    [kind, page, dKeyword],
  );

  const items = data?.data ?? [];

  return (
    <div>
      <input
        type="search"
        placeholder={`Search ${kind}…`}
        aria-label={`Search ${kind}`}
        className="input mb-8 max-w-md"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setPage(1);
        }}
      />
      {error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title={`No ${kind} found`} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((item) => (
              <Link
                key={item._id}
                href={`/${kind}/${item._id}`}
                className="group overflow-hidden rounded-lg border border-slate-100 bg-surface transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square bg-white">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 20vw, 50vw"
                    className={kind === "brands" ? "object-contain p-6" : "object-cover"}
                  />
                </div>
                <p className="p-3 text-center font-medium text-ink group-hover:text-brand">
                  {item.name}
                </p>
              </Link>
            ))}
          </div>
          <Pagination page={page} pages={data?.metadata?.numberOfPages ?? 1} onChange={setPage} />
        </>
      )}
    </div>
  );
}
