# iOS App - Run & Deploy Guide

## ✅ Build Complete

Your iOS app is built and ready. Xcode should now be open.

## Step 1: Run the App (Testing)

### On Simulator

1. **Select Simulator**
   - At the top of Xcode, click the device dropdown
   - Choose an iPhone simulator (e.g., "iPhone 15 Pro")

2. **Run**
   - Click the Play button (▶️) or press `Cmd+R`
   - Wait for build and launch

### On Physical Device

1. **Connect Device**
   - Connect iPhone/iPad via USB
   - Unlock device and trust computer

2. **Select Device**
   - In Xcode device dropdown, select your device
   - If device isn't listed, check:
     - Device is unlocked
     - "Trust This Computer" is accepted
     - Developer mode is enabled (iOS 16+)

3. **Configure Signing** (if needed)
   - Select "App" target → Signing & Capabilities
   - Select your Apple Developer Team
   - Ensure "Automatically manage signing" is checked

4. **Run**
   - Click Play button (▶️) or press `Cmd+R`
   - First run may take longer (installing provisioning profile)

## Step 2: Deploy to TestFlight

### Build for TestFlight

1. **Select Build Target**
   - At top of Xcode, select "Any iOS Device" (NOT a simulator)

2. **Archive**
   - Product → Archive (or `Cmd+B` then Product → Archive)
   - Wait for archive to complete (few minutes)

3. **Distribute**
   - In Organizer window that opens:
     - Select your archive
     - Click "Distribute App"
     - Choose "App Store Connect"
     - Select "Upload"
     - Follow prompts

### Configure in App Store Connect

1. **Go to App Store Connect**
   - Visit: https://appstoreconnect.apple.com
   - Navigate to your app → TestFlight tab

2. **Wait for Processing** (5-30 minutes)
   - Build will show as "Processing"
   - You'll receive email when ready

3. **Add Test Information**
   - Click on your build
   - Add "What to Test" notes (required)

4. **Add Testers**
   - **Internal Testing**: Instant access (up to 100 users)
   - **External Testing**: < 24h review (up to 10,000 users)

## Step 3: Deploy to App Store (Production)

1. **Complete Store Listing**
   - App description, screenshots, keywords
   - Privacy policy URL
   - Content rating

2. **Submit for Review**
   - Go to App Store tab
   - Select your build
   - Click "Submit for Review"
   - Review time: 24-48 hours

## Quick Commands

```bash
# Build and sync iOS
npm run build && npx cap sync ios

# Install CocoaPods (if needed)
cd ios/App && export LANG=en_US.UTF-8 && pod install

# Open Xcode
npx cap open ios
```

## Troubleshooting

### "Communication with Apple failed"
- Connect a physical device (required for provisioning)
- Check Apple Developer account is active
- Try signing out/in Xcode accounts

### "No profiles found"
- Select your Team in Signing & Capabilities
- Connect a device to register it
- Click "Try Again"

### Build Fails
- Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
- Check for signing errors
- Verify all dependencies installed

### Can't Run on Device
- Check device is trusted
- Verify Developer Mode enabled (Settings → Privacy & Security → Developer Mode)
- Check signing certificate is valid

---

**Status**: ✅ Ready to run and deploy!

