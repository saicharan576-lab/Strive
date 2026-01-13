import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReviewsScreen } from '../reviewscreen';

interface SkillWithLevel {
  readonly name: string;
  readonly level: string;
}

interface Review {
  readonly id: string;
  readonly userName: string;
  readonly userAvatar: string;
  readonly rating: number;
  readonly comment: string;
  readonly timeAgo: string;
}

interface Partner {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly isActiveNow: boolean;
  readonly skillsOffered: SkillWithLevel[];
  readonly skillsWanted: SkillWithLevel[];
  readonly availability: string[];
  readonly timeSlots: string;
  readonly bio: string;
  readonly reviews: Review[];
}

interface PartnerProfileProps {
  partner: Partner;
  onBack: () => void;
  onRequestSwap: () => void;
}

interface ColorScheme {
  readonly bg: string;
  readonly text: string;
  readonly border: string;
}

const LEVEL_COLORS: Record<string, ColorScheme> = {
  'Beginner': { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
  'Amateur': { bg: '#DCFCE7', text: '#15803D', border: '#BBFBE0' },
  'Intermediate': { bg: '#FED7AA', text: '#92400E', border: '#FDBA74' },
  'Expert': { bg: '#E9D5FF', text: '#6B21A8', border: '#D8B4FE' },
} as const;

const DEFAULT_COLORS: ColorScheme = { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };

const BIO_PREVIEW_LENGTH = 120;

const getLevelColor = (level: string): ColorScheme => {
  return LEVEL_COLORS[level] || DEFAULT_COLORS;
};

const StarRating = React.memo<{ rating: number }>(({ rating }) => (
  <View style={styles.starContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Text
        key={star}
        style={[
          styles.star,
          { color: star <= rating ? '#14B8A6' : '#E5E7EB' },
        ]}
      >
        ★
      </Text>
    ))}
  </View>
));

StarRating.displayName = 'StarRating';

const MOCK_PARTNERS: readonly Partner[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'https://via.placeholder.com/128?text=AJ',
    rating: 4.8,
    reviewCount: 2,
    isActiveNow: true,
    skillsOffered: [
      { name: 'Web Design', level: 'Expert' },
      { name: 'Graphic Design', level: 'Expert' },
    ],
    skillsWanted: [
      { name: 'Photography', level: 'Intermediate' },
      { name: 'Video Editing', level: 'Beginner' },
    ],
    availability: ['Weekdays', 'Evenings'],
    timeSlots: 'Monday & Wednesday 10 AM - 2 PM',
    bio: 'Passionate web designer with 7 years of experience crafting intuitive and beautiful user interfaces.',
    reviews: [
      {
        id: '1',
        userName: 'Sarah Chen',
        userAvatar: 'https://via.placeholder.com/40?text=SC',
        rating: 5,
        comment: 'Alex did an amazing job on my website!',
        timeAgo: '2 days ago',
      },
    ],
  },
  {
    id: '2',
    name: 'Sriram K.',
    avatar: 'https://via.placeholder.com/128?text=SK',
    rating: 4.9,
    reviewCount: 82,
    isActiveNow: true,
    skillsOffered: [
      { name: 'Product Management', level: 'Expert' },
      { name: 'Mock Interviews', level: 'Expert' },
    ],
    skillsWanted: [
      { name: 'Design', level: 'Intermediate' },
    ],
    availability: ['Weekdays', 'Evenings'],
    timeSlots: 'Tuesday & Thursday 6 PM - 8 PM',
    bio: 'Senior Product Manager at PepsiCo with extensive experience in product strategy and leadership.',
    reviews: [],
  },
] as const;

interface SkillSectionProps {
  readonly title: string;
  readonly skills: readonly SkillWithLevel[];
  readonly isOffered?: boolean;
}

const SkillSection = React.memo<SkillSectionProps>(({ title, skills, isOffered }) => {
  const skillTags = useMemo(() => 
    skills.map((skill, index) => {
      const colors = isOffered
        ? { bg: '#FCD34D', text: '#FFFFFF', border: '#FBBF24' }
        : getLevelColor(skill.level);

      return (
        <View
          key={`${skill.name}-${index}`}
          style={[
            styles.skillTag,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.skillName, { color: colors.text }]}>
            {skill.name}
          </Text>
          <Text style={[styles.skillLevel, { color: colors.text }]}>
            {skill.level}
          </Text>
        </View>
      );
    }), [skills, isOffered]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.skillsContainer}>
        {skillTags}
      </View>
    </View>
  );
});

SkillSection.displayName = 'SkillSection';

interface ReviewCardProps {
  readonly review: Review;
}

const ReviewCard = React.memo<ReviewCardProps>(({ review }) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewHeader}>
      <Image
        source={{ uri: review.userAvatar }}
        style={styles.reviewAvatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.reviewerName}>{review.userName}</Text>
        <StarRating rating={review.rating} />
      </View>
    </View>
    <Text style={styles.reviewComment}>{review.comment}</Text>
    <Text style={styles.reviewTime}>{review.timeAgo}</Text>
  </View>
));

ReviewCard.displayName = 'ReviewCard';

