import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from './_context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'screens';
    const isLoginScreen = segments[0] === 'screens' && segments[1] === 'Login';
    const isInterestScreen = segments[0] === 'screens' && segments[1] === 'Interestselection';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('🔐 Auth Guard Check:', { 
      user: user ? 'authenticated' : 'not authenticated', 
      loading, 
      segments: segments.join('/'),
      inAuthGroup,
      inTabsGroup
    });

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not already on login/onboarding screens
      console.log('➡️ Redirecting to Login (no user)');
      router.replace('/screens/Login');
    } else if (user && isLoginScreen) {
      // Redirect to tabs if authenticated and on login screen
      console.log('➡️ Redirecting to tabs (already authenticated)');
      router.replace('/(tabs)');
    }
    // Allow Interestselection screen during onboarding flow
  }, [user, loading, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/Login" options={{ headerShown: false }} />
        <Stack.Screen name="screens/Interestselection" options={{ headerShown: false }} />
        <Stack.Screen name="oauth-callback" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
