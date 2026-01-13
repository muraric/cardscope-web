const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const teamId = '6URPSH85GM';
const keyId = '3R3LDV246G';
const privateKeyPath = path.join(process.env.HOME, 'Downloads', 'AuthKey_3R3LDV246G.p8');

// You'll need to set your Services ID here
// Default is com.shomuran.cardcompass.web, but check Apple Developer Console
const servicesId = process.env.APPLE_SERVICES_ID || 'com.shomuran.cardcompass.web';

try {
  console.log('Reading private key from:', privateKeyPath);
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  
  console.log('Generating JWT token...');
  const token = jwt.sign(
    {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 months
      aud: 'https://appleid.apple.com',
      sub: servicesId,
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId,
    }
  );
  
  console.log('\n✅ Apple Secret (JWT Token) Generated Successfully!\n');
  console.log('='.repeat(80));
  console.log(token);
  console.log('='.repeat(80));
  console.log('\n📋 Next Steps:');
  console.log('1. Copy the token above');
  console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('3. Add new variable:');
  console.log('   - Name: APPLE_SECRET');
  console.log('   - Value: [paste the token above]');
  console.log('   - Environment: Production, Preview, Development (select all)');
  console.log('4. Also add these variables:');
  console.log('   - APPLE_ID = ' + servicesId);
  console.log('   - APPLE_TEAM_ID = ' + teamId);
  console.log('   - APPLE_KEY_ID = ' + keyId);
  console.log('5. Redeploy your Vercel project');
  console.log('\n⚠️  Note: This token expires in 6 months. Regenerate it before expiration.\n');
} catch (error) {
  console.error('❌ Error generating token:', error.message);
  if (error.code === 'ENOENT') {
    console.error('   Private key file not found at:', privateKeyPath);
    console.error('   Please check the file path.');
  }
  process.exit(1);
}
