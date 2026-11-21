import { Suspense } from "react";
import ProductDetails from "@/components/ProductDetails";
import { PageLoader } from "@/components/ui";

export default function ProductDetailsPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Resolved params={params} />
    </Suspense>
  );
}

async function Resolved({ params }: Pick<PageProps<"/products/[id]">, "params">) {
  const { id } = await params;
  return <ProductDetails id={id} />;
}
