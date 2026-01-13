import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and anon key
// Get these from your Supabase project settings: https://app.supabase.com
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gdjbziwujcxinwkiwwmy.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkamJ6aXd1amN4aW53a2l3d215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNTUxMjYsImV4cCI6MjA3ODczMTEyNn0.JBXrKCws2foRqOkMaLUugX0sfC3qeRNe1uJIXNRAvfw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
