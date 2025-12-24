const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
let content = fs.readFileSync(envPath, 'utf8');

// The hash we verified works
const hash = "$2b$10$UJ5EyMeXQRUbyi3sdwcVrO5NYOENcKztlt0koXfP2F1WftKQf8cF.";

// Replace the line with single quotes (prevents variable interpolation)
content = content.replace(
  /NEXT_PUBLIC_ADMIN_PASSWORD_HASH=.*/,
  `NEXT_PUBLIC_ADMIN_PASSWORD_HASH='${hash}'`
);

fs.writeFileSync(envPath, content);

console.log('✅ Fixed .env file!');
console.log('New hash line: NEXT_PUBLIC_ADMIN_PASSWORD_HASH=\'' + hash + '\'');
console.log('\n⚠️  Now restart your admin server!');


