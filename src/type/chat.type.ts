export interface UserInfo {
  user_id: string;
  fullName: string;
  avatar?: string;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  is_read: boolean;
  read_at?: string;
  createdAt: string;
  sender: UserInfo;
  receiver: UserInfo;
}

export interface Conversation {
  conversation_id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  createdAt: string;
  user1: UserInfo;
  user2: UserInfo;
  messages?: Array<{
    message_text: string;
    createdAt: string;
    is_read: boolean;
    sender_id?: string;
  }>;
}

export interface TypingStatus {
  userId: string;
  conversationId: string;
}
