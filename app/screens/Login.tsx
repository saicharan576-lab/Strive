import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../_context/AuthContext';
import { createOrGetUserProfile } from '../services/userProfileService';

type LoginStep = 'credentials' | 'otp';

const MOBILE_LENGTH = 10;
const OTP_LENGTH = 6;
const COUNTRY_CODE = '+91';

interface OTPInputProps {
  index: number;
  value: string;
  onChangeText: (index: number, value: string) => void;
  onKeyPress: (index: number, key: string) => void;
  inputRef: (ref: TextInput | null) => void;
}

const OTPInput = React.memo<OTPInputProps>(({ index, value, onChangeText, onKeyPress, inputRef }) => (
  <TextInput
    ref={inputRef}
    style={styles.otpInput}
    value={value}
    onChangeText={(text) => onChangeText(index, text)}
    onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
    keyboardType="number-pad"
    maxLength={1}
    textAlign="center"
    selectTextOnFocus
    accessibilityLabel={`OTP digit ${index + 1}`}
  />
));

OTPInput.displayName = 'OTPInput';

const SecurityNote = React.memo(() => (
  <View style={styles.securityNote}>
    <Ionicons name="shield-checkmark" size={12} color="#7C3AED" />
    <Text style={styles.securityText}>
      Your data is encrypted and secure
    </Text>
  </View>
));

SecurityNote.displayName = 'SecurityNote';

