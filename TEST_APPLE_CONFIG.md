# Test Apple Sign-In Configuration

## Quick Test

After Vercel deploys the latest changes, visit this URL to test your Apple Sign-In configuration:

```
https://cardscope-web.vercel.app/api/test-apple-config
```

## What It Checks

The test endpoint validates:

1. ✅ **Environment Variables** - Checks if all required variables are set:
   - `APPLE_ID`
   - `APPLE_SECRET`
   - `APPLE_TEAM_ID`
   - `APPLE_KEY_ID`

2. ✅ **JWT Token Format** - Validates that `APPLE_SECRET` is a valid JWT token:
   - Correct algorithm (ES256)
   - Valid structure
   - Not expired

3. ✅ **Values Match** - Verifies that JWT token values match environment variables:
   - Team ID matches
   - Key ID matches
   - Services ID matches

4. ✅ **NextAuth Provider** - Confirms Apple provider will be available

## Expected Output

### ✅ Success (All Checks Pass)
```json
{
  "overall": "pass",
  "summary": {
    "totalChecks": 5,
    "passedChecks": 5,
    "failedChecks": 0
  },
  "messages": [
    "✅ All checks passed! Apple Sign-In should work correctly."
  ]
}
```

### ❌ Failure (Issues Found)
```json
{
  "overall": "fail",
  "summary": {
    "totalChecks": 5,
    "passedChecks": 3,
    "failedChecks": 2
  },
  "messages": [
    "⚠️ Some environment variables are missing",
    "❌ JWT token is invalid or malformed"
  ]
}
```

## How to Use

1. **Wait for Vercel deployment** to complete (usually 1-2 minutes after push)

2. **Visit the test URL:**
   ```
   https://cardscope-web.vercel.app/api/test-apple-config
   ```

3. **Check the response:**
   - If `overall: "pass"` → Configuration is correct ✅
   - If `overall: "fail"` → Check the `messages` array for issues

4. **Fix any issues** based on the error messages

## Troubleshooting

### "JWT token is invalid"
- Regenerate the token using `node generate-apple-secret.js`
- Update `APPLE_SECRET` in Vercel

### "Values do not match"
- Verify `APPLE_TEAM_ID` matches the JWT issuer
- Verify `APPLE_KEY_ID` matches the JWT key ID
- Verify `APPLE_ID` matches the JWT subject

### "Some environment variables are missing"
- Go to Vercel → Settings → Environment Variables
- Add any missing variables
- Redeploy

## Local Testing

You can also test locally (if environment variables are set):

```bash
# Start dev server
npm run dev

# Visit
http://localhost:3000/api/test-apple-config
```
