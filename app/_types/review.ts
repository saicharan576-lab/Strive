export interface ReviewsScreenProps {
  visible: boolean;
  onClose: () => void;
  reviews?: readonly Review[];
  isLoading?: boolean;
  error?: string | null;
}

export interface Review {
  readonly id: string;
  readonly partnerName: string;
  readonly partnerAvatar: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly comment: string;
  readonly timeAgo: string;
  readonly skillExchanged: string;
}

export interface StarRatingProps {
  rating: number;
}

export interface ReviewCardProps {
  review: Review;
}

export interface RatingDistributionProps {
  distribution: number[];
  totalReviews: number;
}