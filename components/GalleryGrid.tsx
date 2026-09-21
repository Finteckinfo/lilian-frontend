"use client";

import { useEffect, useState } from "react";
import type { PortfolioItem } from "@/lib/types";
import { GALLERY_FILTERS } from "@/lib/types";

export function GalleryGrid({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState<(typeof GALLERY_FILTERS)[number]["id"]>("all");
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const [videoOk, setVideoOk] = useState(false);

  const visible = items.filter(
    (item) => filter === "all" || item.public_label === filter
  );

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    if (active.media_type === "Video" && active.video_url) {
      fetch(active.video_url, { method: "HEAD" })
        .then((r) => setVideoOk(r.ok))
        .catch(() => setVideoOk(false));
    } else {
      setVideoOk(false);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10 md:mb-16">
        {GALLERY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`text-[11px] md:text-xs uppercase tracking-[1.5px] pb-1 ${
              filter === f.id
                ? "text-ink border-b border-ink"
                : "text-muted hover:text-ink"
            }`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-muted font-light py-20">
          Curation in progress.
        </p>
      ) : (
        <div className="masonry">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              id={item.id === "craft-video" ? "craft" : undefined}
              className="masonry-item portfolio-card relative w-full text-left overflow-hidden bg-surface group"
              onClick={() => setActive(item)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.media_url}
                alt={item.title}
                className="w-full h-auto object-cover block"
              />
              <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <span className="text-paper font-display text-xl">
                  {item.title}
                </span>
              </span>
              {item.media_type === "Video" && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-14 h-14 rounded-full border border-paper/80 text-paper flex items-center justify-center bg-ink/40">
                    ▶
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-[70] bg-ink/80 flex items-center justify-center p-4 md:p-12"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal
          aria-label={active.title}
        >
          <button
            type="button"
            className="absolute top-5 right-5 w-12 h-12 bg-ink text-paper"
            aria-label="Close"
            onClick={() => setActive(null)}
          >
            ×
          </button>
          <div
            className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {active.media_type === "Video" && videoOk && active.video_url ? (
              <video
                className="max-h-[75vh] w-auto max-w-full"
                src={active.video_url}
                poster={active.media_url}
                controls
                playsInline
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.media_url}
                alt={active.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            )}
            <div className="mt-4 text-center text-paper">
              <p className="font-display text-2xl">{active.title}</p>
              {active.media_type === "Video" && !videoOk && active.instagram_url && (
                <a
                  href={active.instagram_url}
                  className="mt-2 inline-block text-[11px] uppercase tracking-[1.5px] border-b border-gold pb-0.5"
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch the craft reel on Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
