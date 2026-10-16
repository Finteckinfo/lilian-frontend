import type { Metadata } from "next";
import { CatalogShop } from "@/components/CatalogShop";

export const metadata: Metadata = {
  title: "Makeup Catalog",
  description:
    "Browse the products Lillian uses in her studio kit. Add items to a request list and send it on WhatsApp — she handles billing and delivery from there.",
  openGraph: {
    title: "Makeup Catalog — Being Lillian",
    description:
      "Browse Lillian's studio kit and request products via WhatsApp.",
    type: "website",
  },
};

export default function CatalogPage() {
  return <CatalogShop />;
}
