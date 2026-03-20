import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createTextPost } from '../services/postService';
import { getCachedUserProfile } from '../services/userProfileService';

// ---------- Types ----------

type MediaType = 'images' | 'video' | null;

interface MediaFile {
  readonly uri: string;
  readonly type: 'image' | 'video';
  readonly width?: number;
  readonly height?: number;
}

interface Category {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
}

// ---------- Constants ----------

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_THUMB_SIZE = (SCREEN_WIDTH - 56) / 3;
const CHAR_WARN_THRESHOLD = 0.85; // Show counter at 85%+

const CATEGORIES: readonly Category[] = [
  { id: 'investing', name: 'Investing', icon: '💰' },
  { id: 'tech', name: 'Tech', icon: '💻' },
  { id: 'health', name: 'Health', icon: '🏃' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'business', name: 'Business', icon: '📊' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
] as const;

const MAX_CONTENT_LENGTH = 5000;

// ---------- Sub-components ----------

/** User identity row */
const UserIdentityRow = React.memo<{
  name: string;
  avatar?: string | null;
}>(({ name, avatar }) => (
  <View style={styles.identityRow}>
    <View style={styles.avatarCircle}>
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarFallback}>
          {name ? name.charAt(0).toUpperCase() : '?'}
        </Text>
      )}
    </View>
    <View>
      <Text style={styles.identityName}>{name || 'You'}</Text>
      <Text style={styles.identityHint}>Posting publicly</Text>
    </View>
  </View>
));
UserIdentityRow.displayName = 'UserIdentityRow';

/** Category chip */
const CategoryChip = React.memo<{
  category: Category;
  isSelected: boolean;
  onPress: (id: string) => void;
}>(({ category, isSelected, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(category.id)}
    style={[styles.chip, isSelected && styles.chipSelected]}
    activeOpacity={0.7}
    accessibilityRole="radio"
    accessibilityState={{ checked: isSelected }}
  >
    <Text style={styles.chipIcon}>{category.icon}</Text>
    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
      {category.name}
    </Text>
  </TouchableOpacity>
));
CategoryChip.displayName = 'CategoryChip';

/** Single image thumbnail with remove button */
const ImageThumb = React.memo<{
  uri: string;
  onRemove: () => void;
}>(({ uri, onRemove }) => (
  <View style={styles.thumbWrapper}>
    <Image source={{ uri }} style={styles.thumbImage} />
    <TouchableOpacity
      style={styles.removeButton}
      onPress={onRemove}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Remove image"
    >
      <Ionicons name="close-circle" size={22} color="#fff" />
    </TouchableOpacity>
  </View>
));
ImageThumb.displayName = 'ImageThumb';

/** "Add more" tile in the image grid */
const AddMoreTile = React.memo<{ onPress: () => void }>(({ onPress }) => (
  <TouchableOpacity style={styles.addMoreTile} onPress={onPress} activeOpacity={0.6}>
    <Ionicons name="add" size={28} color="#8A2BE2" />
    <Text style={styles.addMoreText}>Add</Text>
  </TouchableOpacity>
));
AddMoreTile.displayName = 'AddMoreTile';

/** Video preview with remove and play overlay */
const VideoThumb = React.memo<{
  uri: string;
  onRemove: () => void;
}>(({ uri, onRemove }) => (
  <View style={styles.videoPreview}>
    <Image source={{ uri }} style={styles.videoPreviewImage} />
    <View style={styles.videoOverlay}>
      <View style={styles.playIcon}>
        <Ionicons name="play" size={36} color="#fff" />
      </View>
    </View>
    <TouchableOpacity
      style={styles.videoRemoveButton}
      onPress={onRemove}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel="Remove video"
    >
      <Ionicons name="close-circle" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
));
VideoThumb.displayName = 'VideoThumb';

/** Success modal */
const SuccessModal = React.memo<{ visible: boolean }>(({ visible }) => (
  <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.successCheckCircle}>
          <Ionicons name="checkmark" size={36} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Published! 🎉</Text>
        <Text style={styles.successMessage}>
          Your post is now live for others to see
        </Text>
      </View>
    </View>
  </Modal>
));
SuccessModal.displayName = 'SuccessModal';

