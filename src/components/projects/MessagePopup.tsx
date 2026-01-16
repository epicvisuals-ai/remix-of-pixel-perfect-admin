import { useState } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface MessagePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creator: {
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

export default function MessagePopup({ open, onOpenChange, creator }: MessagePopupProps) {
  const [newMessage, setNewMessage] = useState("");
  
  // Mock messages for the creator
  const [messages] = useState<Message[]>([
    {
      id: "1",
      sender: creator,
      content: "Looking forward to working with you!",
      timestamp: new Date(Date.now() - 31 * 60 * 1000),
      isOwn: false,
    },
  ]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message
    setNewMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <DialogTitle className="text-lg font-semibold">Messages</DialogTitle>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">Start a conversation with {creator.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.isOwn ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.sender.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      {!message.isOwn && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          1
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{message.content}</p>
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
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
