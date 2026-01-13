import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ServiceProvider } from '../../_types/swappyfeed';

interface ProviderCardProps {
  provider: ServiceProvider;
  onPress: (provider: ServiceProvider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = React.memo(({ provider, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(provider)}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${provider.name}, ${provider.serviceName}`}
    >
      {/* Header with Avatar and Basic Info */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{provider.avatar}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.title} numberOfLines={1}>{provider.title}</Text>
        </View>
        {provider.isActiveNow && (
          <View style={styles.activeIndicator}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        )}
      </View>

      {/* Service Name */}
      <Text style={styles.serviceName} numberOfLines={2}>
        {provider.serviceName}
      </Text>

      {/* Rating and Reviews */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingStar}>⭐</Text>
        <Text style={styles.ratingText}>
          {provider.rating.toFixed(1)} ({provider.reviews || 0} review{provider.reviews !== 1 ? 's' : ''})
        </Text>
      </View>

      {/* Footer with Price/Swap Info */}
      <View style={styles.footer}>
        {provider.paidPrice ? (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.priceValue}>${provider.paidPrice}/hr</Text>
          </View>
        ) : null}
        {provider.acceptsSwap && (
          <View style={styles.swapBadge}>
            <Text style={styles.swapText}>🔄 Accepts Swap</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

ProviderCard.displayName = 'ProviderCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    color: '#6b7280',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  activeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 10,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingStar: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  swapBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  swapText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
});

export default ProviderCard;