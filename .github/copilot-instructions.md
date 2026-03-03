# Strive - AI Coding Assistant Instructions

## Project Overview
**Strive** is a React Native mobile app (iOS/Android/Web) built with **Expo SDK 54** and **expo-router** for file-based navigation. It's a social learning/skill-swapping platform with dual authentication (Google OAuth + OTP) powered by Supabase.

## Tech Stack
- **Framework**: Expo ~54.0, React 19.1, React Native 0.81.5
- **Routing**: expo-router ~6.0 (file-based routing)
- **Backend**: Supabase (PostgreSQL, Auth)
- **Navigation**: @react-navigation/material-top-tabs, bottom-tabs
- **State**: React Context API (no Redux/Zustand)
- **Storage**: AsyncStorage for local persistence
- **Language**: TypeScript (strict mode)

## Critical Architecture Patterns

### 1. **Dual Import System - Use Relative Paths in app/**
The project uses **both** @/ alias AND relative imports:
- Files in app/ directory: **ALWAYS use relative imports** (../, ../../)
- Files in root-level components/, hooks/, constants/: Use @/ alias
- Example in app/_layout.tsx:
  ```typescript
  import { useColorScheme } from '@/hooks/use-color-scheme'; // Root-level
  import { AuthProvider, useAuth } from './_context/AuthContext'; // app/ folder
  ```

### 2. **Authentication Architecture - Event-Driven, No Polling**
Two auth methods managed via app/_context/AuthContext.tsx:
- **Google OAuth**: Supabase session (long-term users)
- **OTP Login**: AsyncStorage flags (isLoggedIn, hasCompletedOnboarding, userMobile)

**Critical Pattern**: Always call refreshAuth() after AsyncStorage updates:
```typescript
await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
await refreshAuth(); // Required - updates context immediately
```

Auth guard in app/_layout.tsx handles routing based on segments.

### 3. **File-Based Routing Structure**
- app/(tabs)/ → Main authenticated app (home, explore, create, messages, profile)
- app/screens/ → Full-screen views (Login, Interestselection, learn-service/, teach-service/, swappypartner/)
- app/components/ → Feature-specific UI (auth/, feed/, profile/, swappyfeed/)
- Root components/ → Shared/reusable UI components

### 4. **Component Organization - Barrel Exports**
Follow pattern in app/screens/swappypartner/components/:
```
feature/
├── index.tsx          # Main screen
└── components/
    ├── index.ts       # Barrel export: export { Comp1 } from './comp1';
    ├── comp1.tsx      # camelCase filenames
    └── comp2.tsx
```
Import via barrel: import { Comp1, Comp2 } from '../feature/components'

### 5. **Custom Hooks Pattern**
All custom hooks in app/_hooks/:
- usePosts() - Fetches posts from Supabase, handles refresh
- useAuth() - Exposes auth context (user, loading, signInWithGoogle, signOut, refreshAuth)
- useProviderFilter() - Category filtering for SwappyFeed

Hooks return { data, loading, error, refreshing, refresh } pattern.

### 6. **Supabase Integration**
Initialized in app/supabaseConfig.ts:
- Environment variables: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
- **Development**: Set in .env file (must restart Expo)
- **EAS Builds**: Set in eas.json under build.*.env

Query pattern:
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('field', value)
  .maybeSingle(); // or .single() / no method for array
