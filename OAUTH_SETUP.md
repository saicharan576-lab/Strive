# Google OAuth Setup Guide

## The "Could not connect to server" error occurs because Supabase needs to be configured properly for OAuth.

Follow these steps to fix the issue:

## 1. Configure Supabase Authentication

### Step 1: Add Redirect URLs in Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `gdjbziwujcxinwkiwwmy`
3. Navigate to **Authentication** → **URL Configuration**
4. Add these URLs to the **Redirect URLs** list:

```
strive://oauth-callback
exp://127.0.0.1:8081
exp://localhost:8081
```

For production (when you deploy):
```
https://your-production-domain.com/oauth-callback
```

### Step 2: Enable Google Provider in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to enable it
3. You'll need to create a Google OAuth App:

## 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add these to **Authorized redirect URIs**:
   ```
   https://gdjbziwujcxinwkiwwmy.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret**

## 3. Configure Google Provider in Supabase

1. Back in Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

## 4. Test the Connection

1. Restart your Expo development server:
   ```bash
   # Press Ctrl+C to stop, then run:
   npx expo start --clear
   ```

2. Try logging in with Google again

## 5. Troubleshooting

### If you still see "could not connect to server":

**Check Network Connection:**
```bash
# Test if Supabase is reachable:
curl https://gdjbziwujcxinwkiwwmy.supabase.co/auth/v1/health
```

**Check Expo Logs:**
- Look in the terminal for detailed error messages
- Check the console logs for the redirect URL being used

**Verify Environment Variables:**
- Make sure `.env` file has correct values
- Restart Expo after changing `.env`

**Common Issues:**

1. **Redirect URL Mismatch**: The URL in Supabase must exactly match what the app generates
2. **Google OAuth Not Configured**: Google provider must be enabled in Supabase
3. **Network Issues**: Check firewall or VPN settings
4. **Expo Development Client**: On physical devices, you may need Expo Go or development build

## 6. Testing on Different Platforms

### iOS Simulator
- Should work with `strive://oauth-callback`

### Android Emulator  
- Should work with `strive://oauth-callback`

### Physical Device (via Expo Go)
- Use the redirect URL shown in console logs
- May need to use `exp://` scheme

## Quick Fix Commands

```bash
# Clear Expo cache and restart
npx expo start --clear

# If using development build
npx expo prebuild --clean

# View all logs
npx expo start --dev-client
```

## Current Configuration

Your app scheme: `strive`
Supabase URL: `https://gdjbziwujcxinwkiwwmy.supabase.co`
OAuth Callback Path: `strive://oauth-callback`

---

After completing these steps, the OAuth login should work correctly!
