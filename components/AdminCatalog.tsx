"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";

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

const empty = {
  name: "",
  brand: "",
  category: "Face",
  shade: "",
  barcode: "",
  quantity: 1,
  notes: "",
  image_url: "",
};

const CATEGORIES = ["Face", "Eyes", "Lips", "Cheeks", "Setting", "Tools"];

export function AdminCatalog() {
  const { authHeaders } = useAdminAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(apiUrl("/v1/admin/catalog"), { headers: authHeaders });
    if (!res.ok) {
      setError(`Could not load catalog (${res.status})`);
      return;
    }
    setItems((await res.json()) as Product[]);
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopScan() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  useEffect(() => {
    if (!scanning || !streamRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    const Detector = (window as unknown as {
      BarcodeDetector?: new (opts?: { formats?: string[] }) => {
        detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]>;
      };
    }).BarcodeDetector;
    if (!Detector) return;
    video.srcObject = streamRef.current;
    let alive = true;
    const detector = new Detector({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
    });
    const tick = async () => {
      if (!alive || !videoRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        const value = codes[0]?.rawValue?.replace(/\s/g, "");
        if (value) {
          applyBarcode(value);
          stopScan();
          return;
        }
      } catch {
        /* keep scanning */
      }
      if (alive) requestAnimationFrame(() => void tick());
    };
    void video.play().then(() => void tick());
    return () => {
      alive = false;
    };
  }, [scanning]); // eslint-disable-line react-hooks/exhaustive-deps -- applyBarcode/stopScan are stable function declarations

  async function startScan() {
    setError("");
    const Detector = (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "This browser cannot open the camera scanner. Type the barcode, or use a USB scanner in the barcode field."
      );
      document.querySelector<HTMLInputElement>("[data-tour=catalog-barcode]")?.focus();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
    } catch {
      setError("Camera permission was blocked. Type the barcode instead.");
      stopScan();
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(apiUrl("/v1/admin/catalog/upload"), {
        method: "POST",
        headers: { Authorization: authHeaders.Authorization || "" },
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.detail === "string" ? data.detail : `Upload failed (${res.status})`);
        return;
      }
      const { url } = (await res.json()) as { url: string };
      setForm((prev) => ({ ...prev, image_url: url }));
      setMsg("Image uploaded.");
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setUploading(false);
    }
  }

  function applyBarcode(code: string) {
    const match = items.find((p) => p.barcode && p.barcode === code);
    if (match) {
      setEditing(match.id);
      setForm({
        name: match.name,
        brand: match.brand,
        category: match.category,
        shade: match.shade,
        barcode: match.barcode,
        quantity: match.quantity,
        notes: match.notes,
        image_url: match.image_url || "",
      });
      setMsg(`Found "${match.name}". Update the quantity if the stock changed.`);
      return;
    }
    setEditing(null);
    setForm((prev) => ({ ...prev, barcode: code }));
    setMsg("New barcode. Fill in the product and quantity, then save.");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    const url = editing
      ? apiUrl(`/v1/admin/catalog/${editing}`)
      : apiUrl("/v1/admin/catalog");
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(
        typeof body.detail === "string" ? body.detail : `Save failed (${res.status})`
      );
      return;
    }
    setMsg(editing ? "Product updated." : "Product recorded.");
    setEditing(null);
    setForm(empty);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this product from the catalog?")) return;
    const res = await fetch(apiUrl(`/v1/admin/catalog/${id}`), {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok && res.status !== 204) {
      setError(`Delete failed (${res.status})`);
      return;
    }
    if (editing === id) {
      setEditing(null);
      setForm(empty);
    }
    await load();
  }

  return (
    <div className="space-y-12">
      {/* ── Header ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[2px] text-gold mb-2">Catalog</p>
        <h2 className="font-display text-3xl">Kit stock</h2>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="grid lg:grid-cols-[1fr_1fr] gap-12">
        {/* ── Product list ── */}
        <div>
          <ul className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="border border-line bg-elevated/30 p-5 flex gap-4 transition-colors hover:border-gold/40"
              >
                {item.image_url && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-14 h-14 object-cover shrink-0 border border-line"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-[11px] text-muted mt-1.5 leading-relaxed">
                    {item.brand || "Studio"} · {item.category}
                    {item.shade ? ` · ${item.shade}` : ""} · qty{" "}
                    <span className="tabular-nums">{item.quantity}</span>
                    {item.barcode ? ` · ${item.barcode}` : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-[1px] border border-line px-3 py-1.5 hover:border-gold transition-colors"
                    onClick={() => {
                      setEditing(item.id);
                      setForm({
                        name: item.name,
                        brand: item.brand,
                        category: item.category,
                        shade: item.shade,
                        barcode: item.barcode,
                        quantity: item.quantity,
                        notes: item.notes,
                        image_url: item.image_url || "",
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-[10px] uppercase tracking-[1px] border border-accent text-accent px-3 py-1.5 hover:bg-accent hover:text-paper transition-colors"
                    onClick={() => remove(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!items.length && (
              <li className="text-sm text-muted">No products recorded yet.</li>
            )}
          </ul>
        </div>

        {/* ── Record form ── */}
        <form
          onSubmit={save}
          className="border border-line bg-elevated/40 p-6 md:p-8 space-y-5"
        >
          <h3 className="font-display text-2xl">
            {editing ? "Update product" : "Record a product"}
          </h3>
          {msg && <p className="text-[13px] text-gold">{msg}</p>}

          {/* Barcode + quantity group */}
          <div className="border border-line/60 bg-surface/20 p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-[2px] text-muted">
              Scan or type
            </p>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                Barcode
              </span>
              <input
                data-tour="catalog-barcode"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && form.barcode.trim()) {
                    e.preventDefault();
                    applyBarcode(form.barcode.trim());
                  }
                }}
                className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
                placeholder="Scan with USB or type"
              />
            </label>
            <button
              type="button"
              className="text-[11px] uppercase tracking-[1.5px] border border-line px-4 py-2 hover:border-gold transition-colors"
              onClick={scanning ? stopScan : startScan}
            >
              {scanning ? "Stop camera" : "Scan with camera"}
            </button>
            {scanning && (
              <video
                ref={videoRef}
                className="w-full max-h-48 bg-ink rounded-sm"
                muted
                playsInline
              />
            )}
            <label className="block">
              <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                Quantity
              </span>
              <input
                type="number"
                min={0}
                required
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) })
                }
                className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
              />
            </label>
          </div>

          {/* Product details */}
          <label className="block">
            <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
              Name
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                Brand
              </span>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                Category
              </span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
              Shade
            </span>
            <input
              value={form.shade}
              onChange={(e) => setForm({ ...form, shade: e.target.value })}
              className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
              Notes
            </span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="mt-1.5 w-full bg-transparent border border-line focus:border-gold p-3 outline-none text-sm resize-none transition-colors"
            />
          </label>
          {/* ── Product image ── */}
          <div className="border border-line/60 bg-surface/20 p-5 space-y-4">
            <p className="text-[10px] uppercase tracking-[2px] text-muted">
              Product image
            </p>
            {form.image_url && (
              <div className="relative w-24 h-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-24 h-24 object-cover border border-line"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: "" })}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-paper text-[10px] flex items-center justify-center"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex gap-3 items-center">
              <button
                type="button"
                className="text-[11px] uppercase tracking-[1.5px] border border-line px-4 py-2 hover:border-gold transition-colors"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              <span className="text-[11px] text-muted">JPEG, PNG, or WebP · max 5 MB</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = "";
              }}
            />
            <label className="block">
              <span className="text-[10px] uppercase tracking-[1.5px] text-muted">
                Or paste image URL
              </span>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://… or /media/catalog/…"
                className="mt-1.5 w-full bg-transparent border-b border-line focus:border-gold py-2 outline-none text-sm transition-colors"
              />
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <button type="submit" className="btn-primary">
              {editing ? "Update" : "Save product"}
            </button>
            {editing && (
              <button
                type="button"
                className="text-[11px] uppercase tracking-[1.5px] text-muted hover:text-ink transition-colors"
                onClick={() => {
                  setEditing(null);
                  setForm(empty);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
