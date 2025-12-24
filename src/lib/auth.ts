// Simple password verification - just compare plain text
// In production, you should use a proper auth system
export async function verifyPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  
  console.log("\n========== PASSWORD DEBUG ==========");
  console.log("Password entered:", `"${password}"`);
  console.log("Expected password set:", adminPassword ? "YES" : "NO");
  console.log("Match:", password === adminPassword);
  console.log("====================================\n");
  
  if (!adminPassword) {
    console.error("❌ NEXT_PUBLIC_ADMIN_PASSWORD is not set in environment variables");
    return false;
  }

  return password === adminPassword;
}

