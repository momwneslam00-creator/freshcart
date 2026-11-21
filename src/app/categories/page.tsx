import type { Metadata } from "next";
import Directory from "@/components/Directory";
import { SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <div className="container-page py-10">
      <SectionTitle>All Categories</SectionTitle>
      <Directory kind="categories" />
    </div>
  );
}
