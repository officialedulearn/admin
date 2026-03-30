"use server";

import { resolveLoginRole } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import type { AdminRole } from "@/lib/admin-session-types";
import { redirect } from "next/navigation";

export async function loginAction(
  formData: FormData
): Promise<
  | { success: true; role: AdminRole }
  | { error: string }
> {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (!process.env.ADMIN_PASSWORD_HASH) {
    return {
      error:
        "ADMIN_PASSWORD_HASH not configured. Run: node scripts/setup-env.js",
    };
  }

  const role = await resolveLoginRole(password);

  if (!role) {
    return {
      error:
        "Invalid password. Use the admin password or a valid uploader password.",
    };
  }

  try {
    await createSession(role);
    return { success: true, role };
  } catch {
    return { error: "Failed to create session. Please try again." };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
