import { SERVICE_OPTIONS, type ServiceType, WHATSAPP_NUMBER } from "./types";

const PREFILLS: Record<ServiceType, string> = {
  MUA: "Hi Lillian, I'd like to book MUA services.",
  Brand_Collab: "Hi Lillian, I'm interested in a brand collaboration.",
  Event: "Hi Lillian, I'd like to inquire about an event appearance.",
  General: "Hi Lillian, I'd like to get in touch.",
};

export function whatsappUrl(
  service: ServiceType = "General",
  extra?: string,
  phone?: string
) {
  const base = PREFILLS[service];
  const text = extra ? `${base}\n\n${extra}` : base;
  const number = (phone || WHATSAPP_NUMBER).replace(/\D/g, "") || WHATSAPP_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function serviceLabel(service: ServiceType) {
  return SERVICE_OPTIONS.find((s) => s.value === service)?.label ?? service;
}
