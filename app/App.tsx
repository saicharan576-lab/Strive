export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
  swapAccepted: boolean;
  swapCompleted: boolean;
  hasReviewed: boolean;
  unread: boolean;
  skillOffered?: string;
  skillWanted?: string;
}
