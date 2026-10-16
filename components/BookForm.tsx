"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";
import { SERVICE_OPTIONS, type ServiceType } from "@/lib/types";
import { serviceLabel, whatsappUrl } from "@/lib/whatsapp";

const SERVICE_QUERY: Record<string, ServiceType> = {
  mua: "MUA",
  collab: "Brand_Collab",
  collaboration: "Brand_Collab",
  event: "Event",
  general: "General",
};

export function BookForm({ service }: { service?: string }) {
  const defaultService = SERVICE_QUERY[service?.toLowerCase() ?? ""] ?? "MUA";
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      full_name: String(data.get("full_name") || "").trim(),
      phone_number: String(data.get("phone_number") || "").trim(),
      email: String(data.get("email") || "").trim(),
      service_type: String(data.get("service_type") || "General") as ServiceType,
      event_date: String(data.get("event_date") || ""),
      location: String(data.get("location") || "").trim(),
      budget: String(data.get("budget") || "").trim(),
      notes: String(data.get("notes") || "").trim(),
    };
    if (!payload.full_name || !payload.phone_number) {
      setStatus("error");
      setMessage("Name and WhatsApp number are required.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const body = {
        ...payload,
        email: payload.email || null,
        event_date: payload.event_date || null,
      };
      const res = await fetch(apiUrl("/v1/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("ok");
      const extra = [
        `Name: ${payload.full_name}`,
        `Service: ${serviceLabel(payload.service_type)}`,
        payload.event_date && `Date: ${payload.event_date}`,
        payload.location && `Location: ${payload.location}`,
        payload.budget && `Budget: ${payload.budget}`,
        payload.notes && `Notes: ${payload.notes}`,
      ]
        .filter(Boolean)
        .join("\n");
      window.open(whatsappUrl(payload.service_type, extra), "_blank");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Could not save the inquiry. You can still continue on WhatsApp.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Full name</span>
        <input
          name="full_name"
          required
          className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">
          WhatsApp number
        </span>
        <input
          name="phone_number"
          type="tel"
          required
          className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Email (optional)</span>
        <input
          name="email"
          type="email"
          className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Service</span>
        <select
          name="service_type"
          defaultValue={defaultService}
          className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold"
        >
          {SERVICE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">
            Preferred date
          </span>
          <input
            name="event_date"
            type="date"
            className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Location</span>
          <input
            name="location"
            className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">
          Budget bracket
        </span>
        <input
          name="budget"
          placeholder="Optional"
          className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold placeholder:text-muted/60"
        />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[1.5px] text-muted">Notes</span>
        <textarea
          name="notes"
          rows={4}
          className="mt-2 w-full bg-transparent border-b border-ink py-3 outline-none focus:border-gold resize-y"
        />
      </label>
      <button className="btn-primary w-full md:w-auto" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Submit & open WhatsApp"}
      </button>
      {status === "ok" && (
        <p className="text-sm font-light">
          Received. WhatsApp should open with your details — if it does not, use the button in the corner.
        </p>
      )}
      {status === "error" && <p className="text-sm text-muted">{message}</p>}
    </form>
  );
}
