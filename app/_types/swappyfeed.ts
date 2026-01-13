export interface Review {
  readonly id: string;
  readonly userName: string;
  readonly userAvatar: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly comment: string;
  readonly timeAgo: string;
}

export interface SkillWithLevel {
  readonly name: string;
  readonly level: 'Expert' | 'Intermediate' | 'Amateur' | 'Beginner';
}

export interface ServiceProvider {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly title: string;
  readonly serviceName: string;
  readonly rating: number;
  readonly reviews: number;
  readonly category: string;
  readonly paidPrice?: number;
  readonly acceptsSwap: boolean;
  readonly skillsOffered?: readonly SkillWithLevel[];
  readonly skillsWanted?: readonly SkillWithLevel[];
  readonly availability?: readonly string[];
  readonly timeSlots?: string;
  readonly bio?: string;
  readonly isActiveNow?: boolean;
  readonly detailedReviews?: readonly Review[];
}

export interface SwappyFeedProps {
  onRequestSwap?: (
    userId: string,
    userName: string,
    userAvatar: string,
    skillOffered: string,
    skillWanted: string
  ) => void;
  onClose?: () => void;
}

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
}
