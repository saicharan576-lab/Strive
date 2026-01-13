import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
interface ExploreCategory {
  readonly id: number;
  readonly name: string;
  readonly subtitle: string;
  readonly emoji: string;
}

interface TrendingContent {
  readonly id: number;
  readonly title: string;
  readonly image: string;
  readonly creator: string;
  readonly likes: number;
  readonly views: number;
}

const EXPLORE_CATEGORIES: readonly ExploreCategory[] = [
  { 
    id: 1, 
    name: 'Visual Arts', 
    subtitle: 'Photography, Painting, Sculpting',
    emoji: '🎨',
  },
  { 
    id: 2, 
    name: 'Creative Writing', 
    subtitle: 'Poetry, Fiction, Screenwriting',
    emoji: '📝',
  },
  { 
    id: 3, 
    name: 'Music & Sound', 
    subtitle: 'Composing, Production, Performance',
    emoji: '🎵',
  },
  { 
    id: 4, 
    name: 'Digital Design', 
    subtitle: 'Graphic, UI/UX, 3D Modeling',
    emoji: '💻',
  },
] as const;

const TRENDING_CONTENT: readonly TrendingContent[] = [
  {
    id: 1,
    title: 'Sunrise Over the Alps',
    image: 'https://images.unsplash.com/photo-1644965736489-854d8be3bc53?w=300&h=200&fit=crop',
    creator: 'Lena M.',
    likes: 1245,
    views: 15300,
  },
  {
    id: 2,
    title: 'Urban Poetry: "City Echoes"',
    image: 'https://images.unsplash.com/photo-1707142979946-a745d1d0092c?w=300&h=200&fit=crop',
    creator: 'Jamal K.',
    likes: 890,
    views: 9200,
  },
] as const;

// Category Card Component - Memoized
const CategoryCard = React.memo<{ category: ExploreCategory; onPress: (id: number) => void }>(({ category, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(category.id);
  }, [category.id, onPress]);

  return (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${category.name} category`}
      accessibilityHint={`Explore ${category.subtitle}`}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
});
CategoryCard.displayName = 'CategoryCard';

// Trending Content Card Component - Memoized
const TrendingCard = React.memo<{ 
  content: TrendingContent; 
  hasError: boolean; 
  onImageError: (id: number) => void;
  onPress: (id: number) => void;
}>(({ content, hasError, onImageError, onPress }) => {
  const handleImageError = useCallback(() => {
    onImageError(content.id);
  }, [content.id, onImageError]);

  const handlePress = useCallback(() => {
    onPress(content.id);
  }, [content.id, onPress]);

  return (
    <TouchableOpacity 
      style={styles.trendingCard}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${content.title} by ${content.creator}`}
    >
      {!hasError ? (
        <Image
          source={{ uri: content.image }}
          style={styles.trendingImage}
          onError={handleImageError}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[styles.trendingImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📸</Text>
        </View>
      )}
      <Text style={styles.trendingTitle} numberOfLines={2}>{content.title}</Text>
      <Text style={styles.creatorName}>{content.creator}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Ionicons name="heart" size={14} color="#ff6b6b" />
          <Text style={styles.statText}>{content.likes}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="eye" size={14} color="#666" />
          <Text style={styles.statText}>{content.views}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
TrendingCard.displayName = 'TrendingCard';

// Search Header Component - Memoized
const SearchHeader = React.memo<{ searchQuery: string; onSearchChange: (text: string) => void }>(({ searchQuery, onSearchChange }) => (
  <View style={styles.header}>
    <Text style={styles.title}>Explore</Text>
    
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Discover content..."
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#999"
        accessibilityLabel="Search explore content"
        accessibilityHint="Enter text to search for content"
      />
    </View>
  </View>
));
SearchHeader.displayName = 'SearchHeader';

// Section Header Component - Memoized
const SectionHeader = React.memo<{ title: string }>(({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
));
SectionHeader.displayName = 'SectionHeader';

// Main Explore Screen Component
const ExploreScreen = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const handleImageError = useCallback((contentId: number) => {
    setImageErrors(prev => ({ ...prev, [contentId]: true }));
  }, []);

  const handleCategoryPress = useCallback((categoryId: number) => {
    console.log('Category pressed:', categoryId);
    // Navigate to category details
  }, []);

  const handleContentPress = useCallback((contentId: number) => {
    console.log('Content pressed:', contentId);
    // Navigate to content details
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return EXPLORE_CATEGORIES;
    const query = searchQuery.toLowerCase();
    return EXPLORE_CATEGORIES.filter(cat => 
      cat.name.toLowerCase().includes(query) || 
      cat.subtitle.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Render category item
  const renderCategory = useCallback(({ item }: { item: ExploreCategory }) => (
    <CategoryCard category={item} onPress={handleCategoryPress} />
  ), [handleCategoryPress]);

  // Render trending content item
  const renderTrendingContent = useCallback(({ item }: { item: TrendingContent }) => (
    <TrendingCard 
      content={item} 
      hasError={!!imageErrors[item.id]} 
      onImageError={handleImageError}
      onPress={handleContentPress}
    />
  ), [imageErrors, handleImageError, handleContentPress]);

  // Key extractors
  const categoryKeyExtractor = useCallback((item: ExploreCategory) => `category-${item.id}`, []);
  const trendingKeyExtractor = useCallback((item: TrendingContent) => `trending-${item.id}`, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SearchHeader searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        
        {/* Categories Section */}
        <View style={styles.section}>
          <SectionHeader title="Explore Categories" />
          <FlatList
            data={filteredCategories}
            renderItem={renderCategory}
            keyExtractor={categoryKeyExtractor}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.categorySeparator} />}
            contentContainerStyle={styles.categoriesContainer}
            accessibilityRole="list"
          />
        </View>

        {/* Trending Content Section */}
        <View style={styles.section}>
          <SectionHeader title="Trending Content" />
          <FlatList
            data={TRENDING_CONTENT}
            renderItem={renderTrendingContent}
            keyExtractor={trendingKeyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
            removeClippedSubviews
            maxToRenderPerBatch={5}
            windowSize={5}
            accessibilityRole="list"
            style={styles.trendingContainer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});
ExploreScreen.displayName = 'ExploreScreen';

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  categorySeparator: {
    height: 8,
  },
  categoriesContainer: {
    paddingBottom: 0,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  trendingList: {
    paddingHorizontal: 20,
  },
  trendingContainer: {
    flexGrow: 0,
  },
  trendingCard: {
    width: 160,
    marginRight: 12,
  },
  trendingImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  trendingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  creatorName: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#666',
  },
});