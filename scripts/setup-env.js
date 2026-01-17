const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 Admin Panel Environment Setup\n');
console.log('This script will help you set up your .env.local file.\n');

rl.question('Enter your admin password: ', (password) => {
  if (!password || password.length < 3) {
    console.error('\n❌ Password must be at least 3 characters');
    rl.close();
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, 10);
  const envPath = path.join(__dirname, '..', '.env.local');
  
  // Check if .env.local already exists
  let existingContent = '';
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n⚠️  .env.local already exists. Updating ADMIN_PASSWORD_HASH...\n');
  }

  // Remove old ADMIN_PASSWORD_HASH if it exists
  const lines = existingContent.split('\n').filter(line => 
    !line.startsWith('ADMIN_PASSWORD_HASH=')
  );

  // Add new ADMIN_PASSWORD_HASH
  lines.push(`ADMIN_PASSWORD_HASH=${hash}`);

  // Add other required vars if they don't exist
  const requiredVars = {
    'NEXT_PUBLIC_API_URL': 'http://localhost:3001',
    'ADMIN_API_KEY': 'your-admin-api-key-here',
    'MARKETPLACE_API_KEY': 'your-marketplace-api-key-here',
    'SESSION_SECRET': '',
    'NEXT_PUBLIC_PINATA_JWT': '',
    'NEXT_PUBLIC_PINATA_GATEWAY': '',
    'NODE_ENV': 'development'
  };

  Object.keys(requiredVars).forEach(key => {
    const exists = lines.some(line => line.startsWith(`${key}=`));
    if (!exists) {
      const value = requiredVars[key];
      if (key === 'SESSION_SECRET' && !value) {
        // Generate a random session secret
        const crypto = require('crypto');
        const secret = crypto.randomBytes(32).toString('base64');
        lines.push(`${key}=${secret}`);
      } else {
        lines.push(`${key}=${value}`);
      }
    }
  });

  const content = lines.join('\n');
  fs.writeFileSync(envPath, content);

  console.log('✅ Password hash generated and saved to .env.local');
  console.log(`\n📝 Hash: ${hash}`);
  console.log('\n⚠️  IMPORTANT: Restart your Next.js dev server for changes to take effect!');
  console.log('   Run: pnpm dev (or npm run dev)\n');

  rl.close();
});
