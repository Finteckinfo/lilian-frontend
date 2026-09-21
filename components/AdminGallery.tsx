"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import type { MediaType, PortfolioCategory, PortfolioItem } from "@/lib/types";

const emptyForm = {
  title: "",
  category: "MUA_Clients" as PortfolioCategory,
  media_type: "Image" as MediaType,
  media_url: "/media/",
  video_url: "",
  instagram_url: "",
  testimonial_text: "",
  display_order: 99,
};

export function AdminGallery() {
  const { authHeaders } = useAdminAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(apiUrl("/v1/admin/portfolio"), { headers: authHeaders });
    if (!res.ok) {
      setError(`Failed (${res.status})`);
      return;
    }
    const data = (await res.json()) as Omit<PortfolioItem, "public_label">[];
    setItems(
      data.map((row) => ({
        ...row,
        public_label:
          row.category === "MUA_Clients"
            ? "Bridal"
            : row.category === "Events"
              ? "Events"
              : "Editorial",
      }))
    );
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      media_type: item.media_type,
      media_url: item.media_url,
      video_url: item.video_url || "",
      instagram_url: item.instagram_url || "",
      testimonial_text: item.testimonial_text || "",
      display_order: item.display_order,
    });
    setMsg("");
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    const body = {
      ...form,
      video_url: form.video_url || null,
      instagram_url: form.instagram_url || null,
      testimonial_text: form.testimonial_text || null,
    };
    const url = editingId
      ? apiUrl(`/v1/admin/portfolio/${editingId}`)
      : apiUrl("/v1/admin/portfolio");
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError(`Save failed (${res.status})`);
      return;
    }
    setMsg(editingId ? "Gallery item updated." : "Gallery item added.");
    reset();
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this gallery item?")) return;
    const res = await fetch(apiUrl(`/v1/admin/portfolio/${id}`), {
      method: "DELETE",
      headers: authHeaders,
    });
    if (!res.ok && res.status !== 204) {
      setError(`Delete failed (${res.status})`);
      return;
    }
    if (editingId === id) reset();
    await load();
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10">
      <div>
        <p className="text-[11px] uppercase tracking-[2px] text-muted mb-1">Gallery</p>
        <h2 className="font-display text-3xl mb-6">Portfolio beams</h2>
        {error && <p className="text-sm text-accent mb-3">{error}</p>}
        <ul className="space-y-3 max-h-[640px] overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="border border-line dark:border-white/10 p-3 flex gap-3 items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.media_url}
                alt=""
                className="w-16 h-16 object-cover bg-surface shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-[11px] text-muted">
                  #{item.display_order} · {item.category} · {item.media_type}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" className="text-[10px] uppercase tracking-[1px] border px-2 py-1" onClick={() => startEdit(item)}>
                  Edit
                </button>
                <button type="button" className="text-[10px] uppercase tracking-[1px] border border-accent text-accent px-2 py-1" onClick={() => remove(item.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="space-y-4 border border-line dark:border-white/10 p-5 bg-surface/20">
        <h3 className="font-display text-2xl">{editingId ? "Edit item" : "Add beam"}</h3>
        {msg && <p className="text-sm text-muted">{msg}</p>}
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Title</span>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PortfolioCategory })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none">
              <option value="MUA_Clients">Bridal / MUA</option>
              <option value="Photoshoots">Photoshoots</option>
              <option value="Events">Events</option>
              <option value="Testimonials">Testimonials</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Media type</span>
            <select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value as MediaType })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none">
              <option value="Image">Image</option>
              <option value="Video">Video</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Image / poster URL</span>
          <input required value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" placeholder="/media/your-file.jpg" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Video URL (optional)</span>
          <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" placeholder="/media/craft-video.mp4" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Instagram URL</span>
          <input value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Testimonial text</span>
          <textarea value={form.testimonial_text} onChange={(e) => setForm({ ...form, testimonial_text: e.target.value })} rows={2} className="mt-2 w-full bg-transparent border border-line dark:border-white/10 p-3 outline-none text-sm" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Display order</span>
          <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" />
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">{editingId ? "Update" : "Add to gallery"}</button>
          {editingId && (
            <button type="button" className="text-[11px] uppercase tracking-[1.5px]" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
