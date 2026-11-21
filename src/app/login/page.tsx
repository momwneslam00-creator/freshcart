import { Suspense } from "react";
import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import { PageLoader } from "@/components/ui";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginForm />
    </Suspense>
  );
}
