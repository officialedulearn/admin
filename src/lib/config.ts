export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  marketplaceApiKey: process.env.NEXT_PUBLIC_MARKETPLACE_API_KEY || '',
  adminApiKey: process.env.NEXT_PUBLIC_ADMIN_API_KEY || '',
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || '',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  sessionSecret: process.env.SESSION_SECRET || '',
};

export function validateConfig() {
  const errors: string[] = [];

  if (!config.apiUrl) {
    errors.push('NEXT_PUBLIC_API_URL is not set');
  }

  if (!config.adminApiKey) {
    console.warn('Warning: NEXT_PUBLIC_ADMIN_API_KEY is not set - admin API calls will not work');
  }

  if (!config.adminPasswordHash) {
    errors.push('ADMIN_PASSWORD_HASH is not set - authentication will not work');
  }

  if (!config.sessionSecret || config.sessionSecret.length < 32) {
    console.warn('Warning: SESSION_SECRET should be at least 32 characters long');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    throw new Error(`Missing required environment variables: ${errors.join(', ')}`);
  }

  return true;
}

// Log configuration status (without exposing sensitive data)
export function logConfigStatus() {
  console.log('Configuration status:', {
    apiUrl: config.apiUrl,
    marketplaceApiKeySet: !!config.marketplaceApiKey,
    pinataJwtSet: !!config.pinataJwt,
    pinataGatewaySet: !!config.pinataGateway,
    adminPasswordHashSet: !!config.adminPasswordHash,
    sessionSecretSet: !!config.sessionSecret,
  });
}

