const isServer = typeof window === "undefined";

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  adminApiKey: isServer ? process.env.ADMIN_API_KEY || "" : "",
  marketplaceApiKey: isServer ? process.env.MARKETPLACE_API_KEY || "" : "",
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || "",
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "",
};

export const API_BASE_URL = config.apiUrl;

export function getServerConfig() {
  if (!isServer) {
    throw new Error("getServerConfig can only be called on the server");
  }

  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    adminApiKey: process.env.ADMIN_API_KEY || "",
    marketplaceApiKey: process.env.MARKETPLACE_API_KEY || "",
  };
}

export function validateConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.NEXT_PUBLIC_API_URL) {
    errors.push("NEXT_PUBLIC_API_URL is not set");
  }

  if (isServer) {
    if (!process.env.ADMIN_API_KEY) {
      warnings.push("ADMIN_API_KEY is not set - admin API calls will not work");
    }

    if (!process.env.ADMIN_PASSWORD_HASH) {
      errors.push("ADMIN_PASSWORD_HASH is not set - authentication will not work");
    }

    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
      errors.push("SESSION_SECRET must be at least 32 characters long");
    }
  }

  if (process.env.NODE_ENV === "development" && warnings.length > 0) {
    warnings.forEach((w) => console.warn(`Warning: ${w}`));
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(", ")}`);
  }

  return true;
}
