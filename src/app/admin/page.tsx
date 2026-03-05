import ClientAdminPanel from "@/components/admin/ClientAdminPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Workout Planner – Egzersiz Planlayıcı",
  robots: "noindex, nofollow",
};

export default function AdminPage() {
  return <ClientAdminPanel />;
}
