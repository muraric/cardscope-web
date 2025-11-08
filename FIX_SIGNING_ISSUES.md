# Fix Xcode Signing Issues

## Errors You're Seeing

1. **"Communication with Apple failed"** - Xcode can't communicate with Apple Developer services
2. **"No profiles for 'com.shomuran.cardscope' were found"** - No provisioning profile exists

## Solution Steps

### Step 1: Verify Apple Developer Account

1. **Check Xcode Account Settings**
   - Xcode → Settings (or Preferences) → Accounts
   - Ensure your Apple Developer account is added
   - Click your account → Click "Download Manual Profiles" button

2. **Verify Account Status**
   - Make sure your Apple Developer Program membership is active ($99/year)
   - Check at: https://developer.apple.com/account/

### Step 2: Register a Device

You need at least one registered device for Xcode to create provisioning profiles.

**Option A: Connect Physical Device (Easiest)**
1. Connect your iPhone/iPad via USB
2. Unlock the device and trust the computer
3. In Xcode, go to Window → Devices and Simulators
4. Your device should appear
5. Xcode will automatically register it

**Option B: Add Device Manually**
1. Go to https://developer.apple.com/account/resources/devices/list
2. Click "+" to add a new device
3. Enter your device UDID (find it in Settings → General → About)
4. Name it (e.g., "My iPhone")
5. Save

### Step 3: Create App ID in Apple Developer Portal

1. **Go to App Store Connect**
   - Visit: https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

2. **Create the App** (if not already created)
   - Click "+" → "New App"
   - Platform: iOS
   - Name: CardScope
   - Bundle ID: `com.shomuran.cardscope`
   - SKU: `cardscope-ios-001` (or any unique identifier)
   - Click "Create"

### Step 4: Fix Signing in Xcode

1. **In Xcode, Select Your Target**
   - Click "App" in project navigator
   - Select "App" target (not project)
   - Go to "Signing & Capabilities" tab

2. **Configure Signing**
   - **Team**: Select your Apple Developer Team from dropdown
   - **Automatically manage signing**: ✓ Check this box
   - **Bundle Identifier**: Should show `com.shomuran.cardscope`

3. **If Team Dropdown is Empty**
   - Go to Xcode → Settings → Accounts
   - Click "+" to add Apple ID
   - Sign in with your Apple Developer account
   - Return to Signing & Capabilities
   - Select your team

4. **Click "Try Again" Button**
   - Xcode will attempt to create provisioning profiles automatically

### Step 5: Manual Profile Creation (If Auto-Fix Fails)

1. **Go to Apple Developer Portal**
   - Visit: https://developer.apple.com/account/resources/profiles/list

2. **Create Provisioning Profile**
   - Click "+" to create new profile
   - Select "App Store" (for TestFlight/App Store)
   - OR "iOS App Development" (for development/testing)
   - Select App ID: `com.shomuran.cardscope`
   - Select Certificate: Choose your distribution certificate
   - Select Devices: Choose registered devices
   - Name it: "CardScope App Store" or "CardScope Development"
   - Download the profile

3. **Install Profile in Xcode**
   - Double-click the downloaded `.mobileprovision` file
   - OR drag it onto Xcode icon
   - OR in Xcode: Xcode → Settings → Accounts → Your Account → Download Manual Profiles

### Step 6: Clean and Rebuild

1. **Clean Build Folder**
   - Product → Clean Build Folder (Shift+Cmd+K)

2. **Verify Signing**
   - Check Signing & Capabilities tab again
   - Should show green checkmark ✓

3. **Build**
   - Product → Build (Cmd+B)
   - Should complete without signing errors

## Quick Fix Checklist

- [ ] Apple Developer account is active ($99/year membership)
- [ ] Account added in Xcode → Settings → Accounts
- [ ] At least one device registered (connected or manually added)
- [ ] App created in App Store Connect with bundle ID `com.shomuran.cardscope`
- [ ] Team selected in Xcode Signing & Capabilities
- [ ] "Automatically manage signing" is checked
- [ ] Clicked "Try Again" or refreshed profiles

## Common Issues

**"No devices registered"**
- Connect a physical iOS device via USB
- Or manually add device UDID in developer portal

**"Team not found"**
- Add Apple ID in Xcode → Settings → Accounts
- Verify account has active Developer Program membership

**"Bundle ID not found"**
- Create app in App Store Connect first
- Or create App ID in developer portal: https://developer.apple.com/account/resources/identifiers/list

**"Communication failed"**
- Check internet connection
- Verify Apple Developer account is active
- Try signing out and back into Xcode accounts
- Restart Xcode

## For TestFlight Specifically

For TestFlight uploads, you need:
- **Distribution Certificate** (not Development)
- **App Store Provisioning Profile** (not Development)
- These are created automatically when you archive for App Store Connect

If signing fails when archiving:
1. Ensure you're archiving for "Any iOS Device" (not simulator)
2. Team should be selected
3. Xcode will create distribution profiles automatically

## Still Having Issues?

1. **Check Apple Developer Status**
   - https://developer.apple.com/support/
   - Ensure membership is active

2. **Verify Bundle ID**
   - Should be exactly: `com.shomuran.cardscope`
   - Must match in Xcode, App Store Connect, and Developer Portal

3. **Contact Apple Developer Support**
   - If account issues persist

