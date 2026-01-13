import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import types and data
import { Review, ReviewsScreenProps, StarRatingProps, ReviewCardProps, RatingDistributionProps } from '../_types/review';
import { MOCK_REVIEWS, validateReviews } from '../_data/mockReviews';
import { UI_CONSTANTS, colors } from '../_constants/theme';

// StarRating Component - Optimized with React.memo
const StarRating = React.memo<StarRatingProps>(({ rating }) => {
  const stars = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        size={UI_CONSTANTS.STAR_SIZE}
        color={i < rating ? colors.star.filled : colors.star.empty}
        style={styles.star}
      />
    )), [rating]
  );
  
  return (
    <View 
      style={styles.starsContainer}
      accessibilityRole="text"
      accessibilityLabel={`Rating: ${rating} out of 5 stars`}
    >
      {stars}
    </View>
  );
});

StarRating.displayName = 'StarRating';

// ReviewCard Component - Extracted and optimized
const ReviewCard = React.memo<ReviewCardProps>(({ review }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ 
                uri: imageError ? undefined : review.partnerAvatar 
              }}
              style={styles.avatar}
              onError={() => setImageError(true)}
              accessibilityLabel={`${review.partnerName}'s profile picture`}
            />
            {imageError && (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={24} color={colors.text.secondary} />
              </View>
            )}
          </View>
          <View style={styles.reviewInfo}>
            <Text 
              style={styles.reviewerName}
              accessibilityRole="text"
              accessibilityLabel={`Review by ${review.partnerName}`}
            >
              {review.partnerName}
            </Text>
            <StarRating rating={review.rating} />
          </View>
        </View>
        <Text 
          style={styles.timeAgo}
          accessibilityRole="text"
        >
          {review.timeAgo}
        </Text>
      </View>

      <Text 
        style={styles.reviewComment}
        accessibilityRole="text"
        accessibilityLabel={`Review comment: ${review.comment}`}
      >
        {review.comment}
      </Text>

      <View style={styles.skillBadge}>
        <Text style={styles.skillBadgeEmoji} accessibilityLabel="skill emoji">📚</Text>
        <Text style={styles.skillBadgeText}>{review.skillExchanged}</Text>
      </View>
    </View>
  );
});

ReviewCard.displayName = 'ReviewCard';

