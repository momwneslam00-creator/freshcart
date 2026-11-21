"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthCard, Field, PASSWORD_HINT, SubmitButton, isPassword } from "@/components/forms";

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordForm />
    </ProtectedRoute>
  );
}

function ChangePasswordForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", password: "", rePassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.currentPassword) errs.currentPassword = "Current password is required";
    if (!isPassword(form.password)) errs.password = PASSWORD_HINT;
    if (form.rePassword !== form.password) errs.rePassword = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerError("");
    try {
      const res = await api.changePassword(form);
      // the API issues a fresh token after a password change
      if (res.token) login(res.token);
      toast.success("Password changed successfully");
      setForm({ currentPassword: "", password: "", rePassword: "" });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Change password" subtitle="Update the password for your account">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {serverError && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </p>
        )}
        <Field label="Current password" type="password" autoComplete="current-password" value={form.currentPassword} onChange={set("currentPassword")} error={errors.currentPassword} />
        <Field label="New password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} error={errors.password} />
        <Field label="Confirm new password" type="password" autoComplete="new-password" value={form.rePassword} onChange={set("rePassword")} error={errors.rePassword} />
        <SubmitButton loading={loading}>Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}