const AvailabilitySection = React.memo<{ 
  availability: readonly string[]; 
  timeSlots?: string; 
}>(({ availability, timeSlots }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Availability</Text>
    <View style={styles.availabilityContainer}>
      {availability.map((slot, index) => (
        <View key={index} style={styles.availabilityBadge}>
          <Ionicons name="calendar-outline" size={14} color="#0D9488" />
          <Text style={styles.availabilityText}>{slot}</Text>
        </View>
      ))}
    </View>
    {timeSlots && (
      <View style={styles.timeSlotsContainer}>
        <Ionicons name="time-outline" size={14} color="#374151" />
        <Text style={styles.timeSlotsText}>{timeSlots}</Text>
      </View>
    )}
  </View>
));

AvailabilitySection.displayName = 'AvailabilitySection';

const BioSection = React.memo<{ bio: string }>(({ bio }) => {
  const [bioExpanded, setBioExpanded] = useState(false);

  const shortBio = useMemo(() => bio.slice(0, BIO_PREVIEW_LENGTH), [bio]);
  const needsExpansion = useMemo(() => bio.length > BIO_PREVIEW_LENGTH, [bio]);

  const handleToggleBio = useCallback(() => {
    setBioExpanded(prev => !prev);
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bio</Text>
      <Text style={styles.bioText}>
        {bioExpanded || !needsExpansion ? bio : `${shortBio}...`}
      </Text>
      {needsExpansion && (
        <TouchableOpacity onPress={handleToggleBio}>
          <Text style={styles.readMoreButton}>
            {bioExpanded ? 'Show Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

BioSection.displayName = 'BioSection';

const ReviewsSection = React.memo<{ 
  reviews: readonly Review[]; 
  onViewAll: () => void; 
}>(({ reviews, onViewAll }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      Reviews ({reviews.length})
    </Text>
    {reviews.length === 0 ? (
      <Text style={styles.noReviewsText}>No reviews yet</Text>
    ) : (
      <View style={styles.reviewsContainer}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </View>
    )}
  </View>
));

ReviewsSection.displayName = 'ReviewsSection';

function PartnerProfileComponent({
  partner,
  onBack,
  onRequestSwap,
}: PartnerProfileProps) {
  const [showReviews, setShowReviews] = useState(false);

  const handleShowReviews = useCallback(() => {
    setShowReviews(true);
  }, []);

  const handleCloseReviews = useCallback(() => {
    setShowReviews(false);
  }, []);

  const roundedRating = useMemo(() => Math.floor(partner.rating), [partner.rating]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={onBack} 
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.profilePictureContainer}>
          <Image
            source={{ uri: partner.avatar }}
            style={styles.profilePicture}
          />
          {partner.isActiveNow && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
            </View>
          )}
        </View>

        <Text style={styles.partnerName}>{partner.name}</Text>

        <TouchableOpacity 
          style={styles.ratingContainer} 
          onPress={handleShowReviews}
          accessibilityRole="button"
          accessibilityLabel="View reviews"
        >
          <StarRating rating={roundedRating} />
          <Text style={styles.ratingText}>{partner.rating}</Text>
          <Text style={styles.reviewCount}>({partner.reviewCount} reviews)</Text>
        </TouchableOpacity>

        <SkillSection title="Skills Offered" skills={partner.skillsOffered} isOffered />
        <SkillSection title="Skills Wanted" skills={partner.skillsWanted} />
        <AvailabilitySection availability={partner.availability} timeSlots={partner.timeSlots} />
        <BioSection bio={partner.bio} />
        <ReviewsSection reviews={partner.reviews} onViewAll={handleShowReviews} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onRequestSwap}
          style={styles.requestButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Request skill swap"
        >
          <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.requestButtonText}>Request Swap</Text>
        </TouchableOpacity>
      </View>

      <ReviewsScreen
        visible={showReviews}
        onClose={handleCloseReviews}
      />
    </SafeAreaView>
  );
}

export default function SwappyPartnerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const partnerId = typeof params.partnerId === 'string' ? params.partnerId : '';
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (partnerId) {
      const foundPartner = MOCK_PARTNERS.find(p => p.id === partnerId);
      setPartner(foundPartner || null);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [partnerId]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleRequestSwap = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // Example: await requestSwap({ partnerId, userId });
      console.log('Swap requested with:', partnerId);
      
      Alert.alert(
        'Swap Request Sent',
        `Your swap request has been sent to ${partner?.name || 'the partner'}.`,
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (error) {
      console.error('Error requesting swap:', error);
      Alert.alert(
        'Error',
        'Failed to send swap request. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [partnerId, partner, router]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </SafeAreaView>
    );
  }

  if (!partner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Partner Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>Partner not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PartnerProfileComponent
      partner={partner}
      onBack={handleBack}
      onRequestSwap={handleRequestSwap}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    position: 'relative',
  },
  profilePicture: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#14B8A6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  partnerName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
  },
  skillLevel: {
    fontSize: 12,
    opacity: 0.8,
  },
  availabilityContainer: {
    gap: 8,
    marginBottom: 12,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#CCFBF1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#99F6E4',
    gap: 6,
  },
  availabilityText: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '500',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  timeSlotsText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  bioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreButton: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
    marginTop: 8,
  },
  reviewsContainer: {
    gap: 16,
  },
  reviewItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  requestButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});