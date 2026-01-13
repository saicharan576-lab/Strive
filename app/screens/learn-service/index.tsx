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
interface LearningRequest {
  id?: string;
  skillName: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  budget: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'pending' | 'matched' | 'completed';
}

interface LearnServiceParams {
  skill?: string;
}

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

const EXPERIENCE_OPTIONS: readonly { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

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
    <Text style={styles.headerTitle}>Find a Mentor</Text>
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
    <Text style={styles.benefitsTitle}>What to expect</Text>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
      <Text style={styles.benefitText}>Matched with qualified mentors</Text>
    </View>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
      <Text style={styles.benefitText}>Flexible scheduling</Text>
    </View>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
      <Text style={styles.benefitText}>Pay or swap your skills</Text>
    </View>
  </View>
));

BenefitsSection.displayName = 'BenefitsSection';

// Memoized Experience Option Button Component
interface ExperienceOptionProps {
  option: { value: ExperienceLevel; label: string };
  isSelected: boolean;
  onPress: (value: ExperienceLevel) => void;
}

const ExperienceOption = React.memo<ExperienceOptionProps>(({ option, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.optionButton,
      isSelected && styles.optionButtonActive,
    ]}
    onPress={() => onPress(option.value)}
    activeOpacity={0.7}
    accessibilityRole="radio"
    accessibilityState={{ checked: isSelected }}
    accessibilityLabel={`${option.label} level`}
  >
    <Text
      style={[
        styles.optionText,
        isSelected && styles.optionTextActive,
      ]}
      adjustsFontSizeToFit
      numberOfLines={1}
    >
      {option.label}
    </Text>
  </TouchableOpacity>
));

ExperienceOption.displayName = 'ExperienceOption';

export default function LearnServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const skill = typeof params.skill === 'string' ? params.skill : '';
  const [skillName, setSkillName] = useState(skill);
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Memoized validation
  const isFormValid = useMemo(() => {
    return skillName.trim().length > 0 && budget.trim().length > 0;
  }, [skillName, budget]);

  // Handler for going back
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handler for budget input - ensure only valid numbers
  const handleBudgetChange = useCallback((text: string) => {
    // Allow only numbers and one decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) {
      setBudget(parts[0] + '.' + parts.slice(1).join(''));
    } else {
      setBudget(filtered);
    }
  }, []);

  // Handler for experience level change
  const handleExperienceChange = useCallback((value: ExperienceLevel) => {
    setExperience(value);
  }, []);

  // Handler for submitting learning request
  const handleSubmit = useCallback(async () => {
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // Prepare learning request data for database
      const learningRequest: LearningRequest = {
        skillName: skillName.trim(),
        experience,
        description: description.trim(),
        budget: budget.trim(),
        status: 'pending',
        createdAt: new Date(),
      };

      // TODO: Replace with actual API call to database
      // Example: await createLearningRequest(learningRequest);
      console.log('Learning request:', learningRequest);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      Alert.alert(
        'Success',
        'Your request has been submitted! We\'ll match you with mentors soon.',
        [{ text: 'OK', onPress: handleBack }]
      );
    } catch (error) {
      console.error('Error submitting learning request:', error);
      Alert.alert(
        'Error',
        'Failed to submit request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [isFormValid, skillName, experience, description, budget, handleBack]);

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

          <Text style={styles.sectionTitle}>Learning Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>What do you want to learn?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Web Design, Python"
              placeholderTextColor="#9CA3AF"
              value={skillName}
              onChangeText={setSkillName}
              maxLength={100}
              accessibilityLabel="Skill name input"
              accessibilityHint="Enter the skill you want to learn"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Current Level</Text>
            <View style={styles.optionsContainer}>
              {EXPERIENCE_OPTIONS.map((option) => (
                <ExperienceOption
                  key={option.value}
                  option={option}
                  isSelected={experience === option.value}
                  onPress={handleExperienceChange}
                />
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>What are your goals?</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What specifically do you want to achieve?"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={500}
              accessibilityLabel="Goals description input"
              accessibilityHint="Describe what you want to achieve"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget per hour (INR)</Text>
            <View style={styles.budgetInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.budgetInput}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={budget}
                onChangeText={handleBudgetChange}
                keyboardType="decimal-pad"
                maxLength={10}
                accessibilityLabel="Budget input"
                accessibilityHint="Enter your hourly budget in rupees"
              />
              <Text style={styles.orText}>or swap skills</Text>
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
                styles.submitButton,
                !isFormValid && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
              accessibilityRole="button"
              accessibilityLabel="Find mentors"
              accessibilityState={{ disabled: !isFormValid || isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Find Mentors</Text>
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
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16, // Fixed for iOS
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12, // Increased touch target
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF', // Lighter blue background
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  budgetInputContainer: {
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
  budgetInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  orText: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingRight: 14,
  },
  benefitsSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
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
  // Footer Styles
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  submitButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});