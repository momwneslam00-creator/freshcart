import type { Metadata } from "next";
import Directory from "@/components/Directory";
import { SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Brands" };

export default function BrandsPage() {
  return (
    <div className="container-page py-10">
      <SectionTitle>All Brands</SectionTitle>
      <Directory kind="brands" />
    </div>
  );
}
