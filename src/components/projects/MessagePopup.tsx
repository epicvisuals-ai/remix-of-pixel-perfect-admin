import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMessaging, Message } from "@/contexts/MessagingContext";
import { messagingApi } from "@/lib/messaging-api";
import { toast } from "sonner";

interface MessagePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: {
    id: string; // This is the userId
    name: string;
    avatar: string;
  };
}

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className={`flex-1 space-y-2 ${i % 2 === 0 ? "text-right" : ""}`}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MessagePopup({ open, onOpenChange, creator }: MessagePopupProps) {
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { findOrCreateConversation } = useMessaging();

  // Initialize conversation when popup opens
  useEffect(() => {
    if (!open) {
      setConversationId(null);
      setMessages([]);
      return;
    }

    const initConversation = async () => {
      setIsLoading(true);
      try {
        const result = await findOrCreateConversation(
          creator.id,
          creator.name,
          creator.avatar
        );

        if (result.conversationId) {
          setConversationId(result.conversationId);
          
          // Fetch messages for this conversation
          const messagesResponse = await messagingApi.getMessages(result.conversationId, { limit: 50 });
          const mappedMessages: Message[] = messagesResponse.data.data.map(msg => ({
            id: msg.id,
            conversationId: result.conversationId!,
            senderId: msg.sender.id,
            senderName: msg.sender.firstName,
            senderAvatar: msg.sender.avatar || "",
            content: msg.content,
            timestamp: new Date(msg.sentAt),
            isOwn: msg.isOwn,
            status: msg.status as Message["status"],
            attachments: msg.attachments?.map(att => ({
              id: att.id,
              name: att.fileName,
              type: "document" as const,
              url: "",
              size: att.size || 0,
              mimeType: "application/octet-stream",
            })),
          }));
          
          // Sort messages by timestamp (oldest first)
          mappedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          setMessages(mappedMessages);
        }
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        toast.error("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();
  }, [open, creator.id, creator.name, creator.avatar, findOrCreateConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      senderId: "user",
      senderName: "You",
      senderAvatar: "",
      content: messageContent,
      timestamp: new Date(),
      isOwn: true,
      status: "sending",
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await messagingApi.sendMessage(conversationId, {
        content: messageContent,
      });

      // Update message with real data
      setMessages(prev => prev.map(msg => 
        msg.id === tempId
          ? {
              ...msg,
              id: response.data.data.id,
              status: response.data.data.status as Message["status"],
            }
          : msg
      ));
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      // Remove failed message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageContent); // Restore the message
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <DialogTitle className="text-lg font-semibold">{creator.name}</DialogTitle>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <MessageSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground">Start a conversation from a creator's profile</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={message.isOwn ? "" : creator.avatar} />
                    <AvatarFallback>
                      {message.isOwn ? "Y" : creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[75%] ${message.isOwn ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-2xl px-4 py-2 ${
                      message.isOwn 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.isOwn && message.status === "sending" && (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1"
              disabled={isLoading || isSending}
            />
            <Button 
              size="icon" 
              onClick={handleSend} 
              disabled={!newMessage.trim() || isLoading || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}