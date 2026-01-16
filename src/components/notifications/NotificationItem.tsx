import { formatDistanceToNow } from "date-fns";
import { MessageSquare, RefreshCw, UserPlus, Info, X } from "lucide-react";
import { Notification } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { useSwipeToDismiss } from "@/hooks/useSwipeToDismiss";

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

interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
  onClick: () => void;
}

export function NotificationItem({ notification, onDismiss, onClick }: NotificationItemProps) {
  const { ref, style, handlers, isDragging } = useSwipeToDismiss({
    onDismiss,
    threshold: 0.35,
    direction: "right",
  });

  return (
    <div
      ref={ref}
      style={style}
      {...handlers}
      className={cn(
        "flex gap-3 p-4 cursor-pointer transition-colors relative",
        !notification.read && "bg-primary/5",
        !isDragging && "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {/* Swipe hint indicator */}
      <div 
        className={cn(
          "absolute inset-y-0 -left-10 w-10 flex items-center justify-center text-destructive transition-opacity",
          isDragging ? "opacity-50" : "opacity-0"
        )}
      >
        <X className="h-5 w-5" />
      </div>

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
              onDismiss();
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
  );
}
