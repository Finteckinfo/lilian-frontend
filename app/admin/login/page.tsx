"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";

function LoginForm() {
  const { login, loading, token } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [hasUsers, setHasUsers] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/v1/auth/status"))
      .then((r) => r.json())
      .then((d) => {
        setSignupOpen(Boolean(d.signup_open));
        setHasUsers(Boolean(d.has_users));
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading || token) {
    return <p className="text-sm text-muted">Checking session…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <p className="text-[11px] uppercase tracking-[2px] text-muted mb-1">Studio</p>
        <h1 className="font-display text-4xl">Sign in</h1>
        <p className="text-sm text-muted font-light mt-2">
          {hasUsers
            ? "Enter your admin email and password."
            : "No admin yet — create the first studio account."}
        </p>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-3 outline-none"
        />
      </label>
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      {signupOpen && (
        <p className="text-sm text-muted">
          Need an account?{" "}
          <Link href="/admin/signup" className="underline underline-offset-4">
            Create studio admin
          </Link>
        </p>
      )}
      <p className="text-sm">
        <Link href="/" className="text-muted hover:text-ink">
          ← Back to site
        </Link>
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex items-center justify-center px-4 bg-paper text-ink">
        <LoginForm />
      </div>
    </AdminAuthProvider>
  );
}
