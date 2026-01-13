import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../_types/post';
import { CommentsBottomSheet } from '../../screens/comments';

interface PostCardProps {
  post: Post;
  onLongPress: (postId: string) => void;
}

export const PostCard = React.memo<PostCardProps>(({ post, onLongPress }) => {
  const [showComments, setShowComments] = useState(false);

  const handleLongPress = useCallback(() => {
    onLongPress(post.id);
  }, [post.id, onLongPress]);

  const handleCommentsPress = useCallback(() => {
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
  }, []);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{post.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.username}</Text>
          <Text style={styles.timeAgo}>Just now</Text>
        </View>
        <TouchableOpacity 
          accessibilityRole="button"
          accessibilityLabel="Post options"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Image
        source={{ uri: post.thumbnail }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {post.title}
        </Text>
        {post.description && (
          <Text style={styles.postDescription} numberOfLines={3}>
            {post.description}
          </Text>
        )}
      </View>

      {/* Engagement Row */}
      <View style={styles.engagementRow}>
        <TouchableOpacity
          style={styles.iconGroup}
          onLongPress={handleLongPress}
          delayLongPress={500}
          accessibilityRole="button"
          accessibilityLabel={`${post.likes} likes`}
        >
          <Ionicons name="bulb-outline" size={24} color="black" />
          <Text style={styles.iconText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconGroup}
          onPress={handleCommentsPress}
          accessibilityRole="button"
          accessibilityLabel={`${post.comments} comments`}
        >
          <Ionicons name="chatbubble-outline" size={22} color="black" />
          <Text style={styles.iconText}>{post.comments}</Text>
        </TouchableOpacity>
        
        <View style={{ flex: 1 }} />
        
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Share post">
          <Ionicons 
            name="share-social-outline" 
            size={24} 
            color="black"
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>
        
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Bookmark post">
          <Ionicons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

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
  card: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  timeAgo: {
    color: 'gray',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContent: {
    marginBottom: 10,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  postDescription: {
    color: '#555',
    lineHeight: 20,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
});
