"use client";

import Sidebar from "./Sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 transition-all duration-300 data-[collapsed=true]:ml-[72px]">
        {children}
      </main>
    </div>
  );
}


