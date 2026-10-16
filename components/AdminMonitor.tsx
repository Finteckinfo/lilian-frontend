"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";

type Stats = {
  mode: string;
  leads_total: number;
  booking_inquiries?: number;
  product_requests?: number;
  accounts_total?: number;
  catalog_total?: number;
  leads_by_status: Record<string, number>;
  leads_by_service: Record<string, number>;
  posts_total: number;
  posts_featured: number;
  portfolio_total: number;
  portfolio_videos: number;
  recent_leads: {
    id: string;
    full_name: string;
    service_type: string;
    status: string;
    created_at: string;
    phone_number: string;
  }[];
  recent_requests?: {
    id: string;
    full_name: string;
    phone_number: string;
    created_at: string;
    items: { name: string; quantity: number }[];
  }[];
  recent_signins?: {
    id: string;
    email: string;
    full_name: string;
    last_login_at?: string | null;
    login_count: number;
  }[];
  activity: { id: string; at: string; kind: string; message: string }[];
};

export function AdminMonitor() {
  const { authHeaders } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(apiUrl("/v1/admin/stats"), { headers: authHeaders });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setStats((await res.json()) as Stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load monitor");
    }
  }, [authHeaders]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  if (error) return <p className="text-sm text-accent">{error}</p>;
  if (!stats) return <p className="text-sm text-muted">Loading monitor…</p>;

  const cards = [
    { label: "Booking enquiries", value: stats.booking_inquiries ?? stats.leads_total },
    { label: "Product requests", value: stats.product_requests ?? 0 },
    { label: "Accounts", value: stats.accounts_total ?? 0 },
    { label: "Catalog items", value: stats.catalog_total ?? 0 },
  ];

  return (
    <div className="space-y-12">
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[2px] text-gold mb-2">Monitor</p>
          <h2 className="font-display text-3xl">Overview</h2>
        </div>
        <p className="text-[11px] uppercase tracking-[1.5px] text-muted">
          {stats.mode}
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="border border-line bg-elevated/40 p-6 transition-colors hover:border-gold/40"
          >
            <p className="text-[10px] uppercase tracking-[2px] text-muted">{c.label}</p>
            <p className="font-display text-4xl mt-3">{c.value}</p>
          </div>
        ))}
      </div>

      {/* ── Pipeline & service ── */}
      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h3 className="text-[10px] uppercase tracking-[2px] text-gold mb-5">Pipeline</h3>
          <ul className="space-y-0">
            {Object.entries(stats.leads_by_status).map(([status, count]) => (
              <li
                key={status}
                className="flex justify-between text-sm border-b border-line/50 py-3"
              >
                <span>{status}</span>
                <span className="text-muted tabular-nums">{count}</span>
              </li>
            ))}
            {!Object.keys(stats.leads_by_status).length && (
              <li className="text-sm text-muted py-3">No leads yet.</li>
            )}
          </ul>
        </section>
        <section>
          <h3 className="text-[10px] uppercase tracking-[2px] text-gold mb-5">By service</h3>
          <ul className="space-y-0">
            {Object.entries(stats.leads_by_service).map(([svc, count]) => (
              <li
                key={svc}
                className="flex justify-between text-sm border-b border-line/50 py-3"
              >
                <span>{svc.replace("_", " ")}</span>
                <span className="text-muted tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Recent requests & sign-ins ── */}
      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h3 className="text-[10px] uppercase tracking-[2px] text-gold mb-5">
            Recent product requests
          </h3>
          <ul className="space-y-3">
            {(stats.recent_requests || []).map((r) => (
              <li
                key={r.id}
                className="border border-line bg-elevated/30 p-4 text-sm"
              >
                <p className="font-medium">{r.full_name}</p>
                <p className="text-[11px] text-muted mt-1.5 leading-relaxed">
                  {r.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")} ·{" "}
                  {r.phone_number}
                </p>
              </li>
            ))}
            {!(stats.recent_requests || []).length && (
              <li className="text-sm text-muted">No product requests yet.</li>
            )}
          </ul>
        </section>
        <section>
          <h3 className="text-[10px] uppercase tracking-[2px] text-gold mb-5">
            Recent sign-ins
          </h3>
          <ul className="space-y-3">
            {(stats.recent_signins || []).map((a) => (
              <li
                key={a.id}
                className="border border-line bg-elevated/30 p-4 text-sm"
              >
                <p className="font-medium">{a.full_name || a.email}</p>
                <p className="text-[11px] text-muted mt-1.5">
                  {a.email} · {a.login_count} sign-in{a.login_count === 1 ? "" : "s"}
                  {a.last_login_at
                    ? ` · ${a.last_login_at.slice(0, 16).replace("T", " ")}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Booking enquiries & activity ── */}
      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h3 className="text-[10px] uppercase tracking-[2px] text-gold mb-5">
            Recent booking enquiries
          </h3>
          <ul className="space-y-3">
            {stats.recent_leads.map((l) => (
              <li
                key={l.id}
                className="border border-line bg-elevated/30 p-4 text-sm"
              >
                <p className="font-medium">{l.full_name}</p>
                <p className="text-[11px] text-muted mt-1.5">
                  {l.service_type} · {l.status} · {l.phone_number}
                </p>
              </li>
            ))}
            {!stats.recent_leads.length && (
              <li className="text-sm text-muted">No recent enquiries.</li>
            )}
          </ul>
        </section>
        <section>
          <h3 className="text-[10px] uppercase tracking-[2px] text-gold mb-5">Activity</h3>
          <ul className="space-y-0 max-h-[420px] overflow-y-auto">
            {stats.activity.map((a) => (
              <li key={a.id} className="text-sm border-b border-line/40 py-3">
                <p className="text-[10px] uppercase tracking-[1px] text-muted">
                  {a.kind} · {a.at.slice(0, 19).replace("T", " ")}
                </p>
                <p className="font-light mt-1">{a.message}</p>
              </li>
            ))}
            {!stats.activity.length && (
              <li className="text-sm text-muted py-3">
                Edits and lead moves will show here.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
