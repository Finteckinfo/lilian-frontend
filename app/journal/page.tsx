import type { Metadata } from "next";
import { JournalList } from "@/components/JournalList";
import { SiteHeader } from "@/components/SiteHeader";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const posts = await getPosts();

  return (
    <>
      <SiteHeader />
      <main className="pt-28 md:pt-36 pb-24 px-4 md:px-12 lg:px-20 max-w-[1440px] mx-auto w-full">
        <JournalList posts={posts} />
      </main>
    </>
  );
}
