import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface LearnFunnelCTAProps {
  skillName?: string;
  onClose: () => void;
}

export function LearnFunnelCTA({
  skillName = 'this skill',
  onClose,
}: LearnFunnelCTAProps) {
  const router = useRouter();

  const handleFindPartner = useCallback(() => {
    onClose();
    router.push({
      pathname: '/screens/learn-service',
      params: { skill: skillName },
    });
  }, [router, skillName, onClose]);

  return (
    <View style={styles.card}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={20} color="#6B7280" />
      </TouchableOpacity>

      {/* Badge */}
      <View style={styles.badge}>
        <Ionicons name="person-add" size={14} color="#2563EB" />
        <Text style={styles.badgeText}>Learning Mode</Text>
      </View>

      {/* Headline */}
      <Text style={styles.headline}>Ready to Practice?</Text>

      {/* Sub-headline */}
      <Text style={styles.subHeadline}>
        Find a partner on Swappy to practice{' '}
        <Text style={styles.topicText}>{skillName}</Text>
      </Text>

      {/* Social Proof */}
      <View style={styles.socialProof}>
        <View style={styles.avatarGroup}>
          <View style={[styles.avatar, { backgroundColor: '#3B82F6', marginRight: -10 }]}>
            <Text style={styles.avatarText}>MK</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: '#8B5CF6', marginRight: -10 }]}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: '#06B6D4' }]}>
            <Text style={styles.avatarText}>+18</Text>
          </View>
        </View>
        <Text style={styles.proofText}>Active learners ready to connect</Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleFindPartner}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Find a Partner</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
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
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
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
    color: '#2563EB',
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subHeadline: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  topicText: {
    fontWeight: '600',
    color: '#2563EB',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  proofText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#3B82F6',
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