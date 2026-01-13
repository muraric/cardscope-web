# Add NEXTAUTH_URL to Vercel

## Issue
NextAuth redirect callback is receiving only the base URL instead of Apple's OAuth URL, suggesting NextAuth can't determine the correct base URL.

## Solution: Add NEXTAUTH_URL Environment Variable

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project: `cardscope-web`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add NEXTAUTH_URL
Add this environment variable:

- **Name**: `NEXTAUTH_URL`
- **Value**: `https://cardscope-web.vercel.app`
- **Environment**: Production, Preview, Development (select all)

### Step 3: Redeploy
After adding the variable:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or wait for auto-deploy

## Why This Is Needed

NextAuth uses `NEXTAUTH_URL` to:
- Construct OAuth redirect URLs
- Generate callback URLs for providers
- Determine the base URL for redirects

Without it, NextAuth might not correctly generate the Apple OAuth URL, causing it to redirect back to your base URL instead of Apple's Sign-In page.

## After Adding

1. Wait for deployment to complete
2. Test Apple Sign-In again
3. Check logs - you should see NextAuth redirecting to `appleid.apple.com` instead of your base URL
