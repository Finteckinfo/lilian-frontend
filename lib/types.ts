export const SITE_NAME = "Being Lillian";
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
  "https://www.instagram.com/lilianbeauty_studio";
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254794230220";

export type ServiceType = "MUA" | "Brand_Collab" | "Event" | "General";
export type PostCategory =
  | "Motivation"
  | "Self_Promotion"
  | "Reviews"
  | "Journey_POV";
export type PortfolioCategory =
  | "MUA_Clients"
  | "Photoshoots"
  | "Events"
  | "Testimonials";
export type MediaType = "Image" | "Video";
export type LeadStatus =
  | "New"
  | "Contacted"
  | "Quoted"
  | "Booked"
  | "Completed"
  | "Legacy";

export type ContentPost = {
  id: string;
  slug: string;
  title: string;
  category: PostCategory;
  published_at: string;
  body_markdown: string;
  excerpt: string;
  quote: string | null;
  media_urls: string[];
  is_featured: boolean;
};

export type PortfolioItem = {
  id: string;
  title: string;
  category: PortfolioCategory;
  media_type: MediaType;
  media_url: string;
  video_url: string | null;
  instagram_url: string | null;
  testimonial_text: string | null;
  display_order: number;
  public_label: "Bridal" | "Editorial" | "Events";
};

export const POST_FILTERS: { id: "all" | PostCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Motivation", label: "Motivation" },
  { id: "Self_Promotion", label: "Self-Promotion" },
  { id: "Reviews", label: "Reviews" },
  { id: "Journey_POV", label: "Journey POV" },
];

export const GALLERY_FILTERS: {
  id: "all" | "Bridal" | "Editorial" | "Events";
  label: string;
}[] = [
  { id: "all", label: "All Work" },
  { id: "Bridal", label: "Bridal" },
  { id: "Editorial", label: "Editorial" },
  { id: "Events", label: "Events" },
];

export const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "MUA", label: "Makeup artistry" },
  { value: "Brand_Collab", label: "Brand collaboration" },
  { value: "Event", label: "Event appearance" },
  { value: "General", label: "General inquiry" },
];
