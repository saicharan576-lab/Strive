import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { supabase } from './supabaseConfig';

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('📱 OAuth callback received with params:', params);
        const { code, error: urlError } = params;

        if (urlError) {
          console.error('❌ OAuth error from URL:', urlError);
          router.replace('/(tabs)');
          return;
        }

        if (code && typeof code === 'string') {
          console.log('🔄 Exchanging code for session...');
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('❌ Session exchange error:', error);
            router.replace('/(tabs)');
            return;
          }

          if (data.session) {
            console.log('✅ Login successful!');
            console.log('👤 User:', data.session.user.email);
            console.log('🎫 Session expires at:', new Date(data.session.expires_at! * 1000));
            router.replace('/(tabs)');
          }
        } else {
          console.log('⚠️ No code in callback');
          router.replace('/(tabs)');
        }
      } catch (err) {
        console.error('Callback error:', err);
        router.replace('/(tabs)');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8A2BE2" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
