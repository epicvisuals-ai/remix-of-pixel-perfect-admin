import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, MessageSquare, RefreshCw, UserPlus, Info, Check, Trash2, X } from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "status_change":
      return <RefreshCw className="h-4 w-4" />;
    case "assignment":
      return <UserPlus className="h-4 w-4" />;
    case "system":
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "message":
      return "bg-blue-100 text-blue-600";
    case "status_change":
      return "bg-amber-100 text-amber-600";
    case "assignment":
      return "bg-green-100 text-green-600";
    case "system":
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Could navigate to the relevant request here
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg border border-border bg-card/80 hover:bg-card"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground animate-scale-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      getNotificationColor(notification.type)
                    )}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm line-clamp-1",
                        !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"
                      )}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={clearAll}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
