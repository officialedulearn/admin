#!/usr/bin/env node

/**
 * Helper script to generate authentication credentials for the admin dashboard
 * 
 * Usage:
 *   node scripts/generate-auth-credentials.js <your-password>
 * 
 * Example:
 *   node scripts/generate-auth-credentials.js MySecurePassword123!
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function generateCredentials() {
  const password = process.argv[2];

  if (!password) {
    console.error('❌ Error: Please provide a password as an argument\n');
    console.log('Usage: node scripts/generate-auth-credentials.js <your-password>\n');
    console.log('Example: node scripts/generate-auth-credentials.js MySecurePassword123!\n');
    process.exit(1);
  }

  // Validate password strength
  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long\n');
    process.exit(1);
  }

  console.log('🔐 Generating authentication credentials...\n');

  // Generate password hash
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Generate session secret
  const sessionSecret = crypto.randomBytes(32).toString('base64');

  console.log('✅ Credentials generated successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Add these to your .env.local file:\n');
  console.log('ADMIN_PASSWORD_HASH=' + passwordHash);
  console.log('SESSION_SECRET=' + sessionSecret);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  Keep these credentials secure and never commit them to git!\n');
  console.log('📝 Your login password is: ' + password);
  console.log('   (Keep this somewhere safe - you\'ll need it to log in)\n');
}

generateCredentials().catch(err => {
  console.error('❌ Error generating credentials:', err);
  process.exit(1);
});

