# Troubleshooting: Apple Sign-In Button Not Showing

## Issue
The Apple Sign-In button is not visible in the iOS app even though it's in the code.

## Possible Causes & Solutions

### 1. Vercel Deployment Cache
**Problem**: iOS app WebView might be caching the old version.

**Solution**: Force cache refresh
- Close the iOS app completely
- Reopen the app
- Or: In iOS Simulator, go to Device → Erase All Content and Settings, then rebuild

### 2. Vercel Deployment Not Complete
**Problem**: Changes might not have deployed yet.

**Solution**: Check Vercel deployment
1. Go to https://vercel.com/dashboard
2. Check your project's latest deployment
3. Verify it shows the latest commit (with "Add Sign in with Apple" message)
4. Wait for deployment to complete (green checkmark)

### 3. Verify Deployment
**Test the web version directly:**
1. Open browser and go to: `https://cardscope-web.vercel.app/login`
2. Check if Apple Sign-In button is visible
3. If visible on web but not in iOS app → caching issue
4. If not visible on web → deployment issue

### 4. Hard Refresh iOS App
**In Xcode:**
1. Stop the app (if running)
2. Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
3. Delete derived data (optional): Xcode → Settings → Locations → Derived Data → Delete
4. Rebuild and run

### 5. Check Capacitor Config
**Verify the app is loading from Vercel:**
1. Check `ios/App/App/capacitor.config.json`
2. Should have: `"server": { "url": "https://cardscope-web.vercel.app" }`
3. If not, run: `npx cap sync ios`

### 6. Verify Code is Deployed
**Check the actual deployed code:**
1. Visit: `https://cardscope-web.vercel.app/login`
2. View page source (right-click → View Source)
3. Search for "Continue with Apple"
4. If found → code is deployed, issue is iOS caching
5. If not found → deployment didn't include the changes

### 7. Force iOS WebView Cache Clear
**Add cache-busting query parameter:**
Update `capacitor.config.ts` temporarily:
```typescript
server: {
    url: 'https://cardscope-web.vercel.app?v=' + Date.now(),
}
```
Then run `npx cap sync ios` and rebuild.

### 8. Check Build Logs
**Verify Vercel build succeeded:**
1. Go to Vercel dashboard → Your project → Deployments
2. Click on latest deployment
3. Check build logs for errors
4. Verify all files were built correctly

## Quick Test Checklist

- [ ] Check web version: `https://cardscope-web.vercel.app/login` - Is button visible?
- [ ] Check Vercel deployment status - Is it complete?
- [ ] Check latest commit - Does it include Apple Sign-In changes?
- [ ] Close and reopen iOS app
- [ ] Clean build in Xcode
- [ ] Verify `capacitor.config.json` has correct server URL

## If Still Not Working

1. **Verify the commit was pushed:**
   ```bash
   git log --oneline -5
   ```
   Should see: "Add Sign in with Apple and Account Deletion features"

2. **Check if files are in repo:**
   ```bash
   git ls-files | grep login
   ```

3. **Redeploy manually:**
   - Go to Vercel dashboard
   - Click "Redeploy" on latest deployment
   - Or trigger new deployment

4. **Check browser console:**
   - Open Safari Web Inspector (for iOS Simulator)
   - Check for JavaScript errors
   - Verify the button element exists in DOM
