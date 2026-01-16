import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../_context/AuthContext';
import { ProfileCompletionScreen } from '../components/profile/ProfileCompletionScreen';
import { SettingsMenu } from '../components/profile/SettingsMenu';
import { SocialMediaSettings } from '../components/profile/SocialMediaSettings';
import { ReviewsScreen } from '../screens/reviewscreen';
import { SwappySetup } from '../screens/swappypartner/swappysetup';

interface SavedContent {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly category: string;
  readonly type: 'text' | 'video';
  readonly thumbnail: string;
}

interface SkillWithLevel {
  readonly name: string;
  readonly level: 'Beginner' | 'Amateur' | 'Intermediate' | 'Expert';
}

interface SwappyProfile {
  bio?: string;
  skillsToOffer?: SkillWithLevel[];
  skillsToLearn?: SkillWithLevel[];
  availability?: string;
  isActivated?: boolean;
  socialMedia?: SocialMedia;
}

interface SocialMedia {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

interface ProfileProps {
  savedContent?: readonly SavedContent[];
  swappyProfile?: SwappyProfile;
  onNavigateToSwappySetup?: () => void;
  onNavigateToReviews?: () => void;
}

interface LibraryCategory {
  readonly name: string;
  readonly count: number;
}

interface StatItem {
  readonly label: string;
  readonly value: number;
}

interface QuickAction {
  readonly label: string;
  readonly icon: string;
}

const LIBRARY_CATEGORIES: readonly LibraryCategory[] = [
  { name: 'Coding', count: 11 },
  { name: 'Finance', count: 8 },
  { name: 'Writing', count: 6 },
  { name: 'Design', count: 5 },
] as const;

const STATS: readonly StatItem[] = [
  { label: 'Saved Content', value: 42 },
  { label: 'Skills Shared', value: 7 },
] as const;

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'My Posts', icon: 'document-outline' },
  { label: 'Connections', icon: 'people-outline' },
  { label: 'Swaps', icon: 'swap-horizontal-outline' },
] as const;

