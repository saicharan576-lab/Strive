import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView, SafeAreaView, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SavedContent {
  id: string;
  title: string;
  creator: string;
  category: string;
  type: 'text' | 'video';
  thumbnail: string;
  content?: string;
  createdAt?: Date;
}

interface CreatePostProps {
  onSaveContent: (content: SavedContent) => void;
}

type PostType = 'text' | 'video' | null;

interface Category {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

const CATEGORIES: readonly Category[] = [
  { id: 'investing', name: '💰 Investing', color: '#4CAF50' },
  { id: 'tech', name: '💻 Tech', color: '#2196F3' },
  { id: 'health', name: '🏃 Health', color: '#FF6B6B' },
  { id: 'creative', name: '🎨 Creative', color: '#9C27B0' },
  { id: 'business', name: '📊 Business', color: '#FF9800' },
  { id: 'productivity', name: '⚡ Productivity', color: '#FFC107' },
] as const;

const GUIDELINES = [
  'Share educational and valuable content',
  'Be respectful and authentic',
  'Credit sources when applicable',
  'Keep content relevant to category',
] as const;

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 5000;

const PostTypeCard = React.memo<{
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}>(({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.card}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`Create ${title}`}
    accessibilityHint={subtitle}
  >
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
));

PostTypeCard.displayName = 'PostTypeCard';

const CategoryButton = React.memo<{
  category: Category;
  isSelected: boolean;
  onPress: (id: string) => void;
}>(({ category, isSelected, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(category.id)}
    style={[
      styles.categoryButton,
      isSelected && styles.categoryButtonSelected
    ]}
    activeOpacity={0.7}
    accessibilityRole="radio"
    accessibilityState={{ checked: isSelected }}
    accessibilityLabel={category.name}
  >
    <Text style={[
      styles.categoryText,
      isSelected && styles.categoryTextSelected
    ]}>
      {category.name}
    </Text>
  </TouchableOpacity>
));

CategoryButton.displayName = 'CategoryButton';

const Guidelines = React.memo(() => (
  <View style={styles.guidelinesBox}>
    <Text style={styles.guidelinesTitle}>Content Guidelines</Text>
    {GUIDELINES.map((guideline, index) => (
      <Text key={index} style={styles.guidelineItem}>• {guideline}</Text>
    ))}
  </View>
));

Guidelines.displayName = 'Guidelines';

const SuccessModal = React.memo<{ visible: boolean }>(({ visible }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Post Published!</Text>
        <Text style={styles.successMessage}>
          Your content has been successfully published
        </Text>
      </View>
    </View>
  </Modal>
));

SuccessModal.displayName = 'SuccessModal';

export default function CreateScreen() {
  const [postType, setPostType] = useState<PostType>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [textContent, setTextContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleReset = useCallback(() => {
    setPostType(null);
    setSelectedCategory('');
    setTextContent('');
    setPostTitle('');
    setUploadError('');
  }, []);

  const handlePublish = useCallback(async () => {
    if (!postTitle.trim() || !selectedCategory) {
      setUploadError('Please fill in all required fields');
      return;
    }

    try {
      const newContent: SavedContent = {
        id: Date.now().toString(),
        title: postTitle.trim(),
        creator: 'You',
        category: selectedCategory,
        type: postType === 'video' ? 'video' : 'text',
        thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400',
        content: textContent.trim(),
        createdAt: new Date(),
      };

      // TODO: Replace with actual API call to save post
      // Example: await createPost(newContent);
      console.log('Publishing post:', newContent);

      setShowSuccess(true);
      setUploadError('');

      setTimeout(() => {
        setShowSuccess(false);
        handleReset();
      }, 2000);
    } catch (error) {
      console.error('Error publishing post:', error);
      setUploadError('Failed to publish post. Please try again.');
      Alert.alert(
        'Error',
        'Failed to publish post. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [postTitle, selectedCategory, postType, textContent, handleReset]);

  const isFormValid = useMemo(() => {
    return postTitle.trim() && selectedCategory && (
      (postType === 'text' && textContent.trim()) ||
      (postType === 'video')
    );
  }, [postTitle, selectedCategory, postType, textContent]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleTitleChange = useCallback((text: string) => {
    if (text.length <= MAX_TITLE_LENGTH) {
      setPostTitle(text);
    }
  }, []);

  const handleContentChange = useCallback((text: string) => {
    if (text.length <= MAX_CONTENT_LENGTH) {
      setTextContent(text);
    }
  }, []);

  if (!postType) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Post</Text>
            <Text style={styles.subtitle}>What would you like to create?</Text>
          </View>

          <View style={styles.cardContainer}>
            <PostTypeCard
              icon="📄"
              title="Text Post"
              subtitle="Share insights & articles"
              onPress={() => setPostType('text')}
            />
            <PostTypeCard
              icon="🎥"
              title="Video Post"
              subtitle="Upload educational videos"
              onPress={() => setPostType('video')}
            />
          </View>

          <Guidelines />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleReset}
            accessibilityRole="button"
            accessibilityLabel="Cancel and go back"
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{postType === 'text' ? 'Text Post' : 'Video Post'}</Text>
          <View style={{ width: 24 }} />
        </View>

        {uploadError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{uploadError}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a title..."
            value={postTitle}
            onChangeText={handleTitleChange}
            placeholderTextColor="#999"
            maxLength={MAX_TITLE_LENGTH}
            accessibilityLabel="Post title"
            accessibilityHint="Enter the title of your post"
          />
          <Text style={styles.charCount}>{postTitle.length}/{MAX_TITLE_LENGTH}</Text>
        </View>

        {postType === 'text' && (
          <View style={styles.section}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your insights..."
              value={textContent}
              onChangeText={handleContentChange}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#999"
              maxLength={MAX_CONTENT_LENGTH}
              accessibilityLabel="Post content"
              accessibilityHint="Enter the content of your post"
            />
            <Text style={styles.charCount}>{textContent.length}/{MAX_CONTENT_LENGTH} characters</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(category => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onPress={handleCategorySelect}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleReset}
            style={[styles.button, styles.cancelButton]}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePublish}
            disabled={!isFormValid}
            style={[
              styles.button,
              styles.publishButton,
              !isFormValid && styles.publishButtonDisabled
            ]}
            accessibilityRole="button"
            accessibilityLabel="Publish post"
            accessibilityState={{ disabled: !isFormValid }}
          >
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal visible={showSuccess} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  categoryButtonSelected: {
    backgroundColor: '#8A2BE2',
    borderColor: '#8A2BE2',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginVertical: 20,
  },
  card: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  guidelinesBox: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f0e6ff',
    borderRadius: 10,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A2BE2',
    marginBottom: 8,
  },
  guidelineItem: {
    fontSize: 12,
    color: '#666',
    marginVertical: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  publishButton: {
    backgroundColor: '#8A2BE2',
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  errorBox: {
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  successIcon: {
    fontSize: 50,
    color: '#4CAF50',
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
