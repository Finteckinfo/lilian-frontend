"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export type SiteSettings = {
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

const fallback: SiteSettings = {
  site_name: "Being Lillian",
  tagline: "Makeup artistry, brand consulting, and collaborations.",
  hero_headline: "Beauty with intention",
  accent_color: "#C9A88A",
  paper_color: "#F7F4EF",
  ink_color: "#2A2420",
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "0000000000",
  instagram_url:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://www.instagram.com/lilianbeauty_studio",
  show_whatsapp_fab: true,
  show_journal: true,
  show_portfolio: true,
  show_book_cta: true,
  default_theme: "system",
};

const Ctx = createContext<SiteSettings>(fallback);

function hexToRgbChannels(hex: string): string | null {
  const raw = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const n = parseInt(raw, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

/** Raise value so brand accents stay luminous on espresso grounds. */
function liftForDark(hex: string): string {
  const raw = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return hex;
  const n = parseInt(raw, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  r = Math.min(255, Math.round(r + (255 - r) * 0.28));
  g = Math.min(255, Math.round(g + (255 - g) * 0.22));
  b = Math.min(255, Math.round(b + (255 - b) * 0.16));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function applyCssVars(s: SiteSettings) {
  const root = document.documentElement;
  const dark = root.classList.contains("dark");

  // Keep the full token set in lockstep so chrome never gets light paper + light ink
  const paper = dark ? "#161310" : s.paper_color || "#F7F4EF";
  const ink = dark ? "#F3EDE4" : s.ink_color || "#2A2420";
  const gold = dark ? liftForDark(s.accent_color || "#C9A88A") : s.accent_color || "#C9A88A";
  const surface = dark ? "#221E19" : "#EFE8DE";
  const elevated = dark ? "#2A251F" : "#FFFCF8";
  const line = dark ? "#3A342C" : "#E2D9CE";
  const muted = dark ? "#A3988C" : "#8A7F74";

  root.style.setProperty("--bl-accent", gold);
  root.style.setProperty("--bl-paper", paper);
  root.style.setProperty("--bl-ink", ink);

  const pairs: [string, string][] = [
    ["--color-paper", paper],
    ["--color-ink", ink],
    ["--color-gold", gold],
    ["--color-surface", surface],
    ["--color-elevated", elevated],
    ["--color-line", line],
    ["--color-muted", muted],
    ["--color-on-media", "#F3EDE4"],
  ];
  for (const [key, hex] of pairs) {
    const ch = hexToRgbChannels(hex);
    if (ch) root.style.setProperty(key, ch);
  }
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<SiteSettings>("/v1/settings");
        if (!cancelled && data) {
          setSettings({ ...fallback, ...data });
        }
      } catch {
        /* keep fallback */
      }
    })();
    function onCustom(e: Event) {
      const detail = (e as CustomEvent<SiteSettings>).detail;
      if (!detail) return;
      setSettings({ ...fallback, ...detail });
    }
    window.addEventListener("bl-settings", onCustom);
    return () => {
      cancelled = true;
      window.removeEventListener("bl-settings", onCustom);
    };
  }, []);

  useEffect(() => {
    applyCssVars(settings);
    function sync() {
      applyCssVars(settings);
    }
    window.addEventListener("bl-theme", sync);
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      window.removeEventListener("bl-theme", sync);
      mo.disconnect();
    };
  }, [settings]);

  return <Ctx.Provider value={settings}>{children}</Ctx.Provider>;
}

export function useSiteSettings() {
  return useContext(Ctx);
}
