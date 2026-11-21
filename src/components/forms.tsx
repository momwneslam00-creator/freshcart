"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Spinner } from "@/components/ui";

export function Field({
  label,
  error,
  ...props
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`input ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`}
        {...props}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
      {loading ? <Spinner className="h-4 w-4" /> : children}
    </button>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page flex justify-center py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- validators (mirror the API's own rules) ---------- */

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isEgPhone = (v: string) => /^01[0125][0-9]{8}$/.test(v);
// The API requires: starts with a capital letter, 6+ chars total.
export const isPassword = (v: string) => /^[A-Z][A-Za-z0-9@#$%^&*!_-]{5,}$/.test(v);
export const PASSWORD_HINT =
  "Must start with a capital letter and be at least 6 characters (letters, numbers, symbols).";
