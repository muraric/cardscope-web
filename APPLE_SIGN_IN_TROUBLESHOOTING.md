# Apple Sign-In Troubleshooting Guide

## Current Issue
Clicking "Continue with Apple" redirects to `/login?error=apple`, indicating NextAuth failed to initialize the Apple provider.

## Diagnostic Steps

### Step 1: Check Debug Endpoint
After deployment, visit:
```
https://cardscope-web.vercel.app/api/auth/debug-apple
```

This will show:
- Environment variables status
- Provider initialization errors
- NextAuth configuration

### Step 2: Verify Apple Developer Console Configuration

The most common issue is **Return URLs not matching**. Check:

1. **Go to Apple Developer Console**
   - https://developer.apple.com/account/resources/identifiers/list
   - Select your Services ID: `com.shomuran.cardcompass.web`
   - Click "Configure" under "Sign in with Apple"

2. **Verify Return URLs**
   NextAuth expects this callback URL:
   ```
   https://cardscope-web.vercel.app/api/auth/callback/apple
   ```
   
   Make sure this EXACT URL is in your "Return URLs" list in Apple Developer Console.

3. **Verify Domain**
   Domain should be:
   ```
   cardscope-web.vercel.app
   ```
   (No https://, no paths)

### Step 3: Common Issues

#### Issue 1: Return URL Mismatch
**Symptom**: `error=apple` when clicking button
**Solution**: 
- Add `https://cardscope-web.vercel.app/api/auth/callback/apple` to Return URLs
- Ensure it matches exactly (case-sensitive, must include https://)

#### Issue 2: Domain Not Verified
**Symptom**: Apple Sign-In page doesn't appear
**Solution**:
- Verify domain ownership in Apple Developer Console
- Add verification file to your website root (if required)

#### Issue 3: JWT Token Format
**Symptom**: Provider initialization fails
**Solution**:
- Ensure `APPLE_SECRET` is a valid JWT token (not the raw private key)
- Regenerate using `node generate-apple-secret.js` if needed

#### Issue 4: Services ID Mismatch
**Symptom**: "Invalid client" error
**Solution**:
- Verify `APPLE_ID` in Vercel matches your Services ID exactly
- Check for typos or extra spaces

### Step 4: Test NextAuth Providers Endpoint

Visit:
```
https://cardscope-web.vercel.app/api/auth/providers
```

This should return:
```json
{
  "google": { ... },
  "apple": { ... }
}
```

If `apple` is missing, the provider isn't being initialized.

### Step 5: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for errors related to Apple Sign-In
3. Check for "Apple provider" or "APPLE" in error messages

## Quick Fix Checklist

- [ ] Return URL `https://cardscope-web.vercel.app/api/auth/callback/apple` is in Apple Developer Console
- [ ] Domain `cardscope-web.vercel.app` is verified in Apple Developer Console
- [ ] All 4 environment variables are set in Vercel
- [ ] `APPLE_SECRET` is a valid JWT token (not expired)
- [ ] `APPLE_ID` matches Services ID exactly
- [ ] Vercel deployment completed successfully
- [ ] Test endpoint shows all checks passing

## Next Steps After Fixing

1. Update Return URLs in Apple Developer Console if needed
2. Redeploy Vercel (or wait for auto-deploy)
3. Test Apple Sign-In button again
4. Check `/api/auth/providers` to confirm Apple provider is available
