import { SiteHeader } from "@/components/SiteHeader";

export default function CatalogLoading() {
  return (
    <>
      <SiteHeader />
      <main className="pt-24 md:pt-32 px-4 md:px-10 lg:px-24 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16 max-w-xl">
            <div className="h-3 w-16 bg-line/50 rounded mb-4 animate-pulse" />
            <div className="h-10 w-64 bg-line/50 rounded mb-5 animate-pulse" />
            <div className="h-4 w-80 bg-line/30 rounded animate-pulse" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border border-line bg-elevated/50 overflow-hidden animate-pulse"
              >
                <div className="w-full aspect-[4/3] bg-line/30" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-20 bg-line/50 rounded" />
                  <div className="h-5 w-36 bg-line/50 rounded" />
                  <div className="h-3 w-full bg-line/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
