import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { WhatsappFab } from "@/components/WhatsappFab";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Being Lillian — Makeup Artistry & Consulting",
    template: "%s — Being Lillian",
  },
  description:
    "Makeup artistry, brand consulting, and collaborations. Being Lillian.",
  applicationName: "Being Lillian",
  appleWebApp: { capable: true, title: "Being Lillian", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4EF" },
    { media: "(prefers-color-scheme: dark)", color: "#161310" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- CSS link avoids next/font network at build */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&family=Playfair+Display:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col bg-paper text-ink">
        <SiteSettingsProvider>
          {children}
          <SiteFooter />
          <WhatsappFab />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
