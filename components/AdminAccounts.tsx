"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";

type Account = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at?: string | null;
  last_login_at?: string | null;
  login_count: number;
};

function when(iso?: string | null) {
  if (!iso) return "Never";
  return iso.slice(0, 19).replace("T", " ");
}

export function AdminAccounts() {
  const { authHeaders, user } = useAdminAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(apiUrl("/v1/admin/users"), { headers: authHeaders });
    if (!res.ok) {
      setError(`Could not load accounts (${res.status})`);
      return;
    }
    setAccounts((await res.json()) as Account[]);
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");
    if (newPassword.length < 8) {
      setPasswordError("The new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The new password and confirmation do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(apiUrl("/v1/auth/password"), {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        setPasswordError(
          typeof body.detail === "string"
            ? body.detail
            : `Could not change password (${res.status})`
        );
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg("Password updated. Use it the next time you sign in.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function remove(account: Account) {
    if (!confirm(`Remove ${account.email}? They will not be able to sign in.`))
      return;
    const res = await fetch(apiUrl(`/v1/admin/users/${account.id}`), {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok && res.status !== 204) {
      const body = await res.json().catch(() => ({}));
      setError(
        typeof body.detail === "string" ? body.detail : `Delete failed (${res.status})`
      );
      return;
    }
    await load();
  }

  return (
    <div className="space-y-12">
      {/* ── Header ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[2px] text-gold mb-2">Accounts</p>
        <h2 className="font-display text-3xl mb-3">Studio sign-ins</h2>
        <p className="text-[13px] text-muted font-light max-w-xl leading-relaxed">
          Every admin sign-in is recorded. Remove an account you do not trust.
          You cannot remove the account you are using.
        </p>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      {/* ── Password ── */}
      <form
        onSubmit={changePassword}
        className="border border-line bg-elevated/40 p-6 md:p-8 max-w-md space-y-5"
      >
        <h3 className="font-display text-2xl">Change password</h3>
        <p className="text-[13px] text-muted font-light leading-relaxed">
          Enter the password you sign in with, then choose a new one.
        </p>
        <label className="block">
          <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
            Current password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
            New password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
            Confirm new password
          </span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
          />
        </label>
        {passwordError && <p className="text-[13px] text-accent">{passwordError}</p>}
        {passwordMsg && <p className="text-[13px] text-gold">{passwordMsg}</p>}
        <button type="submit" className="btn-primary" disabled={savingPassword}>
          {savingPassword ? "Saving…" : "Update password"}
        </button>
      </form>

      {/* ── Account list ── */}
      <ul className="space-y-3">
        {accounts.map((account) => {
          const mine = account.id === user?.id;
          return (
            <li
              key={account.id}
              className="border border-line bg-elevated/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium">{account.full_name || account.email}</p>
                <p className="text-sm text-muted mt-1">{account.email}</p>
                <p className="text-[10px] uppercase tracking-[1.5px] text-muted mt-2">
                  Last sign-in {when(account.last_login_at)} ·{" "}
                  {account.login_count} visit{account.login_count === 1 ? "" : "s"}
                  {mine ? " · You" : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={mine}
                onClick={() => remove(account)}
                className="text-[11px] uppercase tracking-[1.5px] border border-accent text-accent px-4 py-2 disabled:opacity-30 transition-colors hover:bg-accent hover:text-paper shrink-0"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
