import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-surface">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm text-slate-500 sm:flex-row">
        <Logo />
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="/products" className="hover:text-brand">Products</Link>
          <Link href="/categories" className="hover:text-brand">Categories</Link>
          <Link href="/brands" className="hover:text-brand">Brands</Link>
        </nav>
        <p>© FreshCart. All rights reserved.</p>
      </div>
    </footer>
  );
}
