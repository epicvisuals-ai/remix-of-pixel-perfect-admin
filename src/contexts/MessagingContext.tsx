import { createContext, useContext, useState, ReactNode } from "react";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
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
    },
  ],
};

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(initialMessages);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const messages = activeConversation ? allMessages[activeConversation] || [] : [];

  const sendMessage = (content: string) => {
    if (!activeConversation || !content.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: activeConversation,
      senderId: "user",
      senderName: "You",
      senderAvatar: "",
      content: content.trim(),
      timestamp: new Date(),
      isOwn: true,
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
  };

  const startConversation = (participantId: string, participantName: string, participantAvatar: string) => {
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
    };

    setConversations((prev) => [newConversation, ...prev]);
    setAllMessages((prev) => ({ ...prev, [newConvId]: [] }));
    setActiveConversation(newConvId);
    setIsOpen(true);
    return newConvId;
  };

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