export function Login() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const { user, loading: authLoading, signInWithGoogle, refreshAuth, error: authError } = useAuth();

  // Display OAuth errors if any
  useEffect(() => {
    if (authError) {
      setError(authError.message || 'Authentication failed. Please try again.');
    }
  }, [authError]);

  const handleGoogleLogin = useCallback(async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to connect. Please check your internet connection and try again.');
    }
  }, [signInWithGoogle]);

  const handleMobileChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, MOBILE_LENGTH);
    setMobileNumber(cleaned);
    setError('');
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value.trim());
    setError('');
  }, []);

  const handleSendOTP = useCallback(async () => {
    if (mobileNumber.length !== MOBILE_LENGTH) {
      setError(`Please enter a valid ${MOBILE_LENGTH}-digit mobile number`);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Example: await sendOTP({ mobile: mobileNumber, email });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('otp');
      setError('');
      
      // Focus first OTP input after a short delay
      setTimeout(() => otpInputs.current[0]?.focus(), 300);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [mobileNumber]);

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < OTP_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleOtpKeyPress = useCallback((index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleVerifyOTP = useCallback(async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) {
      setError('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Example: await verifyOTP({ mobile: mobileNumber, otp: otpValue });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ OTP verified successfully');

      // After successful OTP verification, create or get user profile
      const userProfile = await createOrGetUserProfile(mobileNumber);

      if (!userProfile) {
        setError('Failed to create user profile. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('✅ User profile ready:', userProfile.User_id);

      // Store login state
      await AsyncStorage.setItem('isLoggedIn', 'true');
      
      if (email) {
        await AsyncStorage.setItem('userEmail', email);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if user has completed onboarding by checking if they have interests saved
      const hasInterests = userProfile.Interest_cat_1 || userProfile.Interest_cat_2 || userProfile.Interest_cat_3;

      if (hasInterests) {
        // User has completed onboarding, mark it in AsyncStorage
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        console.log('🎯 User has completed onboarding (has interests), navigating to home');
        
        // Refresh auth state before navigating
        await refreshAuth();
        router.replace('/(tabs)');
      } else {
        console.log('📋 User needs to complete onboarding (no interests found)');
        
        // Refresh auth state before navigating
        await refreshAuth();
        router.replace('/screens/Interestselection');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Verification failed. Please try again.');
      Alert.alert(
        'Verification Failed',
        'Invalid OTP. Please try again.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
    }
  }, [otp, mobileNumber, email, router]);

  const handleResendOTP = useCallback(async () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimeout(() => otpInputs.current[0]?.focus(), 300);
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBackToCredentials = useCallback(() => {
    setStep('credentials');
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
  }, []);

  const isCredentialsValid = useMemo(() => 
    mobileNumber.length === MOBILE_LENGTH, 
    [mobileNumber]
  );

  const isOtpComplete = useMemo(() => 
    otp.every(digit => digit !== ''), 
    [otp]
  );

  const remainingDigits = useMemo(() => 
    MOBILE_LENGTH - mobileNumber.length,
    [mobileNumber]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'credentials' ? (
            <View style={styles.content}>
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
                  <Text style={styles.logoEmoji}>✨</Text>
                </View>
                <Text style={styles.title}>Welcome to Strive</Text>
                <Text style={styles.subtitle}>
                  Transform your screen time into skill time
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="phone-portrait-outline" size={16} color="#374151" />
                    <Text style={styles.label}>Mobile Number</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.countryCode}>{COUNTRY_CODE}</Text>
                    <TextInput
                      style={styles.phoneInput}
                      value={mobileNumber}
                      onChangeText={handleMobileChange}
                      placeholder={`Enter ${MOBILE_LENGTH}-digit number`}
                      keyboardType="phone-pad"
                      maxLength={MOBILE_LENGTH}
                      placeholderTextColor="#9CA3AF"
                      accessibilityLabel="Mobile number input"
                      accessibilityHint="Enter your 10-digit mobile number"
                    />
                  </View>
                  {mobileNumber && remainingDigits > 0 && (
                    <Text style={styles.helperText}>
                      {remainingDigits} {remainingDigits === 1 ? 'digit' : 'digits'} remaining
                    </Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="mail-outline" size={16} color="#374151" />
                    <Text style={styles.label}>Email Address</Text>
                    <Text style={styles.optionalText}>(Optional)</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                    accessibilityLabel="Email address input"
                    accessibilityHint="Optionally enter your email address"
                  />
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleSendOTP}
                  disabled={!isCredentialsValid || isLoading}
                  style={[
                    styles.primaryButton,
                    (!isCredentialsValid || isLoading) && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Send OTP"
                  accessibilityState={{ disabled: !isCredentialsValid || isLoading }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  disabled={authLoading}
                  style={[
                    styles.googleButton,
                    authLoading && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Login with Google"
                  accessibilityState={{ disabled: authLoading }}
                >
                  {authLoading ? (
                    <ActivityIndicator color="#374151" />
                  ) : (
                    <>
                      <Ionicons name="logo-google" size={20} color="#DB4437" />
                      <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.privacyText}>
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.headerSection}>
                <TouchableOpacity
                  onPress={handleBackToCredentials}
                  style={styles.backButton}
                  accessibilityRole="button"
                  accessibilityLabel="Go back to credentials"
                >
                  <Ionicons name="arrow-back" size={20} color="#4B5563" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                <View style={styles.otpHeaderContent}>
                  <View style={styles.otpLogoContainer}>
                    <Ionicons name="shield-checkmark" size={40} color="#fff" />
                  </View>
                  <Text style={styles.title}>Verify OTP</Text>
                  <Text style={styles.subtitle}>
                    We've sent a {OTP_LENGTH}-digit code to{'\n'}
                    <Text style={styles.phoneHighlight}>{COUNTRY_CODE} {mobileNumber}</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, styles.centerText]}>Enter OTP</Text>
                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <OTPInput
                        key={index}
                        index={index}
                        value={digit}
                        onChangeText={handleOtpChange}
                        onKeyPress={handleOtpKeyPress}
                        inputRef={(ref) => {
                          otpInputs.current[index] = ref;
                        }}
                      />
                    ))}
                  </View>
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, styles.centerText]}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  disabled={!isOtpComplete || isLoading}
                  style={[
                    styles.secondaryButton,
                    (!isOtpComplete || isLoading) && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Verify OTP and continue"
                  accessibilityState={{ disabled: !isOtpComplete || isLoading }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={isLoading}
                    style={[isLoading && styles.linkDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Resend OTP"
                    accessibilityState={{ disabled: isLoading }}
                  >
                    <Text style={styles.linkText}>
                      Didn't receive the code? Resend OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <SecurityNote />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  headerSection: {
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
  },
  optionalText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  countryCode: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    height: 48,
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: '#4B5563',
  },
  otpHeaderContent: {
    alignItems: 'center',
  },
  otpLogoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#14B8A6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  phoneHighlight: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  centerText: {
    textAlign: 'center',
  },
  resendContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  linkDisabled: {
    opacity: 0.5,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  securityText: {
    fontSize: 12,
    color: '#7C3AED',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  googleButton: {
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});

export default Login;