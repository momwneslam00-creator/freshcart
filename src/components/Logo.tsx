import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-ink">
      <ShoppingCart className="h-7 w-7 text-brand" aria-hidden />
      FreshCart
    </Link>
  );
}
