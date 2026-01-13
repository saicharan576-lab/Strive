import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Types
interface Comment {
  readonly id: string;
  readonly userName: string;
  readonly userAvatar: string;
  readonly text: string;
  readonly timestamp: Date;
  readonly userId?: string;
}

interface CommentsBottomSheetProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly postTitle: string;
  readonly postId: string;
}

// Constants
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DRAG_THRESHOLD = 150;
const AVATAR_COLORS = [
  ['#A78BFA', '#6366F1'], // Purple
  ['#60A5FA', '#3B82F6'], // Blue
  ['#34D399', '#10B981'], // Green
  ['#FBBF24', '#F59E0B'], // Amber
  ['#F87171', '#EF4444'], // Red
] as const;

const MOCK_COMMENTS: readonly Comment[] = [
  {
    id: '1',
    userName: 'Sarah Chen',
    userAvatar: 'SC',
    text: 'The STAR method has been a game-changer for my interviews. Focus on quantifiable results!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    userName: 'David Kumar',
    userAvatar: 'DK',
    text: 'I struggled with behavioral questions until I practiced with a partner. Mock interviews are crucial!',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    userName: 'Emily Rodriguez',
    userAvatar: 'ER',
    text: "Pro tip: Record yourself answering questions. You'll catch filler words and improve your delivery.",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '4',
    userName: 'James Wilson',
    userAvatar: 'JW',
    text: 'The hardest part for me is articulating my thought process under pressure. Any tips?',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: '5',
    userName: 'Priya Sharma',
    userAvatar: 'PS',
    text: "I practice with Swappy partners weekly. It's like having a free interview coach!",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
  },
] as const;

// Helper Functions
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const getAvatarColor = (userName: string): readonly [string, string] => {
  const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// Sub-components
const DiscussionPrompt = React.memo(() => (
  <View style={styles.promptContainer}>
    <View style={styles.promptIconContainer}>
      <Ionicons name="sparkles" size={20} color="#FFF" />
    </View>
    <View style={styles.promptContent}>
      <Text style={styles.promptTitle}>
        <Text style={styles.promptTitleBold}>Join the discussion!</Text>
      </Text>
      <Text style={styles.promptText}>
        What's your biggest challenge with PM interviews?
      </Text>
    </View>
  </View>
));
DiscussionPrompt.displayName = 'DiscussionPrompt';

interface CommentItemProps {
  readonly comment: Comment;
  readonly isCurrentUser: boolean;
}

const CommentItem = React.memo<CommentItemProps>(({ comment, isCurrentUser }) => {
  const [color1, color2] = useMemo(() => getAvatarColor(comment.userName), [comment.userName]);
  
  return (
    <View style={styles.commentItem}>
      <View 
        style={[
          styles.avatar, 
          { 
            backgroundColor: isCurrentUser ? '#8B5CF6' : color1 
          }
        ]}
      >
        <Text style={styles.avatarText}>{comment.userAvatar}</Text>
      </View>
      
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text 
            style={[
              styles.userName,
              isCurrentUser && styles.userNameCurrent
            ]}
          >
            {comment.userName}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(comment.timestamp)}
          </Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
    </View>
  );
});
CommentItem.displayName = 'CommentItem';

// Main Component
export function CommentsBottomSheet({ 
  isOpen, 
  onClose, 
  postTitle, 
  postId 
}: CommentsBottomSheetProps) {
  const [comments, setComments] = useState<Comment[]>([...MOCK_COMMENTS]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const inputRef = useRef<TextInput>(null);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Pan Responder for drag to close
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > DRAG_THRESHOLD) {
        handleClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }).start();
      }
    },
  }), []);

  // Animation effects
  useEffect(() => {
    if (isOpen) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose]);

  const handleSubmitComment = useCallback(async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      // Example: await addComment({ postId, text: trimmedComment });
      
      const comment: Comment = {
        id: Date.now().toString(),
        userName: 'You',
        userAvatar: 'ME',
        text: trimmedComment,
        timestamp: new Date(),
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      inputRef.current?.blur();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isSubmitting, postId]);

  const commentCount = useMemo(() => comments.length, [comments.length]);

  const renderComment = useCallback(({ item }: { item: Comment }) => (
    <CommentItem 
      comment={item} 
      isCurrentUser={item.userName === 'You'} 
    />
  ), []);

  const keyExtractor = useCallback((item: Comment) => item.id, []);

  const ListHeaderComponent = useMemo(() => <DiscussionPrompt />, []);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            {/* Drag Handle */}
            <View 
              style={styles.dragHandleContainer}
              {...panResponder.panHandlers}
            >
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Discussion</Text>
                <Text style={styles.headerSubtitle}>
                  {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close comments"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={keyExtractor}
              ListHeaderComponent={ListHeaderComponent}
              contentContainerStyle={[
                styles.listContent,
                keyboardHeight > 0 && { paddingBottom: keyboardHeight + 80 }
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
            />

            {/* Input Section */}
            <View style={[
              styles.inputContainer,
              keyboardHeight > 0 && { marginBottom: keyboardHeight }
            ]}>
                <View style={styles.currentUserAvatar}>
                  <Text style={styles.avatarText}>ME</Text>
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Add your thoughts..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  onSubmitEditing={handleSubmitComment}
                  accessibilityLabel="Comment input"
                />
                <TouchableOpacity
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  style={[
                    styles.sendButton,
                    (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Send comment"
                  accessibilityState={{ disabled: !newComment.trim() || isSubmitting }}
                >
                  <Ionicons 
                    name="send" 
                    size={18} 
                    color={newComment.trim() && !isSubmitting ? '#FFF' : '#9CA3AF'} 
                  />
                </TouchableOpacity>
              </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  sheet: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 48,
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  promptContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
  },
  promptIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  promptContent: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  promptTitleBold: {
    fontWeight: '600',
  },
  promptText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  userNameCurrent: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  currentUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
});
