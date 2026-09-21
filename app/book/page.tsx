import type { Metadata } from "next";
import { BookForm } from "@/components/BookForm";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Book" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="max-w-[640px] mx-auto px-5 md:px-8 pt-28 md:pt-36 pb-24">
        <p className="text-[11px] uppercase tracking-[2px] text-muted mb-3">
          Inquiries
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-normal mb-4">
          Book
        </h1>
        <p className="font-light text-muted leading-relaxed mb-10">
          Tell Lillian what you need. The note is saved, then WhatsApp opens with
          the same details so you can finish the conversation there.
        </p>
        <BookForm service={service} />
      </main>
    </>
  );
}
