import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Attachment } from "@/components/messaging/MessageAttachment";
import { 
  messagingApi, 
  ApiConversation, 
  ApiMessage,
  ConversationsResponse,
  MessagesResponse 
} from "@/lib/messaging-api";
import { toast } from "sonner";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status: MessageStatus;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isTyping: boolean;
}

interface MessagingContextType {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Message[];
  setActiveConversation: (id: string | null) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
  startConversation: (participantId: string, participantName: string, participantAvatar: string, initialMessage?: string) => Promise<string | null>;
  findOrCreateConversation: (participantId: string, participantName: string, participantAvatar: string) => Promise<{ conversationId: string | null; isNew: boolean }>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setUserTyping: (isTyping: boolean) => void;
  isParticipantTyping: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  refreshConversations: () => Promise<void>;
  searchConversations: (query: string) => void;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Map API conversation to local format
function mapApiConversation(apiConv: ApiConversation): Conversation {
  // Determine current user's ID from last message
  let currentUserId: string | null = null;
  if (apiConv.lastMessage) {
    if (apiConv.lastMessage.isOwn) {
      // If message is own, sender is current user
      currentUserId = apiConv.lastMessage.sender.id;
    } else {
      // If message is not own, sender is the other participant
      currentUserId = apiConv.participants.find(p => p.userId !== apiConv.lastMessage!.sender.id)?.userId || null;
    }
  }

  // If we can't determine from last message, assume first participant is current user (fallback)
  if (!currentUserId && apiConv.participants.length > 0) {
    currentUserId = apiConv.participants[0].userId;
  }

  // Find the other participant (not current user) to display in conversation list
  const otherParticipant = apiConv.participants.find(p => p.userId !== currentUserId);
  const currentUserParticipant = apiConv.participants.find(p => p.userId === currentUserId);

  // Fallback to first participant if can't determine
  const displayParticipant = otherParticipant || apiConv.participants[0];

  return {
    id: apiConv.id,
    participantId: displayParticipant.userId,
    participantName: displayParticipant.name,
    participantAvatar: displayParticipant.avatar || "",
    lastMessage: apiConv.lastMessage?.content || "",
    lastMessageTime: apiConv.lastMessage ? new Date(apiConv.lastMessage.sentAt) : new Date(),
    unreadCount: currentUserParticipant?.unreadCount || 0,
    isTyping: false,
  };
}

// Map API message to local format
function mapApiMessage(apiMsg: ApiMessage, conversationId: string): Message {
  return {
    id: apiMsg.id,
    conversationId,
    senderId: apiMsg.sender.id,
    senderName: `${apiMsg.sender.firstName} ${apiMsg.sender.lastName || ''}`.trim(),
    senderAvatar: apiMsg.sender.avatar || "",
    content: apiMsg.content,
    timestamp: new Date(apiMsg.sentAt),
    isOwn: apiMsg.isOwn,
    status: apiMsg.status as MessageStatus,
    attachments: apiMsg.attachments?.map(att => ({
      id: att.id,
      name: att.fileName,
      type: "document" as const,
      url: "", // URL would come from file storage - using empty string as placeholder
      size: att.fileSize,
      mimeType: "application/octet-stream",
    })),
  };
}

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [activeConversation, setActiveConversationState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageMeta, setMessageMeta] = useState<Record<string, { page: number; total: number }>>({});

  const messages = activeConversation ? allMessages[activeConversation] || [] : [];
  const activeConv = conversations.find((c) => c.id === activeConversation);
  const isParticipantTyping = activeConv?.isTyping || false;
  const hasMoreMessages = activeConversation 
    ? (messageMeta[activeConversation]?.page || 1) * 50 < (messageMeta[activeConversation]?.total || 0)
    : false;

