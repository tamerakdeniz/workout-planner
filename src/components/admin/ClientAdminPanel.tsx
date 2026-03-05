"use client";

import dynamic from "next/dynamic";

const AdminPanel = dynamic(() => import("@/components/admin/AdminPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-10 h-10 border-2 border-neon-red border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function ClientAdminPanel() {
  return <AdminPanel />;
}
