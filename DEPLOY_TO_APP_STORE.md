# Deploy CardCompass to Apple App Store

This guide walks you through deploying your iOS app to the App Store, including TestFlight beta testing.

## Prerequisites

✅ **Required:**
- Apple Developer Account ($99/year) - [Sign up here](https://developer.apple.com/programs/)
- macOS with Xcode installed
- App Store Connect access (same Apple ID as Developer account)

## Quick Start: TestFlight (Recommended First Step)

TestFlight allows you to test with up to 10,000 users before App Store release.

### Step 1: Build the App

Since your app uses a remote server (configured in `capacitor.config.ts`), you can build normally:

```bash
cd /Users/murari/WebstormProjects/cardscope-web

# Build Next.js app
npm run build

# Sync with Capacitor iOS
npx cap sync ios

# Install CocoaPods (if needed)
cd ios/App && export LANG=en_US.UTF-8 && pod install && cd ../..
```

### Step 2: Open Xcode

```bash
npx cap open ios
```

**Important:** Always open the `.xcworkspace` file, not `.xcodeproj`

### Step 3: Configure Xcode Project

1. **Select the App Target**
   - Click "App" in the project navigator (left sidebar)
   - Select the "App" target (not the project)

2. **General Tab - Identity**
   - **Display Name**: `CardCompass` (or your preferred name)
   - **Bundle Identifier**: `com.shomuran.cardcompass` ✅ (already configured)
   - **Version**: `1.0.0` (Marketing Version - increment for major releases)
   - **Build**: `1` (Build Number - increment for each upload)

3. **Signing & Capabilities**
   - **Team**: Select your Apple Developer Team
   - **Automatically manage signing**: ✓ Checked
   - Xcode will automatically create/update provisioning profiles

### Step 4: Create App in App Store Connect

1. **Log in to App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

2. **Create New App** (if not already created)
   - Click "+" → "New App"
   - **Platform**: iOS
   - **Name**: CardCompass
   - **Primary Language**: English
   - **Bundle ID**: Select `com.shomuran.cardcompass` (must match Xcode)
   - **SKU**: Unique identifier (e.g., `cardcompass-ios-001`)
   - **User Access**: Full Access or App Manager

### Step 5: Archive and Upload to TestFlight

1. **In Xcode**
   - Select **"Any iOS Device"** or **"Generic iOS Device"** as build target (NOT a simulator)
   - **Product → Archive** (or press `Cmd+B` then Product → Archive)
   - Wait for archive to complete (may take a few minutes)

2. **Organizer Window Opens**
   - Select your archive
   - Click **"Distribute App"**

3. **Distribution Options**
   - Select **"App Store Connect"**
   - Click **"Next"**
   - Select **"Upload"** (not Export)
   - Click **"Next"**
   - Review app information
   - Click **"Upload"**
   - Wait for upload to complete (shows progress)

### Step 6: Configure TestFlight

1. **Wait for Processing** (5-30 minutes)
   - Go to App Store Connect → Your App → **TestFlight** tab
   - Build will show as "Processing"
   - You'll receive an email when processing is complete

2. **Add Test Information** (Required)
   - Click on your build
   - Add **"What to Test"** notes:
     ```
     Test the following features:
     - Login/authentication flow with Google
     - Store detection using location services
     - Credit card recommendations
     - Settings and preferences
     ```

3. **Add Testers**

   **Internal Testers** (Instant access, no review):
   - Go to TestFlight → **Internal Testing**
   - Click "+" to add testers
   - Select users from your App Store Connect team
   - Up to 100 internal testers

   **External Testers** (Requires review, usually < 24 hours):
   - Go to TestFlight → **External Testing**
   - Click "+" to create a new group (e.g., "Beta Testers")
   - Add your build to the group
   - Add testers by email or share a public link
   - Up to 10,000 external testers

### Step 7: Testers Install App

Testers need to:
1. Install **TestFlight** app from App Store
2. Accept invitation email (or use public link)
3. Open TestFlight app
4. Tap **"Install"** next to your app

---

## App Store Production Release

Once you've tested via TestFlight and are ready for public release:

### Step 1: Complete App Store Listing

1. **Go to App Store Connect**
   - Navigate to your app → **App Store** tab

2. **App Information**
   - App description (up to 4,000 characters)
   - Keywords (up to 100 characters)
   - Support URL: https://shomuran.com (or your support page)
   - Marketing URL (optional)
   - Privacy Policy URL: https://cardscope-web.vercel.app/privacy (or your privacy policy)

3. **App Privacy**
   - Complete privacy questionnaire
   - Describe data collection practices
   - Your privacy policy is already available at `/privacy`

4. **Pricing and Availability**
   - Set price (Free or Paid)
   - Select countries/regions
   - Set availability date

5. **App Store Preview**
   - Upload screenshots (required for each device size):
     - iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)
     - iPhone 6.5" (iPhone 11 Pro Max, XS Max)
     - iPhone 5.5" (iPhone 8 Plus)
     - iPad Pro 12.9" (if supporting iPad)
   - App preview video (optional)
   - App icon: 1024x1024 PNG (no transparency)

