import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SocialMedia {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

interface SocialMediaSettingsProps {
  socialMedia: SocialMedia;
  setSocialMedia: (media: SocialMedia) => void;
  connectedCount: number;
  onSave: () => void;
  onCancel: () => void;
  onBack: () => void;
}

interface SocialInputFieldProps {
  platform: string;
  icon: string;
  prefix: string;
  value: string;
  onChange: (value: string) => void;
}

const SocialInputField = React.memo<SocialInputFieldProps>(({
  platform,
  icon,
  prefix,
  value,
  onChange,
}) => {
  return (
    <View style={styles.socialInputContainer}>
      <View style={styles.socialInputHeader}>
        <Ionicons name={icon as any} size={20} color="#666" />
        <Text style={styles.socialPlatformName}>{platform}</Text>
        {value && (
          <View style={styles.connectedBadge}>
            <Ionicons name="checkmark" size={12} color="#00BFA5" />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        )}
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputPrefix}>{prefix}</Text>
        <TextInput
          style={styles.socialInput}
          placeholder="username"
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChange}
          accessibilityLabel={`${platform} username`}
        />
      </View>
    </View>
  );
});
SocialInputField.displayName = 'SocialInputField';

export const SocialMediaSettings = React.memo<SocialMediaSettingsProps>(({
  socialMedia,
  setSocialMedia,
  connectedCount,
  onSave,
  onCancel,
  onBack,
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity 
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>Social Media</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressBox}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Connected Platforms</Text>
          <Text style={styles.progressCount}>{connectedCount}/3</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(connectedCount / 3) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Social Input Fields */}
      <View style={styles.settingsSection}>
        <SocialInputField
          platform="Instagram"
          icon="logo-instagram"
          prefix="@"
          value={socialMedia.instagram || ''}
          onChange={(val) => setSocialMedia({ ...socialMedia, instagram: val })}
        />
        <SocialInputField
          platform="LinkedIn"
          icon="logo-linkedin"
          prefix="linkedin.com/in/"
          value={socialMedia.linkedin || ''}
          onChange={(val) => setSocialMedia({ ...socialMedia, linkedin: val })}
        />
        <SocialInputField
          platform="Twitter"
          icon="logo-twitter"
          prefix="@"
          value={socialMedia.twitter || ''}
          onChange={(val) => setSocialMedia({ ...socialMedia, twitter: val })}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={onSave} 
          style={styles.primaryButton}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
        >
          <Text style={styles.primaryButtonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onCancel} 
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});
SocialMediaSettings.displayName = 'SocialMediaSettings';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  progressBox: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8A2BE2',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A2BE2',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8A2BE2',
  },
  socialInputContainer: {
    marginBottom: 20,
  },
  socialInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  socialPlatformName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00BFA5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputPrefix: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  socialInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