```

### 7. **Material Top Tabs Implementation**
See app/(tabs)/index.tsx for custom tab bar:
- Uses createMaterialTopTabNavigator with custom styled CustomTabBar
- Two tabs: **Feedy** (social feed) and **Swappy** (skill exchange)
- Custom tab bar is memoized with React.memo

## Development Workflows

### Starting Development
```bash
npm install
npx expo start          # Dev server with QR code
npx expo start --clear  # Clear cache if auth issues
npm run android         # Android emulator
npm run ios             # iOS simulator
```

### Building Apps
For detailed build instructions, refer to the build guide documentation in the repository root.
```bash
eas build --platform android --profile preview  # APK for testing
eas build --platform ios --profile preview      # iOS dev build
eas build --platform all --profile production   # Production builds
```

### OAuth Setup
For detailed OAuth configuration, refer to the OAuth setup documentation in the repository root.
1. Configure redirect URLs in Supabase Dashboard: strive://oauth-callback
2. Enable Google provider with Client ID/Secret
3. Restart Expo after changing `.env`

## Key Conventions

### TypeScript Types
- Store in app/_types/ (e.g., post.ts, review.ts, swappyfeed.ts)
- Use readonly for immutable fields: readonly id: string
- Props interfaces: ComponentNameProps
- Type unions for state: type LoginStep = 'credentials' | 'otp'
- Strict null checks: Functions return Type | null for optional data

### Supabase Schema Conventions
Database uses **snake_case**, TypeScript uses **PascalCase/camelCase**:
```typescript
// Database table: User_Profile
interface UserProfile {
  User_id: string;           // PascalCase in TS
  Mobile_number?: string;    // Maps to mobile_number in DB
  Interest_cat_1?: string;   // Snake case preserved for DB columns
}
```
- Primary identifier: `User_id` (custom generated, not auto-increment)
- Tables: `User_Profile`, `posts` (mixed casing)
- Always query by unique fields: `Mobile_number` for user lookup

### Styling
- Inline StyleSheet.create() in component files
- Theme colors in app/_constants/theme.ts
- Platform-specific adjustments: Platform.OS === 'ios' ? x : y
- Tab bars: Custom heights for iOS (90px) vs Android (60px)

### Component Patterns
**React.memo for Performance**:
```typescript
const CustomTabBar = React.memo(({ state, navigation }) => { ... });
CustomTabBar.displayName = 'CustomTabBar'; // Required for debugging
```

**Modal Overlays**:
```typescript
<Modal visible={true} transparent animationType="slide" statusBarTranslucent>
  <TouchableOpacity style={styles.overlayBackdrop} onPress={onClose} />
  <View style={styles.overlayContent}>{children}</View>
</Modal>
```

**OTP Input Pattern**: Separate TextInput refs in array, auto-focus on input

### Service Layer
- User profile operations in userProfileService module (located in app/services/)
- Caches profile in AsyncStorage after fetch
- Functions: createOrGetUserProfile(), updateUserProfile(), getCachedUserProfile()
- Always pair Supabase writes with AsyncStorage updates

### Data Flow
1. Component → Custom Hook → Supabase query
2. Hook returns { data, loading, error, refreshing, refresh }
3. AsyncStorage used for offline-first data (user profile, onboarding state)
4. Post-mutation: Update AsyncStorage → Call refreshAuth()

## Common Pitfalls

1. **Import Paths**: Never mix @/ and relative imports in same file; use relative in app/
2. **Auth Sync**: Forgetting refreshAuth() after AsyncStorage changes breaks auth flow
3. **Env Variables**: Restart Expo dev server after changing .env
4. **EAS Builds**: Env vars in eas.json override .env for builds
5. **Supabase Queries**: Use .maybeSingle() to avoid errors when record doesn't exist
6. **Navigation**: Auth guard redirects happen in useEffect watching user, loading, segments

## Testing & Debugging
- Check Expo console logs for `🔐 Auth Guard Check:` outputs
- Use `console.log('✅', '❌', '🔄')` emoji prefixes for visibility
- Supabase errors: Check network connectivity and URL configuration
- OAuth issues: Verify redirect URLs match exactly in Supabase Dashboard

**Note**: No test infrastructure currently configured (no Jest/Vitest/Testing Library)

## Deployment

### Local Testing
```bash
npx expo start --clear       # Clear cache
npm run android              # Android emulator
npm run ios                  # iOS simulator (Mac only)
```

### EAS Builds
```bash
# Android APK (quick testing)
eas build --platform android --profile preview

# iOS Development Build
eas build --platform ios --profile preview

# Production (Google Play AAB + App Store)
eas build --platform all --profile production
```

### Environment Configuration
- **Local dev**: Use .env file (restart server after changes)
- **EAS builds**: Variables in eas.json profiles override .env
- **Never commit**: .env to version control (use .env.example)

### App Store/Play Store
- Android: Upload AAB from production build to Google Play Console
- iOS: Requires Apple Developer account ($99/year), upload via Xcode or Transporter
- Bundle IDs: com.strivzy.app (iOS and Android)

## Additional Documentation
Refer to these documentation files in the repository:
- **Auth flow**: Documentation in app context directory
- **Screen reorganization**: Documentation in app screens directory
- **Build process**: Build guide in repository root
- **OAuth setup**: OAuth documentation in repository root
