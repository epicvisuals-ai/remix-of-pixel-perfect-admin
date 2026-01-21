import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Search, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessaging } from "@/contexts/MessagingContext";
import { TypingIndicator } from "@/components/messaging/TypingIndicator";
import { MessageStatusIndicator } from "@/components/messaging/MessageStatusIndicator";
import { MessageAttachment, Attachment, AttachmentPreview } from "@/components/messaging/MessageAttachment";
import { FileUploadButton } from "@/components/messaging/FileUploadButton";
import { EmojiPicker } from "@/components/messaging/EmojiPicker";
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

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function MessageSkeleton({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
      <Skeleton className={cn("h-16 rounded-2xl", isOwn ? "w-48" : "w-56")} />
    </div>
  );
}

export default function MessagesPage() {
  const {
    conversations,
    activeConversation,
    messages,
    setActiveConversation,
    sendMessage,
    setIsOpen,
    isParticipantTyping,
    isLoadingConversations,
    isLoadingMessages,
    searchConversations,
    loadMoreMessages,
    hasMoreMessages,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const activeConv = conversations.find((c) => c.id === activeConversation);

  // Hide the floating chat panel when on messages page
  useEffect(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!isLoadingMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isParticipantTyping, isLoadingMessages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConversation && !isLoadingMessages) {
      inputRef.current?.focus();
    }
  }, [activeConversation, isLoadingMessages]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      searchConversations(value);
      setIsSearching(false);
    }, 300);
  }, [searchConversations]);

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

  const handleLoadMore = async () => {
    if (hasMoreMessages && !isLoadingMessages) {
      await loadMoreMessages();
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <h1 className="text-2xl font-semibold text-foreground">Messages</h1>

      {/* Chat Container */}
      <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-border bg-card">
        {/* Conversations List - 40% */}
        <div className="flex w-[40%] flex-col border-r border-border">
          {/* Search Header - matches chat header height */}
          <div className="flex h-[72px] items-center border-b border-border px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {isLoadingConversations && conversations.length === 0 ? (
              <div className="divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                  <ConversationSkeleton key={i} />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
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
                    className={cn(
                      "flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent",
                      activeConversation === conv.id && "bg-accent"
                    )}
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
        </div>

        {/* Chat Area - 60% */}
        <div className="flex w-[60%] flex-col">
          {activeConversation && activeConv ? (
            <>
              {/* Chat Header - matches search header height */}
              <div className="flex h-[72px] items-center gap-4 border-b border-border px-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeConv.participantAvatar} />
                  <AvatarFallback>{activeConv.participantName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="font-medium">{activeConv.participantName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {isParticipantTyping ? (
                      <span className="text-primary">typing...</span>
                    ) : (
                      "Creator"
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Load more button */}
                  {hasMoreMessages && (
                    <div className="flex justify-center" ref={messagesStartRef}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLoadMore}
                        disabled={isLoadingMessages}
                      >
                        {isLoadingMessages ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load earlier messages"
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {/* Loading skeleton */}
                  {isLoadingMessages && messages.length === 0 && (
                    <div className="space-y-4">
                      <MessageSkeleton isOwn={false} />
                      <MessageSkeleton isOwn={true} />
                      <MessageSkeleton isOwn={false} />
                    </div>
                  )}
                  
                  {/* Messages list */}
                  {messages.map((message, index) => {
                    const showDate =
                      index === 0 ||
                      new Date(messages[index - 1].timestamp).toDateString() !==
                        new Date(message.timestamp).toDateString();

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex items-center justify-center py-4">
                            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleDateString([], {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex gap-3",
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
                              "max-w-[60%] rounded-2xl px-4 py-3",
                              message.isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {message.content && (
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            )}
                            {message.attachments?.map((attachment) => (
                              <MessageAttachment
                                key={attachment.id}
                                attachment={attachment}
                                isOwn={message.isOwn}
                              />
                            ))}
                            <div
                              className={cn(
                                "mt-1 flex items-center gap-1.5 text-xs",
                                message.isOwn
                                  ? "justify-end text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              <span>{formatMessageTime(message.timestamp)}</span>
                              {message.isOwn && (
                                <MessageStatusIndicator status={message.status} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {isParticipantTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={activeConv.participantAvatar} />
                        <AvatarFallback>{activeConv.participantName.charAt(0)}</AvatarFallback>
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

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-3">
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
                    onClick={handleSend} 
                    disabled={!newMessage.trim() && pendingAttachments.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-6">
                <MessageCircle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-medium text-foreground">Your Messages</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Select a conversation to start chatting, or message a creator from their profile page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
