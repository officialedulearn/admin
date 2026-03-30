import bcrypt from "bcryptjs";
import type { AdminRole } from "./admin-session-types";

export function parseBcryptHash(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  if (!trimmed.startsWith("$2")) {
    return null;
  }
  return trimmed;
}

export function bcryptEnvLooksInvalid(raw: string | undefined): boolean {
  return Boolean(raw?.trim()) && parseBcryptHash(raw) === null;
}

async function compareBcrypt(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = parseBcryptHash(process.env.ADMIN_PASSWORD_HASH);
  if (!hash) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ ADMIN_PASSWORD_HASH is not set in environment variables");
      console.error("💡 Run: node scripts/setup-env.js");
      console.error("💡 Or manually add ADMIN_PASSWORD_HASH to your .env file");
    }
    return false;
  }

  const isValid = await compareBcrypt(password, hash);
  if (!isValid && process.env.NODE_ENV === "development") {
    console.error("❌ Password comparison failed");
    console.error("💡 Make sure ADMIN_PASSWORD_HASH matches the password you're entering");
  }
  return isValid;
}

export async function verifyUploaderPassword(password: string): Promise<boolean> {
  const hash = parseBcryptHash(process.env.UPLOADER_PASSWORD_HASH);
  if (!hash) {
    return false;
  }
  return compareBcrypt(password, hash);
}

export async function resolveLoginRole(password: string): Promise<AdminRole | null> {
  if (await verifyPassword(password)) {
    return "admin";
  }
  if (await verifyUploaderPassword(password)) {
    return "uploader";
  }
  return null;
}
