# How to Check Vercel Logs for Apple Sign-In Errors

## Step 1: Access Vercel Logs

1. Go to https://vercel.com/dashboard
2. Select your project: `cardscope-web`
3. Click on the **"Logs"** tab (or go to **Deployments** → Click latest deployment → **"View Function Logs"**)

## Step 2: Trigger Apple Sign-In

1. Open your app: https://cardscope-web.vercel.app/login
2. Click "Continue with Apple"
3. Immediately go back to Vercel Logs

## Step 3: Look for These Log Messages

### Success Indicators:
- `✅ Apple provider initialized successfully`
- `✅ Apple provider ID: apple`
- `🔍 Creating Apple provider with config:`
- `🍎 Apple OAuth redirect detected, allowing through:`

### Error Indicators:
- `❌ NextAuth Error:` - Shows the specific error code
- `❌ Failed to initialize Apple provider:`
- Any error messages containing "Apple" or "OAuth"

## Step 4: Common Error Codes

### `OAUTH_CALLBACK_ERROR`
- **Cause**: Callback URL mismatch or Apple rejected the callback
- **Fix**: Verify Return URL in Apple Developer Console matches exactly

### `OAUTH_SIGNIN_ERROR`
- **Cause**: Error generating OAuth URL
- **Fix**: Check `NEXTAUTH_URL` is set correctly

### `OAUTH_ACCOUNT_LINK_ERROR`
- **Cause**: Account linking issue
- **Fix**: Usually not relevant for initial signin

### `ConfigurationError`
- **Cause**: Missing or invalid environment variables
- **Fix**: Verify all Apple env vars are set in Vercel

## Step 5: Share the Error

Copy the full error message from Vercel logs and share it. The error message will tell us exactly what's wrong.

## Alternative: Check Real-Time Logs

You can also use Vercel CLI to stream logs in real-time:

```bash
vercel logs cardscope-web --follow
```

Then trigger Apple Sign-In and watch the logs appear.
