import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { supabase } from '../supabaseConfig';

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check both Supabase session AND AsyncStorage for OTP-based login
    const checkAuth = async () => {
      try {
        // First check Supabase session (Google OAuth)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Active Supabase session found for:', session.user.email);
          setUser(session.user);
          setLoading(false);
          return;
        }

        // If no Supabase session, check AsyncStorage for OTP login
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        const userMobile = await AsyncStorage.getItem('userMobile');
        
        if (isLoggedIn === 'true' && hasCompletedOnboarding === 'true' && userMobile) {
          console.log('✅ Active OTP session found for:', userMobile);
          // Create a mock user object for OTP-based login
          setUser({
            id: userMobile,
            phone: userMobile,
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
          } as User);
        } else {
          console.log('ℹ️ No active session');
          setUser(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Session check error:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    checkAuth();

    // Set up an interval to periodically check AsyncStorage for OTP login updates
    // This handles cases where AsyncStorage is updated (e.g., after completing onboarding)
    const intervalId = setInterval(() => {
      checkAuth();
    }, 1000); // Check every second

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event);
      if (session?.user) {
        console.log('👤 User logged in:', session.user.email);
        setUser(session?.user ?? null);
      } else {
        // If signed out from Supabase, recheck AsyncStorage
        checkAuth();
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

          if (data.session) {
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

    return () => {
      clearInterval(intervalId);
      subscription?.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create OAuth redirect URL using Expo's proxy (more reliable than custom schemes)
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'strive',
        path: 'oauth-callback',
      });

      console.log('🔗 Redirect URL:', redirectUrl);
      console.log('📱 Platform:', Platform.OS);

      // Use Supabase's built-in OAuth method
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

      // Open browser for OAuth and wait for result
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      
      console.log('🔍 OAuth result:', result);

      if (result.type === 'success') {
        console.log('✅ OAuth success, processing URL...');
        const url = result.url;
        
        // Parse hash fragment for tokens (Supabase implicit flow)
        const hashParams = new URLSearchParams(url.split('#')[1]);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Also check query params for code (PKCE flow)
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
      } else {
        console.log('⚠️ OAuth result type:', result.type);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(new Error(errorMessage));
      console.error('❌ Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear AsyncStorage for OTP-based login
      await Promise.all([
        AsyncStorage.removeItem('isLoggedIn'),
        AsyncStorage.removeItem('userMobile'),
        AsyncStorage.removeItem('userEmail'),
        AsyncStorage.removeItem('userInterests'),
        AsyncStorage.removeItem('hasCompletedOnboarding'),
      ]);
      
      setUser(null);
      setError(null);
      console.log('✅ User logged out successfully');
    } catch (err) {
      setError(err as Error);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, handleLogin, handleLogout };
};
