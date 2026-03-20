import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Post, ReactionType } from '../../_types/post';
import { CommentsBottomSheet } from '../../screens/comments';

const SCREEN_WIDTH = Dimensions.get('window').width;

/** Returns a human-readable relative time string */
const getRelativeTime = (date?: Date): string => {
  if (!date) return 'Just now';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// --- Sub-components ---

/** User avatar: shows profile image or initials fallback */
const Avatar = React.memo<{ avatar: string; username: string }>(({ avatar, username }) => {
  const isUrl = avatar.startsWith('http');
  const initials = username
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'A';

  if (isUrl) {
    return <Image source={{ uri: avatar }} style={styles.avatarImage} />;
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
});
Avatar.displayName = 'Avatar';

/** Post header: avatar, name, time, options */
const PostHeader = React.memo<{
  username: string;
  avatar: string;
  createdAt?: Date;
  tags?: readonly string[];
}>(({ username, avatar, createdAt, tags }) => {
  const timeLabel = useMemo(() => getRelativeTime(createdAt), [createdAt]);
  const tagLabel = tags && tags.length > 0 ? tags[0] : null;

  return (
    <View style={styles.header}>
      <Avatar avatar={avatar} username={username} />
      <View style={styles.headerInfo}>
        <Text style={styles.username} numberOfLines={1}>{username}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>{timeLabel}</Text>
          {tagLabel && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.tagText} numberOfLines={1}>{tagLabel}</Text>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Post options"
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
});
PostHeader.displayName = 'PostHeader';

/** Text body: title + description with "see more" */
const PostBody = React.memo<{
  title: string;
  description?: string;
}>(({ title, description }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <>
          <Text
            style={styles.description}
            numberOfLines={expanded ? undefined : 3}
          >
            {description}
          </Text>
          {description.length > 150 && !expanded && (
            <TouchableOpacity onPress={() => setExpanded(true)}>
              <Text style={styles.seeMore}>...see more</Text>
            </TouchableOpacity>
          )}
        </>
      ) : null}
    </View>
  );
});
PostBody.displayName = 'PostBody';

/** Image media block — only rendered when thumbnail URL exists */
const PostImage = React.memo<{ uri: string }>(({ uri }) => (
  <Image
    source={{ uri }}
    style={styles.mediaImage}
    resizeMode="cover"
    accessibilityLabel="Post image"
  />
));
PostImage.displayName = 'PostImage';

/** Video placeholder — rendered for video type posts */
const PostVideo = React.memo<{ uri: string }>(({ uri }) => (
  <View style={styles.videoContainer}>
    <Image source={{ uri }} style={styles.mediaImage} resizeMode="cover" />
    <View style={styles.videoOverlay}>
      <View style={styles.playButton}>
        <Ionicons name="play" size={32} color="#fff" />
      </View>
    </View>
  </View>
));
PostVideo.displayName = 'PostVideo';

