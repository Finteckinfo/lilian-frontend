"use client";

import { usePathname } from "next/navigation";
import { PUBLIC_TOUR, Walkthrough, restartWalkthrough } from "@/components/Walkthrough";

export function PublicTour() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <Walkthrough
        storageKey={PUBLIC_TOUR}
        steps={[
          {
            id: "catalog",
            title: "Her kit",
            body: "The catalog lists every product Lillian uses. You can browse by category, see shade and stock, and add what you want.",
            action: "Look for Catalog on the home page.",
            selector: "[data-tour=catalog-link]",
            path: "/",
          },
          {
            id: "add",
            title: "Add a product",
            body: "Click \"Add to request\" on any product. The request panel on the right keeps count. Use the stepper to adjust quantity.",
            action: "Try adding a product.",
            selector: "[data-tour=catalog-add]",
            path: "/catalog",
          },
          {
            id: "send",
            title: "Send the list",
            body: "Enter your name and WhatsApp number, then send. Lillian receives the list in chat and handles billing and delivery herself — no payment happens in the app.",
            action: "When ready, click Send list on WhatsApp.",
            selector: "[data-tour=catalog-request]",
            path: "/catalog",
          },
        ]}
      />
      {pathname === "/" && (
        <button
          type="button"
          onClick={() => restartWalkthrough(PUBLIC_TOUR)}
          className="fixed bottom-24 left-4 z-40 text-[10px] uppercase tracking-[1.5px] border border-line bg-paper/90 px-3 py-2 text-muted hover:text-ink transition-colors"
        >
          Guide
        </button>
      )}
    </>
  );
}
