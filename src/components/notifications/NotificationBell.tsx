import { useState, useMemo } from "react";
import { isToday, isYesterday, isThisWeek } from "date-fns";
import { Bell, Check, Trash2, BellRing } from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { NotificationPreferences } from "./NotificationPreferences";
import { NotificationItem } from "./NotificationItem";

type DateGroup = "today" | "yesterday" | "thisWeek" | "older";

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

const groupLabels: Record<DateGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "This Week",
  older: "Older",
};

const getDateGroup = (date: Date): DateGroup => {
  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
  if (isThisWeek(date, { weekStartsOn: 1 })) return "thisWeek";
  return "older";
};


export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAll,
    notificationPermission,
    requestNotificationPermission,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const groupedNotifications = useMemo(() => {
    const groups: GroupedNotifications = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    notifications.forEach((notification) => {
      const group = getDateGroup(notification.createdAt);
      groups[group].push(notification);
    });

    return groups;
  }, [notifications]);

  const activeGroups = useMemo(() => {
    return (Object.keys(groupedNotifications) as DateGroup[]).filter(
      (group) => groupedNotifications[group].length > 0
    );
  }, [groupedNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Could navigate to the relevant request here
  };

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
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
            <NotificationPreferences />
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
            <div>
              {activeGroups.map((group) => (
                <div key={group}>
                  <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-4 py-1.5 border-b">
                    <span className="text-xs font-medium text-muted-foreground">
                      {groupLabels[group]}
                    </span>
                  </div>
                  <div className="divide-y overflow-hidden">
                    {groupedNotifications[group].map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => clearNotification(notification.id)}
                        onClick={() => handleNotificationClick(notification)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notificationPermission !== "granted" && (
          <div className="border-t p-3 bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleEnableNotifications}
            >
              <BellRing className="h-3 w-3 mr-1.5" />
              Enable browser notifications
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              Get notified even when this tab is inactive
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="border-t p-2 space-y-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all as read
              </Button>
            )}
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
