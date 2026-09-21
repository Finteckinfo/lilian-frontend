"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { AdminAppearance } from "@/components/AdminAppearance";
import { AdminGallery } from "@/components/AdminGallery";
import { AdminJournal } from "@/components/AdminJournal";
import { AdminKanban } from "@/components/AdminKanban";
import { AdminMonitor } from "@/components/AdminMonitor";

const TABS = [
  { id: "monitor", label: "Monitor" },
  { id: "leads", label: "Leads" },
  { id: "journal", label: "Journal" },
  { id: "gallery", label: "Gallery" },
  { id: "appearance", label: "Appearance" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminInner() {
  const { user, loading, token, logout } = useAdminAuth();
  const [tab, setTab] = useState<TabId>("monitor");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Loading studio…
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[2px] text-muted">Being Lillian</p>
            <h1 className="font-display text-2xl md:text-3xl">Studio Admin</h1>
            <p className="text-sm text-muted mt-1">
              Signed in as {user.full_name || user.email}
            </p>
          </div>
          <nav className="flex gap-4 text-[11px] uppercase tracking-[1.5px] items-center">
            <Link href="/">View site</Link>
            <button type="button" onClick={logout} className="text-accent">
              Sign out
            </button>
          </nav>
        </div>
        <div className="mt-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`text-[11px] uppercase tracking-[1.5px] px-4 py-2 border-b-2 transition-colors ${
                tab === t.id
                  ? "border-accent text-ink dark:text-paper"
                  : "border-transparent text-muted hover:text-ink dark:hover:text-paper"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="px-4 md:px-8 py-8">
        {tab === "monitor" && <AdminMonitor />}
        {tab === "leads" && <AdminKanban />}
        {tab === "journal" && <AdminJournal />}
        {tab === "gallery" && <AdminGallery />}
        {tab === "appearance" && <AdminAppearance />}
      </main>
    </div>
  );
}

export function AdminShell() {
  return (
    <AdminAuthProvider>
      <AdminInner />
    </AdminAuthProvider>
  );
}
