# Authentication Architecture

## Overview

This app uses a scalable, context-based authentication system that supports multiple authentication methods:
- **Google OAuth** via Supabase
- **OTP-based login** via AsyncStorage

## Architecture

### AuthContext (`AuthContext.tsx`)

Centralized authentication state management using React Context API.

#### Key Features:

1. **Single Source of Truth**: All auth state is managed in one place
2. **Event-Driven Updates**: 
   - Listens to Supabase auth state changes
   - Monitors app state (foreground/background)
   - Handles deep links for OAuth callbacks
3. **No Polling**: Uses event listeners instead of intervals
4. **Manual Refresh**: Exposes `refreshAuth()` for explicit state updates

#### API:

```typescript
interface AuthContextType {
  user: User | null;           // Current authenticated user
  loading: boolean;            // Auth check in progress
  error: Error | null;         // Authentication errors
  signInWithGoogle: () => Promise<void>;  // Google OAuth login
  signOut: () => Promise<void>;           // Logout (clears all sessions)
  refreshAuth: () => Promise<void>;       // Manually refresh auth state
}
```

### Usage

#### 1. Wrap your app with AuthProvider

```tsx
// app/_layout.tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

#### 2. Use the hook in components

```tsx
import { useAuth } from '../_context/AuthContext';

function MyComponent() {
  const { user, loading, signInWithGoogle, signOut, refreshAuth } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!user) {
    return <Button onPress={signInWithGoogle}>Sign In</Button>;
  }
  
  return <Button onPress={signOut}>Sign Out</Button>;
}
```

#### 3. Call refreshAuth after AsyncStorage updates

```tsx
// After saving onboarding data
await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
await refreshAuth(); // Immediately updates auth state
```

## Authentication Flow

### Google OAuth Flow:
1. User clicks "Continue with Google"
2. `signInWithGoogle()` → Opens browser
3. User authenticates → Returns to app
4. Supabase session created → User state updated
5. Auth guard redirects to app

### OTP Login Flow:
1. User enters mobile + OTP
2. Saves `isLoggedIn: true` in AsyncStorage
3. Completes interest selection
4. Saves `hasCompletedOnboarding: true`
5. Calls `refreshAuth()` → User state updated
6. Auth guard allows access to app

## Best Practices

### ✅ DO:
- Use `refreshAuth()` after updating AsyncStorage auth-related data
- Handle loading states in components
- Use the auth guard in _layout.tsx for route protection

### ❌ DON'T:
- Access AsyncStorage auth data directly in components
- Create local user state in components (use context)
- Poll/setInterval for auth changes (use event listeners)

## Scalability

### Why This Is Scalable:

1. **Event-Driven**: Responds to actual changes, not polling
2. **Centralized**: One place to manage all auth logic
3. **Extensible**: Easy to add new auth methods (Apple, Facebook, etc.)
4. **Type-Safe**: Full TypeScript support
5. **Performant**: 
   - Auth state cached in memory
   - Only checks storage on mount and when explicitly refreshed
   - App state listener refreshes auth when app comes to foreground

### Adding New Auth Methods:

```typescript
// In AuthContext.tsx

export const AuthProvider = ({ children }) => {
  // Add new method
  const signInWithApple = useCallback(async () => {
    // Implementation
  }, []);

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithApple, // ← Add here
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Migration from Old Hook

Old code:
```tsx
const { user, loading, handleLogin, handleLogout } = useAuth();
```

New code:
```tsx
const { user, loading, signInWithGoogle, signOut, refreshAuth } = useAuth();
```

## Performance Optimizations

1. **Memoized callbacks** - All functions use `useCallback`
2. **Single auth check on mount** - No continuous polling
3. **Strategic refresh** - Only when app becomes active or explicitly called
4. **Promise.all** - Parallel AsyncStorage reads

## Testing

```typescript
// Mock the auth context for testing
jest.mock('../_context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '123', email: 'test@example.com' },
    loading: false,
    error: null,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    refreshAuth: jest.fn(),
  }),
}));
```
