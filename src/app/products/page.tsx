import type { Metadata } from "next";
import ProductsBrowser from "@/components/ProductsBrowser";
import { SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <div className="container-page py-10">
      <SectionTitle>All Products</SectionTitle>
      <ProductsBrowser />
    </div>
  );
}
