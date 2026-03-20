export type PostType = 'text' | 'image' | 'video';

export interface Post {
  readonly id: string;
  readonly username: string;
  readonly avatar: string;
  readonly thumbnail?: string | null;
  readonly title: string;
  readonly description?: string;
  readonly likes: number;
  readonly comments: number;
  readonly createdAt?: Date;
  readonly tags?: readonly string[];
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly type: PostType;
}

export interface FeedScreenProps {
  onNavigateToSwappy?: () => void;
}

export type ReactionType = 'teach' | 'learn' | 'insightful' | 'celebrate';
