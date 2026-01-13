import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Types for future database integration
interface ServiceData {
  id?: string;
  serviceTitle: string;
  description: string;
  price: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeachServiceParams {
  skill?: string;
}

// Memoized Header Component
const Header = React.memo<{ onBack: () => void }>(({ onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity 
      onPress={onBack} 
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Go back"
      accessibilityRole="button"
    >
      <Ionicons name="chevron-back" size={24} color="#000" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Offer a Service</Text>
    <View style={{ width: 24 }} />
  </View>
));

Header.displayName = 'Header';

// Memoized Step Indicator Component
const StepIndicator = React.memo(() => (
  <View style={styles.stepIndicator}>
    <View style={styles.stepDot} />
    <View style={[styles.stepLine, { backgroundColor: '#E5E7EB' }]} />
    <View style={[styles.stepDot, { backgroundColor: '#E5E7EB' }]} />
  </View>
));

StepIndicator.displayName = 'StepIndicator';

// Memoized Benefits Section Component
const BenefitsSection = React.memo(() => (
  <View style={styles.benefitsSection}>
    <Text style={styles.benefitsTitle}>Benefits of Teaching</Text>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      <Text style={styles.benefitText}>Earn money or swap skills</Text>
    </View>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      <Text style={styles.benefitText}>Build your professional profile</Text>
    </View>
  </View>
));

BenefitsSection.displayName = 'BenefitsSection';

export default function TeachServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const skill = typeof params.skill === 'string' ? params.skill : '';
  const [serviceTitle, setServiceTitle] = useState(skill);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Memoized validation
  const isFormValid = useMemo(() => {
    return serviceTitle.trim().length > 0 && price.trim().length > 0;
  }, [serviceTitle, price]);

  // Handler for going back
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handler for price input - ensure only valid numbers
  const handlePriceChange = useCallback((text: string) => {
    // Allow only numbers and one decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) {
      setPrice(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setPrice(filtered);
    }
  }, []);

  // Handler for publishing service
  const handlePublish = useCallback(async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // Prepare service data for database
      const serviceData: ServiceData = {
        serviceTitle: serviceTitle.trim(),
        description: description.trim(),
        price: price.trim(),
        createdAt: new Date(),
      };

      // TODO: Replace with actual API call to database
      // Example: await createService(serviceData);
      console.log('Publishing service:', serviceData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      Alert.alert(
        'Success',
        'Your service has been published successfully!',
        [{ text: 'OK', onPress: handleBack }]
      );
    } catch (error) {
      console.error('Error publishing service:', error);
      Alert.alert(
        'Error',
        'Failed to publish service. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, serviceTitle, description, price, handleBack]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header onBack={handleBack} />

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <StepIndicator />

          <Text style={styles.sectionTitle}>Service Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Web Design Mentorship"
              placeholderTextColor="#9CA3AF"
              value={serviceTitle}
              onChangeText={setServiceTitle}
              returnKeyType="next"
              maxLength={100}
              accessibilityLabel="Service title input"
              accessibilityHint="Enter the title of your service"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what you'll teach..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={500}
              accessibilityLabel="Service description input"
              accessibilityHint="Describe what you will teach"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hourly Rate (INR)</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={price}
                onChangeText={handlePriceChange}
                keyboardType="decimal-pad"
                maxLength={10}
                accessibilityLabel="Hourly rate input"
                accessibilityHint="Enter your hourly rate in rupees"
              />
            </View>
          </View>

          <BenefitsSection />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBack}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.publishButton, 
                !isFormValid && styles.publishButtonDisabled
              ]}
              onPress={handlePublish}
              disabled={!isFormValid || isLoading}
              accessibilityRole="button"
              accessibilityLabel="Publish service"
              accessibilityState={{ disabled: !isFormValid || isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.publishButtonText}>Publish</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1, 
    // Removed padding here, moved to contentContainerStyle
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 40, // Extra space at bottom of scroll
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    justifyContent: 'center',
    paddingHorizontal: 40, // Limit width of lines
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10, // Modern slightly rounder corners
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16, // 16px prevents iOS zoom on focus
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingLeft: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  benefitsSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  // New Footer Styles
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    // safe area handling is often automatic inside SafeAreaView, 
    // but explicit padding ensures breathing room
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  publishButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  publishButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});