const ProfileScreen = React.memo<ProfileProps>(({ 
  savedContent = [], 
  swappyProfile = {}, 
  onNavigateToSwappySetup = () => {},
  onNavigateToReviews = () => {} 
}) => {
  const router = useRouter();
  const { signOut } = useAuth();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<'menu' | 'social'>('menu');
  const [socialMedia, setSocialMedia] = useState<SocialMedia>(swappyProfile.socialMedia || {});
  const [tempSocialMedia, setTempSocialMedia] = useState<SocialMedia>(swappyProfile.socialMedia || {});
  const [showSwappySetup, setShowSwappySetup] = useState(false);
  const [currentSwappyProfile, setCurrentSwappyProfile] = useState<SwappyProfile>(swappyProfile);
  const [showReviews, setShowReviews] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

  // Calculate profile completion - memoized
  const getConnectedCount = useCallback(() => {
    let count = 0;
    if (socialMedia.instagram) count++;
    if (socialMedia.linkedin) count++;
    if (socialMedia.twitter) count++;
    return count;
  }, [socialMedia]);

  const completion = useMemo(() => {
    const tasks = [
      { name: 'Add bio', completed: !!currentSwappyProfile.bio },
      { name: 'Add skills to offer', completed: !!currentSwappyProfile.skillsToOffer?.length },
      { name: 'Add skills to learn', completed: !!currentSwappyProfile.skillsToLearn?.length },
      { name: 'Connect social media', completed: getConnectedCount() > 0 },
      { name: 'Activate Swappy profile', completed: !!currentSwappyProfile.isActivated },
    ] as const;
    const completedCount = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedCount / tasks.length) * 100);
    return { tasks, percentage, completedCount };
  }, [currentSwappyProfile, getConnectedCount]);

  const handleSaveSocialMedia = useCallback(() => {
    setSocialMedia(tempSocialMedia);
    setIsSettingsOpen(false);
    setSettingsView('menu');
  }, [tempSocialMedia]);

  const handleCancelSocialMedia = useCallback(() => {
    setTempSocialMedia(socialMedia);
    setIsSettingsOpen(false);
    setSettingsView('menu');
  }, [socialMedia]);

  const handleOpenSocialSettings = useCallback(() => {
    setTempSocialMedia(socialMedia);
    setSettingsView('social');
  }, [socialMedia]);

  const handleOpenSwappySetup = useCallback(() => {
    setShowSwappySetup(true);
    setShowProfileCompletion(false);
  }, []);

  const handleCloseSwappySetup = useCallback(() => {
    setShowSwappySetup(false);
  }, []);

  const handleSaveSwappyProfile = useCallback((profile: SwappyProfile) => {
    setCurrentSwappyProfile(profile);
    setShowSwappySetup(false);
  }, []);

  const handleOpenProfileCompletion = useCallback(() => {
    setShowProfileCompletion(true);
    setIsSettingsOpen(false);
  }, []);

  const handleOpenReviews = useCallback(() => {
    setShowReviews(true);
  }, []);

  const handleBackToMenu = useCallback(() => {
    setTempSocialMedia(socialMedia);
    setSettingsView('menu');
  }, [socialMedia]);

  const handleSettingsOpen = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleCloseReviews = useCallback(() => {
    setShowReviews(false);
  }, []);

  const handleCloseProfileCompletion = useCallback(() => {
    setShowProfileCompletion(false);
  }, []);

  const handleOpenInterestSelection = useCallback(() => {
    router.push('/screens/Interestselection');
    setIsSettingsOpen(false);
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('👤 Profile: Logout button clicked');
      setIsSettingsOpen(false);
      console.log('👤 Profile: Settings modal closed, calling signOut...');
      await signOut();
      console.log('👤 Profile: signOut completed, waiting for auth guard...');
      // Navigation will be handled by the auth guard in _layout.tsx
    } catch (error) {
      console.error('❌ Profile: Logout error:', error);
    }
  }, [signOut]);

  const connectedCount = getConnectedCount();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            onPress={handleSettingsOpen}
            style={styles.settingsButton}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Picture */}
          <View style={styles.profilePicContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=200' }}
              style={styles.profilePic}
              accessibilityIgnoresInvertColors
            />
            <TouchableOpacity 
              style={styles.editButton}
              accessibilityRole="button"
              accessibilityLabel="Edit profile picture"
            >
              <Ionicons name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Name and Bio */}
          <Text style={styles.name}>Alex Johnson</Text>
          <Text style={styles.bio}>
            Passionate learner, aspiring coder, and avid reader. Always seeking to grow and connect.
          </Text>

          {/* Social Links */}
          {connectedCount > 0 && (
            <View style={styles.socialLinks}>
              {socialMedia.instagram && (
                <TouchableOpacity 
                  style={styles.socialIcon}
                  accessibilityRole="button"
                  accessibilityLabel="Instagram profile"
                >
                  <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                </TouchableOpacity>
              )}
              {socialMedia.linkedin && (
                <TouchableOpacity 
                  style={styles.socialIcon}
                  accessibilityRole="button"
                  accessibilityLabel="LinkedIn profile"
                >
                  <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                </TouchableOpacity>
              )}
              {socialMedia.twitter && (
                <TouchableOpacity 
                  style={styles.socialIcon}
                  accessibilityRole="button"
                  accessibilityLabel="Twitter profile"
                >
                  <Ionicons name="logo-twitter" size={20} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Rating */}
          <TouchableOpacity 
            onPress={handleOpenReviews} 
            style={styles.ratingContainer}
            accessibilityRole="button"
            accessibilityLabel="View reviews, rating 4.8 out of 5"
          >
            <View style={styles.stars}>
              {[1, 2, 3, 4, 4.5].map((_, i) => (
                <Ionicons key={i} name="star" size={16} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.ratingText}>
              <Text style={styles.ratingScore}>4.8</Text>
              <Text style={styles.ratingReviews}> (125 Reviews)</Text>
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>

          {/* Stats */}
          <View style={styles.statsGrid}>
            {STATS.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as any} size={24} color="#8A2BE2" />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Library Section */}
        <View style={styles.librarySection}>
          <View style={styles.libraryHeader}>
            <Text style={styles.libraryTitle}>My Library</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="View all library items"
            >
              <Text style={styles.viewAllLink}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesList}>
            {LIBRARY_CATEGORIES.map((cat, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.categoryPill}
                accessibilityRole="button"
                accessibilityLabel={`${cat.name} category, ${cat.count} items`}
              >
                <Text style={styles.categoryName}>{cat.name}</Text>
                <View style={styles.categoryCount}>
                  <Text style={styles.categoryCountText}>{cat.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          {settingsView === 'menu' ? (
            <SettingsMenu
              onSocialSettings={handleOpenSocialSettings}
              onClose={handleSettingsClose}
              socialMediaCount={connectedCount}
              completion={completion}
              onNavigateToSwappySetup={handleOpenProfileCompletion}
              onNavigateToInterestSelection={handleOpenInterestSelection}
              onLogout={handleLogout}
            />
          ) : (
            <SocialMediaSettings
              socialMedia={tempSocialMedia}
              setSocialMedia={setTempSocialMedia}
              connectedCount={connectedCount}
              onSave={handleSaveSocialMedia}
              onCancel={handleCancelSocialMedia}
              onBack={handleBackToMenu}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Swappy Setup Modal */}
      <SwappySetup
        visible={showSwappySetup}
        swappyProfile={currentSwappyProfile}
        setSwappyProfile={handleSaveSwappyProfile}
        onCancel={handleCloseSwappySetup}
      />

      {/* Reviews Modal */}
      <ReviewsScreen
        visible={showReviews}
        onClose={handleCloseReviews}
      />

      {/* Profile Completion Modal */}
      <ProfileCompletionScreen
        visible={showProfileCompletion}
        completion={completion}
        onClose={handleCloseProfileCompletion}
        onStartSwappySetup={handleOpenSwappySetup}
      />
    </SafeAreaView>
  );
});
ProfileScreen.displayName = 'ProfileScreen';

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePic: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00BFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
  },
  ratingScore: {
    fontWeight: 'bold',
  },
  ratingReviews: {
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  librarySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  libraryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllLink: {
    fontSize: 14,
    color: '#00BFA5',
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#8A2BE2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  categoryCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryCountText: {
    fontSize: 10,
    color: '#fff',
  },
  // Settings Styles
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBox: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#f0f8f7',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#333',
  },
  progressCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00BFA5',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00BFA5',
  },
  socialInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  socialInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  socialPlatformName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#d4f4f1',
    borderRadius: 12,
  },
  connectedText: {
    fontSize: 10,
    color: '#00BFA5',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputPrefix: {
    color: '#999',
    fontSize: 14,
    marginRight: 4,
  },
  socialInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#00BFA5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

