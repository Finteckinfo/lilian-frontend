"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useAdminAuth } from "@/lib/admin-auth";
import type { LeadStatus, ServiceType } from "@/lib/types";
import { whatsappUrl } from "@/lib/whatsapp";

type Lead = {
  id: string;
  created_at: string;
  full_name: string;
  phone_number: string;
  email?: string | null;
  service_type: ServiceType;
  event_date?: string | null;
  status: LeadStatus;
  notes?: string | null;
};

const COLUMNS: LeadStatus[] = [
  "New",
  "Contacted",
  "Quoted",
  "Booked",
  "Completed",
  "Legacy",
];

export function AdminKanban() {
  const { token, authHeaders } = useAdminAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/v1/admin/leads"), { headers: authHeaders });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setLeads((await res.json()) as Lead[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load leads");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load, token]);

  async function move(lead: Lead, status: LeadStatus) {
    const res = await fetch(apiUrl(`/v1/admin/leads/${lead.id}`), {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("Status update failed");
      return;
    }
    const updated = (await res.json()) as Lead;
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    if (selected?.id === lead.id) setSelected({ ...lead, ...updated });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[2px] text-muted mb-1">CRM</p>
          <h2 className="font-display text-3xl">Lead triage</h2>
        </div>
        <button type="button" className="text-[11px] uppercase tracking-[1.5px] border px-4 py-2" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <p className="text-sm text-accent">{error}</p>}
      {loading && <p className="text-sm text-muted">Loading…</p>}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = leads.filter((l) => l.status === col);
          return (
            <div
              key={col}
              className="min-w-[220px] w-[240px] shrink-0 border border-line dark:border-white/10 bg-surface/40 dark:bg-white/5 p-3"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-[11px] uppercase tracking-[1.5px]">{col}</h2>
                <span className="text-[11px] text-muted">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setSelected(lead)}
                    className="w-full text-left p-3 bg-paper dark:bg-ink border border-line dark:border-white/10 hover:border-accent"
                  >
                    <p className="font-medium text-sm">{lead.full_name}</p>
                    <p className="text-[11px] text-muted mt-1">{lead.service_type}</p>
                    <p className="text-[11px] text-muted">{lead.phone_number}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] bg-ink/50 flex justify-end" onClick={() => setSelected(null)}>
          <aside
            className="w-full max-w-md h-full bg-elevated p-6 overflow-y-auto border-l border-line"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="text-sm mb-6" onClick={() => setSelected(null)}>
              Close
            </button>
            <h2 className="font-display text-3xl mb-2">{selected.full_name}</h2>
            <p className="text-sm text-muted mb-6">{selected.service_type}</p>
            <dl className="space-y-3 text-sm mb-8">
              <div>
                <dt className="text-[11px] uppercase tracking-[1.5px] text-muted">Phone</dt>
                <dd>{selected.phone_number}</dd>
              </div>
              {selected.email && (
                <div>
                  <dt className="text-[11px] uppercase tracking-[1.5px] text-muted">Email</dt>
                  <dd>{selected.email}</dd>
                </div>
              )}
              {selected.event_date && (
                <div>
                  <dt className="text-[11px] uppercase tracking-[1.5px] text-muted">Event date</dt>
                  <dd>{selected.event_date}</dd>
                </div>
              )}
              {selected.notes && (
                <div>
                  <dt className="text-[11px] uppercase tracking-[1.5px] text-muted">Notes</dt>
                  <dd className="whitespace-pre-wrap font-light">{selected.notes}</dd>
                </div>
              )}
            </dl>
            <a
              className="btn-primary w-full mb-6"
              href={whatsappUrl(
                selected.service_type,
                `Following up with ${selected.full_name}`
              )}
              target="_blank"
              rel="noreferrer"
            >
              Open WhatsApp
            </a>
            <p className="text-[11px] uppercase tracking-[1.5px] text-muted mb-3">Move to</p>
            <div className="flex flex-wrap gap-2">
              {COLUMNS.map((col) => (
                <button
                  key={col}
                  type="button"
                  disabled={col === selected.status}
                  onClick={() => move(selected, col)}
                  className={`text-[11px] uppercase tracking-[1px] px-3 py-2 border ${
                    col === selected.status
                      ? "border-accent text-accent"
                      : "border-ink dark:border-paper/40"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
