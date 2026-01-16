import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { X, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessaging } from "@/contexts/MessagingContext";
import { TypingIndicator } from "./TypingIndicator";
import { MessageStatusIndicator } from "./MessageStatusIndicator";
import { MessageAttachment, Attachment, AttachmentPreview } from "./MessageAttachment";
import { FileUploadButton } from "./FileUploadButton";
import { EmojiPicker } from "./EmojiPicker";
import { cn } from "@/lib/utils";

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function ChatPanel() {
  const {
    conversations,
    activeConversation,
    messages,
    setActiveConversation,
    sendMessage,
    isOpen,
    setIsOpen,
    isParticipantTyping,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const activeConv = conversations.find((c) => c.id === activeConversation);
  const isOnMessagesPage = location.pathname === "/messages";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isParticipantTyping]);

  useEffect(() => {
    if (activeConversation && isOpen) {
      inputRef.current?.focus();
    }
  }, [activeConversation, isOpen]);

  const handleSend = () => {
    if (newMessage.trim() || pendingAttachments.length > 0) {
      sendMessage(newMessage, pendingAttachments.length > 0 ? pendingAttachments : undefined);
      setNewMessage("");
      setPendingAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilesSelected = (attachments: Attachment[]) => {
    setPendingAttachments((prev) => [...prev, ...attachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Don't render floating panel on messages page
  if (isOnMessagesPage) {
    return null;
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {conversations.some((c) => c.unreadCount > 0) && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
            {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        {activeConversation ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setActiveConversation(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={activeConv?.participantAvatar} />
              <AvatarFallback>
                {activeConv?.participantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="font-medium">{activeConv?.participantName}</span>
              {isParticipantTyping && (
                <p className="text-xs text-muted-foreground">typing...</p>
              )}
            </div>
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="flex-1 font-medium">Messages</span>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {activeConversation ? (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.isOwn ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {!message.isOwn && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      message.isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.content && <p className="text-sm">{message.content}</p>}
                    {message.attachments?.map((attachment) => (
                      <MessageAttachment
                        key={attachment.id}
                        attachment={attachment}
                        isOwn={message.isOwn}
                      />
                    ))}
                    <div
                      className={cn(
                        "mt-1 flex items-center gap-1 text-xs",
                        message.isOwn ? "justify-end text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {message.isOwn && (
                        <MessageStatusIndicator status={message.status} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isParticipantTyping && (
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={activeConv?.participantAvatar} />
                    <AvatarFallback>{activeConv?.participantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Attachment Preview */}
          <AttachmentPreview
            attachments={pendingAttachments}
            onRemove={handleRemoveAttachment}
          />

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <FileUploadButton onFilesSelected={handleFilesSelected} />
              <EmojiPicker onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji)} />
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSend} 
                disabled={!newMessage.trim() && pendingAttachments.length === 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Conversation List */
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground">
                Start a conversation from a creator's profile
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.participantAvatar} />
                    <AvatarFallback>{conv.participantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{conv.participantName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {conv.isTyping ? (
                        <span className="italic text-primary">typing...</span>
                      ) : (
                        conv.lastMessage || "Start a conversation"
                      )}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}
