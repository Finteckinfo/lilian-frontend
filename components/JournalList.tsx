"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categoryLabel, formatPostDate } from "@/lib/content";
import { POST_FILTERS, type ContentPost, type PostCategory } from "@/lib/types";

const CARD_IMAGES = [
  "/media/bridal-closeup.jpg",
  "/media/editorial-hat.jpg",
  "/media/craft-video-still.jpg",
  "/media/editorial-fullbody.jpg",
  "/media/bridal-closeup.jpg",
  "/media/editorial-hat.jpg",
];

export function JournalList({ posts }: { posts: ContentPost[] }) {
  const [filter, setFilter] = useState<"all" | PostCategory>("all");
  const visible = useMemo(
    () => posts.filter((p) => filter === "all" || p.category === filter),
    [posts, filter]
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-16 w-full">
      <aside className="w-full md:w-[220px] shrink-0">
        <h3 className="font-journalDisplay text-xl font-semibold mb-6 hidden md:block">
          Archives
        </h3>
        <nav className="hidden md:flex flex-col gap-3">
          {POST_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`text-left pl-4 py-1 text-sm tracking-widest uppercase font-medium ${
                filter === f.id
                  ? "journal-nav-item active text-accent"
                  : "text-muted hover:text-ink dark:hover:text-paper"
              }`}
              onClick={() => setFilter(f.id)}
            >
              {f.id === "Self_Promotion" ? "Self-Promo" : f.id === "Journey_POV" ? "Journey" : f.label}
            </button>
          ))}
        </nav>
        <nav className="md:hidden flex overflow-x-auto gap-3 pb-4 -mx-1 px-1">
          {POST_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`flex-shrink-0 px-4 py-2 border text-xs tracking-widest uppercase ${
                filter === f.id
                  ? "border-accent bg-accent text-white"
                  : "border-ink dark:border-paper/40 text-ink dark:text-paper"
              }`}
              onClick={() => setFilter(f.id)}
            >
              {f.id === "Self_Promotion" ? "Self-Promo" : f.id === "Journey_POV" ? "Journey" : f.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="mb-8 md:mb-12">
          <h1 className="font-journalDisplay text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            The Journal
          </h1>
          <p className="text-muted max-w-xl text-base md:text-lg font-journalBody">
            Behind-the-scenes stories, beauty reviews, motivational pieces, and
            updates from the Being Lillian journey.
          </p>
        </header>

        {visible.length === 0 ? (
          <p className="py-16 text-muted font-light">No entries in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            {visible.map((post, index) => {
              const span =
                index % 5 === 0
                  ? "lg:col-span-7"
                  : index % 5 === 1
                    ? "lg:col-span-5 lg:mt-16"
                    : index % 5 === 2
                      ? "lg:col-span-12"
                      : "lg:col-span-6";
              const img = CARD_IMAGES[index % CARD_IMAGES.length];
              return (
                <Link
                  key={post.slug}
                  href={`/journal/${post.slug}`}
                  className={`glass-card rounded-sm p-5 md:p-8 ${span} flex flex-col group`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs uppercase tracking-widest font-semibold text-accent">
                      {categoryLabel(post.category)}
                    </span>
                    <span className="w-8 h-px bg-muted/50" />
                    <span className="text-xs text-muted font-medium">
                      {formatPostDate(post.published_at)}
                    </span>
                  </div>
                  <h2 className="font-journalDisplay text-xl md:text-2xl lg:text-3xl font-bold mb-3 leading-snug group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm md:text-base text-ink/80 dark:text-paper/80 mb-6 line-clamp-3 font-journalBody">
                    {post.excerpt}
                  </p>
                  {(index % 5 === 0 || index % 5 === 1 || index % 5 === 2) && (
                    <div className="overflow-hidden mb-6 h-[180px] md:h-[240px] w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <span className="mt-auto text-xs uppercase tracking-widest font-medium">
                    Read more →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
