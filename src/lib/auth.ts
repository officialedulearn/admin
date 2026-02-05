import bcrypt from "bcryptjs";

export async function verifyPassword(password: string): Promise<boolean> {
  let passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    console.error("❌ ADMIN_PASSWORD_HASH is not set in environment variables");
    console.error("💡 Run: node scripts/setup-env.js");
    console.error("💡 Or manually add ADMIN_PASSWORD_HASH to your .env file");
    return false;
  }

  // Trim whitespace and remove quotes if present
  passwordHash = passwordHash.trim().replace(/^["']|["']$/g, "");

  if (!passwordHash.startsWith("$2")) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ ADMIN_PASSWORD_HASH appears to be invalid (should start with $2)");
      console.error("💡 Make sure you're using a bcrypt hash, not plain text");
      console.error(`💡 Current value (first 20 chars): ${passwordHash.substring(0, 20)}...`);
      console.error(`💡 Full length: ${passwordHash.length} characters`);
      console.error("💡 Expected format: $2b$10$... (60 characters total)");
      console.error("💡 TIP: Wrap the hash in quotes in .env: ADMIN_PASSWORD_HASH='$2b$10$...'");
    }
    return false;
  }

  try {
    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid && process.env.NODE_ENV === "development") {
      console.error("❌ Password comparison failed");
      console.error("💡 Make sure ADMIN_PASSWORD_HASH matches the password you're entering");
    }
    return isValid;
  } catch (error) {
    console.error("❌ Error comparing password:", error);
    return false;
  }
}
