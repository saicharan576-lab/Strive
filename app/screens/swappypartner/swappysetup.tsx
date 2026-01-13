import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface SkillWithLevel {
  name: string;
  level: 'Beginner' | 'Amateur' | 'Intermediate' | 'Expert';
}

interface SwappyProfile {
  bio?: string;
  skillsToOffer?: SkillWithLevel[];
  skillsToLearn?: SkillWithLevel[];
  availability?: string;
  isActivated?: boolean;
}

interface SwappySetupProps {
  swappyProfile: SwappyProfile;
  setSwappyProfile: (profile: SwappyProfile) => void;
  onCancel?: () => void;
  visible: boolean;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const SKILL_LEVELS: Array<'Beginner' | 'Amateur' | 'Intermediate' | 'Expert'> = [
  'Beginner',
  'Amateur',
  'Intermediate',
  'Expert',
];

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner':
      return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' };
    case 'Amateur':
      return { bg: '#DCFCE7', text: '#166534', border: '#BBDBF7' };
    case 'Intermediate':
      return { bg: '#FED7AA', text: '#92400E', border: '#FDBA74' };
    case 'Expert':
      return { bg: '#E9D5FF', text: '#581C87', border: '#D8B4FE' };
    default:
      return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
  }
};

export function SwappySetup({
  swappyProfile,
  setSwappyProfile,
  onCancel,
  visible,
}: SwappySetupProps) {
  const [skillsToOffer, setSkillsToOffer] = useState<SkillWithLevel[]>(
    swappyProfile.skillsToOffer || []
  );
  const [skillsToLearn, setSkillsToLearn] = useState<SkillWithLevel[]>(
    swappyProfile.skillsToLearn || []
  );
  const [availability, setAvailability] = useState(
    swappyProfile.availability || ''
  );
  const [bio, setBio] = useState(swappyProfile.bio || '');
  const [offerInput, setOfferInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [offerLevel, setOfferLevel] = useState<
    'Beginner' | 'Amateur' | 'Intermediate' | 'Expert'
  >('Intermediate');
  const [learnLevel, setLearnLevel] = useState<
    'Beginner' | 'Amateur' | 'Intermediate' | 'Expert'
  >('Beginner');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showOfferLevelPicker, setShowOfferLevelPicker] = useState(false);
  const [showLearnLevelPicker, setShowLearnLevelPicker] = useState(false);

  // Sync state with prop when modal becomes visible
  useEffect(() => {
    if (visible) {
      setSkillsToOffer(swappyProfile.skillsToOffer || []);
      setSkillsToLearn(swappyProfile.skillsToLearn || []);
      setAvailability(swappyProfile.availability || '');
      setBio(swappyProfile.bio || '');
    }
  }, [visible, swappyProfile]);

  const addSkillToOffer = () => {
    if (
      offerInput.trim() &&
      !skillsToOffer.find((s) => s.name === offerInput.trim())
    ) {
      setSkillsToOffer([
        ...skillsToOffer,
        { name: offerInput.trim(), level: offerLevel },
      ]);
      setOfferInput('');
      setOfferLevel('Intermediate');
    }
  };

  const addSkillToLearn = () => {
    if (
      learnInput.trim() &&
      !skillsToLearn.find((s) => s.name === learnInput.trim())
    ) {
      setSkillsToLearn([
        ...skillsToLearn,
        { name: learnInput.trim(), level: learnLevel },
      ]);
      setLearnInput('');
      setLearnLevel('Beginner');
    }
  };

  const removeSkill = (skillName: string, type: 'offer' | 'learn') => {
    if (type === 'offer') {
      setSkillsToOffer(skillsToOffer.filter((s) => s.name !== skillName));
    } else {
      setSkillsToLearn(skillsToLearn.filter((s) => s.name !== skillName));
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    setSwappyProfile({
      skillsToOffer,
      skillsToLearn,
      availability,
      bio,
      isActivated: true,
    });
    onCancel?.();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isValid =
    skillsToOffer.length > 0 && skillsToLearn.length > 0 && bio.trim();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Swappy Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Section Title */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Build Your Swappy Identity</Text>
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Your Bio</Text>
            <TextInput
              style={[styles.textarea, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Say a little about yourself, your goals, and what you're looking for."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Skills I Can Offer */}
          <View style={styles.section}>
            <Text style={styles.label}>Skills I Can Offer</Text>

            {/* Display added skills as tags */}
            {skillsToOffer.length > 0 && (
              <View style={styles.skillsContainer}>
                {skillsToOffer.map((skill) => {
                  const colors = getLevelColor(skill.level);
                  return (
                    <View
                      key={skill.name}
                      style={[
                        styles.skillTag,
                        { backgroundColor: colors.bg, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.skillTagContent}>
                        <Text style={styles.skillName}>{skill.name}</Text>
                        <TouchableOpacity
                          onPress={() => removeSkill(skill.name, 'offer')}
                          style={styles.skillRemove}
                        >
                          <Ionicons name="close" size={14} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          styles.levelBadge,
                          { backgroundColor: colors.bg, borderColor: colors.border },
                        ]}
                      >
                        <Text style={[styles.levelText, { color: colors.text }]}>
                          {skill.level}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Input with level selector */}
            <View style={styles.skillInputSection}>
              <View style={styles.skillInputContainer}>
                <TextInput
                  style={styles.skillInput}
                  value={offerInput}
                  onChangeText={setOfferInput}
                  placeholder="e.g., UI/UX Design, Public Speaking"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  onPress={addSkillToOffer}
                  disabled={!offerInput.trim()}
                  style={[
                    styles.addButton,
                    !offerInput.trim() && styles.addButtonDisabled,
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={offerInput.trim() ? '#fff' : '#999'}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setShowOfferLevelPicker(true)}
                style={[
                  styles.levelSelector,
                  { backgroundColor: getLevelColor(offerLevel).bg },
                ]}
              >
                <Text
                  style={[
                    styles.levelSelectorText,
                    { color: getLevelColor(offerLevel).text },
                  ]}
                >
                  {offerLevel}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={getLevelColor(offerLevel).text}
                />
              </TouchableOpacity>
            </View>

            {/* Level Picker Modal for Offer */}
            <Modal
              visible={showOfferLevelPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowOfferLevelPicker(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowOfferLevelPicker(false)}
              >
                <View
                  style={styles.pickerContainer}
                  onStartShouldSetResponder={() => true}
                >
                  {SKILL_LEVELS.map((level) => {
                    const colors = getLevelColor(level);
                    return (
                      <TouchableOpacity
                        key={level}
                        onPress={() => {
                          setOfferLevel(level);
                          setShowOfferLevelPicker(false);
                        }}
                        style={[
                          styles.pickerItem,
                          offerLevel === level && styles.pickerItemSelected,
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerItemBadge,
                            {
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.pickerItemText, { color: colors.text }]}>
                            {level}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Pressable>
            </Modal>
          </View>

          {/* Skills I Want to Learn */}
          <View style={styles.section}>
            <Text style={styles.label}>Skills I Want to Learn</Text>

            {/* Display added skills as tags */}
            {skillsToLearn.length > 0 && (
              <View style={styles.skillsContainer}>
                {skillsToLearn.map((skill) => {
                  const colors = getLevelColor(skill.level);
                  return (
                    <View
                      key={skill.name}
                      style={[
                        styles.skillTag,
                        { backgroundColor: colors.bg, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.skillTagContent}>
                        <Text style={styles.skillName}>{skill.name}</Text>
                        <TouchableOpacity
                          onPress={() => removeSkill(skill.name, 'learn')}
                          style={styles.skillRemove}
                        >
                          <Ionicons name="close" size={14} color={colors.text} />
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          styles.levelBadge,
                          { backgroundColor: colors.bg, borderColor: colors.border },
                        ]}
                      >
                        <Text style={[styles.levelText, { color: colors.text }]}>
                          {skill.level}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Input with level selector */}
            <View style={styles.skillInputSection}>
              <View style={styles.skillInputContainer}>
                <TextInput
                  style={styles.skillInput}
                  value={learnInput}
                  onChangeText={setLearnInput}
                  placeholder="e.g., Full-stack Development, Guitar"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  onPress={addSkillToLearn}
                  disabled={!learnInput.trim()}
                  style={[
                    styles.addButton,
                    !learnInput.trim() && styles.addButtonDisabled,
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={learnInput.trim() ? '#fff' : '#999'}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setShowLearnLevelPicker(true)}
                style={[
                  styles.levelSelector,
                  { backgroundColor: getLevelColor(learnLevel).bg },
                ]}
              >
                <Text
                  style={[
                    styles.levelSelectorText,
                    { color: getLevelColor(learnLevel).text },
                  ]}
                >
                  {learnLevel}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={getLevelColor(learnLevel).text}
                />
              </TouchableOpacity>
            </View>

            {/* Level Picker Modal for Learn */}
            <Modal
              visible={showLearnLevelPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowLearnLevelPicker(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowLearnLevelPicker(false)}
              >
                <View
                  style={styles.pickerContainer}
                  onStartShouldSetResponder={() => true}
                >
                  {SKILL_LEVELS.map((level) => {
                    const colors = getLevelColor(level);
                    return (
                      <TouchableOpacity
                        key={level}
                        onPress={() => {
                          setLearnLevel(level);
                          setShowLearnLevelPicker(false);
                        }}
                        style={[
                          styles.pickerItem,
                          learnLevel === level && styles.pickerItemSelected,
                        ]}
                      >
                        <View
                          style={[
                            styles.pickerItemBadge,
                            {
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.pickerItemText, { color: colors.text }]}>
                            {level}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Pressable>
            </Modal>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.label}>Your Availability</Text>

            {/* Day Checkboxes */}
            <View style={styles.daysGrid}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[
                    styles.dayCheckbox,
                    selectedDays.includes(day) && styles.dayCheckboxSelected,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedDays.includes(day) ? 'checkbox' : 'square-outline'
                    }
                    size={20}
                    color={selectedDays.includes(day) ? '#14B8A6' : '#999'}
                  />
                  <Text
                    style={[
                      styles.dayLabel,
                      selectedDays.includes(day) && styles.dayLabelSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Availability notes */}
            <TextInput
              style={[styles.textarea, styles.availabilityInput]}
              value={availability}
              onChangeText={setAvailability}
              placeholder="e.g., Weekdays 6-8 PM, Weekends flexible"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsSection}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!isValid}
              style={[
                styles.saveButton,
                !isValid && styles.saveButtonDisabled,
              ]}
            >
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitleContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  bioInput: {
    height: 100,
  },
  availabilityInput: {
    height: 80,
    marginTop: 12,
  },
  skillsContainer: {
    marginBottom: 12,
    gap: 8,
  },
  skillTag: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  skillTagContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  skillRemove: {
    padding: 4,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  skillInputSection: {
    gap: 10,
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  levelSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  levelSelectorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerItemSelected: {
    backgroundColor: '#F0F9F8',
  },
  pickerItemBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dayCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    width: '48%',
  },
  dayCheckboxSelected: {},
  dayLabel: {
    fontSize: 13,
    color: '#666',
  },
  dayLabelSelected: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  buttonsSection: {
    gap: 12,
    paddingBottom: 24,
  },
  saveButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});