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
  isEmail,
  isPassword,
} from "@/components/forms";

type Step = "email" | "code" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setError("Enter a valid email address");
    run(async () => {
      await api.forgotPassword(email);
      toast.success("Reset code sent to your email");
      setStep("code");
    });
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Enter the code from your email");
    run(async () => {
      await api.verifyResetCode(code.trim());
      setStep("reset");
    });
  };

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPassword(password)) return setError(PASSWORD_HINT);
    run(async () => {
      const res = await api.resetPassword(email, password);
      toast.success("Password updated");
      if (res.token) {
        login(res.token);
        router.replace("/");
      } else {
        router.replace("/login");
      }
    });
  };

  const alert = error && (
    <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
      {error}
    </p>
  );

  return (
    <AuthCard
      title="Forgot password"
      subtitle={
        step === "email"
          ? "We'll email you a verification code"
          : step === "code"
            ? `Enter the code we sent to ${email}`
            : "Choose a new password"
      }
    >
      {step === "email" && (
        <form onSubmit={sendCode} className="space-y-4" noValidate>
          {alert}
          <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <SubmitButton loading={loading}>Send code</SubmitButton>
        </form>
      )}
      {step === "code" && (
        <form onSubmit={verify} className="space-y-4" noValidate>
          {alert}
          <Field label="Verification code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
          <SubmitButton loading={loading}>Verify code</SubmitButton>
          <button type="button" className="w-full text-sm text-brand hover:underline" onClick={() => { setError(""); setStep("email"); }}>
            Use a different email
          </button>
        </form>
      )}
      {step === "reset" && (
        <form onSubmit={reset} className="space-y-4" noValidate>
          {alert}
          <Field label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <SubmitButton loading={loading}>Reset password</SubmitButton>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