/** Engagement bar: likes, comments, share, bookmark */
const EngagementBar = React.memo<{
  likes: number;
  comments: number;
  activeReaction?: ReactionType | null;
  onLikePress: () => void;
  onLikeLongPress: () => void;
  onCommentPress: () => void;
}>(({ likes, comments, activeReaction, onLikePress, onLikeLongPress, onCommentPress }) => {
  const hasAnyReaction = !!activeReaction;

  // Map reaction to display label & color
  const reactionConfig = activeReaction
    ? ({
        insightful: { icon: 'bulb' as const, label: 'Insightful', color: '#FCA311' },
        learn: { icon: 'book' as const, label: 'Want to learn', color: '#3B82F6' },
        teach: { icon: 'school' as const, label: 'Can teach', color: '#10B981' },
        celebrate: { icon: 'trophy' as const, label: 'Celebrate', color: '#F59E0B' },
      })[activeReaction]
    : null;

  return (
  <>
    {/* Like / comment counts */}
    {(likes > 0 || comments > 0) && (
      <View style={styles.countsRow}>
        {likes > 0 && (
          <View style={styles.countItem}>
            <Ionicons name="bulb" size={14} color="#8A2BE2" />
            <Text style={styles.countText}>{likes}</Text>
          </View>
        )}
        {comments > 0 && (
          <Text style={styles.countText}>
            {comments} comment{comments !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    )}

    <View style={styles.divider} />

    {/* Action buttons */}
    <View style={styles.actionsRow}>
      <TouchableOpacity
        style={[styles.actionButton, hasAnyReaction && styles.actionButtonActive]}
        onPress={onLikePress}
        onLongPress={onLikeLongPress}
        delayLongPress={500}
        accessibilityRole="button"
        accessibilityLabel={reactionConfig?.label || 'Insightful'}
      >
        <Ionicons
          name={reactionConfig?.icon || 'bulb-outline'}
          size={20}
          color={reactionConfig?.color || '#666'}
        />
        <Text style={[styles.actionLabel, hasAnyReaction && { color: reactionConfig?.color }]}>
          {reactionConfig?.label || 'Insightful'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onCommentPress}
        accessibilityRole="button"
        accessibilityLabel="Join Discussion"
      >
        <Ionicons name="chatbubble-outline" size={19} color="#666" />
        <Text style={styles.actionLabel}>Join Discussion</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        style={styles.iconOnlyButton}
        accessibilityRole="button"
        accessibilityLabel="Share"
      >
        <Ionicons name="share-social-outline" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconOnlyButton}
        accessibilityRole="button"
        accessibilityLabel="Save"
      >
        <Ionicons name="bookmark-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  </>
  );
});
EngagementBar.displayName = 'EngagementBar';

// --- Main PostCard ---

interface PostCardProps {
  post: Post;
  onLongPress: (postId: string) => void;
  activeReaction?: ReactionType | null;
  onReact?: (postId: string) => void;
}

export const PostCard = React.memo<PostCardProps>(({ post, onLongPress, activeReaction = null, onReact }) => {
  const [showComments, setShowComments] = useState(false);

  const handleLongPress = useCallback(() => {
    onLongPress(post.id);
  }, [post.id, onLongPress]);

  const handleLikePress = useCallback(() => {
    onReact?.(post.id);
  }, [post.id, onReact]);

  const handleCommentsPress = useCallback(() => {
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
  }, []);

  // Determine if media should render
  const hasMedia = !!post.thumbnail;
  const isVideo = post.type === 'video' && hasMedia;

  return (
    <View style={styles.card}>
      {/* Header */}
      <PostHeader
        username={post.username}
        avatar={post.avatar}
        createdAt={post.createdAt}
        tags={post.tags}
      />

      {/* Text body */}
      <PostBody title={post.title} description={post.description} />

      {/* Conditional media: only rendered when thumbnail exists */}
      {hasMedia && (
        isVideo
          ? <PostVideo uri={post.thumbnail!} />
          : <PostImage uri={post.thumbnail!} />
      )}

      {/* Engagement */}
      <EngagementBar
        likes={post.likes}
        comments={post.comments}
        activeReaction={activeReaction}
        onLikePress={handleLikePress}
        onLikeLongPress={handleLongPress}
        onCommentPress={handleCommentsPress}
      />

      {/* Comments Bottom Sheet */}
      <CommentsBottomSheet
        isOpen={showComments}
        onClose={handleCloseComments}
        postTitle={post.title}
        postId={post.id}
      />
    </View>
  );
});

PostCard.displayName = 'PostCard';

const styles = StyleSheet.create({
  // Card container — LinkedIn-style
  card: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5E5',
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191919',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  metaDot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#8A2BE2',
    fontWeight: '500',
    flexShrink: 1,
  },

  // --- Body ---
  body: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#191919',
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  seeMore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },

  // --- Media ---
  mediaImage: {
    width: SCREEN_WIDTH,
    height: undefined,
    aspectRatio: 16 / 9,
    backgroundColor: '#F0F0F0',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },

  // --- Counts row ---
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 13,
    color: '#666',
  },

  // --- Divider ---
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },

  // --- Action buttons ---
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: '#F5F0FF',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  iconOnlyButton: {
    padding: 10,
  },
});