### Step 2: Build and Upload for App Store

Follow the same steps as TestFlight (Steps 1-5 above), but:

1. **Increment Build Number** in Xcode (e.g., `1` → `2`)
2. **Archive** the app
3. **Upload** to App Store Connect

### Step 3: Submit for Review

1. **In App Store Connect**
   - Go to your app → **App Store** tab
   - Under **"Build"**, click **"+"** to select your uploaded build
   - Wait for processing (15-60 minutes)

2. **Complete Submission**
   - Review all app information
   - Answer export compliance questions
   - Click **"Submit for Review"**

3. **Review Process**
   - Typical review time: **24-48 hours**
   - You'll receive email updates
   - Check App Store Connect for status

### Step 4: After Approval

- App will be available on the App Store
- You can set release date (immediate or scheduled)
- Monitor reviews and ratings
- Update app as needed with new builds

---

## Important Configuration Details

### Bundle Identifier
- **Current**: `com.shomuran.cardcompass` ✅
- Must match across:
  - `capacitor.config.ts` → `appId`
  - Xcode project → `PRODUCT_BUNDLE_IDENTIFIER`
  - App Store Connect → Bundle ID

### Server Configuration
- Your app uses **remote server**: `https://cardscope-web.vercel.app`
- This is **valid for App Store** (many apps use remote servers)
- Configured in `capacitor.config.ts` → `server.url`

### Version Management
- **Marketing Version** (CFBundleShortVersionString): e.g., `1.0.0`
  - Increment for major releases (1.0.0 → 2.0.0)
- **Build Number** (CFBundleVersion): e.g., `1`, `2`, `3`
  - Increment for each upload (even if version stays same)

### Required Assets
- ✅ App Icon: 1024x1024 PNG (no transparency)
- ✅ Screenshots: Required for each device size you support
- ✅ Privacy Policy URL: Required

---

## Troubleshooting

### Build Fails with API Routes Error
**Solution**: Your app already uses remote server, so this shouldn't occur. If it does:
- Ensure `server.url` is set in `capacitor.config.ts`
- Use `npm run build` (not `npm run build:mobile`)

### Code Signing Errors
- Verify Apple Developer account membership is active
- Check "Automatically manage signing" is enabled
- Select correct Team in Xcode
- Clean build folder: **Product → Clean Build Folder** (`Shift+Cmd+K`)

### Upload Fails
- Check internet connection
- Verify App Store Connect status
- Try using **Transporter** app as alternative
- Ensure build number is unique (increment if needed)

### TestFlight Build Not Appearing
- Wait 5-30 minutes for processing
- Check email for processing completion
- Verify build number is unique
- Check App Store Connect → TestFlight → Processing tab

### External Testers Can't Install
- Ensure "What to Test" notes are added (required)
- Wait for external testing review (usually < 24 hours)
- Verify testers have TestFlight app installed
- Check that build is added to external testing group

---

## Quick Reference Commands

```bash
# Full build and sync process
npm run build && npx cap sync ios && cd ios/App && export LANG=en_US.UTF-8 && pod install && cd ../.. && npx cap open ios

# Just sync (after code changes)
npx cap sync ios

# Open Xcode
npx cap open ios
```

---

## Next Steps After Deployment

1. **Monitor Analytics**: Check App Store Connect for downloads, ratings, reviews
2. **Respond to Reviews**: Engage with user feedback
3. **Update Regularly**: Release updates with bug fixes and new features
4. **Marketing**: Promote your app through various channels

---

## Additional Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)

---

**Need Help?** Check the detailed documentation:
- `APP_STORE_DEPLOYMENT.md` - Comprehensive deployment guide
- `TESTFLIGHT_STEPS.md` - Quick TestFlight reference
- `IOS_RUN_DEPLOY.md` - Running and testing locally
