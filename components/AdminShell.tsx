"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { AdminAppearance } from "@/components/AdminAppearance";
import { AdminGallery } from "@/components/AdminGallery";
import { AdminJournal } from "@/components/AdminJournal";
import { AdminKanban } from "@/components/AdminKanban";
import { AdminMonitor } from "@/components/AdminMonitor";
import { AdminAccounts } from "@/components/AdminAccounts";
import { AdminCatalog } from "@/components/AdminCatalog";
import { ADMIN_TOUR, Walkthrough, restartWalkthrough } from "@/components/Walkthrough";

const TABS = [
  { id: "monitor", label: "Monitor", tour: "admin-monitor" },
  { id: "accounts", label: "Accounts", tour: "admin-accounts" },
  { id: "catalog", label: "Catalog", tour: "admin-catalog" },
  { id: "leads", label: "Leads", tour: "admin-leads" },
  { id: "journal", label: "Journal", tour: "admin-journal" },
  { id: "gallery", label: "Gallery", tour: "admin-gallery" },
  { id: "appearance", label: "Appearance", tour: "admin-appearance" },
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
      {/* ── Header ── */}
      <header className="border-b border-line">
        <div className="px-5 md:px-10 pt-8 pb-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-gold mb-2">Being Lillian</p>
              <h1 className="font-display text-3xl md:text-4xl leading-tight">Studio</h1>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted mb-2">
                {user.full_name || user.email}
              </p>
              <nav className="flex gap-5 text-[11px] uppercase tracking-[1.5px]">
                <button type="button" onClick={() => restartWalkthrough(ADMIN_TOUR)} className="text-muted hover:text-ink transition-colors">
                  Guide
                </button>
                <Link href="/" className="text-muted hover:text-ink transition-colors">
                  View site
                </Link>
                <button type="button" onClick={logout} className="text-accent hover:text-ink transition-colors">
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* ── Tab rail ── */}
        <div className="px-5 md:px-10 flex gap-0.5 overflow-x-auto -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              data-tour={t.tour || undefined}
              onClick={() => setTab(t.id)}
              className={`text-[11px] uppercase tracking-[1.5px] px-5 py-3 border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "border-gold text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="px-5 md:px-10 py-10">
        {tab === "monitor" && <AdminMonitor />}
        {tab === "accounts" && <AdminAccounts />}
        {tab === "catalog" && <AdminCatalog />}
        {tab === "leads" && <AdminKanban />}
        {tab === "journal" && <AdminJournal />}
        {tab === "gallery" && <AdminGallery />}
        {tab === "appearance" && <AdminAppearance />}

        <Walkthrough
          storageKey={ADMIN_TOUR}
          onTabSwitch={(tab: string) => setTab(tab as TabId)}
          steps={[
            {
              id: "monitor",
              title: "Monitor",
              body: "The overview shows booking enquiries, product requests, and how many accounts are active. Recent sign-ins, leads, and catalog requests appear below the cards.",
              action: "Click Monitor to see it.",
              selector: "[data-tour=admin-monitor]",
              switchTab: "monitor",
            },
            {
              id: "accounts",
              title: "Accounts",
              body: "See every admin who signed in and when. Remove an account you do not trust — you cannot remove your own. Change your password from the form at the top.",
              action: "Click Accounts.",
              selector: "[data-tour=admin-accounts]",
              switchTab: "accounts",
            },
            {
              id: "catalog",
              title: "Catalog",
              body: "Record what is in your kit. Scan a barcode with your phone camera, plug in a USB scanner, or type the details by hand. Set the quantity so visitors see what is available.",
              action: "Click Catalog.",
              selector: "[data-tour=admin-catalog]",
              switchTab: "catalog",
            },
            {
              id: "leads",
              title: "Leads",
              body: "Booking enquiries live here as a kanban board. Drag or click to move them through your pipeline — New, Contacted, Booked, Done.",
              action: "Click Leads.",
              selector: "[data-tour=admin-leads]",
              switchTab: "leads",
            },
            {
              id: "journal",
              title: "Journal",
              body: "Write and edit notes that appear on the public site. Mark a post as featured to pin it to the home page.",
              action: "Click Journal.",
              selector: "[data-tour=admin-journal]",
              switchTab: "journal",
            },
            {
              id: "gallery",
              title: "Gallery",
              body: "Upload stills and reels. Drag to reorder. Each item gets a sepia filter on the public site and reveals colour on hover.",
              action: "Click Gallery.",
              selector: "[data-tour=admin-gallery]",
              switchTab: "gallery",
            },
            {
              id: "appearance",
              title: "Appearance",
              body: "Set the WhatsApp number visitors reach, toggle the journal, portfolio, and booking sections, and choose the default theme. Changes go live when you save.",
              action: "Click Appearance.",
              selector: "[data-tour=admin-appearance]",
              switchTab: "appearance",
            },
          ]}
        />
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
