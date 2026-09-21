"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";

type Stats = {
  mode: string;
  leads_total: number;
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
    { label: "Leads", value: stats.leads_total },
    { label: "Journal posts", value: stats.posts_total },
    { label: "Gallery items", value: stats.portfolio_total },
    { label: "Videos", value: stats.portfolio_videos },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[2px] text-muted mb-1">Account monitor</p>
          <h2 className="font-display text-3xl">Overview</h2>
        </div>
        <p className="text-[11px] uppercase tracking-[1.5px] text-muted">
          Mode · {stats.mode}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-line dark:border-white/10 p-5 bg-surface/30">
            <p className="text-[11px] uppercase tracking-[1.5px] text-muted">{c.label}</p>
            <p className="font-display text-4xl mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h3 className="text-[11px] uppercase tracking-[1.5px] text-muted mb-4">Pipeline</h3>
          <ul className="space-y-2">
            {Object.entries(stats.leads_by_status).map(([status, count]) => (
              <li key={status} className="flex justify-between text-sm border-b border-line/60 dark:border-white/10 py-2">
                <span>{status}</span>
                <span className="text-muted">{count}</span>
              </li>
            ))}
            {!Object.keys(stats.leads_by_status).length && (
              <li className="text-sm text-muted">No leads yet — submit /book to seed the board.</li>
            )}
          </ul>
        </section>
        <section>
          <h3 className="text-[11px] uppercase tracking-[1.5px] text-muted mb-4">By service</h3>
          <ul className="space-y-2">
            {Object.entries(stats.leads_by_service).map(([svc, count]) => (
              <li key={svc} className="flex justify-between text-sm border-b border-line/60 dark:border-white/10 py-2">
                <span>{svc.replace("_", " ")}</span>
                <span className="text-muted">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h3 className="text-[11px] uppercase tracking-[1.5px] text-muted mb-4">Recent inquiries</h3>
          <ul className="space-y-3">
            {stats.recent_leads.map((l) => (
              <li key={l.id} className="border border-line dark:border-white/10 p-3 text-sm">
                <p className="font-medium">{l.full_name}</p>
                <p className="text-[11px] text-muted mt-1">
                  {l.service_type} · {l.status} · {l.phone_number}
                </p>
              </li>
            ))}
            {!stats.recent_leads.length && (
              <li className="text-sm text-muted">No recent inquiries.</li>
            )}
          </ul>
        </section>
        <section>
          <h3 className="text-[11px] uppercase tracking-[1.5px] text-muted mb-4">Activity</h3>
          <ul className="space-y-3 max-h-[420px] overflow-y-auto">
            {stats.activity.map((a) => (
              <li key={a.id} className="text-sm border-b border-line/50 dark:border-white/10 pb-2">
                <p className="text-[10px] uppercase tracking-[1px] text-muted">
                  {a.kind} · {a.at.slice(0, 19).replace("T", " ")}
                </p>
                <p className="font-light mt-1">{a.message}</p>
              </li>
            ))}
            {!stats.activity.length && (
              <li className="text-sm text-muted">Edits and lead moves will show here.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
