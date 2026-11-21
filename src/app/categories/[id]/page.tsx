import { Suspense } from "react";
import CategoryDetails from "@/components/CategoryDetails";
import { PageLoader } from "@/components/ui";

export default function CategoryDetailsPage({ params }: PageProps<"/categories/[id]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Resolved params={params} />
    </Suspense>
  );
}

async function Resolved({ params }: Pick<PageProps<"/categories/[id]">, "params">) {
  const { id } = await params;
  return <CategoryDetails id={id} />;
}
