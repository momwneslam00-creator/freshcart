import { Suspense } from "react";
import BrandDetails from "@/components/BrandDetails";
import { PageLoader } from "@/components/ui";

export default function BrandDetailsPage({ params }: PageProps<"/brands/[id]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Resolved params={params} />
    </Suspense>
  );
}

async function Resolved({ params }: Pick<PageProps<"/brands/[id]">, "params">) {
  const { id } = await params;
  return <BrandDetails id={id} />;
}
