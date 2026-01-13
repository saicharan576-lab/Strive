import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoginScreenProps {
  onLogin: () => void;
  loading?: boolean;
}

export const LoginScreen = React.memo<LoginScreenProps>(({ onLogin, loading }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.content}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>Strive</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        Welcome to Strive!
      </Text>
      <Text style={styles.subtitle}>
        Connect, Learn, and Grow Together
      </Text>
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={onLogin}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Login with Google"
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login with Google'}
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
));

LoginScreen.displayName = 'LoginScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
