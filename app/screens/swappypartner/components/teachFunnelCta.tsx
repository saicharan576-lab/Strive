import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface TeachFunnelCTAProps {
  topic?: string;
  onOfferService: () => void;
  onClose: () => void;
}

export function TeachFunnelCTA({
  topic = 'this skill',
  onOfferService,
  onClose,
}: TeachFunnelCTAProps) {
  const router = useRouter();

  const handleOfferService = () => {
    onOfferService();
    // Navigate to the teach service screen to add the teaching service
    router.push({
      pathname: '/screens/teach-service',
      params: { skill: topic },
    });
  };

  return (
    <View style={styles.card}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Badge */}
      <View style={styles.badge}>
        <Ionicons name="medal" size={14} color="#16A34A" />
        <Text style={styles.badgeText}>Teaching Mode</Text>
      </View>

      {/* Headline */}
      <View style={styles.headlineContainer}>
        <Text style={styles.headline}>You're an Expert!</Text>
        <Text style={styles.sparkle}>✨</Text>
      </View>

      {/* Sub-headline */}
      <Text style={styles.subHeadline}>
        Help others & get paid or swap. Add{' '}
        <Text style={styles.topicText}>{topic}</Text> to your profile.
      </Text>

      {/* Value Props */}
      <View style={styles.valuePropsContainer}>
        <View style={styles.valueProp}>
          <Text style={styles.propEmoji}>💰</Text>
          <Text style={styles.propText}>Earn money</Text>
        </View>

        <View style={styles.valueProp}>
          <Text style={styles.propEmoji}>🔁</Text>
          <Text style={styles.propText}>Skill swap</Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleOfferService}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Offer this Service</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* Secondary action */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onClose}
      >
        <Text style={styles.secondaryButtonText}>Maybe Later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 12,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  headlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  sparkle: {
    fontSize: 16,
  },
  subHeadline: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  topicText: {
    fontWeight: '600',
    color: '#16A34A',
  },
  valuePropsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  valueProp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  propEmoji: {
    fontSize: 18,
  },
  propText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '500',
  },
});