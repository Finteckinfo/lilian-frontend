import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";

export const metadata: Metadata = { title: "Studio Admin" };

export default function AdminPage() {
  return <AdminShell />;
}
