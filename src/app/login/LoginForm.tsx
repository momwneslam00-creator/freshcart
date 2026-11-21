"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AuthCard, Field, SubmitButton, isEmail } from "@/components/forms";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = params.get("next");
  // only allow same-site redirects
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!isEmail(form.email)) errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerError("");
    try {
      const res = await api.signIn(form);
      login(res.token, res.user);
      toast.success("Welcome back!");
      router.replace(dest);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue shopping">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {serverError && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        <SubmitButton loading={loading}>Login</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New to FreshCart?{" "}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
