"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import type { ContentPost, PostCategory } from "@/lib/types";
import { POST_FILTERS } from "@/lib/types";

const emptyForm = {
  slug: "",
  title: "",
  category: "Journey_POV" as PostCategory,
  published_at: new Date().toISOString().slice(0, 10),
  excerpt: "",
  quote: "",
  body_markdown: "",
  is_featured: false,
};

export function AdminJournal() {
  const { authHeaders } = useAdminAuth();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(apiUrl("/v1/admin/posts"), { headers: authHeaders });
    if (!res.ok) {
      setError(`Failed (${res.status})`);
      return;
    }
    setPosts((await res.json()) as ContentPost[]);
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(post: ContentPost) {
    setEditingId(post.id);
    setForm({
      slug: post.slug,
      title: post.title,
      category: post.category,
      published_at: post.published_at.slice(0, 10),
      excerpt: post.excerpt || "",
      quote: post.quote || "",
      body_markdown: post.body_markdown || "",
      is_featured: post.is_featured,
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
      quote: form.quote || null,
      media_urls: [] as string[],
    };
    const url = editingId
      ? apiUrl(`/v1/admin/posts/${editingId}`)
      : apiUrl("/v1/admin/posts");
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError(`Save failed (${res.status})`);
      return;
    }
    setMsg(editingId ? "Post updated." : "Post published.");
    reset();
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this journal post?")) return;
    const res = await fetch(apiUrl(`/v1/admin/posts/${id}`), {
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
        <p className="text-[11px] uppercase tracking-[2px] text-muted mb-1">Journal</p>
        <h2 className="font-display text-3xl mb-6">Archives editor</h2>
        {error && <p className="text-sm text-accent mb-3">{error}</p>}
        <ul className="space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="border border-line dark:border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
            >
              <div>
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-[11px] text-muted mt-1">
                  {p.published_at} · {p.category}
                  {p.is_featured ? " · Featured" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="text-[11px] uppercase tracking-[1px] border border-ink dark:border-paper/40 px-3 py-2" onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button type="button" className="text-[11px] uppercase tracking-[1px] border border-accent text-accent px-3 py-2" onClick={() => remove(p.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={save} className="space-y-4 border border-line dark:border-white/10 p-5 bg-surface/20">
        <h3 className="font-display text-2xl">{editingId ? "Edit post" : "New post"}</h3>
        {msg && <p className="text-sm text-muted">{msg}</p>}
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Title</span>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Slug</span>
          <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" placeholder="my-post-slug" />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PostCategory })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none">
              {POST_FILTERS.filter((f) => f.id !== "all").map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Published</span>
            <input type="date" required value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" />
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Excerpt</span>
          <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="mt-2 w-full bg-transparent border border-line dark:border-white/10 p-3 outline-none text-sm" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Pull quote</span>
          <input value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className="mt-2 w-full bg-transparent border-b border-ink dark:border-paper/40 py-2 outline-none" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Body (markdown)</span>
          <textarea required value={form.body_markdown} onChange={(e) => setForm({ ...form, body_markdown: e.target.value })} rows={10} className="mt-2 w-full bg-transparent border border-line dark:border-white/10 p-3 outline-none text-sm font-mono" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          Featured on home
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">{editingId ? "Update" : "Publish"}</button>
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
