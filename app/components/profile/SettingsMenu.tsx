import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsMenuProps {
  onSocialSettings: () => void;
  onClose: () => void;
  socialMediaCount: number;
  completion: {
    percentage: number;
    completedCount: number;
    tasks: readonly { readonly name: string; readonly completed: boolean }[];
  };
  onNavigateToSwappySetup: () => void;
  onNavigateToInterestSelection: () => void;
}

interface SettingsMenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  accent?: boolean;
  onPress?: () => void;
}

const SettingsMenuItem = React.memo<SettingsMenuItemProps>(({ 
  icon, 
  label, 
  subtitle, 
  accent,
  onPress 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.menuItem}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={subtitle}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={accent ? '#8A2BE2' : '#333'} 
      />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );
});
SettingsMenuItem.displayName = 'SettingsMenuItem';

export const SettingsMenu = React.memo<SettingsMenuProps>(({ 
  onSocialSettings, 
  onClose, 
  socialMediaCount, 
  completion,
  onNavigateToSwappySetup,
  onNavigateToInterestSelection
}) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity 
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Account Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <SettingsMenuItem 
          icon="lock-closed-outline" 
          label="Reset Password" 
        />
        <SettingsMenuItem 
          icon="shield-checkmark-outline" 
          label="Social Media Proof"
          subtitle={socialMediaCount > 0 ? `${socialMediaCount} platform${socialMediaCount > 1 ? 's' : ''} connected` : undefined}
          onPress={onSocialSettings}
        />
        <SettingsMenuItem 
          icon="apps-outline" 
          label="Interest Categories"
          subtitle="Manage your interests"
          onPress={onNavigateToInterestSelection}
        />
      </View>

      {/* Complete Profile */}
      {completion.percentage < 100 && (
        <View style={styles.settingsSection}>
          <SettingsMenuItem 
            icon="sparkles-outline" 
            label="Complete Your Profile"
            subtitle={`${completion.percentage}% complete`}
            accent
            onPress={onNavigateToSwappySetup}
          />
        </View>
      )}

      {/* Support Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionLabel}>SUPPORT</Text>
        <SettingsMenuItem 
          icon="help-circle-outline" 
          label="FAQ" 
        />
        <SettingsMenuItem 
          icon="bulb-outline" 
          label="What's New" 
        />
      </View>

      {/* Logout */}
      <View style={styles.settingsSection}>
        <TouchableOpacity 
          style={styles.logoutButton}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
});
SettingsMenu.displayName = 'SettingsMenu';

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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F44336',
  },
});
