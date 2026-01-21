import api from './api';

// API Response Types
export interface ConversationParticipant {
  userId: string;
  unreadCount: number;
  lastReadAt: string | null;
  joinedAt: string;
  avatar: string | null;
  name: string;
  leftAt: string | null;
}

export interface MessageSender {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface ConversationLastMessage {
  id: string;
  content: string;
  sentAt: string;
  isOwn: boolean;
  sender: MessageSender;
  attachments: any[];
}

export interface ApiConversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  lastMessage: ConversationLastMessage | null;
}

export interface ConversationsResponse {
  success: boolean;
  data: ApiConversation[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateConversationRequest {
  participantId: string;
  initialMessage: string;
}

export interface CreateConversationResponse {
  success: boolean;
  data: ApiConversation;
}


export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
}

export interface ApiMessage {
  id: string;
  content: string;
  sender: MessageSender;
  status: 'sent' | 'delivered' | 'read';
  sentAt: string;
  isOwn: boolean;
  attachments: MessageAttachment[];
}

export interface MessagesResponse {
  success: boolean;
  data: ApiMessage[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface SendMessageRequest {
  content: string;
  attachments?: { fileId: string }[];
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    id: string;
    conversationId: string;
    content: string;
    status: 'sent' | 'delivered' | 'read';
    sentAt: string;
    isOwn: boolean;
    attachments: MessageAttachment[];
  };
}

export interface MarkReadResponse {
  success: boolean;
  data: {
    conversationId: string;
    readAt: string;
    messagesRead: number;
  };
}

// API Functions
export const messagingApi = {
  // Get all conversations
  getConversations: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ConversationsResponse>('/conversations', { params }),

  // Create a new conversation
  createConversation: (data: CreateConversationRequest) =>
    api.post<CreateConversationResponse>('/conversations', data),

  // Get messages in a conversation
  getMessages: (conversationId: string, params?: { page?: number; limit?: number; before?: string }) =>
    api.get<MessagesResponse>(`/conversations/${conversationId}/messages`, { params }),

  // Send a message
  sendMessage: (conversationId: string, data: SendMessageRequest) =>
    api.post<SendMessageResponse>(`/conversations/${conversationId}/messages`, data),

  // Mark conversation as read
  markAsRead: (conversationId: string) =>
    api.post<MarkReadResponse>(`/conversations/${conversationId}/read`),
};
