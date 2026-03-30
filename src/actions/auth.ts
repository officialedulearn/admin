"use server";

import {
  bcryptEnvLooksInvalid,
  parseBcryptHash,
  resolveLoginRole,
} from "@/lib/auth";
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

  if (bcryptEnvLooksInvalid(process.env.ADMIN_PASSWORD_HASH)) {
    return {
      error:
        "ADMIN_PASSWORD_HASH is not a valid bcrypt hash. Paste the full ~60-character value starting with $2b$. Generate it from the admin folder with bcryptjs; plain text passwords will not work.",
    };
  }

  if (bcryptEnvLooksInvalid(process.env.UPLOADER_PASSWORD_HASH)) {
    return {
      error:
        "UPLOADER_PASSWORD_HASH is not a valid bcrypt hash. Paste the full bcrypt hash, same format as ADMIN_PASSWORD_HASH.",
    };
  }

  const hasAdmin = parseBcryptHash(process.env.ADMIN_PASSWORD_HASH);
  const hasUploader = parseBcryptHash(process.env.UPLOADER_PASSWORD_HASH);

  if (!hasAdmin && !hasUploader) {
    return {
      error:
        "No valid password hashes in server env. Add ADMIN_PASSWORD_HASH and/or UPLOADER_PASSWORD_HASH to your host (e.g. Vercel → Settings → Environment Variables). Local .env is not used in production unless synced.",
    };
  }

  const role = await resolveLoginRole(password);

  if (!role) {
    return {
      error: "Invalid password.",
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
