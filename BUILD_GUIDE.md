# Build Guide - Android & iOS Apps

## Prerequisites

✅ EAS CLI installed (already done)
✅ eas.json created (already done)
✅ app.json configured (already done)

## Step 1: Create/Login to Expo Account

**Option A: Create New Account**
```bash
# Visit https://expo.dev/signup
# Or run:
npx expo register
```

**Option B: Login to Existing Account**
```bash
eas login
```

## Step 2: Build Android APK

### For Testing (APK - Quick Install)
```bash
# Build APK that can be installed directly on Android devices
eas build --platform android --profile preview
```

**What happens:**
- Build takes ~10-20 minutes
- You'll get a download link
- Download the APK to your phone
- Enable "Install from Unknown Sources" in Settings
- Install and test!

### For Production (AAB - Google Play)
```bash
# Build app bundle for Play Store
eas build --platform android --profile production
```

## Step 3: Build iOS App

### For Testing (Development Build)
```bash
# Build for testing on your iPhone
eas build --platform ios --profile preview
```

**Requirements for iOS:**
- Apple Developer Account (paid - $99/year)
- Device UDID registered in Apple Developer Portal
- Provisioning profile configured

### For Production (App Store)
```bash
# Build for App Store submission
eas build --platform ios --profile production
```

## Step 4: Build Both Platforms at Once

```bash
# Build Android APK and iOS simultaneously
eas build --platform all --profile preview
```

## Alternative: Local Build (No Expo Account Needed)

### Android APK - Local Build
```bash
# Install dependencies
npm install

# Generate native Android project
npx expo prebuild --platform android

# Build APK locally (requires Android Studio/SDK)
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### iOS - Local Build
```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Open Xcode project
open ios/Strive.xcworkspace

# Build from Xcode (requires Mac)
```

## Quick Testing Without Building

### Use Expo Go (Limitations Apply)

1. **Install Expo Go** on your phone:
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Start development server:**
   ```bash
   npx expo start
   ```

3. **Scan QR code** with Expo Go app

**Note:** Expo Go doesn't support custom native code or certain packages like Google OAuth might have limitations.

## Recommended: Build Android APK First

### Complete Command Sequence:

```bash
# 1. Login to Expo (create account if needed)
eas login

# 2. Configure project (if not done)
eas build:configure

# 3. Build Android APK for testing
eas build --platform android --profile preview --non-interactive

# 4. Wait for build to complete (~15 minutes)
# 5. Download APK from the link provided
# 6. Transfer to your Android phone
# 7. Install and test!
```

## Troubleshooting

### "Not logged in" error
```bash
# Try logging in with browser
eas login --web
```

### Build fails
```bash
# Clear cache and retry
eas build --platform android --profile preview --clear-cache
```

### Need to update app version
Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1"  // Increment this
  }
}
```

## Install APK on Android Device

1. **Transfer APK** to your phone (USB, Email, or Cloud)
2. **Enable Unknown Sources:**
   - Settings → Security → Unknown Sources (enable)
   - Or Settings → Apps → Special access → Install unknown apps
3. **Install APK** by tapping on it
4. **Open and test** your app!

## Install IPA on iOS Device

1. **Using TestFlight (Recommended):**
   - Upload build to App Store Connect
   - Invite testers via TestFlight
   - Testers install from TestFlight app

2. **Using Ad-Hoc Distribution:**
   - Requires registered device UDIDs
   - Install via Xcode or third-party tools

## Current Configuration

**Package Name:** `com.strivzy.app`
**Bundle ID:** `com.strivzy.app`
**Version:** `1.0.0`
**App Name:** `Strive`

## Next Steps

1. ✅ Create Expo account at https://expo.dev
2. ✅ Run `eas login` to authenticate
3. ✅ Run build command for your platform
4. ✅ Download and install on your device
5. ✅ Test all features!

## Build Status

Check your builds at: https://expo.dev/accounts/[your-username]/projects/strive/builds

---

**Need Help?**
- Expo Docs: https://docs.expo.dev/build/introduction/
- EAS Build: https://docs.expo.dev/build/setup/