// Rating Distribution Component
const RatingDistribution = React.memo<RatingDistributionProps>(({ distribution, totalReviews }) => {
  return (
    <View style={styles.distributionContainer}>
      {distribution.map((count, index) => {
        const rating = 5 - index;
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
        
        return (
          <View 
            key={rating} 
            style={styles.distributionRow}
            accessibilityRole="text"
            accessibilityLabel={`${rating} stars: ${percentage}% of reviews`}
          >
            <Text style={styles.ratingLabel}>{rating} ★</Text>
            <View style={styles.distributionBar}>
              <View
                style={[
                  styles.distributionFill,
                  { width: `${percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.distributionPercent}>{percentage}%</Text>
          </View>
        );
      })}
    </View>
  );
});

RatingDistribution.displayName = 'RatingDistribution';

// Error Component
const ErrorView = React.memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <View style={styles.errorContainer}>
    <Ionicons name="alert-circle" size={48} color={colors.error} />
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity 
      style={styles.retryButton} 
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Retry loading reviews"
    >
      <Text style={styles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
));

ErrorView.displayName = 'ErrorView';

// Loading Component
const LoadingView = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>Loading reviews...</Text>
  </View>
));

LoadingView.displayName = 'LoadingView';

// Main ReviewsScreen Component - First define the component function
const ReviewsScreenComponent: React.FC<ReviewsScreenProps> = ({ 
  visible, 
  onClose, 
  reviews = MOCK_REVIEWS,
  isLoading = false,
  error = null
}) => {
  const [localError, setLocalError] = useState<string | null>(error);

  // Validate reviews data
  const validatedReviews = useMemo(() => {
    if (!validateReviews(reviews)) {
      setLocalError('Invalid review data format');
      return MOCK_REVIEWS;
    }
    return reviews;
  }, [reviews]);

  // Calculate statistics
  const { averageRating, totalReviews, ratingDistribution } = useMemo(() => {
    if (validatedReviews.length === 0) {
      return { averageRating: 0, totalReviews: 0, ratingDistribution: [0, 0, 0, 0, 0] };
    }

    const total = validatedReviews.length;
    const sum = validatedReviews.reduce((acc, review) => acc + review.rating, 0);
    const average = Number((sum / total).toFixed(1));
    
    const distribution = [0, 0, 0, 0, 0];
    validatedReviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    
    return {
      averageRating: average,
      totalReviews: total,
      ratingDistribution: distribution.reverse()
    };
  }, [validatedReviews]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleRetry = useCallback(() => {
    setLocalError(null);
    // In real app, you would retry the API call here
  }, []);

  const handleImageError = useCallback(() => {
    Alert.alert('Image Error', 'Failed to load some profile images');
  }, []);

  const renderReviewItem = useCallback(({ item }: { item: Review }) => (
    <ReviewCard review={item} />
  ), []);

  const keyExtractor = useCallback((item: Review) => item.id, []);

  const ListHeaderComponent = useMemo(() => (
    <>
      {/* Overall Rating Section */}
      <View style={styles.ratingSection}>
        <View style={styles.ratingDisplay}>
          <StarRating rating={Math.floor(averageRating)} />
          <View style={styles.ratingText}>
            <Text 
              style={styles.averageRating}
              accessibilityRole="text"
              accessibilityLabel={`Average rating ${averageRating} out of 5`}
            >
              {averageRating}
            </Text>
            <Text 
              style={styles.reviewCount}
              accessibilityRole="text"
            >
              ({totalReviews} Reviews)
            </Text>
          </View>
        </View>

        <RatingDistribution 
          distribution={ratingDistribution} 
          totalReviews={totalReviews} 
        />
      </View>

      {/* Reviews List Header */}
      <View style={styles.reviewsHeaderSection}>
        <Text 
          style={styles.reviewsTitle}
          accessibilityRole="header"
        >
          Reviews from Partners
        </Text>
      </View>
    </>
  ), [averageRating, totalReviews, ratingDistribution]);

  if (localError) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Close reviews"
            >
              <Ionicons name="chevron-back" size={UI_CONSTANTS.ICON_SIZE + 4} color={colors.text.primary} />
            </TouchableOpacity>
            <Text 
              style={styles.headerTitle}
              accessibilityRole="header"
            >
              My Reviews
            </Text>
            <View style={{ width: UI_CONSTANTS.ICON_SIZE + 4 }} />
          </View>
          <ErrorView error={localError} onRetry={handleRetry} />
        </SafeAreaView>
      </Modal>
    );
  }

  if (isLoading) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Close reviews"
            >
              <Ionicons name="chevron-back" size={UI_CONSTANTS.ICON_SIZE + 4} color={colors.text.primary} />
            </TouchableOpacity>
            <Text 
              style={styles.headerTitle}
              accessibilityRole="header"
            >
              My Reviews
            </Text>
            <View style={{ width: UI_CONSTANTS.ICON_SIZE + 4 }} />
          </View>
          <LoadingView />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleClose} 
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Close reviews"
          >
            <Ionicons 
              name="chevron-back" 
              size={UI_CONSTANTS.ICON_SIZE + 4} 
              color={colors.text.primary} 
            />
          </TouchableOpacity>
          <Text 
            style={styles.headerTitle}
            accessibilityRole="header"
          >
            My Reviews
          </Text>
          <View style={{ width: UI_CONSTANTS.ICON_SIZE + 4 }} />
        </View>

        <FlatList
          data={validatedReviews}
          keyExtractor={keyExtractor}
          renderItem={renderReviewItem}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate item height
            offset: 200 * index,
            index,
          })}
        />
      </SafeAreaView>
    </Modal>
  );
};

// Export the memoized version
export const ReviewsScreen = React.memo(ReviewsScreenComponent);
ReviewsScreen.displayName = 'ReviewsScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: UI_CONSTANTS.SPACING.MD,
    paddingVertical: UI_CONSTANTS.SPACING.SM + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.white,
  },
  backButton: {
    padding: UI_CONSTANTS.SPACING.SM,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  contentContainer: {
    paddingBottom: UI_CONSTANTS.SPACING.LG,
  },
  ratingSection: {
    backgroundColor: colors.background.white,
    paddingHorizontal: UI_CONSTANTS.SPACING.LG,
    paddingVertical: UI_CONSTANTS.SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UI_CONSTANTS.SPACING.LG,
    gap: UI_CONSTANTS.SPACING.SM + 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: UI_CONSTANTS.SPACING.XS,
  },
  star: {
    marginHorizontal: 2,
  },
  ratingText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: UI_CONSTANTS.SPACING.XS,
  },
  averageRating: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  distributionContainer: {
    gap: UI_CONSTANTS.SPACING.SM + 4,
    maxWidth: 320,
    alignSelf: 'center',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: UI_CONSTANTS.SPACING.SM,
  },
  ratingLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    width: 30,
  },
  distributionBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: colors.star.filled,
    borderRadius: 3,
  },
  distributionPercent: {
    fontSize: 12,
    color: colors.text.tertiary,
    width: 35,
    textAlign: 'right',
  },
  reviewsHeaderSection: {
    paddingHorizontal: UI_CONSTANTS.SPACING.LG,
    paddingVertical: UI_CONSTANTS.SPACING.MD,
    backgroundColor: colors.background.gray,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  reviewCard: {
    backgroundColor: colors.background.white,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS * 2,
    padding: UI_CONSTANTS.SPACING.MD,
    marginHorizontal: UI_CONSTANTS.SPACING.LG,
    marginBottom: UI_CONSTANTS.SPACING.SM + 4,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: UI_CONSTANTS.SPACING.SM + 4,
  },
  reviewerInfo: {
    flexDirection: 'row',
    gap: UI_CONSTANTS.SPACING.SM + 4,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: UI_CONSTANTS.AVATAR_SIZE,
    height: UI_CONSTANTS.AVATAR_SIZE,
    borderRadius: UI_CONSTANTS.AVATAR_SIZE / 2,
  },
  avatarFallback: {
    backgroundColor: colors.background.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: UI_CONSTANTS.SPACING.XS,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  reviewComment: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: UI_CONSTANTS.SPACING.SM + 4,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.badge.purple.background,
    paddingHorizontal: UI_CONSTANTS.SPACING.SM + 4,
    paddingVertical: 6,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS * 2,
    alignSelf: 'flex-start',
  },
  skillBadgeEmoji: {
    fontSize: 14,
  },
  skillBadgeText: {
    fontSize: 12,
    color: colors.badge.purple.text,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UI_CONSTANTS.SPACING.LG,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: UI_CONSTANTS.SPACING.MD,
    marginBottom: UI_CONSTANTS.SPACING.LG,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: UI_CONSTANTS.SPACING.LG,
    paddingVertical: UI_CONSTANTS.SPACING.SM + 4,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS,
  },
  retryText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: UI_CONSTANTS.SPACING.MD,
  },
});
