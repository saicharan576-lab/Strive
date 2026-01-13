export interface Post {
  readonly id: string;
  readonly username: string;
  readonly avatar: string;
  readonly thumbnail: string;
  readonly title: string;
  readonly description?: string;
  readonly likes: number;
  readonly comments: number;
  readonly createdAt?: Date;
  readonly tags?: readonly string[];
}

export interface FeedScreenProps {
  onNavigateToSwappy?: () => void;
}

export type ReactionType = 'teach' | 'learn' | 'insightful' | 'celebrate';
