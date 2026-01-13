import { User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseConfig';

WebBrowser.maybeCompleteAuthSession();

// Get your project URL - change this to your actual Supabase project URL
const SUPABASE_URL = 'https://gdjbziwujcxinwkiwwmy.supabase.co';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Session check error:', err);
        setError(err as Error);
        setLoading(false);
      });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create OAuth redirect URL
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'strive',
        path: 'oauth-callback',
      });

      console.log('Redirect URL:', redirectUrl);

      // Build the OAuth URL
      const oauthUrl = new URL(`${SUPABASE_URL}/auth/v1/oauth/authorize`);
      oauthUrl.searchParams.set('provider', 'google');
      oauthUrl.searchParams.set('client_id', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '');
      oauthUrl.searchParams.set('redirect_to', redirectUrl);
      oauthUrl.searchParams.set('response_type', 'code');

      // Open browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl.toString(),
        redirectUrl
      );

      if (result.type === 'success') {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');

        if (code) {
          // Exchange code for session
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (sessionError) throw sessionError;
          
          if (data.user) {
            setUser(data.user);
          }
        }
      } else if (result.type === 'cancel') {
        console.log('OAuth login cancelled');
        setError(new Error('Login cancelled'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(new Error(errorMessage));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, handleLogin, handleLogout };
};
