"use server";

import { verifyPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const password = formData.get("password") as string;

  console.log("🔑 Login attempt received");
  
  if (!password) {
    console.log("❌ No password provided");
    return { error: "Password is required" };
  }

  const isValid = await verifyPassword(password);

  if (!isValid) {
    console.log("❌ Login failed - invalid password");
    return { error: "Invalid password" };
  }

  console.log("✅ Login successful - creating session");
  
  try {
    await createSession();
    console.log("✅ Session created - returning success");
    return { success: true };
  } catch (sessionError) {
    console.error("❌ Failed to create session:", sessionError);
    return { error: "Failed to create session. Please try again." };
  }
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

