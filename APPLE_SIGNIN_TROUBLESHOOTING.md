# Apple Sign-In Troubleshooting Guide

## Current Issue
NextAuth redirect callback is receiving only the base URL (`https://cardscope-web.vercel.app`) instead of Apple's OAuth URL (`https://appleid.apple.com/...`). This means NextAuth isn't generating the Apple OAuth URL properly.

## Root Cause
NextAuth needs proper configuration to generate OAuth URLs. The most common causes are:

1. **Missing `NEXTAUTH_URL` environment variable**
2. **Apple provider not properly initialized**
3. **Invalid Apple credentials**

## Step-by-Step Fix

### 1. Verify Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
- `NEXTAUTH_URL` = `https://cardscope-web.vercel.app` (Production, Preview, Development)
- `APPLE_ID` = Your Apple Services ID (e.g., `com.cardscope.web`)
- `APPLE_SECRET` = Your JWT token (generated with `generate-apple-secret.js`)
- `NEXTAUTH_SECRET` = A random secret string

### 2. Test Configuration

After adding/updating variables, test the configuration:

```bash
# Test endpoint
curl https://cardscope-web.vercel.app/api/test-apple-config

# Debug endpoint
curl https://cardscope-web.vercel.app/api/auth/debug-signin

# Check providers
curl https://cardscope-web.vercel.app/api/auth/providers
```

### 3. Verify Apple Developer Console

In Apple Developer Console → Certificates, Identifiers & Profiles → Identifiers:

1. **Services ID** (your `APPLE_ID`):
   - ✅ Configured for "Sign in with Apple"
   - ✅ Return URLs include: `https://cardscope-web.vercel.app/api/auth/callback/apple`
   - ✅ Domains include: `cardscope-web.vercel.app` (without `https://`)

2. **App ID** (for iOS app):
   - ✅ "Sign in with Apple" capability enabled

3. **Key** (for generating `APPLE_SECRET`):
   - ✅ Key ID matches `APPLE_KEY_ID`
   - ✅ Team ID matches `APPLE_TEAM_ID`

### 4. Check NextAuth Logs

After clicking "Continue with Apple", check Vercel logs for:

- `✅ Apple provider initialized successfully` - Provider is configured
- `🔍 Redirect callback - URL: ...` - Should show Apple OAuth URL, not base URL
- Any error messages about Apple provider initialization

### 5. Common Issues

#### Issue: Redirect callback receives base URL
**Cause:** `NEXTAUTH_URL` not set or incorrect
**Fix:** Add `NEXTAUTH_URL=https://cardscope-web.vercel.app` to Vercel

#### Issue: Apple provider not available
**Cause:** `APPLE_ID` or `APPLE_SECRET` missing/invalid
**Fix:** Verify environment variables and regenerate `APPLE_SECRET` if needed

#### Issue: "Invalid client" error from Apple
**Cause:** Return URL mismatch in Apple Developer Console
**Fix:** Ensure Return URL exactly matches: `https://cardscope-web.vercel.app/api/auth/callback/apple`

## Expected Behavior

When clicking "Continue with Apple":

1. Browser redirects to `/api/auth/signin/apple`
2. NextAuth generates Apple OAuth URL: `https://appleid.apple.com/auth/authorize?...`
3. Browser redirects to Apple's sign-in page
4. User authenticates with Apple
5. Apple redirects back to `/api/auth/callback/apple`
6. NextAuth processes the callback
7. User is redirected to your app

## Debug Endpoints

- `/api/test-apple-config` - Tests Apple configuration
- `/api/auth/debug-signin` - Inspects Apple provider setup
- `/api/auth/providers` - Lists available providers

## Next Steps

1. ✅ Add `NEXTAUTH_URL` to Vercel (if not already added)
2. ✅ Verify all environment variables are set
3. ✅ Redeploy Vercel project
4. ✅ Test Apple Sign-In button
5. ✅ Check Vercel logs for errors
6. ✅ Verify Apple Developer Console configuration

If issues persist after these steps, check Vercel logs for specific error messages.
