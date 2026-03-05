import ClientAdminPanel from "@/components/admin/ClientAdminPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Antrenman Programı",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return <ClientAdminPanel />;
}
