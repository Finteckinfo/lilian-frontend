"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { apiUrl } from "@/lib/api";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  shade: string;
  barcode: string;
  quantity: number;
  notes: string;
  image_url: string;
};

type Line = { product: Product; quantity: number };

const FALLBACK: Product[] = [
  {
    id: "kit-foundation",
    name: "Soft Matte Foundation",
    brand: "Studio kit",
    category: "Face",
    shade: "Neutral medium",
    barcode: "",
    quantity: 4,
    notes: "The base Lillian uses when the day is long and the light is honest.",
    image_url: "/media/catalog/foundation.jpg",
  },
];

export function CatalogShop() {
  const settings = useSiteSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/v1/catalog"));
        if (!res.ok) throw new Error("catalog");
        const data = (await res.json()) as Product[];
        if (!cancelled) setProducts(data.length ? data : FALLBACK);
      } catch {
        if (!cancelled) setProducts(FALLBACK);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category || "Kit"))),
    [products]
  );

  const total = lines.reduce((n, l) => n + l.quantity, 0);

  function add(product: Product) {
    setSent(false);
    setLines((prev) => {
      const found = prev.find((l) => l.product.id === product.id);
      if (found) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function setQty(id: string, quantity: number) {
    setLines((prev) =>
      quantity < 1
        ? prev.filter((l) => l.product.id !== id)
        : prev.map((l) => (l.product.id === id ? { ...l, quantity } : l))
    );
  }

  async function sendRequest() {
    setError("");
    if (!lines.length) {
      setError("Add at least one product.");
      return;
    }
    if (!name.trim() || phone.replace(/\D/g, "").length < 7) {
      setError("Your name and WhatsApp number are required so Lillian can reply.");
      return;
    }
    setSending(true);
    const items = lines.map((l) => ({
      product_id: l.product.id,
      name: l.product.name,
      shade: l.product.shade,
      quantity: l.quantity,
    }));
    try {
      await fetch(apiUrl("/v1/catalog/requests"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          phone_number: phone.trim(),
          note: note.trim(),
          items,
        }),
      });
    } catch {
      /* WhatsApp still carries the list */
    }
    const list = lines
      .map(
        (l) =>
          `• ${l.product.name}${l.product.shade ? ` (${l.product.shade})` : ""} × ${l.quantity}`
      )
      .join("\n");
    const text = [
      "Hi Lillian, I'd like to buy these from your kit:",
      "",
      list,
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      note.trim() && `Note: ${note.trim()}`,
      "",
      "Please send billing and delivery details.",
    ]
      .filter(Boolean)
      .join("\n");
    const digits =
      (settings.whatsapp_number || "254794230220").replace(/\D/g, "") || "254794230220";
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank");
    setSending(false);
    setSent(true);
    setLines([]);
    setNote("");
  }

  return (
    <>
      <SiteHeader />
      <main className="pt-24 md:pt-32 px-4 md:px-10 lg:px-24 pb-16">
        <div className="max-w-[1200px] mx-auto">
          {/* ── Hero ── */}
          <div className="mb-16 max-w-xl">
            <p className="text-[11px] uppercase tracking-[2px] text-gold mb-4">Studio kit</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-[56px] leading-[1.1] mb-5">
              Makeup catalog
            </h1>
            <p className="font-light text-[16px] leading-relaxed text-muted">
              Products Lillian actually uses. Build a request list, then send it
              on WhatsApp — she handles billing and delivery from there.
            </p>
          </div>

          {/* ── Two-column layout ── */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* ── Kit column ── */}
            <div className="flex-1 min-w-0">
              {categories.map((category) => (
                <section key={category} className="mb-14">
                  <h2 className="text-[11px] uppercase tracking-[1.5px] text-muted mb-5 border-b border-line pb-3">
                    {category}
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-5">
                    {products
                      .filter((p) => (p.category || "Kit") === category)
                      .map((product, index) => {
                        const inCart = lines.find((l) => l.product.id === product.id);
                        return (
                          <li
                            key={product.id}
                            className="group border border-line hover:border-gold/40 bg-elevated/50 flex flex-col transition-all duration-300 overflow-hidden"
                          >
                            {product.image_url && (
                              <div className="w-full aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover filter grayscale-[0.85] sepia-[0.12] contrast-[0.96] group-hover:grayscale-0 group-hover:sepia-[0.04] group-hover:contrast-100 group-hover:scale-[1.03] transition-all duration-500"
                                />
                              </div>
                            )}
                            <div className="p-6 flex flex-col flex-1">
                            <p className="text-[10px] uppercase tracking-[2px] text-gold/80">
                              {product.brand || "Studio"}
                            </p>
                            <h3 className="font-display text-[22px] mt-1 leading-snug">
                              {product.name}
                            </h3>
                            {product.shade && (
                              <p className="text-[13px] text-muted mt-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-gold/50 mr-1.5 align-middle" />
                                {product.shade}
                              </p>
                            )}
                            <p className="text-[13px] font-light text-muted mt-3 leading-relaxed flex-1">
                              {product.notes}
                            </p>
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-line/60">
                              <p className="text-[11px] uppercase tracking-[1px] text-muted">
                                {product.quantity > 0
                                  ? `${product.quantity} in kit`
                                  : "Ask to source"}
                              </p>
                              <button
                                type="button"
                                aria-label={`Add ${product.name} to request`}
                                data-tour={
                                  index === 0 && category === categories[0]
                                    ? "catalog-add"
                                    : undefined
                                }
                                onClick={() => add(product)}
                                className={`text-[11px] uppercase tracking-[1.5px] pb-0.5 transition-colors ${
                                  inCart
                                    ? "text-gold border-b border-gold"
                                    : "border-b border-ink hover:text-gold hover:border-gold"
                                }`}
                              >
                                {inCart ? `Added (${inCart.quantity})` : "Add to request"}
                              </button>
                            </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </section>
              ))}
            </div>

            {/* ── Request panel ── */}
            <aside className="w-full lg:w-[360px] lg:sticky lg:top-28 shrink-0">
              <div className="border border-line bg-elevated/40 p-6 lg:p-8">
                <p className="text-[11px] uppercase tracking-[2px] text-gold mb-1">
                  Your request
                </p>
                <h2 className="font-display text-2xl mb-5">
                  {total > 0 ? `${total} item${total === 1 ? "" : "s"}` : "Empty"}
                </h2>

                {lines.length === 0 && !sent && (
                  <p className="text-[13px] font-light text-muted leading-relaxed mb-6">
                    Browse the kit and add what you want. Billing and delivery
                    happen in the WhatsApp conversation with Lillian.
                  </p>
                )}

                {sent && lines.length === 0 && (
                  <p className="text-[13px] text-gold leading-relaxed mb-6">
                    Request sent. Check your WhatsApp for Lillian&apos;s reply.
                  </p>
                )}

                {lines.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {lines.map((l) => (
                      <li
                        key={l.product.id}
                        className="flex items-start justify-between gap-3 border-b border-line/50 pb-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug">{l.product.name}</p>
                          {l.product.shade && (
                            <p className="text-[11px] text-muted">{l.product.shade}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setQty(l.product.id, l.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center border border-line text-sm"
                            aria-label="Decrease"
                          >
                            −
                          </button>
                          <span className="text-sm w-5 text-center">{l.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQty(l.product.id, l.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center border border-line text-sm"
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                      Your name
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                      WhatsApp number
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                      Note (optional)
                    </span>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Anything Lillian should know"
                      rows={2}
                      className="mt-1.5 w-full bg-transparent border border-line focus:border-gold p-2.5 outline-none text-sm resize-none transition-colors"
                    />
                  </label>
                </div>

                {error && <p className="text-[13px] text-accent mt-3">{error}</p>}

                <button
                  type="button"
                  data-tour="catalog-request"
                  className="btn-primary w-full mt-6"
                  disabled={sending}
                  onClick={sendRequest}
                >
                  {sending ? "Opening…" : "Send list on WhatsApp"}
                </button>

                <p className="text-[11px] text-muted text-center mt-4 leading-relaxed">
                  No payment here — Lillian will confirm pricing and delivery in chat.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
