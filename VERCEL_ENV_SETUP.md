# Vercel Environment Variables Setup for Apple Sign-In

## Issue
When clicking "Continue with Apple", you see `error=apple` in the URL. This means Apple Sign-In is not configured in Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project: `cardscope-web`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Apple Sign-In Variables

Add these environment variables:

#### Required Variables:

1. **APPLE_ID**
   - Value: Your Apple Services ID (e.g., `com.shomuran.cardcompass.web`)
   - Environment: Production, Preview, Development (select all)

2. **APPLE_SECRET**
   - Value: Your Apple JWT secret token
   - Environment: Production, Preview, Development (select all)
   - **Important**: This is a JWT token, not the raw private key

3. **APPLE_TEAM_ID** (Optional but recommended)
   - Value: Your Apple Developer Team ID
   - Environment: Production, Preview, Development (select all)

4. **APPLE_KEY_ID** (Optional but recommended)
   - Value: Your Apple Key ID
   - Environment: Production, Preview, Development (select all)

### Step 3: Generate Apple Secret (JWT Token)

The `APPLE_SECRET` needs to be a JWT token signed with your Apple private key. 

**Option A: Use NextAuth's built-in method (Recommended)**

NextAuth can generate the secret automatically if you provide:
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`  
- `APPLE_PRIVATE_KEY` (the raw .p8 file content)

**Option B: Generate JWT manually**

Use this Node.js script:

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
    sub: 'com.shomuran.cardcompass.web', // Your Services ID
  },
  privateKey,
  {
    algorithm: 'ES256',
    keyid: keyId,
  }
);

console.log(token);
```

### Step 4: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 5: Test

1. Wait for deployment to complete
2. Visit: `https://cardscope-web.vercel.app/login`
3. Click "Continue with Apple"
4. Should redirect to Apple Sign-In page (not show error)

## Troubleshooting

### Still seeing `error=apple`?
- Verify all environment variables are set correctly
- Check that variables are set for the correct environment (Production)
- Ensure `APPLE_SECRET` is a valid JWT token, not the raw private key
- Redeploy after adding variables

### "Invalid client" error?
- Verify `APPLE_ID` matches your Services ID exactly
- Check that redirect URLs are configured in Apple Developer Console
- Ensure domain is verified

### "Invalid grant" error?
- Check that JWT token hasn't expired (tokens expire after 6 months)
- Verify `APPLE_KEY_ID` and `APPLE_TEAM_ID` are correct
- Regenerate JWT token if needed

## Quick Checklist

- [ ] Apple Developer Console setup complete (Services ID created)
- [ ] `APPLE_ID` added to Vercel
- [ ] `APPLE_SECRET` (JWT token) added to Vercel
- [ ] `APPLE_TEAM_ID` added to Vercel (optional)
- [ ] `APPLE_KEY_ID` added to Vercel (optional)
- [ ] Vercel deployment redeployed
- [ ] Tested Apple Sign-In button

## Need Help?

See `APPLE_SIGN_IN_SETUP.md` for detailed Apple Developer Console setup instructions.
