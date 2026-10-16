"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";

type Settings = {
  site_name: string;
  tagline: string;
  hero_headline: string;
  accent_color: string;
  paper_color: string;
  ink_color: string;
  whatsapp_number: string;
  instagram_url: string;
  show_whatsapp_fab: boolean;
  show_journal: boolean;
  show_portfolio: boolean;
  show_book_cta: boolean;
  default_theme: string;
};

const defaults: Settings = {
  site_name: "Being Lillian",
  tagline: "Makeup artistry, brand consulting, and collaborations.",
  hero_headline: "Beauty with intention",
  accent_color: "#C9A88A",
  paper_color: "#F7F4EF",
  ink_color: "#2A2420",
  whatsapp_number: "254794230220",
  instagram_url: "https://www.instagram.com/lilianbeauty_studio",
  show_whatsapp_fab: true,
  show_journal: true,
  show_portfolio: true,
  show_book_cta: true,
  default_theme: "system",
};

export function AdminAppearance() {
  const { authHeaders } = useAdminAuth();
  const [form, setForm] = useState<Settings>(defaults);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(apiUrl("/v1/admin/settings"), { headers: authHeaders });
    if (!res.ok) {
      setError(`Failed (${res.status})`);
      return;
    }
    setForm({ ...defaults, ...((await res.json()) as Settings) });
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    const res = await fetch(apiUrl("/v1/admin/settings"), {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError(`Save failed (${res.status})`);
      return;
    }
    const next = (await res.json()) as Settings;
    setForm({ ...defaults, ...next });
    window.dispatchEvent(new CustomEvent("bl-settings", { detail: next }));
    setMsg("Appearance & capabilities saved. Refresh public pages to see nav changes.");
  }

  function toggle(key: keyof Settings) {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[2px] text-muted mb-1">Appearance</p>
        <h2 className="font-display text-3xl">UI & capabilities</h2>
        <p className="text-sm text-muted font-light mt-2">
          Colors, copy, and which sections visitors can reach.
        </p>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
      {msg && <p className="text-sm text-muted">{msg}</p>}

      <fieldset className="space-y-4">
        <legend className="text-[11px] uppercase tracking-[1.5px] text-muted mb-2">Brand copy</legend>
        {(
          [
            ["site_name", "Site name"],
            ["hero_headline", "Hero headline"],
            ["tagline", "Tagline"],
            ["whatsapp_number", "WhatsApp number (digits)"],
            ["instagram_url", "Instagram URL"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="text-[11px] uppercase tracking-[1.5px] text-muted">{label}</span>
            <input
              value={String(form[key])}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none"
            />
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-[11px] uppercase tracking-[1.5px] text-muted mb-2">Colors</legend>
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              ["accent_color", "Accent"],
              ["paper_color", "Paper"],
              ["ink_color", "Ink"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-[11px] uppercase tracking-[1.5px] text-muted">{label}</span>
              <input
                type="color"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-2 w-full h-10 bg-transparent cursor-pointer"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-[11px] uppercase tracking-[1.5px] text-muted mb-2">Capabilities</legend>
        {(
          [
            ["show_journal", "Show Journal"],
            ["show_portfolio", "Show Portfolio"],
            ["show_book_cta", "Show Book CTA"],
            ["show_whatsapp_fab", "Show WhatsApp button"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={Boolean(form[key])} onChange={() => toggle(key)} />
            {label}
          </label>
        ))}
        <label className="block pt-2">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Default theme</span>
          <select
            value={form.default_theme}
            onChange={(e) => setForm({ ...form, default_theme: e.target.value })}
            className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </fieldset>

      <button type="submit" className="btn-primary">
        Save appearance
      </button>
    </form>
  );
}
