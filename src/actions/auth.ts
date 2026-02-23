"use server";

import { verifyPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  // Check if ADMIN_PASSWORD_HASH is set
  if (!process.env.ADMIN_PASSWORD_HASH) {
    return {
      error:
        "ADMIN_PASSWORD_HASH not configured. Run: node scripts/setup-env.js",
    };
  }

  const isValid = await verifyPassword(password);

  if (!isValid) {
    return {
      error:
        "Invalid password. Make sure ADMIN_PASSWORD_HASH in .env matches your password hash.",
    };
  }

  try {
    await createSession();
    return { success: true };
  } catch (error) {
    console.error("Session creation error:", error);
    return { error: "Failed to create session. Please try again." };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
