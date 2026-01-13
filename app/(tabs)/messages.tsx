import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Conversation } from '../App';

// Swap State Types
type SwapState = 'matched' | 'chatting' | 'accepted' | 'in-progress' | 'completed' | 'reviewed';

const SWAP_STATES: { id: SwapState; label: string }[] = [
  { id: 'matched', label: 'Matched' },
  { id: 'chatting', label: 'Chatting' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'reviewed', label: 'Reviewed' },
];

// Helper function to determine current swap state
function getCurrentSwapState(conversation: Conversation): SwapState {
  if (conversation.hasReviewed) return 'reviewed';
  if (conversation.swapCompleted) return 'completed';
  if (conversation.swapAccepted) return 'in-progress';
  const msgs = Array.isArray(conversation.messages) ? conversation.messages : [];
  if (msgs.length > 2) return 'chatting';
  if (msgs.length === 1) return 'accepted';
  return 'matched';
}

interface MessagesProps {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  handleSendMessage: (userId: string, userName: string, userAvatar: string, messageText: string, skillOffered: string, skillWanted: string) => void;
  handleAcceptSwap: (conversationId: string) => void;
  handleCompleteSwap: (conversationId: string) => void;
  handleSubmitReview: (conversationId: string) => void;
}

export default function Messages({
  conversations = [],
  setConversations = () => {},
  handleSendMessage = () => {},
  handleAcceptSwap = () => {},
  handleCompleteSwap = () => {},
  handleSubmitReview = () => {},
}: MessagesProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);

  const handleSend = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: 'You',
            text: messageText,
            timestamp: new Date(),
          }],
          lastMessage: messageText,
          lastMessageTime: new Date(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations as any);
    setMessageText('');
    
    // Update selected conversation
    const updated = updatedConversations.find(c => c.id === selectedConversation.id);
    if (updated) setSelectedConversation(updated as any);
  };

  const handleReviewSubmit = () => {
    if (selectedConversation && rating > 0) {
      handleSubmitReview(selectedConversation.id);
      setShowReviewModal(false);
      setRating(0);
      setReviewComment('');
    }
  };

  // Conversation List View
  if (!selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="mail-outline" size={32} color="#999" />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Request a swap to start a conversation</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item: conversation }) => (
              <TouchableOpacity
                onPress={() => setSelectedConversation(conversation)}
                style={styles.conversationItem}
              >
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatar}>{conversation.userAvatar}</Text>
                </View>
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{conversation.userName}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {conversation.lastMessage}
                  </Text>
                  {conversation.swapCompleted && !conversation.hasReviewed && (
                    <Text style={styles.reviewPrompt}>⭐ Please leave a review</Text>
                  )}
                </View>
                {conversation.unread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // Chat View
  return (
    <View style={styles.container}>
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          onPress={() => setSelectedConversation(null)}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{selectedConversation.userName}</Text>
          {selectedConversation.swapAccepted && (
            <View style={styles.swapAcceptedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#00BFA5" />
              <Text style={styles.swapAcceptedText}>Swap accepted</Text>
            </View>
          )}
        </View>
        {selectedConversation.swapAccepted && (
          <TouchableOpacity onPress={() => alert('Starting video call...')} style={styles.videoButton}>
            <Ionicons name="videocam" size={20} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setShowSessionDetails(true)}
          style={styles.infoButton}
        >
          <Ionicons name="information-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Swap Progress Timeline */}
      <View style={styles.progressSection}>
        {(() => {
          const currentState = getCurrentSwapState(selectedConversation);
          const currentIndex = SWAP_STATES.findIndex(s => s.id === currentState);
          const progressPercentage = ((currentIndex + 1) / SWAP_STATES.length) * 100;

          return (
            <View style={styles.timelineContainer}>
              {/* Progress Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                </View>
              </View>

              {/* Timeline Steps */}
              <View style={styles.stepsContainer}>
                {SWAP_STATES.map((state, index) => {
                  const isCompleted = index <= currentIndex;
                  return (
                    <View key={state.id} style={styles.stepItem}>
                      <View style={[styles.stepCircle, isCompleted && styles.stepCircleCompleted]}>
                        {isCompleted && <Ionicons name="checkmark" size={12} color="white" />}
                      </View>
                      <Text style={[styles.stepLabel, isCompleted && styles.stepLabelCompleted]}>
                        {state.label}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Session Info */}
              {selectedConversation.swapAccepted && !selectedConversation.swapCompleted && (
                <View style={styles.sessionInfo}>
                  <Ionicons name="calendar" size={16} color="#00BFA5" />
                  <View style={styles.sessionInfoText}>
                    <Text style={styles.sessionInfoLabel}>Next Session</Text>
                    <Text style={styles.sessionInfoTime}>Mon, Nov 11 at 2:00 PM</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowScheduleSheet(true)}>
                    <Text style={styles.rescheduleText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })()}
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer}>
        {selectedConversation.messages.map((message: any) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.senderId === 'me' ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.senderId === 'me' ? styles.sentBubble : styles.receivedBubble,
              ]}
            >
              <Text style={[styles.messageText, message.senderId === 'me' && styles.sentMessageText]}>
                {message.text}
              </Text>
              <Text style={[styles.messageTime, message.senderId === 'me' && styles.sentMessageTime]}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Action Banners */}
      {!selectedConversation.swapAccepted && selectedConversation.messages.length > 0 && (
        <View style={styles.actionBanner}>
          <Text style={styles.actionBannerText}>Accept this swap request?</Text>
          <TouchableOpacity
            onPress={() => handleAcceptSwap(selectedConversation.id)}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedConversation.swapAccepted && !selectedConversation.swapCompleted && (
        <View style={styles.completeBanner}>
          <Text style={styles.completeBannerText}>Session complete?</Text>
          <TouchableOpacity
            onPress={() => handleCompleteSwap(selectedConversation.id)}
            style={styles.completeButton}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedConversation.swapCompleted && !selectedConversation.hasReviewed && (
        <View style={styles.reviewBanner}>
          <Text style={styles.reviewBannerText}>Leave a review for {selectedConversation.userName}</Text>
          <TouchableOpacity
            onPress={() => setShowReviewModal(true)}
            style={styles.reviewButton}
          >
            <Ionicons name="star" size={14} color="white" />
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message Input */}
      <View style={styles.inputSection}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="attach" size={18} color="#666" />
            <Text style={styles.actionButtonText}>Attach</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, isRecording && styles.recordingButton]}>
            <Ionicons name="mic" size={18} color={isRecording ? '#F44336' : '#666'} />
            <Text style={[styles.actionButtonText, isRecording && styles.recordingText]}>
              {isRecording ? 'Recording...' : 'Voice'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim()}
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              How was your experience with {selectedConversation.userName}?
            </Text>

            {/* Star Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= rating ? '#FFD700' : '#DDD'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Comment (optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience..."
                placeholderTextColor="#999"
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleReviewSubmit}
              disabled={rating === 0}
              style={[styles.submitReviewButton, rating === 0 && styles.submitReviewButtonDisabled]}
            >
              <Text style={styles.submitReviewButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Session Details Bottom Sheet */}
      <Modal
        visible={showSessionDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSessionDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Session Details</Text>
            <TouchableOpacity onPress={() => setShowSessionDetails(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Session Info */}
            <View style={styles.sessionDetailsBox}>
              <View style={styles.sessionDetailsHeader}>
                <View style={styles.sessionDetailsIcon}>
                  <Ionicons name="calendar" size={24} color="white" />
                </View>
                <View style={styles.sessionDetailsText}>
                  <Text style={styles.sessionDetailsTitle}>Session Scheduled</Text>
                  <Text style={styles.sessionDetailsDate}>Monday, November 11, 2024</Text>
                </View>
              </View>
              <View style={styles.sessionDetailsGrid}>
                <View style={styles.sessionDetailItem}>
                  <View style={styles.sessionDetailItemIcon}>
                    <Ionicons name="time-outline" size={16} color="#00BFA5" />
                  </View>
                  <Text style={styles.sessionDetailItemLabel}>Time</Text>
                  <Text style={styles.sessionDetailItemValue}>2:00 PM - 3:00 PM</Text>
                </View>
                <View style={styles.sessionDetailItem}>
                  <View style={styles.sessionDetailItemIcon}>
                    <Ionicons name="timer-outline" size={16} color="#00BFA5" />
                  </View>
                  <Text style={styles.sessionDetailItemLabel}>Duration</Text>
                  <Text style={styles.sessionDetailItemValue}>60 minutes</Text>
                </View>
              </View>
            </View>

            {/* Swap Details */}
            <View style={styles.swapDetailsSection}>
              <Text style={styles.swapDetailsTitle}>Skill Exchange</Text>
              <View style={styles.skillBox}>
                <Text style={styles.skillLabel}>You're providing</Text>
                <Text style={styles.skillValue}>Web Design Consultation</Text>
              </View>
              <View style={[styles.skillBox, styles.skillBoxReceiving]}>
                <Text style={styles.skillLabel}>You're receiving</Text>
                <Text style={styles.skillValue}>{selectedConversation.skillOffered || 'Photography Tips & Tricks'}</Text>
              </View>
            </View>

            {/* Video Call Button */}
            <TouchableOpacity
              style={styles.joinCallButton}
              onPress={() => alert('Opening video call...')}
            >
              <Ionicons name="videocam" size={18} color="white" />
              <Text style={styles.joinCallButtonText}>Join Video Call</Text>
            </TouchableOpacity>

            {/* Session Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Session Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes for this session..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Schedule Bottom Sheet */}
      <Modal
        visible={showScheduleSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScheduleSheet(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Session</Text>
            <TouchableOpacity onPress={() => setShowScheduleSheet(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Date Selection */}
            <View style={styles.dateSection}>
              <Text style={styles.dateTitle}>Select Date</Text>
              <View style={styles.dateGrid}>
                {['Mon 11', 'Tue 12', 'Wed 13', 'Thu 14', 'Fri 15', 'Sat 16'].map((date) => (
                  <TouchableOpacity key={date} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>{date}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Slots */}
            <View style={styles.timeSection}>
              <Text style={styles.timeTitle}>Available Time Slots</Text>
              {['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map((time) => (
                <TouchableOpacity key={time} style={styles.timeSlot}>
                  <View>
                    <Text style={styles.timeSlotText}>{time}</Text>
                    <Text style={styles.timeSlotDuration}>60 minutes</Text>
                  </View>
                  <Ionicons name="time-outline" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration Selection */}
            <View style={styles.durationSection}>
              <Text style={styles.durationTitle}>Session Duration</Text>
              <View style={styles.durationGrid}>
                {['30 min', '60 min', '90 min'].map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationButton,
                      duration === '60 min' && styles.durationButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        duration === '60 min' && styles.durationButtonTextActive,
                      ]}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmScheduleButton}
              onPress={() => {
                setShowScheduleSheet(false);
                alert('Session scheduled successfully!');
              }}
            >
              <Text style={styles.confirmScheduleButtonText}>Confirm Schedule</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 24,
    color: 'white',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  reviewPrompt: {
    fontSize: 12,
    color: '#7C3AED',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
    marginTop: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  swapAcceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  swapAcceptedText: {
    fontSize: 11,
    color: '#00BFA5',
  },
  videoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00BFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    padding: 8,
  },
  progressSection: {
    backgroundColor: '#F3E8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timelineContainer: {
    gap: 12,
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: '#E9D5FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarBackground: {
    flex: 1,
    flexDirection: 'row',
  },
  progressBarFill: {
    backgroundColor: '#7C3AED',
    height: '100%',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  stepLabel: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: '#333',
    fontWeight: '600',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
    marginTop: 8,
  },
  sessionInfoText: {
    flex: 1,
  },
  sessionInfoLabel: {
    fontSize: 11,
    color: '#999',
  },
  sessionInfoTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  rescheduleText: {
    fontSize: 11,
    color: '#00BFA5',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageWrapper: {
    marginVertical: 8,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%' as any,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: '#7C3AED',
  },
  receivedBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  sentMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  sentMessageTime: {
    color: '#E9D5FF',
  },
  actionBanner: {
    backgroundColor: '#F3E8FF',
    borderTopWidth: 1,
    borderTopColor: '#E9D5FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBannerText: {
    fontSize: 14,
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  completeBanner: {
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completeBannerText: {
    fontSize: 14,
    color: '#333',
  },
  completeButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewBanner: {
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FEE2B8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewBannerText: {
    fontSize: 14,
    color: '#333',
  },
  reviewButton: {
    backgroundColor: '#FBBF24',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  recordingButton: {
    backgroundColor: '#FEE2E2',
  },
  recordingText: {
    color: '#F44336',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  starButton: {
    padding: 8,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 80,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  submitReviewButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitReviewButtonDisabled: {
    opacity: 0.5,
  },
  submitReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDetailsBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sessionDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sessionDetailsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00BFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionDetailsText: {
    flex: 1,
  },
  sessionDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sessionDetailsDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sessionDetailsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionDetailItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sessionDetailItemIcon: {
    marginBottom: 6,
  },
  sessionDetailItemLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  sessionDetailItemValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  swapDetailsSection: {
    marginBottom: 16,
  },
  swapDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  skillBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEDBA8',
  },
  skillBoxReceiving: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  skillLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  skillValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  joinCallButton: {
    backgroundColor: '#00BFA5',
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  joinCallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  dateSection: {
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dateButton: {
    width: '31%' as any,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 12,
    color: '#666',
  },
  timeSection: {
    marginBottom: 20,
  },
  timeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timeSlot: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  timeSlotDuration: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  durationSection: {
    marginBottom: 20,
  },
  durationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: '#00BFA5',
    backgroundColor: '#F0F9FF',
  },
  durationButtonText: {
    fontSize: 12,
    color: '#666',
  },
  durationButtonTextActive: {
    color: '#00BFA5',
    fontWeight: '600',
  },
  confirmScheduleButton: {
    backgroundColor: '#00BFA5',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmScheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
