"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";

function SignupForm() {
  const { signup, loading, token } = useAdminAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(apiUrl("/v1/auth/status"))
      .then((r) => r.json())
      .then((d) => {
        setOpen(Boolean(d.signup_open));
        if (!d.signup_open) router.replace("/admin/login");
      })
      .catch(() => setOpen(false));
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signup(fullName.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading || token || open === null) {
    return <p className="text-sm text-muted">Checking availability…</p>;
  }

  if (!open) {
    return (
      <p className="text-sm text-muted">
        Signup is closed.{" "}
        <Link href="/admin/login" className="underline">
          Sign in
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <p className="text-[11px] uppercase tracking-[2px] text-muted mb-1">Studio</p>
        <h1 className="font-display text-4xl">Create admin</h1>
        <p className="text-sm text-muted font-light mt-2">
          First account owns the CRM, journal, and gallery.
        </p>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Full name</span>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-3 outline-none"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-3 outline-none"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Password</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-3 outline-none"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Confirm password</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-3 outline-none"
        />
      </label>
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Creating…" : "Create account"}
      </button>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href="/admin/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default function AdminSignupPage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex items-center justify-center px-4 bg-paper text-ink">
        <SignupForm />
      </div>
    </AdminAuthProvider>
  );
}
