# Quick Steps to Deploy to TestFlight

## ✅ Pre-flight Checklist

- [x] Bundle identifier fixed: `com.shomuran.cardscope`
- [x] Location permissions added to Info.plist
- [x] Remote server configured (using Vercel URL)
- [x] Capacitor configured correctly

## Step 1: Build the App

```bash
# Navigate to project root
cd /Users/murari/WebstormProjects/cardscope-web

# Build Next.js app
npm run build

# Sync Capacitor iOS project
npx cap sync ios
```

## Step 2: Open Xcode

```bash
npx cap open ios
```

## Step 3: Configure in Xcode

1. **Select Target**: Click "App" in project navigator → Select "App" target

2. **General Tab**:
   - **Bundle Identifier**: `com.shomuran.cardscope` ✅
   - **Version**: `1.0.0` (Marketing Version)
   - **Build**: `1` (or increment if you've uploaded before)

3. **Signing & Capabilities**:
   - **Team**: Select your Apple Developer Team
   - **Automatically manage signing**: ✓ Checked

## Step 4: Archive the App

1. **Select Build Target**: 
   - Choose "Any iOS Device" or "Generic iOS Device" (NOT a simulator)

2. **Create Archive**:
   - Product → Archive (or `Cmd+B` then Product → Archive)
   - Wait for build to complete (may take a few minutes)

3. **Organizer Opens Automatically**

## Step 5: Upload to TestFlight

1. **In Organizer Window**:
   - Select your archive
   - Click "Distribute App"

2. **Select Distribution Method**:
   - Choose "App Store Connect"
   - Click "Next"

3. **Select Distribution Options**:
   - Choose "Upload" (not Export)
   - Click "Next"

4. **Review & Upload**:
   - Review app information
   - Click "Upload"
   - Wait for upload to complete (shows progress)

## Step 6: Configure in App Store Connect

1. **Go to App Store Connect**
   - Visit: https://appstoreconnect.apple.com
   - Navigate to your app → TestFlight tab

2. **Wait for Processing** (5-30 minutes)
   - Build will show as "Processing"
   - You'll receive an email when ready

3. **Add Test Information** (Required)
   - Click on your build
   - Add "What to Test" notes:
     ```
     Test the following features:
     - Login/authentication flow
     - Store detection using location
     - Credit card suggestions
     - Settings page
     ```

## Step 7: Add Testers

### Option A: Internal Testers (Instant Access)
1. Go to TestFlight → Internal Testing
2. Click "+" to add testers
3. Select users from your App Store Connect team
4. They get access immediately (up to 100 users)

### Option B: External Testers (Requires Review, < 24h)
1. Go to TestFlight → External Testing
2. Click "+" to create group (e.g., "Beta Testers")
3. Add your build to the group
4. Add testers by email or share public link
5. First build needs brief review (usually < 24 hours)

## Step 8: Testers Install App

**Testers need to:**
1. Install TestFlight app from App Store
2. Accept invitation email (or use public link)
3. Open TestFlight app
4. Tap "Install" next to your app

## Troubleshooting

### Upload Fails
- Check internet connection
- Verify Apple Developer account is active
- Try again (sometimes temporary server issues)

### Build Not Appearing
- Wait 5-30 minutes for processing
- Check email for completion notification
- Verify build number is unique (increment if needed)

### Code Signing Errors
- Verify Team is selected in Xcode
- Check "Automatically manage signing" is enabled
- Ensure Apple Developer account membership is active

### Location Permission Not Showing
- ✅ Already fixed in Info.plist
- Rebuild and upload new build if testing old version

## Quick Commands Reference

```bash
# Full build process
npm run build && npx cap sync ios && npx cap open ios

# Increment build number in Xcode before each upload:
# General Tab → Build → Increment number
```

## Next Build

For subsequent TestFlight builds:
1. Increment Build number in Xcode (e.g., 1 → 2)
2. Repeat Steps 1-5
3. Upload new build
4. Add to same TestFlight group

---

**Need Help?** Check `APP_STORE_DEPLOYMENT.md` for detailed documentation.

