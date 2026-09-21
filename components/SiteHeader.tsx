"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { whatsappUrl } from "@/lib/whatsapp";

function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
    window.dispatchEvent(new Event("bl-theme"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`nav-link ${className}`}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}

export function SiteHeader({ transparentOnTop = false }: { transparentOnTop?: boolean }) {
  const settings = useSiteSettings();
  const [scrolled, setScrolled] = useState(!transparentOnTop);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!transparentOnTop) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOnTop]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;
  // Explicit pairs — never depend on swapped paper/ink alone (avoids cream bar + ivory type)
  const linkClass = solid
    ? "nav-link text-[#2A2420] dark:text-[#F3EDE4]"
    : "nav-link text-[#F3EDE4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]";

  return (
    <>
      <header
        className={`site-header fixed top-0 z-50 w-full h-16 md:h-[96px] flex items-center justify-between px-4 md:px-16 transition-all duration-300 ${
          solid
            ? "bg-[#F7F4EF]/95 dark:bg-[#161310]/95 border-b border-[#E2D9CE] dark:border-[#3A342C] backdrop-blur-md shadow-soft"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="hidden md:flex items-center gap-6">
          <Link className={linkClass} href="/">
            Home
          </Link>
          {settings.show_journal && (
            <Link className={linkClass} href="/journal">
              Journal
            </Link>
          )}
        </nav>
        <Link
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src="/logo-mark.png"
            alt={settings.site_name}
            width={96}
            height={96}
            className={`h-10 md:h-14 w-auto object-contain transition-[filter] duration-300 ${
              solid
                ? "dark:brightness-0 dark:invert"
                : "brightness-0 invert"
            }`}
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {settings.show_portfolio && (
            <Link className={linkClass} href="/portfolio">
              Portfolio
            </Link>
          )}
          {settings.show_book_cta && (
            <Link className={linkClass} href="/book">
              Book
            </Link>
          )}
          <ThemeToggle className={solid ? "text-[#2A2420] dark:text-[#F3EDE4]" : "text-[#F3EDE4] drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"} />
        </nav>
        <div className="md:hidden ml-auto flex items-center gap-4">
          <ThemeToggle className={solid ? "text-[#2A2420] dark:text-[#F3EDE4]" : "text-[#F3EDE4]"} />
          <button
            type="button"
            className={`text-2xl leading-none ${
              solid ? "text-[#2A2420] dark:text-[#F3EDE4]" : "text-[#F3EDE4]"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 bg-[#F7F4EF]/98 dark:bg-[#161310]/98 flex flex-col items-center justify-center gap-8 pt-16 md:hidden">
          <Link className="nav-link text-[#2A2420] dark:text-[#F3EDE4] text-lg" href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          {settings.show_journal && (
            <Link className="nav-link text-[#2A2420] dark:text-[#F3EDE4] text-lg" href="/journal" onClick={() => setOpen(false)}>
              Journal
            </Link>
          )}
          {settings.show_portfolio && (
            <Link className="nav-link text-[#2A2420] dark:text-[#F3EDE4] text-lg" href="/portfolio" onClick={() => setOpen(false)}>
              Portfolio
            </Link>
          )}
          {settings.show_book_cta && (
            <Link className="nav-link text-[#2A2420] dark:text-[#F3EDE4] text-lg" href="/book" onClick={() => setOpen(false)}>
              Book
            </Link>
          )}
          <a
            className="nav-link text-[#2A2420] dark:text-[#F3EDE4] text-lg"
            href={whatsappUrl("General", undefined, settings.whatsapp_number)}
          >
            Contact
          </a>
        </div>
      )}
    </>
  );
}
