import { apiGet } from "./api";
import { SEED_PORTFOLIO, SEED_POSTS } from "./seed";
import type { ContentPost, PortfolioItem, PostCategory } from "./types";

function mapApiPost(row: Record<string, unknown>): ContentPost {
  const category = String(row.category) as PostCategory;
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    category,
    published_at: String(row.published_at).slice(0, 10),
    body_markdown: String(row.body_markdown ?? ""),
    excerpt: String(row.excerpt ?? ""),
    quote: (row.quote as string) || null,
    media_urls: Array.isArray(row.media_urls) ? (row.media_urls as string[]) : [],
    is_featured: Boolean(row.is_featured),
  };
}

function mapApiItem(row: Record<string, unknown>): PortfolioItem {
  const category = row.category as PortfolioItem["category"];
  const public_label =
    category === "MUA_Clients"
      ? "Bridal"
      : category === "Events"
        ? "Events"
        : "Editorial";
  return {
    id: String(row.id),
    title: String(row.title),
    category,
    media_type: row.media_type as PortfolioItem["media_type"],
    media_url: String(row.media_url),
    video_url: (row.video_url as string) || null,
    instagram_url: (row.instagram_url as string) || null,
    testimonial_text: (row.testimonial_text as string) || null,
    display_order: Number(row.display_order ?? 0),
    public_label,
  };
}

export async function getPosts(): Promise<ContentPost[]> {
  try {
    const data = await apiGet<Record<string, unknown>[]>("/v1/posts");
    if (Array.isArray(data) && data.length) return data.map(mapApiPost);
  } catch {
    /* fall through to seed */
  }
  return [...SEED_POSTS].sort((a, b) =>
    b.published_at.localeCompare(a.published_at)
  );
}

export async function getFeaturedPosts(limit = 3): Promise<ContentPost[]> {
  const posts = await getPosts();
  const featured = posts.filter((p) => p.is_featured);
  return (featured.length ? featured : posts).slice(0, limit);
}

export async function getPostBySlug(
  slug: string
): Promise<ContentPost | null> {
  try {
    const data = await apiGet<Record<string, unknown>>(`/v1/posts/${slug}`);
    if (data?.slug) return mapApiPost(data);
  } catch {
    /* fall through */
  }
  return SEED_POSTS.find((p) => p.slug === slug) ?? null;
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  try {
    const data = await apiGet<Record<string, unknown>[]>("/v1/portfolio");
    if (Array.isArray(data) && data.length) return data.map(mapApiItem);
  } catch {
    /* fall through */
  }
  return [...SEED_PORTFOLIO].sort((a, b) => a.display_order - b.display_order);
}

export async function getGalleryItems(): Promise<PortfolioItem[]> {
  const items = await getPortfolio();
  return items.filter((i) => i.category !== "Testimonials");
}

export async function getTestimonials(): Promise<PortfolioItem[]> {
  const items = await getPortfolio();
  return items.filter((i) => i.category === "Testimonials" && i.testimonial_text);
}

export function categoryLabel(category: PostCategory) {
  if (category === "Self_Promotion") return "Self-Promotion";
  if (category === "Journey_POV") return "Journey POV";
  return category;
}

export function formatPostDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}.${m}.${d}`;
}

export function postParagraphs(post: ContentPost) {
  return post.body_markdown
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith(">"));
}
