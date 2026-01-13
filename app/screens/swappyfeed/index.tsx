import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ServiceProvider, SwappyFeedProps, Category } from '../../_types/swappyfeed';
import { MOCK_PROVIDERS, validateProviders } from '../../_data/mockProviders';
import { CATEGORIES } from '../../_constants/categories';
import { useProviderFilter } from '../../_hooks/useProviderFilter';
import CategoryChip from '../../components/swappyfeed/CategoryChip';
import ProviderCard from '../../components/swappyfeed/ProviderCard';

// Loading state component
const LoadingView = React.memo(() => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color="#4f46e5" />
    <Text style={styles.loadingText}>Loading providers...</Text>
  </View>
));
LoadingView.displayName = 'LoadingView';

// Error state component
const ErrorView = React.memo(({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.centerContainer}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorText}>Failed to load providers</Text>
    <TouchableOpacity
      style={styles.retryButton}
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Retry loading providers"
    >
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
));
ErrorView.displayName = 'ErrorView';

// Empty state component
const EmptyView = React.memo(() => (
  <View style={styles.centerContainer}>
    <Text style={styles.emptyIcon}>🔍</Text>
    <Text style={styles.emptyText}>No providers found</Text>
    <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
  </View>
));
EmptyView.displayName = 'EmptyView';

