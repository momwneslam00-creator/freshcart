import type { Brand, Category, Product } from "@/types";

export const currency = (n: number) =>
  `${new Intl.NumberFormat("en-US").format(n)} EGP`;

export const categoryOf = (p: Product): Category | null =>
  typeof p.category === "object" && p.category ? p.category : null;

export const brandOf = (p: Product): Brand | null =>
  typeof p.brand === "object" && p.brand ? p.brand : null;

export const effectivePrice = (p: Pick<Product, "price" | "priceAfterDiscount">) =>
  p.priceAfterDiscount ?? p.price;

/** The API returns either a bare array or a { data } envelope for orders. */
export function unwrapList<T>(res: T[] | { data: T[] } | null | undefined): T[] {
  if (!res) return [];
  return Array.isArray(res) ? res : (res.data ?? []);
}

export const shortTitle = (title: string, words = 2) =>
  title.split(" ").slice(0, words).join(" ");
