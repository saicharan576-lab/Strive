import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ListRenderItem,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../_context/AuthContext';

interface Category {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
}

const CATEGORIES: readonly Category[] = [
  { id: 'investing', label: 'Investing & Finance', emoji: '💰' },
  { id: 'tech', label: 'Tech & Coding', emoji: '💻' },
  { id: 'health', label: 'Health & Wellness', emoji: '🧘' },
  { id: 'creative', label: 'Creative Skills', emoji: '🎨' },
  { id: 'communication', label: 'Communication', emoji: '🗣️' },
  { id: 'business', label: 'Business', emoji: '📈' },
  { id: 'languages', label: 'Languages', emoji: '🌍' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡' },
  { id: 'marketing', label: 'Marketing', emoji: '📱' },
  { id: 'design', label: 'Design & UX', emoji: '✨' },
] as const;

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

  const handlePress = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.categoryCard,
        { width: ITEM_WIDTH, marginRight: isLeftColumn ? 12 : 0 },
        isSelected ? styles.categoryCardSelected : styles.categoryCardDefault,
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${item.label}`}
      accessibilityHint={isSelected ? 'Double tap to deselect' : 'Double tap to select'}
    >
      {isSelected && (
        <View style={styles.checkmarkContainer}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();

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
        await Promise.all([
          AsyncStorage.setItem('userInterests', JSON.stringify(selected)),
          AsyncStorage.setItem('hasCompletedOnboarding', 'true'),
        ]);
        
        // Refresh auth state to pick up the new onboarding status
        await refreshAuth();
        
        // Navigate to home screen (index in tabs)
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error saving interests:', error);
        setIsLoading(false);
      }
    }
  }, [selected, router, refreshAuth]);

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header />

      <FlatList
        data={CATEGORIES}
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
  categoryCardDefault: {
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  categoryCardSelected: {
    borderColor: '#8A2BE2',
    backgroundColor: '#F5F0FF',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
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
});