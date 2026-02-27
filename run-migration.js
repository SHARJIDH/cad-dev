require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
