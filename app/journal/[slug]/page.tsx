import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import {
  categoryLabel,
  formatPostDate,
  getPostBySlug,
  getPosts,
  postParagraphs,
} from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post?.title ?? "Journal" };
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const paras = postParagraphs(post);

  return (
    <>
      <SiteHeader />
      <article className="max-w-[720px] mx-auto px-5 md:px-8 pt-28 md:pt-36 pb-24">
        <p className="text-[11px] uppercase tracking-[2px] text-muted mb-4">
          {categoryLabel(post.category)} · {formatPostDate(post.published_at)}
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-normal leading-tight mb-10">
          {post.title}
        </h1>
        {post.quote && (
          <blockquote className="border-l-2 border-gold pl-5 mb-10">
            <p className="font-display text-xl md:text-2xl italic leading-snug">
              {post.quote}
            </p>
          </blockquote>
        )}
        <div className="space-y-6 font-light text-base md:text-lg leading-relaxed">
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-line flex justify-between text-[12px] uppercase tracking-[1.5px]">
          <Link href="/journal">All entries</Link>
          <a href={whatsappUrl("General")}>Book</a>
        </div>
      </article>
    </>
  );
}