  // Fetch conversations
  const fetchConversations = useCallback(async (search?: string) => {
    setIsLoadingConversations(true);
    try {
      const response = await messagingApi.getConversations({ search });
      const mappedConversations = response.data.data.map(mapApiConversation);
      setConversations(mappedConversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      // Keep existing conversations on error
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string, page: number = 1) => {
    setIsLoadingMessages(true);
    try {
      const response = await messagingApi.getMessages(conversationId, { page, limit: 50 });
      const mappedMessages = response.data.data.map(msg => mapApiMessage(msg, conversationId));
      
      // Sort messages by timestamp (oldest first for display)
      mappedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      setAllMessages(prev => ({
        ...prev,
        [conversationId]: page === 1 
          ? mappedMessages 
          : [...mappedMessages, ...(prev[conversationId] || [])],
      }));
      
      setMessageMeta(prev => ({
        ...prev,
        [conversationId]: { page, total: response.data.meta.total },
      }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh conversations
  const refreshConversations = useCallback(async () => {
    await fetchConversations(searchQuery || undefined);
  }, [fetchConversations, searchQuery]);

  // Search conversations
  const searchConversations = useCallback((query: string) => {
    setSearchQuery(query);
    fetchConversations(query || undefined);
  }, [fetchConversations]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || !hasMoreMessages) return;
    const currentPage = messageMeta[activeConversation]?.page || 1;
    await fetchMessages(activeConversation, currentPage + 1);
  }, [activeConversation, hasMoreMessages, messageMeta, fetchMessages]);

  // Mark messages as read when viewing conversation
  const setActiveConversation = useCallback(async (id: string | null) => {
    setActiveConversationState(id);
    if (id) {
      // Fetch messages for this conversation
      await fetchMessages(id);
      
      // Mark conversation as read locally immediately
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === id ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      // Mark as read on server
      try {
        await messagingApi.markAsRead(id);
      } catch (error) {
        console.error("Failed to mark conversation as read:", error);
      }
    }
  }, [fetchMessages]);

  const sendMessage = useCallback(async (content: string, attachments?: Attachment[]) => {
    if (!activeConversation || (!content.trim() && (!attachments || attachments.length === 0))) return;

    const tempId = `temp-${Date.now()}`;
    const trimmedContent = content.trim();
    
    // Create optimistic message
    const newMessage: Message = {
      id: tempId,
      conversationId: activeConversation,
      senderId: "user",
      senderName: "You",
      senderAvatar: "",
      content: trimmedContent,
      timestamp: new Date(),
      isOwn: true,
      status: "sending",
      attachments,
    };

    // Add optimistic message
    setAllMessages((prev) => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage],
    }));

    // Update conversation last message
    const lastMessageText = attachments && attachments.length > 0 && !trimmedContent
      ? `📎 ${attachments.length} attachment${attachments.length > 1 ? "s" : ""}`
      : trimmedContent;

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? { ...conv, lastMessage: lastMessageText, lastMessageTime: new Date() }
          : conv
      )
    );

    try {
      // Send message to server
      const response = await messagingApi.sendMessage(activeConversation, {
        content: trimmedContent,
        attachments: attachments?.map(a => ({ fileId: a.id })),
      });

      // Update message with real ID and status
      setAllMessages((prev) => ({
        ...prev,
        [activeConversation]: (prev[activeConversation] || []).map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: response.data.data.id,
                status: response.data.data.status as MessageStatus,
              }
            : msg
        ),
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      
      // Mark message as failed (revert to showing error state)
      setAllMessages((prev) => ({
        ...prev,
        [activeConversation]: (prev[activeConversation] || []).filter((msg) => msg.id !== tempId),
      }));
    }
  }, [activeConversation]);

  const setUserTyping = useCallback((isTyping: boolean) => {
    // In a real app, this would emit to the server via WebSocket
  }, []);

  // Find or create a conversation with a participant via API
  const findOrCreateConversation = useCallback(async (
    participantId: string,
    participantName: string,
    participantAvatar: string
  ): Promise<{ conversationId: string | null; isNew: boolean }> => {
    try {
      // First, check via API if a conversation already exists
      const response = await messagingApi.getConversations({});
      const existingConv = response.data.data.find((c) =>
        c.participants.some(p => p.userId === participantId)
      );

      if (existingConv) {
        // Update local state with fetched conversations
        const mappedConversations = response.data.data.map(mapApiConversation);
        setConversations(mappedConversations);
        return { conversationId: existingConv.id, isNew: false };
      }
      
      // No existing conversation, create a new one
      const createResponse = await messagingApi.createConversation({
        participantId,
        initialMessage: "Hi! I'd love to discuss a potential project with you.",
      });

      const newConversation = mapApiConversation(createResponse.data.data);

      setConversations((prev) => [newConversation, ...prev]);
      return { conversationId: newConversation.id, isNew: true };
    } catch (error) {
      console.error("Failed to find or create conversation:", error);
      toast.error("Failed to start conversation");
      return { conversationId: null, isNew: false };
    }
  }, []);

  const startConversation = useCallback(async (
    participantId: string, 
    participantName: string, 
    participantAvatar: string,
    initialMessage?: string
  ): Promise<string | null> => {
    // Check if conversation already exists locally first
    const existingConv = conversations.find((c) => c.participantId === participantId);
    if (existingConv) {
      setActiveConversation(existingConv.id);
      setIsOpen(true);
      return existingConv.id;
    }

    // Create new conversation via API
    try {
      const response = await messagingApi.createConversation({
        participantId,
        initialMessage: initialMessage || "Hi! I'd love to discuss a potential project with you.",
      });

      const newConversation = mapApiConversation(response.data.data);

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation.id);
      setIsOpen(true);
      return newConversation.id;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to start conversation");
      return null;
    }
  }, [conversations, setActiveConversation]);

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        setActiveConversation,
        sendMessage,
        startConversation,
        findOrCreateConversation,
        isOpen,
        setIsOpen,
        setUserTyping,
        isParticipantTyping,
        isLoadingConversations,
        isLoadingMessages,
        refreshConversations,
        searchConversations,
        loadMoreMessages,
        hasMoreMessages,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}