// ---------- Main Component ----------

export default function CreateScreen() {
  const router = useRouter();

  // User profile
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Content state
  const [textContent, setTextContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Media state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [activeMediaType, setActiveMediaType] = useState<MediaType>(null);

  // UI state
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Load user identity
  useEffect(() => {
    (async () => {
      try {
        const profile = await getCachedUserProfile();
        if (profile) {
          setUserName(profile.Profile_name || profile.User_name || '');
          setUserAvatar(profile.Profile_picture || null);
        }
      } catch {
        // Silently fail — we still show fallback avatar
      }
    })();
  }, []);

  // ---- Derived state ----
  const hasText = textContent.trim().length > 0;
  const hasMedia = mediaFiles.length > 0;
  const hasAnyContent = hasText || hasMedia;
  const showCharCount = textContent.length > MAX_CONTENT_LENGTH * CHAR_WARN_THRESHOLD;
  const charCountNearLimit = textContent.length > MAX_CONTENT_LENGTH * 0.95;

  const isFormValid = useMemo(() => {
    return !isPublishing && selectedCategory && (hasText || hasMedia);
  }, [isPublishing, selectedCategory, hasText, hasMedia]);

  // ---- Handlers ----

  const handleReset = useCallback(() => {
    setTextContent('');
    setSelectedCategory('');
    setMediaFiles([]);
    setActiveMediaType(null);
    setUploadError('');
  }, []);

  const handleDiscard = useCallback(() => {
    Alert.alert(
      'Clear everything?',
      'This will remove all your text, media, and category selection.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: handleReset,
        },
      ]
    );
  }, [handleReset]);

  const handleCancel = useCallback(() => {
    if (hasAnyContent || selectedCategory) {
      Alert.alert(
        'Discard post?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              handleReset();
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [hasAnyContent, selectedCategory, handleReset, router]);

  const handleContentChange = useCallback((text: string) => {
    if (text.length <= MAX_CONTENT_LENGTH) {
      setTextContent(text);
      if (uploadError) setUploadError('');
    }
  }, [uploadError]);

  const handleCategorySelect = useCallback((id: string) => {
    setSelectedCategory(prev => (prev === id ? '' : id)); // Toggle
    if (uploadError) setUploadError('');
  }, [uploadError]);

  // Pick images (multiple)
  const handleAddPhotos = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access to attach images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - mediaFiles.length, // Respect total limit
      });

      if (!result.canceled && result.assets.length > 0) {
        const newFiles: MediaFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image' as const,
          width: asset.width,
          height: asset.height,
        }));

        setMediaFiles(prev => [...prev, ...newFiles].slice(0, 10));
        setActiveMediaType('images');
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  }, [mediaFiles.length]);

  // Pick video (single)
  const handleAddVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access to attach a video.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaFiles([{
          uri: asset.uri,
          type: 'video',
          width: asset.width,
          height: asset.height,
        }]);
        setActiveMediaType('video');
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  }, []);

  // Remove a single media file
  const handleRemoveMedia = useCallback((index: number) => {
    setMediaFiles(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setActiveMediaType(null);
      }
      return next;
    });
  }, []);

  // Publish
  const handlePublish = useCallback(async () => {
    if (!selectedCategory) {
      setUploadError('Pick a category so people can find your post');
      return;
    }
    if (!hasText && !hasMedia) {
      setUploadError('Write something or attach media to post');
      return;
    }

    setIsPublishing(true);
    setUploadError('');

    try {
      const result = await createTextPost({
        title: textContent.trim().substring(0, 100) || 'Untitled',
        description: textContent.trim(),
        tags: [selectedCategory],
      });

      if (!result) {
        setUploadError('Couldn\'t publish — check your connection and retry');
        setIsPublishing(false);
        return;
      }

      console.log('✅ Post published:', result.id);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setIsPublishing(false);
        handleReset();
      }, 2000);
    } catch (error) {
      console.error('Error publishing:', error);
      setUploadError('Something went wrong. Please try again.');
      setIsPublishing(false);
    }
  }, [selectedCategory, hasText, hasMedia, textContent, handleReset]);

  // ---- Render helpers ----

  const renderImageThumb = useCallback(({ item, index }: { item: MediaFile | 'add'; index: number }) => {
    if (item === 'add') {
      return <AddMoreTile onPress={handleAddPhotos} />;
    }
    return <ImageThumb uri={item.uri} onRemove={() => handleRemoveMedia(index)} />;
  }, [handleRemoveMedia, handleAddPhotos]);

  const imageKeyExtractor = useCallback((_: MediaFile | 'add', index: number) => `img-${index}`, []);

  // Append "add more" tile to image list (max 10 images)
  const imageGridData = useMemo(() => {
    if (activeMediaType !== 'images') return [];
    const items: (MediaFile | 'add')[] = [...mediaFiles];
    if (mediaFiles.length < 10) {
      items.push('add');
    }
    return items;
  }, [mediaFiles, activeMediaType]);

  // ---- Main render ----

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.topBarButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            {hasAnyContent || selectedCategory ? (
              <TouchableOpacity
                onPress={handleDiscard}
                style={styles.discardButton}
                accessibilityRole="button"
                accessibilityLabel="Clear all content"
              >
                <Ionicons name="trash-outline" size={18} color="#d32f2f" />
                <Text style={styles.discardText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.topBarTitle}>Create Post</Text>

          <TouchableOpacity
            onPress={handlePublish}
            disabled={!isFormValid}
            style={[styles.postButton, !isFormValid && styles.postButtonDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Publish post"
            accessibilityState={{ disabled: !isFormValid }}
          >
            {isPublishing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User identity */}
          <UserIdentityRow name={userName} avatar={userAvatar} />

          {/* Error banner */}
          {uploadError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#d32f2f" />
              <Text style={styles.errorText}>{uploadError}</Text>
            </View>
          ) : null}

          {/* Text composer */}
          <TextInput
            style={styles.composerInput}
            placeholder="What do you want to share today?"
            placeholderTextColor="#AAAAAA"
            value={textContent}
            onChangeText={handleContentChange}
            multiline
            textAlignVertical="top"
            maxLength={MAX_CONTENT_LENGTH}
            accessibilityLabel="Post content"
          />

          {showCharCount && (
            <Text style={[styles.charCount, charCountNearLimit && styles.charCountWarn]}>
              {textContent.length.toLocaleString()}/{MAX_CONTENT_LENGTH.toLocaleString()}
            </Text>
          )}

          {/* Inline attach bar */}
          <View style={styles.attachBar}>
            <TouchableOpacity
              style={[
                styles.attachButton,
                activeMediaType === 'images' && styles.attachButtonActive,
                activeMediaType === 'video' && styles.attachButtonLocked,
              ]}
              onPress={handleAddPhotos}
              disabled={activeMediaType === 'video'}
              accessibilityRole="button"
              accessibilityLabel="Add photos"
            >
              <Ionicons
                name="images-outline"
                size={18}
                color={activeMediaType === 'video' ? '#ccc' : activeMediaType === 'images' ? '#8A2BE2' : '#666'}
              />
              <Text style={[
                styles.attachButtonText,
                activeMediaType === 'video' && styles.attachButtonTextLocked,
                activeMediaType === 'images' && styles.attachButtonTextActive,
              ]}>
                Photos
              </Text>
              {activeMediaType === 'images' && mediaFiles.length > 0 && (
                <View style={styles.attachBadge}>
                  <Text style={styles.attachBadgeText}>{mediaFiles.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.attachDivider} />

            <TouchableOpacity
              style={[
                styles.attachButton,
                activeMediaType === 'video' && styles.attachButtonActive,
                activeMediaType === 'images' && styles.attachButtonLocked,
              ]}
              onPress={handleAddVideo}
              disabled={activeMediaType === 'images'}
              accessibilityRole="button"
              accessibilityLabel="Add video"
            >
              <Ionicons
                name="videocam-outline"
                size={18}
                color={activeMediaType === 'images' ? '#ccc' : activeMediaType === 'video' ? '#8A2BE2' : '#666'}
              />
              <Text style={[
                styles.attachButtonText,
                activeMediaType === 'images' && styles.attachButtonTextLocked,
                activeMediaType === 'video' && styles.attachButtonTextActive,
              ]}>
                Video
              </Text>
            </TouchableOpacity>
          </View>

          {/* Image previews — with "add more" tile */}
          {activeMediaType === 'images' && imageGridData.length > 0 && (
            <View style={styles.mediaSectionHeader}>
              <Text style={styles.mediaSectionTitle}>
                {mediaFiles.length} {mediaFiles.length === 1 ? 'photo' : 'photos'} attached
              </Text>
            </View>
          )}
          {activeMediaType === 'images' && imageGridData.length > 0 && (
            <FlatList
              data={imageGridData}
              renderItem={renderImageThumb}
              keyExtractor={imageKeyExtractor}
              numColumns={3}
              scrollEnabled={false}
              style={styles.imageGrid}
              columnWrapperStyle={styles.imageGridRow}
            />
          )}

          {/* Video preview */}
          {activeMediaType === 'video' && mediaFiles.length > 0 && (
            <>
              <View style={styles.mediaSectionHeader}>
                <Text style={styles.mediaSectionTitle}>Video attached</Text>
              </View>
              <VideoThumb
                uri={mediaFiles[0].uri}
                onRemove={() => handleRemoveMedia(0)}
              />
            </>
          )}

          {/* Category selection */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Pick a category</Text>
            <Text style={styles.sectionHint}>
              Help others discover your post
            </Text>
            <View style={styles.categoryWrap}>
              {CATEGORIES.map(cat => (
                <CategoryChip
                  key={cat.id}
                  category={cat}
                  isSelected={selectedCategory === cat.id}
                  onPress={handleCategorySelect}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal visible={showSuccess} />
    </SafeAreaView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // --- Top bar ---
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 90,
  },
  topBarButton: {
    padding: 6,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#FFF3F3',
  },
  discardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d32f2f',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#191919',
  },
  postButton: {
    backgroundColor: '#8A2BE2',
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 22,
    minWidth: 68,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#D4B8F0',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // --- User identity ---
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarFallback: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  identityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191919',
  },
  identityHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },

  // --- Scroll area ---
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // --- Error ---
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF3F3',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFDDDD',
  },
  errorText: {
    fontSize: 13,
    color: '#c62828',
    flex: 1,
  },

  // --- Composer ---
  composerInput: {
    fontSize: 16,
    color: '#191919',
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  charCountWarn: {
    color: '#E65100',
    fontWeight: '600',
  },

  // --- Media section header ---
  mediaSectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  mediaSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },

  // --- Image grid ---
  imageGrid: {
    paddingHorizontal: 16,
  },
  imageGridRow: {
    gap: 6,
    marginBottom: 6,
  },
  thumbWrapper: {
    width: IMAGE_THUMB_SIZE,
    height: IMAGE_THUMB_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 11,
  },

  // --- Add more tile ---
  addMoreTile: {
    width: IMAGE_THUMB_SIZE,
    height: IMAGE_THUMB_SIZE,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D4B8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
  },
  addMoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A2BE2',
    marginTop: 2,
  },

  // --- Video preview ---
  videoPreview: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  videoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  videoRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
  },

  // --- Categories ---
  categorySection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191919',
  },
  sectionHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    marginBottom: 12,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
  },
  chipSelected: {
    backgroundColor: '#8A2BE2',
    borderColor: '#8A2BE2',
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
  },
  chipTextSelected: {
    color: '#fff',
  },

  // --- Inline attach bar ---
  attachBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  attachButtonActive: {
    backgroundColor: '#F3E8FF',
  },
  attachButtonLocked: {
    opacity: 0.3,
  },
  attachButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  attachButtonTextActive: {
    color: '#8A2BE2',
    fontWeight: '600',
  },
  attachButtonTextLocked: {
    color: '#ccc',
  },
  attachDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
  },
  attachBadge: {
    backgroundColor: '#8A2BE2',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: 2,
  },
  attachBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  successCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#191919',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
