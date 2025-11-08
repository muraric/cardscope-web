# Apple App Store Deployment Guide for CardScope

This guide walks you through deploying your Capacitor iOS app to the Apple App Store, including TestFlight beta testing.

## Quick Start: TestFlight Beta Testing

**For testing with a few users, TestFlight is the fastest option:**

1. **Build and upload:**
   ```bash
   ./build-ios-release.sh
   # Then in Xcode: Product → Archive → Distribute to TestFlight
   ```

2. **Add testers in App Store Connect:**
   - Go to TestFlight → Internal Testing (instant) or External Testing (< 24h review)
   - Add testers by email or share public link

3. **Testers install TestFlight app** and receive your app automatically

**Full steps below ↓**

---

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com/programs/
   - Enroll in the Apple Developer Program

2. **macOS Machine with Xcode**
   - Xcode 14+ (latest recommended)
   - Command Line Tools installed
   - CocoaPods installed (`sudo gem install cocoapods`)

3. **App Store Connect Access**
   - Access to your Apple Developer account
   - App Store Connect access (same Apple ID)

## Pre-Deployment Checklist

### ✅ Issues Already Fixed

The following issues have been resolved:
- ✅ **Bundle Identifier**: Fixed mismatch - now consistently `com.shomuran.cardscope` across all configs
- ✅ **Server Configuration**: `server.url` commented out in `capacitor.config.ts` for local bundling
- ✅ **Build Configuration**: Next.js config updated to support both web (standalone) and mobile (export) builds
- ✅ **Build Scripts**: Automated build script created (`build-ios-release.sh`)

### 1. Verify App Configuration

- **App ID**: `com.shomuran.cardscope` ✅ (matches across all configs)
- **Bundle Identifier**: `com.shomuran.cardscope` ✅ (fixed in Xcode project)
- **App Name**: CardScope
- **Display Name**: Credit Card Advisor (in Info.plist)

### 2. Update Version Numbers

In Xcode project settings:
- **Marketing Version** (CFBundleShortVersionString): e.g., `1.0.0`
- **Build Number** (CFBundleVersion): Increment for each build, e.g., `1`, `2`, `3`

## Deployment Options

### Option 1: TestFlight Beta Testing (Recommended for Testing)
TestFlight allows you to distribute your app to up to 10,000 testers without App Store review. Perfect for testing with a few users.

**Benefits:**
- ✅ Faster distribution (no App Store review)
- ✅ Up to 10,000 external testers
- ✅ Get feedback before public release
- ✅ Test multiple builds (up to 100 builds per 90 days)

