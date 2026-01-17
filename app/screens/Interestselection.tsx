import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../_context/AuthContext';
import { getCachedUserProfile, saveUserInterests, updateUserInterests } from '../services/userProfileService';
import { supabase } from '../supabaseConfig';

interface Category {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly iconUrl?: string;
  readonly description?: string;
  readonly colorCode?: string;
}

// Emoji mapping for categories based on their names
const getEmojiForCategory = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  // Direct matches
  if (lowerName.includes('invest')) return '💰';
  if (lowerName.includes('finance') || lowerName.includes('money')) return '💵';
  if (lowerName.includes('tech') || lowerName.includes('technology')) return '💻';
  if (lowerName.includes('coding') || lowerName.includes('programming')) return '👨‍💻';
  if (lowerName.includes('health') || lowerName.includes('fitness')) return '🧘';
  if (lowerName.includes('wellness') || lowerName.includes('meditation')) return '🧘‍♀️';
  if (lowerName.includes('creative') || lowerName.includes('creativity')) return '🎨';
  if (lowerName.includes('art') || lowerName.includes('drawing')) return '🎨';
  if (lowerName.includes('communication') || lowerName.includes('speaking')) return '🗣️';
  if (lowerName.includes('business') || lowerName.includes('entrepreneur')) return '📈';
  if (lowerName.includes('language') || lowerName.includes('translation')) return '🌍';
  if (lowerName.includes('productivity') || lowerName.includes('organization')) return '⚡';
  if (lowerName.includes('marketing') || lowerName.includes('advertis')) return '📱';
  if (lowerName.includes('design')) return '✨';
  if (lowerName.includes('ux') || lowerName.includes('ui')) return '🖥️';
  if (lowerName.includes('music') || lowerName.includes('audio')) return '🎵';
  if (lowerName.includes('video') || lowerName.includes('film')) return '🎬';
  if (lowerName.includes('photo')) return '📸';
  if (lowerName.includes('writing') || lowerName.includes('content')) return '✍️';
  if (lowerName.includes('cooking') || lowerName.includes('food')) return '🍳';
  if (lowerName.includes('travel')) return '✈️';
  if (lowerName.includes('sport') || lowerName.includes('athletic')) return '⚽';
  if (lowerName.includes('science')) return '🔬';
  if (lowerName.includes('math')) return '🔢';
  if (lowerName.includes('reading') || lowerName.includes('book')) return '📚';
  if (lowerName.includes('gaming') || lowerName.includes('game')) return '🎮';
  if (lowerName.includes('fashion') || lowerName.includes('style')) return '👗';
  if (lowerName.includes('teach') || lowerName.includes('education')) return '👨‍🏫';
  if (lowerName.includes('data') || lowerName.includes('analytics')) return '📊';
  if (lowerName.includes('ai') || lowerName.includes('machine learning')) return '🤖';
  
  return '📚'; // Default fallback emoji
};

const MINIMUM_SELECTION = 3 as const;
const NUM_COLUMNS = 2 as const;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / NUM_COLUMNS;
const ITEM_HEIGHT = 110;

// Header Component
const Header = React.memo(() => (
  <View style={styles.header}>
    <Text style={styles.title}>What are you interested in?</Text>
    <Text style={styles.subtitle}>
      Select at least {MINIMUM_SELECTION} topics to personalize your feed
    </Text>
  </View>
));
Header.displayName = 'Header';

// Category Card Component
interface CategoryCardProps {
  readonly item: Category;
  readonly index: number;
  readonly isSelected: boolean;
  readonly onToggle: (id: string) => void;
}

