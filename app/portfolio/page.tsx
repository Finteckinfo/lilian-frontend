import type { Metadata } from "next";
import { GalleryGrid } from "@/components/GalleryGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { getPortfolio } from "@/lib/content";

export const metadata: Metadata = { title: "Portfolio" };
export const revalidate = 60;

export default async function PortfolioPage() {
  const portfolio = await getPortfolio();
  const items = portfolio.filter((i) => i.category !== "Testimonials");
  const quotes = portfolio.filter(
    (i) => i.category === "Testimonials" && i.testimonial_text
  );

  return (
    <>
      <SiteHeader />
      <main className="pt-24 md:pt-32 px-4 md:px-10 lg:px-24 pb-24">
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <p className="text-[11px] uppercase tracking-[2px] text-muted mb-3">
            Media gallery
          </p>
          <h1 className="font-display text-3xl lg:text-5xl text-ink">Portfolio</h1>
        </div>
        <GalleryGrid items={items} />

        {quotes.length > 0 && (
          <section className="mt-20 md:mt-28 max-w-[900px] mx-auto">
            <p className="text-[11px] uppercase tracking-[2px] text-muted mb-3 text-center">
              Social proof
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-center mb-10">
              From the chair
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {quotes.map((q) => (
                <blockquote key={q.id} className="border-t border-line pt-6">
                  <p className="font-display text-xl italic leading-snug mb-4">
                    “{q.testimonial_text}”
                  </p>
                  <p className="text-[11px] uppercase tracking-[1.5px] text-muted">
                    Instagram
                  </p>
                </blockquote>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