**Jump to:** [TestFlight Deployment Steps](#testflight-beta-testing)

### Option 2: App Store Production Release
Full App Store submission requires App Store review.

**Jump to:** [App Store Deployment Steps](#app-store-production-release)

---

## TestFlight Beta Testing

### Step 1: Build for TestFlight

#### Option A: Automated Build (Recommended)

```bash
# Navigate to project root
cd /Users/murari/WebstormProjects/cardscope-web

# Run the automated build script
./build-ios-release.sh
```

This script will:
- ✅ Build Next.js app for mobile (static export)
- ✅ Sync Capacitor iOS project
- ✅ Install CocoaPods dependencies
- ✅ Display next steps (you'll need to open Xcode manually)

#### Option B: Manual Build

If you prefer to run steps individually:

```bash
# 1. Build Next.js app for mobile (static export)
npm run build:mobile

# 2. Sync Capacitor iOS project (copies web assets to iOS)
npx cap sync ios

# 3. Install CocoaPods dependencies
cd ios/App
pod install
cd ../..

# 4. Open Xcode
npx cap open ios
```

#### Troubleshooting Build Issues

**If build fails due to API routes:**

Since your app uses Next.js API routes (`app/api/auth/[...nextauth]/route.ts`), static export may fail. You have two options:

1. **Use Remote Server (Easier for TestFlight)**
   ```bash
   # 1. Uncomment server.url in capacitor.config.ts
   # 2. Build normally (not for mobile)
   npm run build
   # 3. Sync Capacitor
   npx cap sync ios
   ```
   - ✅ Works immediately
   - ✅ App loads from Vercel URL
   - ✅ Valid for TestFlight (many apps use remote servers)

2. **Fix for Local Bundling**
   - Ensure mobile app doesn't import NextAuth API routes
   - Mobile uses Capacitor Google Auth plugin (not NextAuth)
   - Remove any client-side imports of `/api/auth/*` routes

**⚠️ Configuration Note**: 
- The iOS config (`ios/App/App/capacitor.config.json`) is auto-generated from `capacitor.config.ts`
- To use local bundling: Comment out `server.url` in `capacitor.config.ts` BEFORE running `npx cap sync ios`
- To use remote server: Uncomment `server.url` in `capacitor.config.ts` BEFORE syncing

### Step 2: Open Xcode Project

```bash
# Open iOS project in Xcode
npx cap open ios
```

### Step 3: Configure Xcode for TestFlight

1. **Select the App Target**
   - Click on "App" in the project navigator
   - Select the "App" target (not the project)

2. **General Tab - Identity**
   - **Display Name**: Credit Card Advisor (or your preferred name)
   - **Bundle Identifier**: `com.shomuran.cardscope` ✅ (already fixed)
   - **Version**: `1.0.0` (Marketing Version - increment for major releases)
   - **Build**: `1` (Build Number - increment for each TestFlight build)

3. **Signing & Capabilities**
   - **Team**: Select your Apple Developer Team
   - **Automatically manage signing**: ✓ (checked)
   - Xcode will automatically create/update provisioning profiles

### Step 4: Create App in App Store Connect (if not done)

1. **Log in to App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

2. **Create New App** (if not already created)
   - Click "+" → "New App"
   - **Platform**: iOS
   - **Name**: CardScope
   - **Primary Language**: English
   - **Bundle ID**: Select `com.shomuran.cardscope` (must match Xcode)
   - **SKU**: Unique identifier (e.g., `cardscope-ios-001`)
   - **User Access**: Full Access or App Manager

### Step 5: Archive and Upload to TestFlight

1. **In Xcode**
   - Select "Any iOS Device" or "Generic iOS Device" as build target
   - Product → Archive (or press Cmd+B then Product → Archive)

2. **Wait for Archive to Complete**
   - Xcode will build and create an archive
   - Organizer window will open automatically

3. **Distribute to TestFlight**
   - In Organizer, select your archive
   - Click "Distribute App"
   - Select "App Store Connect"
   - Select "Upload" (not "Export")
   - Choose your distribution certificate and provisioning profile
   - Review and upload
   - Wait for upload to complete (can take a few minutes)

### Step 6: Configure TestFlight in App Store Connect

1. **Wait for Processing**
   - Go to App Store Connect → Your App → TestFlight tab
   - Wait for the build to process (usually 5-30 minutes)
   - You'll receive an email when processing is complete

2. **Add Test Information** (Required before adding testers)
   - Click on your build
   - Add "What to Test" notes (required for external testers)
   - Example: "Test login flow, card suggestions, and settings page"

3. **Add Internal Testers** (Immediate access, no review)
   - Go to TestFlight → Internal Testing
   - Click "+" to add internal testers
   - Select users from your App Store Connect team
   - Internal testers get access immediately (up to 100 users)

4. **Add External Testers** (Requires review, but fast - usually < 24 hours)
   - Go to TestFlight → External Testing
   - Click "+" to create a new group (e.g., "Beta Testers")
   - Add the build to the group
   - Add testers by email or share a public link
   - External testers need App Store review (usually fast for TestFlight)

### Step 7: Invite Testers

**For Internal Testers:**
- They'll receive an email invitation
- They need to install TestFlight app from App Store
- They can install your app directly from TestFlight

**For External Testers:**
- They'll receive an email invitation
- Or share the public TestFlight link
- They need to install TestFlight app from App Store
- First-time external builds need brief review (usually < 24 hours)

### Step 8: Managing TestFlight Builds

- **Update Build**: Increment build number and repeat steps 1-5
- **Test Multiple Builds**: Testers can test multiple builds simultaneously
- **Collect Feedback**: Testers can submit feedback directly through TestFlight
- **Monitor Crashes**: View crash reports in App Store Connect

---

## App Store Production Release

### Step 1: Build for iOS App Store

You can use the automated build script:

```bash
# Navigate to project root
cd /Users/murari/WebstormProjects/cardscope-web

# Run the automated build script
./build-ios-release.sh
```

**Or manually:**

```bash
# Build Next.js app for mobile (static export)
npm run build:mobile

# Sync Capacitor iOS project
npx cap sync ios

# Install CocoaPods dependencies
cd ios/App
pod install
cd ../..
```

**Note**: If the build fails due to API routes, you have two options:
1. **Use remote server** (valid for App Store): Uncomment `server.url` in `capacitor.config.ts` and use `npm run build` instead
2. **Fix API routes**: Ensure mobile app doesn't reference NextAuth API routes (since it uses Capacitor Google Auth plugin)

### Step 2: Open Xcode Project

```bash
# Open iOS project in Xcode
npx cap open ios
```

### Step 3: Configure Xcode Project

1. **Open Xcode Project**
   ```bash
   cd ios/App
   open App.xcworkspace
   ```
   ⚠️ **Important**: Always open `.xcworkspace`, not `.xcodeproj`

2. **Select the App Target**
   - Click on "App" in the project navigator
   - Select the "App" target (not the project)

3. **General Tab - Identity**
   - **Display Name**: Credit Card Advisor (or your preferred name)
   - **Bundle Identifier**: `com.shomuran.cardscope` (must match App Store Connect)
   - **Version**: `1.0.0` (Marketing Version)
   - **Build**: `1` (Build Number - increment for each submission)

4. **Signing & Capabilities**
   - **Team**: Select your Apple Developer Team
   - **Automatically manage signing**: ✓ (checked)
   - Xcode will automatically create/update provisioning profiles

5. **Verify Deployment Target**
   - Should be iOS 14.0+ (as set in Podfile)

### Step 4: Configure App Store Connect

1. **Log in to App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

2. **Create New App** (if not already created)
   - Click "+" → "New App"
   - **Platform**: iOS
   - **Name**: CardScope
   - **Primary Language**: English
   - **Bundle ID**: Select `com.shomuran.cardscope` (must match Xcode)
   - **SKU**: Unique identifier (e.g., `cardscope-ios-001`)
   - **User Access**: Full Access or App Manager

3. **App Information**
   - Fill in app description, keywords, support URL
   - Upload app icon (1024x1024 PNG)
   - Upload screenshots for different device sizes
   - Set age rating
   - Set pricing and availability

4. **App Privacy**
   - Complete privacy questionnaire
   - Describe data collection practices

### Step 5: Archive and Build for App Store

1. **In Xcode**
   - Select "Any iOS Device" or "Generic iOS Device" as build target
   - Product → Archive (or press Cmd+B then Product → Archive)

2. **Wait for Archive to Complete**
   - Xcode will build and create an archive
   - Organizer window will open automatically

3. **Validate Archive**
   - In Organizer, select your archive
   - Click "Validate App"
   - Fix any issues that appear
   - Common issues:
     - Missing icons
     - Incorrect provisioning profiles
     - Missing compliance documentation

4. **Distribute Archive**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Select "Upload"
   - Choose your distribution certificate and provisioning profile
   - Review and upload

### Step 6: Submit for App Store Review

1. **In App Store Connect**
   - Go to your app → "App Store" tab
   - Under "Build", click "+" to select your uploaded build
   - Wait for processing (can take 15-60 minutes)

2. **Complete App Store Listing**
   - Add screenshots (required for each device size)
   - Write app description
   - Add keywords
   - Set categories
   - Provide support URL
   - Set contact information

3. **Submit for Review**
   - Click "Submit for Review"
   - Answer export compliance questions
   - Submit

### Step 7: Monitor Submission

- Check email for updates
- Check App Store Connect for status
- Typical review time: 24-48 hours (can be longer)

## TestFlight vs App Store: Key Differences

| Feature | TestFlight | App Store |
|---------|-----------|-----------|
| **Review Required** | Only for external testers (fast, < 24h) | Yes (24-48 hours) |
| **Max Testers** | 10,000 external + 100 internal | Unlimited |
| **Build Limit** | 100 builds per 90 days | No limit |
| **Distribution** | Via TestFlight app | Public App Store |
| **Version Info** | Minimal (What to Test notes) | Full listing required |
| **Best For** | Beta testing, feedback | Public release |

## Troubleshooting Common Issues

### Issue: Bundle Identifier Mismatch
**Solution**: Update Xcode project bundle identifier to match capacitor.config.ts (`com.shomuran.cardscope`)

### Issue: Missing Icons
**Solution**: Ensure AppIcon assets are complete (all required sizes)

### Issue: Code Signing Errors
**Solution**: 
- Verify Apple Developer account membership
- Check automatic signing is enabled
- Clean build folder (Product → Clean Build Folder)

### Issue: Archive Not Appearing
**Solution**:
- Ensure "Any iOS Device" is selected (not simulator)
- Check build succeeded without errors

### Issue: Upload Fails
**Solution**:
- Verify internet connection
- Check App Store Connect status
- Try using Transporter app as alternative

### Issue: TestFlight Build Not Appearing
**Solution**:
- Wait 5-30 minutes for processing
- Check email for processing completion notification
- Verify build number is unique (increment if needed)
- Check App Store Connect → TestFlight → Processing tab

### Issue: External Testers Can't Install
**Solution**:
- Ensure "What to Test" notes are added (required)
- Wait for external testing review (usually < 24 hours)
- Verify testers have TestFlight app installed
- Check that build is added to external testing group

## Build Scripts (Optional)

You can create a script to automate the build process:

```bash
#!/bin/bash
# build-ios-release.sh

echo "Building Next.js app..."
npm run build

echo "Syncing Capacitor..."
npx cap sync ios

echo "Installing CocoaPods..."
cd ios/App
pod install
cd ../..

echo "Opening Xcode..."
npx cap open ios
```

## Additional Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)

## Notes

- **Bundle ID**: Ensure consistency across:
  - `capacitor.config.ts` → `appId`
  - Xcode project → `PRODUCT_BUNDLE_IDENTIFIER`
  - App Store Connect → Bundle ID

- **Version Management**: Always increment build number for each App Store submission

- **Testing**: Test thoroughly on physical devices before submission

- **Privacy**: Ensure you have privacy policy URL and complete privacy questionnaire

- **Icons**: App icon must be 1024x1024 PNG without transparency

