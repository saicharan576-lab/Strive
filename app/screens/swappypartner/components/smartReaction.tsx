import React, { useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ReactionType = 'insightful' | 'learn' | 'teach';

interface SmartReactionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: ReactionType) => void;
}

interface Reaction {
  readonly id: ReactionType;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly label: string;
  readonly color: string;
  readonly bg: string;
}

const REACTIONS: readonly Reaction[] = [
  {
    id: 'insightful',
    icon: 'bulb-outline',
    label: 'Insightful',
    color: '#FCD34D',
    bg: '#FFFBEB',
  },
  {
    id: 'learn',
    icon: 'book-outline',
    label: 'Want to learn',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    id: 'teach',
    icon: 'school-outline',
    label: 'Can teach',
    color: '#10B981',
    bg: '#ECFDF5',
  },
] as const;

const ReactionButton = React.memo<{
  reaction: Reaction;
  onPress: (id: ReactionType) => void;
}>(({ reaction, onPress }) => (
  <TouchableOpacity
    style={styles.reactionButton}
    onPress={() => onPress(reaction.id)}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={reaction.label}
    accessibilityHint={`React with ${reaction.label}`}
  >
    <View
      style={[
        styles.iconCircle,
        { backgroundColor: reaction.bg },
      ]}
    >
      <Ionicons 
        name={reaction.icon} 
        size={26} 
        color={reaction.color} 
      />
    </View>
    <Text style={styles.reactionLabel} numberOfLines={2}>
      {reaction.label}
    </Text>
  </TouchableOpacity>
));

ReactionButton.displayName = 'ReactionButton';

export const SmartReactionPopup = React.memo<SmartReactionPopupProps>(({
  isOpen,
  onClose,
  onSelect,
}) => {
  const handleSelect = useCallback((action: ReactionType) => {
    onSelect(action);
    onClose();
  }, [onSelect, onClose]);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close reactions"
      >
        <TouchableWithoutFeedback>
          <View style={styles.popup}>
            <View style={styles.reactionsContainer}>
              {REACTIONS.map((reaction) => (
                <ReactionButton
                  key={reaction.id}
                  reaction={reaction}
                  onPress={handleSelect}
                />
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
});

SmartReactionPopup.displayName = 'SmartReactionPopup';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '90%',
    maxWidth: 400,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  reactionButton: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    lineHeight: 16,
  },
});