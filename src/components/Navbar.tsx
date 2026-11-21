"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Menu, ShieldCheck, ShoppingCart, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Category" },
  { href: "/brands", label: "Brands" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, logout, ready, user } = useAuth();
  const { count } = useCart();
  const { items } = useWishlist();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/login");
  };

  const linkCls = (href: string) =>
    `text-sm font-medium transition-colors hover:text-brand ${
      isActive(href) ? "text-brand" : "text-slate-600"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="flex items-center justify-center gap-2 bg-brand-light py-1.5 text-xs text-slate-600">
        <ShieldCheck className="h-4 w-4 text-brand" aria-hidden />
        FDIC insured up to $250,000 · Bank-level 256-bit encryption
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(l.href)}>
              {l.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link href="/orders" className={linkCls("/orders")}>
              Orders
            </Link>
          )}
          <Link href="/cart" className="relative text-brand" aria-label={`Cart, ${count} items`}>
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full border border-slate-200 bg-white px-1 text-[11px] font-semibold text-brand">
                {count}
              </span>
            )}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {ready && isLoggedIn && (
            <>
              <Link
                href="/wishlist"
                className="relative text-slate-600 hover:text-danger"
                aria-label={`Wishlist, ${items.length} items`}
              >
                <Heart className="h-6 w-6" />
                {items.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                    {items.length}
                  </span>
                )}
              </Link>
              <Link href="/change-password" className="text-sm text-slate-600 hover:text-brand">
                {user?.name ? user.name.split(" ")[0] : "Account"}
              </Link>
              <button onClick={handleLogout} className="btn-danger">
                LogOut
              </button>
            </>
          )}
          {ready && !isLoggedIn && (
            <>
              <Link href="/login" className="btn-outline">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={linkCls(l.href)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)} className={linkCls("/cart")}>
              Cart ({count})
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/wishlist" onClick={() => setOpen(false)} className={linkCls("/wishlist")}>
                  Wishlist ({items.length})
                </Link>
                <Link href="/orders" onClick={() => setOpen(false)} className={linkCls("/orders")}>
                  Orders
                </Link>
                <Link
                  href="/change-password"
                  onClick={() => setOpen(false)}
                  className={linkCls("/change-password")}
                >
                  Change password
                </Link>
                <button onClick={handleLogout} className="btn-danger w-full">
                  LogOut
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline flex-1">
                  Login
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
