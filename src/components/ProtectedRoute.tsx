"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui";

/** Client-side guard: sends logged-out visitors to /login and returns them afterwards. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { ready, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !isLoggedIn) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, isLoggedIn, router, pathname]);

  if (!ready || !isLoggedIn) return <PageLoader />;
  return <>{children}</>;
}
