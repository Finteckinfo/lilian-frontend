"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { whatsappUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  const pathname = usePathname();
  const settings = useSiteSettings();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-ink text-paper dark:bg-elevated dark:text-ink pt-16 md:pt-[96px] pb-24 md:pb-8 px-5 md:px-16 border-t border-transparent dark:border-line">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-20">
        <div className="md:col-span-2">
          <Image
            src="/logo-wordmark.png"
            alt={settings.site_name}
            width={280}
            height={120}
            className="h-16 md:h-20 w-auto mb-6 object-contain dark:opacity-95"
          />
          <p className="font-light text-sm text-paper/75 dark:text-muted max-w-xs leading-relaxed">
            {settings.tagline}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[12px] uppercase tracking-[1.5px] text-gold mb-1">
            Explore
          </p>
          <Link className="text-sm font-light hover:text-gold transition-colors" href="/#services">
            Services
          </Link>
          {settings.show_portfolio && (
            <Link className="text-sm font-light hover:text-gold transition-colors" href="/portfolio">
              Portfolio
            </Link>
          )}
          {settings.show_journal && (
            <Link className="text-sm font-light hover:text-gold transition-colors" href="/journal">
              Journal
            </Link>
          )}
          {settings.show_book_cta && (
            <Link className="text-sm font-light hover:text-gold transition-colors" href="/book">
              Book
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[12px] uppercase tracking-[1.5px] text-gold mb-1">
            Connect
          </p>
          <a
            className="text-sm font-light hover:text-gold transition-colors"
            href={settings.instagram_url}
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
          <a
            className="text-sm font-light hover:text-gold transition-colors"
            href={whatsappUrl("Brand_Collab", undefined, settings.whatsapp_number)}
          >
            Collaborations
          </a>
          <a
            className="text-sm font-light hover:text-gold transition-colors"
            href={whatsappUrl("General", undefined, settings.whatsapp_number)}
          >
            WhatsApp
          </a>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto border-t border-paper/15 dark:border-line pt-8 flex flex-col md:flex-row justify-between gap-4">
        <p className="text-[12px] text-paper/60 dark:text-muted font-light">
          © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
        </p>
        <p className="text-[12px] text-gold/80 font-light tracking-wide uppercase">
          Soft Luxe
        </p>
      </div>
    </footer>
  );
}
