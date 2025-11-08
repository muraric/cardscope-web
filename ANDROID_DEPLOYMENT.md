# Android App Deployment Guide

## ✅ Build Complete!

Your Android App Bundle (AAB) has been successfully built and signed.

**Build Details:**
- **Version**: 1.0.20
- **Version Code**: 20
- **Package**: com.shomuran.cardscope
- **File**: `android/app/build/outputs/bundle/release/app-release.aab`

## Deployment Options

### Option 1: Google Play Store (Production)

1. **Go to Google Play Console**
   - Visit: https://play.google.com/console
   - Sign in with your Google Play Developer account ($25 one-time fee)

2. **Create App** (if not already created)
   - Click "Create app"
   - Fill in app details:
     - App name: CardScope
     - Default language: English
     - App or game: App
     - Free or paid: Your choice
   - Accept terms and create

3. **Upload AAB**
   - Go to your app → Production (or Testing) → Create new release
   - Click "Upload" under "App bundles and APKs"
   - Select: `android/app/build/outputs/bundle/release/app-release.aab`
   - Upload the file

4. **Release Checklist**
   - [ ] Store listing (description, screenshots, etc.)
   - [ ] Content rating questionnaire
   - [ ] Privacy policy URL
   - [ ] App icon (512x512 PNG)
   - [ ] Feature graphic (1024x500 PNG)
   - [ ] Screenshots for different device sizes

5. **Submit for Review**
   - Review all information
   - Click "Start rollout to Production"
   - Wait for review (usually 1-3 days)

### Option 2: Internal Testing / Closed Testing

1. **Go to Testing Tracks**
   - Google Play Console → Your app → Testing
   - Choose: Internal testing, Closed testing, or Open testing

2. **Create Test Track** (if needed)
   - Click "Create new release"
   - Upload AAB file
   - Add release notes
   - Save

3. **Add Testers**
   - **Internal Testing**: Up to 100 testers (email list)
   - **Closed Testing**: Specific groups, email list, or Google Groups
   - **Open Testing**: Public beta (anyone can join)

4. **Share Testing Link**
   - Testers receive an opt-in link
   - They can install from Google Play Store

### Option 3: Direct APK Installation (Ad-hoc)

If you need to distribute directly (not through Play Store):

1. **Build APK instead of AAB**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   APK location: `android/app/build/outputs/apk/release/app-release.apk`

2. **Distribute APK**
   - Share via email, file sharing, or website
   - Users need to enable "Install from unknown sources"
   - ⚠️ **Not recommended** for production (security risk)

## Quick Commands

### Build Release AAB
```bash
cd android
./gradlew bundleRelease
```

### Build Release APK
```bash
cd android
./gradlew assembleRelease
```

### Clean and Rebuild
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

### Check Build Info
```bash
# View AAB details
aapt dump badging android/app/build/outputs/bundle/release/app-release.aab | grep -E "package|versionCode|versionName"
```

## Version Management

Current version is managed in `android/app/build.gradle`:
```gradle
versionCode 20        // Increment for each release
versionName "1.0.20"  // User-facing version
```

**To update version:**
1. Edit `android/app/build.gradle`
2. Increment `versionCode` (required for each Play Store upload)
3. Update `versionName` if needed (e.g., "1.0.21")

## Signing

Your app is signed with:
- **Keystore**: `android/app/cardscope.keystore`
- **Key Alias**: cardscope
- **Password**: cardscope

⚠️ **IMPORTANT**: Keep your keystore file safe! If you lose it, you cannot update your app on Play Store.

**Backup your keystore:**
```bash
cp android/app/cardscope.keystore ~/backups/
```

## App Requirements Checklist

Before submitting to Play Store:

- [x] App icon (all sizes) ✅ Updated
- [x] App signed with release keystore ✅
- [x] Version code incremented ✅
- [ ] Store listing information
- [ ] Screenshots (at least 2, up to 8)
- [ ] Feature graphic (1024x500)
- [ ] Privacy policy URL
- [ ] Content rating completed
- [ ] App description (at least 80 characters)
- [ ] Short description (at least 30 characters)

## Troubleshooting

### Build Fails: "SDK location not found"
- Ensure `android/local.properties` exists with `sdk.dir` set
- Or set `ANDROID_HOME` environment variable

### Upload Fails: "Version code already exists"
- Increment `versionCode` in `build.gradle`
- Rebuild AAB

### Signing Errors
- Verify keystore file exists: `android/app/cardscope.keystore`
- Check passwords match in `build.gradle`

### Play Console Errors
- Ensure all required store listing fields are filled
- Complete content rating questionnaire
- Add privacy policy URL if app collects data

## Next Steps

1. **Upload AAB to Google Play Console**
   - File: `android/app/build/outputs/bundle/release/app-release.aab`
   - Size: Check with `ls -lh` command

2. **Complete Store Listing**
   - Add description, screenshots, graphics
   - Set pricing and distribution

3. **Submit for Review**
   - Review can take 1-3 days
   - You'll receive email notifications

---

**Status**: ✅ AAB built successfully and ready for upload!

**AAB Location**: `android/app/build/outputs/bundle/release/app-release.aab`

