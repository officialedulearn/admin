"use client";

import type { AdminRole } from "@/lib/admin-session-types";
import Sidebar from "./Sidebar";

export default function AuthLayoutClient({
  children,
  role,
}: {
  children: React.ReactNode;
  role: AdminRole;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 ml-64 p-6 transition-all duration-300 data-[collapsed=true]:ml-[72px]">
        {children}
      </main>
    </div>
  );
}
