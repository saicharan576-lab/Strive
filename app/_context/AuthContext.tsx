import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import { supabase } from '../supabaseConfig';

WebBrowser.maybeCompleteAuthSession();

// Types
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check authentication state (Supabase + AsyncStorage)
  const checkAuth = useCallback(async () => {
    try {
      // First check Supabase session (Google OAuth)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Only log on initial check, not on every call
        setUser(session.user);
        return;
      }

      // If no Supabase session, check AsyncStorage for OTP login
      const [isLoggedIn, hasCompletedOnboarding, userMobile] = await Promise.all([
        AsyncStorage.getItem('isLoggedIn'),
        AsyncStorage.getItem('hasCompletedOnboarding'),
        AsyncStorage.getItem('userMobile'),
      ]);
      
      if (isLoggedIn === 'true' && hasCompletedOnboarding === 'true' && userMobile) {
        // Create a user object for OTP-based login
        setUser({
          id: userMobile,
          phone: userMobile,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Session check error:', err);
      setError(err as Error);
      setUser(null);
    }
  }, []);

  // Refresh auth state (can be called manually)
  const refreshAuth = useCallback(async () => {
    console.log('🔄 Manually refreshing auth state...');
    setLoading(true);
    await checkAuth();
    setLoading(false);
  }, [checkAuth]);

  // Google OAuth Sign In
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'strive',
        path: 'oauth-callback',
      });

      console.log('🔗 Redirect URL:', redirectUrl);
      console.log('📱 Platform:', Platform.OS);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        }
      });

      if (oauthError) {
        console.error('❌ OAuth initiation error:', oauthError);
        throw oauthError;
      }

      if (!data?.url) {
        throw new Error('No OAuth URL returned from Supabase');
      }

      console.log('🌐 Opening OAuth URL:', data.url);

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      
      console.log('🔍 OAuth result:', result);

      if (result.type === 'success') {
        console.log('✅ OAuth success, processing URL...');
        const url = result.url;
        
        // Parse hash fragment for tokens (implicit flow)
        const hashParams = new URLSearchParams(url.split('#')[1]);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Check query params for code (PKCE flow)
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const error_param = urlObj.searchParams.get('error');

        if (error_param) {
          throw new Error(`OAuth error: ${error_param}`);
        }

        // Handle tokens directly (implicit flow)
        if (accessToken && refreshToken) {
          console.log('🔄 Setting session with tokens...');
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          if (sessionData.session) {
            console.log('✅ Login successful!');
            console.log('👤 User:', sessionData.session.user.email);
            setUser(sessionData.session.user);
          }
        }
        // Handle code (PKCE flow)
        else if (code) {
          console.log('🔄 Exchanging code for session...');
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

          if (sessionError) throw sessionError;

          if (sessionData.session) {
            console.log('✅ Login successful!');
            console.log('👤 User:', sessionData.session.user.email);
            setUser(sessionData.session.user);
          }
        }
      } else if (result.type === 'cancel') {
        console.log('⚠️ OAuth cancelled by user');
        setError(new Error('Login cancelled'));
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(new Error(errorMessage));
      console.error('❌ Login error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      console.log('🚪 Starting logout process...');
      setLoading(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log('✅ Supabase signOut complete');
      
      // Clear AsyncStorage for OTP-based login
      await Promise.all([
        AsyncStorage.removeItem('isLoggedIn'),
        AsyncStorage.removeItem('userMobile'),
        AsyncStorage.removeItem('userEmail'),
        AsyncStorage.removeItem('userInterests'),
        AsyncStorage.removeItem('hasCompletedOnboarding'),
      ]);
      console.log('✅ AsyncStorage cleared');
      
      setUser(null);
      setError(null);
      console.log('✅ User logged out successfully - user state set to null');
    } catch (err) {
      setError(err as Error);
      console.error('❌ Logout error:', err);
    } finally {
      setLoading(false);
      console.log('✅ Logout process complete');
    }
  }, []);

  // Initialize auth and set up listeners
  useEffect(() => {
    let isActive = true;

    // Initial auth check
    const initAuth = async () => {
      console.log('🔐 Initializing auth...');
      await checkAuth();
      if (isActive) {
        setLoading(false);
        console.log('✅ Auth initialized');
      }
    };

    initAuth();

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('👤 User logged in:', session.user.email);
        if (isActive) setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out from Supabase');
        // Don't recheck auth immediately after sign out
        // The signOut function will handle clearing everything
      }
    });

    // Handle deep links for OAuth callback
    const handleDeepLink = async (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      
      try {
        const url = new URL(event.url);
        const code = url.searchParams.get('code');
        const error_param = url.searchParams.get('error');

        if (error_param) {
          console.error('❌ OAuth error from deep link:', error_param);
          return;
        }

        if (code) {
          console.log('🔄 Code received via deep link, exchanging...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('❌ Session exchange error:', error);
            return;
          }

          if (data.session && isActive) {
            console.log('✅ Login successful via deep link!');
            console.log('👤 User:', data.session.user.email);
            setUser(data.session.user);
          }
        }
      } catch (err) {
        console.error('❌ Deep link handling error:', err);
      }
    };

    // Listen for incoming deep links
    const linkSubscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 App opened with URL:', url);
        handleDeepLink({ url });
      }
    });

    // Listen for app state changes (foreground/background)
    // Refresh auth when app comes to foreground
    let previousAppState = AppState.currentState;
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (previousAppState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App became active, refreshing auth...');
        checkAuth();
      }
      previousAppState = nextAppState;
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      isActive = false;
      subscription?.unsubscribe();
      linkSubscription.remove();
      appStateSubscription?.remove();
    };
  }, []); // Remove checkAuth from dependencies

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
