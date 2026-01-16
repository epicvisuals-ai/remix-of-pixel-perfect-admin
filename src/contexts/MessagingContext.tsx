import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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
  sendMessage: (content: string) => void;
  startConversation: (participantId: string, participantName: string, participantAvatar: string) => string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setUserTyping: (isTyping: boolean) => void;
  isParticipantTyping: boolean;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// Mock initial conversations
const initialConversations: Conversation[] = [
  {
    id: "conv-1",
    participantId: "4",
    participantName: "Alex Kim",
    participantAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    lastMessage: "Looking forward to working with you!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 1,
    isTyping: false,
  },
];

const initialMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "4",
      senderName: "Alex Kim",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      content: "Hi! Thanks for reaching out. I'd love to hear more about your project.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isOwn: false,
      status: "read",
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: "user",
      senderName: "You",
      senderAvatar: "",
      content: "Hi Alex! We're looking for 3D renders for our new product line.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isOwn: true,
      status: "read",
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      senderId: "4",
      senderName: "Alex Kim",
      senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      content: "Looking forward to working with you!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isOwn: false,
      status: "read",
    },
  ],
};

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [activeConversation, setActiveConversationState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const messages = activeConversation ? allMessages[activeConversation] || [] : [];
  const activeConv = conversations.find((c) => c.id === activeConversation);
  const isParticipantTyping = activeConv?.isTyping || false;

  // Mark messages as read when viewing conversation
  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationState(id);
    if (id) {
      // Mark conversation as read
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === id ? { ...conv, unreadCount: 0 } : conv
        )
      );
      // Mark all messages in conversation as read
      setAllMessages((prev) => ({
        ...prev,
        [id]: (prev[id] || []).map((msg) =>
          !msg.isOwn ? { ...msg, status: "read" as MessageStatus } : msg
        ),
      }));
    }
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!activeConversation || !content.trim()) return;

    const msgId = `msg-${Date.now()}`;
    const newMessage: Message = {
      id: msgId,
      conversationId: activeConversation,
      senderId: "user",
      senderName: "You",
      senderAvatar: "",
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
      status: "sending",
    };

    setAllMessages((prev) => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversation
          ? { ...conv, lastMessage: content.trim(), lastMessageTime: new Date() }
          : conv
      )
    );

    // Simulate message status updates
    setTimeout(() => {
      setAllMessages((prev) => ({
        ...prev,
        [activeConversation]: (prev[activeConversation] || []).map((msg) =>
          msg.id === msgId ? { ...msg, status: "sent" as MessageStatus } : msg
        ),
      }));
    }, 500);

    setTimeout(() => {
      setAllMessages((prev) => ({
        ...prev,
        [activeConversation]: (prev[activeConversation] || []).map((msg) =>
          msg.id === msgId ? { ...msg, status: "delivered" as MessageStatus } : msg
        ),
      }));
    }, 1000);

    setTimeout(() => {
      setAllMessages((prev) => ({
        ...prev,
        [activeConversation]: (prev[activeConversation] || []).map((msg) =>
          msg.id === msgId ? { ...msg, status: "read" as MessageStatus } : msg
        ),
      }));
    }, 2500);

    // Simulate typing indicator after user sends message
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation ? { ...conv, isTyping: true } : conv
        )
      );
    }, 3000);

    // Simulate reply after typing
    setTimeout(() => {
      const conv = conversations.find((c) => c.id === activeConversation);
      if (!conv) return;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation ? { ...c, isTyping: false } : c
        )
      );

      const replyMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: activeConversation,
        senderId: conv.participantId,
        senderName: conv.participantName,
        senderAvatar: conv.participantAvatar,
        content: getRandomReply(),
        timestamp: new Date(),
        isOwn: false,
        status: "delivered",
      };

      setAllMessages((prev) => ({
        ...prev,
        [activeConversation]: [...(prev[activeConversation] || []), replyMessage],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation
            ? { ...c, lastMessage: replyMessage.content, lastMessageTime: new Date() }
            : c
        )
      );
    }, 5000);
  }, [activeConversation, conversations]);

  const setUserTyping = useCallback((isTyping: boolean) => {
    // In a real app, this would emit to the server
    // For now, it's just a placeholder for the UI to use
  }, []);

  const startConversation = useCallback((participantId: string, participantName: string, participantAvatar: string) => {
    const existingConv = conversations.find((c) => c.participantId === participantId);
    if (existingConv) {
      setActiveConversation(existingConv.id);
      setIsOpen(true);
      return existingConv.id;
    }

    const newConvId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      id: newConvId,
      participantId,
      participantName,
      participantAvatar,
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: 0,
      isTyping: false,
    };

    setConversations((prev) => [newConversation, ...prev]);
    setAllMessages((prev) => ({ ...prev, [newConvId]: [] }));
    setActiveConversation(newConvId);
    setIsOpen(true);
    return newConvId;
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
        isOpen,
        setIsOpen,
        setUserTyping,
        isParticipantTyping,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
}

function getRandomReply(): string {
  const replies = [
    "That sounds great! I'd love to discuss this further.",
    "Thanks for the details. When would you like to start?",
    "Perfect! I have some ideas that could work well for this.",
    "I'm excited about this project. Let me send you some examples.",
    "Great! I'll put together a proposal for you.",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }
  return context;
}
