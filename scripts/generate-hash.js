const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('\n❌ Usage: node generate-hash.js YOUR_PASSWORD\n');
  console.log('Example: node generate-hash.js mySecurePassword123\n');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log('\n✅ Password hash generated!\n');
console.log('Add this to your admin/.env file:\n');
console.log(`ADMIN_PASSWORD_HASH='${hash}'\n`);
console.log('Your password:', password);
console.log('Your hash:', hash);
console.log('\n⚠️  IMPORTANT:');
console.log('   1. Wrap the hash in single quotes');
console.log('   2. Restart the dev server after updating\n');





console.log('\n✅ Password hash generated!\n');

console.log('Add this to your admin/.env file:\n');

console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);

console.log('Your password:', password);

console.log('Your hash:', hash);

console.log('\n⚠️  Make sure to restart the admin server after updating .env\n');








console.log('\n✅ Password hash generated!\n');

console.log('Add this to your admin/.env file:\n');

console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);

console.log('Your password:', password);

console.log('Your hash:', hash);

console.log('\n⚠️  Make sure to restart the admin server after updating .env\n');




