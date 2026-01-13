# Sign in with Apple Setup Guide

## Overview
To comply with Apple's App Store guidelines (4.8), we've added Sign in with Apple as an alternative login option alongside Google Sign-In.

## What's Been Implemented

1. **NextAuth Apple Provider** - Added to `/app/api/auth/[...nextauth]/route.ts`
2. **Apple Sign-In API Endpoint** - Created `/app/api/auth/apple/route.ts`
3. **Login Page** - Added Apple Sign-In button to `/app/login/page.tsx`
4. **Signup Page** - Added Apple Sign-In button to `/app/signup/page.tsx`

## Required Setup Steps

### 1. Apple Developer Console Setup

1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Create a **Services ID** (if not already created):
   - Click "+" → Select "Services IDs"
   - Description: CardCompass Web
   - Identifier: `com.shomuran.cardcompass.web` (or similar)
   - Enable "Sign in with Apple"
   - Configure: Add your domain and redirect URLs:
     - Primary App ID: `com.shomuran.cardcompass`
     - **Domains and Subdomains** (⚠️ IMPORTANT: Only domain name, NO https:// or paths):
       - `cardscope-web.vercel.app`
     - **Return URLs** (Full URLs with https://):
       - `https://cardscope-web.vercel.app/api/auth/callback/apple`

3. Create a **Key** for Sign in with Apple:
   - Go to Keys section
   - Click "+"
   - Name: CardCompass Sign in with Apple Key
   - Enable "Sign in with Apple"
   - Configure: Select your Primary App ID
   - Download the key file (`.p8`) - **SAVE THIS SECURELY**
   - Note the Key ID

### 2. Environment Variables

Add these to your `.env.production` and Vercel environment variables:

```bash
# Apple Sign-In Configuration
APPLE_ID=com.shomuran.cardcompass.web  # Your Services ID
APPLE_SECRET=-----BEGIN PRIVATE KEY-----
...your private key content...
-----END PRIVATE KEY-----
APPLE_TEAM_ID=YOUR_TEAM_ID  # Found in Apple Developer account
APPLE_KEY_ID=YOUR_KEY_ID    # The Key ID from step 1
```

**Important**: The `APPLE_SECRET` should be a JWT token. You can generate it using a library or use NextAuth's built-in method.

### 3. Generate Apple Secret (JWT)

The Apple secret needs to be a JWT signed with your private key. You can use this Node.js script:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const teamId = 'YOUR_TEAM_ID';
const keyId = 'YOUR_KEY_ID';
const privateKey = fs.readFileSync('path/to/AuthKey_XXXXX.p8', 'utf8');

const token = jwt.sign(
  {
    iss: teamId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 6 months
    aud: 'https://appleid.apple.com',
    sub: 'com.shomuran.cardcompass.web',
  },
  privateKey,
  {
    algorithm: 'ES256',
    keyid: keyId,
  }
);

console.log(token);
```

Or use NextAuth's built-in method (recommended):

```typescript
// NextAuth will automatically generate the secret if you provide:
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### 4. iOS Native Sign-In (Optional but Recommended)

For better iOS experience, install the Capacitor plugin:

```bash
npm install @capacitor-community/apple-sign-in
npx cap sync ios
```

Then configure in Xcode:
1. Enable "Sign in with Apple" capability in Xcode
2. The code already includes fallback to web-based Sign-In

### 5. Testing

1. **Web Testing**:
   - Visit `/login` or `/signup`
   - Click "Continue with Apple"
   - Sign in with Apple ID

2. **iOS Testing**:
   - Test on physical device (Sign in with Apple doesn't work in simulator)
   - Click "Continue with Apple"
   - Use Face ID/Touch ID or Apple ID password

## Troubleshooting

### "Invalid client" error
- Verify Services ID matches `APPLE_ID`
- Check redirect URLs are configured correctly
- Ensure domain is verified in Apple Developer Console

### "Invalid grant" error
- Check that Key ID and Team ID are correct
- Verify private key is properly formatted (with `\n` for newlines)
- Ensure JWT token hasn't expired

### Native Sign-In not working
- Ensure plugin is installed: `npm install @capacitor-community/apple-sign-in`
- Run `npx cap sync ios`
- Enable capability in Xcode
- Test on physical device (not simulator)

## Resources

- [Apple Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [NextAuth Apple Provider](https://next-auth.js.org/providers/apple)
- [Capacitor Apple Sign-In Plugin](https://github.com/capacitor-community/apple-sign-in)
