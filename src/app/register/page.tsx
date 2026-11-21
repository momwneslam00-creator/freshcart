"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  AuthCard,
  Field,
  PASSWORD_HINT,
  SubmitButton,
  isEgPhone,
  isEmail,
  isPassword,
} from "@/components/forms";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    rePassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 3) errs.name = "Name must be at least 3 characters";
    if (!isEmail(form.email)) errs.email = "Enter a valid email address";
    if (!isEgPhone(form.phone)) errs.phone = "Enter a valid Egyptian phone number (01XXXXXXXXX)";
    if (!isPassword(form.password)) errs.password = PASSWORD_HINT;
    if (form.rePassword !== form.password) errs.rePassword = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerError("");
    try {
      const res = await api.signUp({ ...form, name: form.name.trim() });
      login(res.token, res.user);
      toast.success("Account created!");
      router.replace("/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="Join FreshCart and start shopping">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {serverError && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}
        <Field label="Name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
        <Field label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
        <Field label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
        <Field label="Confirm password" type="password" autoComplete="new-password" value={form.rePassword} onChange={set("rePassword")} error={errors.rePassword} />
        <SubmitButton loading={loading}>Register</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Login
        </Link>
      </p>
    </AuthCard>
  );
}