export default function SwappyFeed({ onRequestSwap, onClose }: SwappyFeedProps) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterExchangeType, setFilterExchangeType] = useState<string[]>(['paid', 'swap']);
  const [filterPriceRange, setFilterPriceRange] = useState([0, 200]);
  const [filterAvailability, setFilterAvailability] = useState<string[]>([]);

  const {
    filteredProviders,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useProviderFilter(MOCK_PROVIDERS);

  // Simulate data loading
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        // Validate data
        if (!validateProviders(MOCK_PROVIDERS)) {
          throw new Error('Invalid provider data');
        }
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        setHasError(true);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePartnerPress = useCallback((partnerId: string) => {
    router.push({
      pathname: '/screens/swappypartner',
      params: { partnerId },
    });
  }, [router]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleProviderPress = useCallback((provider: ServiceProvider) => {
    setSelectedProvider(provider);
  }, []);

  const handleCategoryPress = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, [setSelectedCategory]);

  // Apply additional filters (exchange type, price, availability)
  const fullyFilteredProviders = useMemo(() => {
    return filteredProviders.filter(provider => {
      // Exchange type filter
      const showPaid = filterExchangeType.includes('paid') && provider.paidPrice;
      const showSwap = filterExchangeType.includes('swap') && provider.acceptsSwap;
      if (!showPaid && !showSwap) return false;

      // Price range filter
      if (provider.paidPrice && (provider.paidPrice < filterPriceRange[0] || provider.paidPrice > filterPriceRange[1])) {
        return false;
      }

      return true;
    });
  }, [filteredProviders, filterExchangeType, filterPriceRange]);

  const renderCategoryItem: ListRenderItem<Category> = useCallback(
    ({ item }) => (
      <CategoryChip
        category={item}
        isSelected={selectedCategory === item.id}
        onPress={handleCategoryPress}
      />
    ),
    [selectedCategory, handleCategoryPress]
  );

  const renderProviderItem: ListRenderItem<ServiceProvider> = useCallback(
    ({ item }) => (
      <ProviderCard provider={item} onPress={handleProviderPress} />
    ),
    [handleProviderPress]
  );

  const keyExtractor = useCallback((item: ServiceProvider | Category) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 200,
      offset: 200 * index,
      index,
    }),
    []
  );

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingView />
      </SafeAreaView>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  // Detailed provider view
  if (selectedProvider) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedProvider(null)}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color="#4f46e5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={{ width: 28 }} />
        </View>

        <FlatList
          data={[selectedProvider]}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => (
            <View>
              {/* Provider Card */}
              <TouchableOpacity
                style={styles.providerCard}
                onPress={() => handlePartnerPress(item.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`View full profile for ${item.name}`}
              >
                <View style={styles.providerHeader}>
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{item.name}</Text>
                    <Text style={styles.providerTitle}>{item.title}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({item.reviews} reviews)</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                </View>

                <Text style={styles.serviceName}>{item.serviceName}</Text>

                <View style={styles.tagsRow}>
                  {item.paidPrice && (
                    <View style={[styles.tag, styles.paidTag]}>
                      <Text style={styles.paidTagText}>💰 ${item.paidPrice}/hr</Text>
                    </View>
                  )}
                  {item.acceptsSwap && (
                    <View style={[styles.tag, styles.swapTag]}>
                      <Text style={styles.swapTagText}>🔄 Swap</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.buttonsContainer}>
                {item.acceptsSwap && (
                  <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={() => {
                      if (onRequestSwap) {
                        onRequestSwap(item.id, item.name, item.avatar, item.serviceName, '');
                      }
                      setSelectedProvider(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Request skill swap"
                  >
                    <Text style={styles.buttonText}>Request Swap</Text>
                  </TouchableOpacity>
                )}
                {item.paidPrice && (
                  <TouchableOpacity
                    style={[styles.button, styles.greenButton]}
                    onPress={() => {
                      if (onRequestSwap) {
                        onRequestSwap(item.id, item.name, item.avatar, item.serviceName, '');
                      }
                      setSelectedProvider(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Book session for $${item.paidPrice}`}
                  >
                    <Text style={styles.buttonText}>Book for ${item.paidPrice}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.button, styles.outlineButton]}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                >
                  <Text style={styles.outlineButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }

  // Main feed view
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search for services"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons name="options-outline" size={20} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Find Your Partner</Text>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCategoryItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.categoriesScroll}
          accessibilityRole="list"
        />
      </View>

      {/* Service Providers List */}
      <View style={styles.providersSection}>
        <Text style={styles.sectionTitle}>
          Top Providers ({fullyFilteredProviders.length})
        </Text>
        <FlatList
          data={fullyFilteredProviders}
          renderItem={renderProviderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyView}
          accessibilityRole="list"
        />
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              accessibilityRole="button"
              accessibilityLabel="Close filters"
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={[1]}
            renderItem={() => (
              <View style={styles.modalContent}>
                {/* Exchange Type */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Exchange Type</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[
                        styles.filterCheckbox,
                        filterExchangeType.includes('paid') && styles.filterCheckboxActive
                      ]}
                      onPress={() => {
                        if (filterExchangeType.includes('paid')) {
                          setFilterExchangeType(filterExchangeType.filter(t => t !== 'paid'));
                        } else {
                          setFilterExchangeType([...filterExchangeType, 'paid']);
                        }
                      }}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: filterExchangeType.includes('paid') }}
                      accessibilityLabel="Pay with Money"
                    >
                      <Ionicons
                        name={filterExchangeType.includes('paid') ? 'checkbox' : 'checkbox-outline'}
                        size={20}
                        color={filterExchangeType.includes('paid') ? '#4f46e5' : '#ccc'}
                      />
                      <Text style={styles.filterOptionText}>Pay with Money</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.filterCheckbox,
                        filterExchangeType.includes('swap') && styles.filterCheckboxActive
                      ]}
                      onPress={() => {
                        if (filterExchangeType.includes('swap')) {
                          setFilterExchangeType(filterExchangeType.filter(t => t !== 'swap'));
                        } else {
                          setFilterExchangeType([...filterExchangeType, 'swap']);
                        }
                      }}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: filterExchangeType.includes('swap') }}
                      accessibilityLabel="Swap for Skill"
                    >
                      <Ionicons
                        name={filterExchangeType.includes('swap') ? 'checkbox' : 'checkbox-outline'}
                        size={20}
                        color={filterExchangeType.includes('swap') ? '#4f46e5' : '#ccc'}
                      />
                      <Text style={styles.filterOptionText}>Swap for Skill</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Price Range */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Price Range</Text>
                  <View style={styles.priceDisplay}>
                    <Text style={styles.priceText}>${filterPriceRange[0]}</Text>
                    <Text style={styles.priceText}>${filterPriceRange[1]}</Text>
                  </View>
                </View>

                {/* Availability */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterTitle}>Availability</Text>
                  <View style={styles.availabilityOptions}>
                    {['Weekdays', 'Weekends', 'Evenings'].map(option => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.availabilityChip,
                          filterAvailability.includes(option) && styles.availabilityChipActive
                        ]}
                        onPress={() => {
                          if (filterAvailability.includes(option)) {
                            setFilterAvailability(filterAvailability.filter(a => a !== option));
                          } else {
                            setFilterAvailability([...filterAvailability, option]);
                          }
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: filterAvailability.includes(option) }}
                        accessibilityLabel={`Filter by ${option}`}
                      >
                        <Text style={[
                          styles.availabilityChipText,
                          filterAvailability.includes(option) && styles.availabilityChipTextActive
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
            keyExtractor={() => 'filters'}
          />

          {/* Apply Filters Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setShowFilters(false)}
              accessibilityRole="button"
              accessibilityLabel="Apply filters"
            >
              <Text style={styles.buttonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  categoriesSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
    color: '#000',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  providersSection: {
    flex: 1,
    paddingTop: 16,
  },
  providerCard: {
    backgroundColor: '#f5f1fa',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  providerTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingStar: {
    fontSize: 14,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  paidTag: {
    backgroundColor: '#dcfce7',
  },
  paidTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  swapTag: {
    backgroundColor: '#dbeafe',
  },
  swapTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
  },
  greenButton: {
    backgroundColor: '#059669',
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 10,
  },
  filterCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    gap: 10,
  },
  filterCheckboxActive: {
    backgroundColor: '#f0e6ff',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#000',
  },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  availabilityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  availabilityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  availabilityChipActive: {
    backgroundColor: '#f0e6ff',
    borderColor: '#4f46e5',
  },
  availabilityChipText: {
    fontSize: 13,
    color: '#666',
  },
  availabilityChipTextActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
});