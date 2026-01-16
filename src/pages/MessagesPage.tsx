import { useState, useRef, useEffect } from "react";
import { Send, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessaging } from "@/contexts/MessagingContext";
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

export default function MessagesPage() {
  const {
    conversations,
    activeConversation,
    messages,
    setActiveConversation,
    sendMessage,
    setIsOpen,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversation);

  // Hide the floating chat panel when on messages page
  useEffect(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      inputRef.current?.focus();
    }
  }, [activeConversation]);

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border bg-card">
      {/* Conversations List */}
      <div className="flex w-80 flex-col border-r border-border">
        {/* Header */}
        <div className="border-b border-border p-4">
          <h1 className="text-lg font-semibold">Messages</h1>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
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
              {filteredConversations.map((conv) => (
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
                      {conv.lastMessage || "Start a conversation"}
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

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {activeConversation && activeConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 border-b border-border p-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeConv.participantAvatar} />
                <AvatarFallback>{activeConv.participantName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-medium">{activeConv.participantName}</h2>
                <p className="text-sm text-muted-foreground">Creator</p>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
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
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p
                            className={cn(
                              "mt-1 text-xs",
                              message.isOwn
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!newMessage.trim()}>
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
  );
}
