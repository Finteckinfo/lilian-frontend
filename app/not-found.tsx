import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-4xl mb-4">Page not found</h1>
        <Link href="/" className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1">
          Back home
        </Link>
      </main>
    </>
  );
}
