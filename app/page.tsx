import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getFeaturedPosts, categoryLabel, formatPostDate } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const featured = await getFeaturedPosts(3);

  return (
    <>
      <SiteHeader transparentOnTop />
      <main>
        <header className="relative w-full h-[62vh] min-h-[380px] max-h-[560px] md:h-[819px] md:max-h-none overflow-hidden mt-16 md:mt-[96px]">
          <div className="absolute inset-0 sepia-overlay">
            <Image
              src="/media/bridal-closeup.jpg"
              alt="Bridal makeup close-up by Being Lillian"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="font-display text-4xl md:text-6xl text-on-media font-normal text-center drop-shadow-md tracking-wide px-4">
              Being Lillian
            </h1>
          </div>
        </header>

        <section className="py-16 md:py-[120px] px-5 md:px-16 flex flex-col items-center bg-paper">
          <p className="font-display text-[26px] md:text-[48px] text-ink leading-snug font-normal mb-8 md:mb-12 max-w-[800px] text-center">
            Professional makeup artistry, brand consulting, and creative
            direction — crafted to reveal your most confident self.
          </p>
          <a className="btn-primary w-full md:w-auto" href={whatsappUrl("MUA")}>
            Book via WhatsApp
          </a>
        </section>

        <section id="services" className="py-16 md:py-[120px] px-5 md:px-16 bg-surface">
          <div className="max-w-[1200px] mx-auto space-y-16 md:space-y-32">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
              <div className="w-full md:w-1/2 aspect-[3/4] overflow-hidden relative">
                <Image
                  src="/media/bridal-closeup.jpg"
                  alt="Makeup artistry"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="w-full md:w-1/2 md:pl-12">
                <h2 className="font-display text-3xl md:text-4xl mb-6">Makeup Artistry</h2>
                <p className="font-light text-[16px] leading-relaxed mb-8 max-w-md">
                  From bridal glam to editorial shoots, every look is tailored to
                  enhance your natural features. Using premium products and refined
                  techniques, Lillian creates transformations that feel authentically you.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link
                    className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1 hover:text-muted hover:border-muted"
                    href="/book?service=mua"
                  >
                    Book MUA
                  </Link>
                  <a
                    className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1 hover:text-muted hover:border-muted"
                    href={whatsappUrl("MUA")}
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-center">
              <div className="w-full md:w-1/2 aspect-[3/4] overflow-hidden relative">
                <Image
                  src="/media/craft-video-still.jpg"
                  alt="Lillian at work"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="w-full md:w-1/2 md:pr-12 md:text-right flex flex-col items-start md:items-end">
                <h2 className="font-display text-3xl md:text-4xl mb-6">Brand Consulting</h2>
                <p className="font-light text-[16px] leading-relaxed mb-8 max-w-md">
                  Lillian partners with brands, creators, and event organizers to
                  deliver bespoke beauty direction. From campaign strategy to on-set
                  artistry, every collaboration is handled with precision.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link
                    className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1 hover:text-muted hover:border-muted"
                    href="/book?service=event"
                  >
                    Inquire
                  </Link>
                  <Link
                    className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1 hover:text-muted hover:border-muted"
                    href="/portfolio"
                  >
                    View Portfolio
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
              <div className="w-full md:w-1/2 aspect-[3/4] overflow-hidden relative">
                <Image
                  src="/media/editorial-hat.jpg"
                  alt="Collaboration look"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="w-full md:w-1/2 md:pl-12">
                <h2 className="font-display text-3xl md:text-4xl mb-6">Collaborations</h2>
                <p className="font-light text-[16px] leading-relaxed mb-8 max-w-md">
                  Campaigns, original brands, and beauty partners who want work that
                  still looks like skin — and still looks like you.
                </p>
                <Link
                  className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1 hover:text-muted hover:border-muted"
                  href="/book?service=collab"
                >
                  Start a collaboration
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-5 md:px-16 bg-paper" id="craft">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/media/craft-video-still.jpg"
                alt="Lillian applying makeup, 2 February 2020"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <span className="absolute inset-0 flex items-center justify-center text-paper text-sm uppercase tracking-[2px] bg-ink/20">
                In the chair
              </span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[2px] text-muted mb-3">Craft</p>
              <h2 className="font-display text-3xl md:text-5xl mb-4">Watch the work</h2>
              <p className="font-light leading-relaxed mb-6 max-w-md">
                A still from Lillian in session — the craft video lives in the
                portfolio. Originals will replace this Instagram placeholder.
              </p>
              <Link
                href="/portfolio#craft"
                className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1"
              >
                Open gallery
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-[120px] px-5 md:px-16 bg-paper" id="journal">
          <div className="max-w-[900px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-16">
              <div>
                <p className="text-[11px] uppercase tracking-[2px] text-muted mb-2">
                  The journal
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-normal">
                  From the content engine
                </h2>
              </div>
              <Link
                className="text-[12px] uppercase tracking-[1.5px] border-b border-ink pb-1 self-start"
                href="/journal"
              >
                All entries
              </Link>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {featured.map((post) => (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className="block py-8 md:py-10 group"
                >
                  <p className="text-[11px] uppercase tracking-[2px] text-muted mb-2">
                    {categoryLabel(post.category)} · {formatPostDate(post.published_at)}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-normal mb-3 group-hover:text-muted transition-colors">
                    {post.title}
                  </h3>
                  <p className="font-light leading-relaxed max-w-2xl">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
