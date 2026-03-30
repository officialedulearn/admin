import AuthLayoutClient from "@/components/AuthLayoutClient";
import { getSession } from "@/lib/session";
import type { AdminRole } from "@/lib/admin-session-types";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const role: AdminRole = session.role ?? "admin";
  return <AuthLayoutClient role={role}>{children}</AuthLayoutClient>;
}