const CategoryCard = React.memo<CategoryCardProps>(({ item, index, isSelected, onToggle }) => {
  const isLeftColumn = index % NUM_COLUMNS === 0;
  const [imageError, setImageError] = useState(false);

  const handlePress = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  // Use color_code from database or default purple
  const borderColor = isSelected ? (item.colorCode || '#8A2BE2') : '#E5E5E5';
  const backgroundColor = isSelected ? `${item.colorCode || '#8A2BE2'}15` : '#fff';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.categoryCard,
        { 
          width: ITEM_WIDTH, 
          marginRight: isLeftColumn ? 12 : 0,
          borderColor,
          backgroundColor,
        },
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${item.label}`}
      accessibilityHint={isSelected ? 'Double tap to deselect' : 'Double tap to select'}
    >
      {isSelected && (
        <View style={[styles.checkmarkContainer, { backgroundColor: item.colorCode || '#8A2BE2' }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
      {item.iconUrl && !imageError ? (
        <Image 
          source={{ uri: item.iconUrl }} 
          style={styles.categoryIcon}
          resizeMode="contain"
          onError={(e) => {
            console.log('Image load error for', item.label, ':', e.nativeEvent.error);
            console.log('Icon URL:', item.iconUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Image loaded successfully for', item.label);
          }}
        />
      ) : (
        <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      )}
      <Text style={styles.categoryLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
});
CategoryCard.displayName = 'CategoryCard';

// Footer Component
interface FooterProps {
  readonly selectedCount: number;
  readonly onContinue: () => void;
  readonly isLoading: boolean;
}

const Footer = React.memo<FooterProps>(({ selectedCount, onContinue, isLoading }) => {
  const isDisabled = selectedCount < MINIMUM_SELECTION || isLoading;
  
  return (
    <View style={styles.footer}>
      <Text style={styles.selectionCount}>
        {selectedCount} / {MINIMUM_SELECTION} minimum selected
      </Text>
      <TouchableOpacity
        onPress={onContinue}
        disabled={isDisabled}
        style={[
          styles.continueButton,
          isDisabled && styles.continueButtonDisabled,
        ]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Continue to app"
        accessibilityState={{ disabled: isDisabled }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});
Footer.displayName = 'Footer';

// Main Component
const InterestSelection = React.memo(() => {
  const [selected, setSelected] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();

  // Fetch categories from Supabase on mount
  useEffect(() => {
    fetchCategories();
    loadExistingInterests();
  }, []);

  // Load existing interests if user is updating from profile
  const loadExistingInterests = async () => {
    try {
      const userProfile = await getCachedUserProfile();
      if (userProfile) {
        // Check if user has existing interests in database
        const existingInterests: string[] = [];
        if (userProfile.Interest_cat_1) existingInterests.push(userProfile.Interest_cat_1);
        if (userProfile.Interest_cat_2) existingInterests.push(userProfile.Interest_cat_2);
        if (userProfile.Interest_cat_3) existingInterests.push(userProfile.Interest_cat_3);
        
        if (existingInterests.length > 0) {
          setSelected(existingInterests);
          setIsUpdatingInterests(true);
          console.log('📋 Loaded existing interests:', existingInterests);
        }
      }
    } catch (error) {
      console.error('Error loading existing interests:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsFetchingCategories(true);
      
      const { data, error } = await supabase
        .from('Skill_Categories')
        .select('id, Display_name, Description, icon_url, color_code, Name, rank_order')
        .eq('is-active', true)
        .order('rank_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories. Please try again.');
        return;
      }

      console.log('📊 Fetched categories from Supabase:', data);

      if (data && data.length > 0) {
        // Transform database records to Category interface
        const transformedCategories: Category[] = data.map(item => {
          console.log(`Category: ${item.Display_name}, Icon URL: ${item.icon_url}`);
          return {
            id: item.id.toString(),
            label: item.Display_name,
            iconUrl: item.icon_url || undefined,
            emoji: getEmojiForCategory(item.Name || item.Display_name),
            description: item.Description || undefined,
            colorCode: item.color_code || undefined,
          };
        });

        setCategories(transformedCategories);
      } else {
        Alert.alert('No Categories', 'No active categories found.');
      }
    } catch (error) {
      console.error('Exception fetching categories:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsFetchingCategories(false);
    }
  };

  const toggleInterest = useCallback((id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const handleContinue = useCallback(async () => {
    if (selected.length >= MINIMUM_SELECTION) {
      setIsLoading(true);
      try {
        // Get user profile from cache
        const userProfile = await getCachedUserProfile();
        
        if (!userProfile) {
          Alert.alert('Error', 'User profile not found. Please log in again.');
          setIsLoading(false);
          router.replace('/Login');
          return;
        }

        // Use updateUserInterests if editing, saveUserInterests if first time
        const success = isUpdatingInterests
          ? await updateUserInterests(userProfile.User_id, selected)
          : await saveUserInterests(userProfile.User_id, selected);

        if (!success) {
          Alert.alert('Error', 'Failed to save interests. Please try again.');
          setIsLoading(false);
          return;
        }

        console.log('✅ Interests saved successfully');
        
        // Refresh auth state to pick up the new onboarding status
        await refreshAuth();
        
        // Navigate based on context
        if (isUpdatingInterests) {
          // User is updating from profile, go back
          Alert.alert('Success', 'Your interests have been updated!', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
          // New user completing onboarding, go to home
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error saving interests:', error);
        Alert.alert('Error', 'Failed to save interests. Please try again.');
        setIsLoading(false);
      }
    }
  }, [selected, router, refreshAuth, isUpdatingInterests]);

  const renderCategory: ListRenderItem<Category> = useCallback(({ item, index }) => (
    <CategoryCard
      item={item}
      index={index}
      isSelected={selected.includes(item.id)}
      onToggle={toggleInterest}
    />
  ), [selected, toggleInterest]);

  const keyExtractor = useCallback((item: Category) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    []
  );

  const selectedCount = useMemo(() => selected.length, [selected.length]);

  // Show loading spinner while fetching categories
  if (isFetchingCategories) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#8A2BE2" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  // Show message if no categories available
  if (categories.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top', 'bottom']}>
        <Text style={styles.emptyText}>No categories available</Text>
        <TouchableOpacity onPress={fetchCategories} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header />

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        accessibilityRole="list"
      />

      <Footer
        selectedCount={selectedCount}
        onContinue={handleContinue}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
});
InterestSelection.displayName = 'InterestSelection';

export default InterestSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  gridContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  columnWrapper: {
    marginBottom: 12,
  },
  categoryCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
    marginBottom: 0,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#000',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  selectionCount: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});