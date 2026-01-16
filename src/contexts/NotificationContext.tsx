import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";

export interface Notification {
  id: string;
  type: "message" | "status_change" | "assignment" | "system";
  title: string;
  description: string;
  createdAt: Date;
  read: boolean;
  requestId?: string;
  creatorName?: string;
  creatorAvatar?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock initial notifications
const mockNotifications: Notification[] = [
  {
    id: "notif-1",
    type: "message",
    title: "New message from Alex Morgan",
    description: "Here are the initial concepts. Let me know your thoughts!",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    requestId: "req-003",
    creatorName: "Alex Morgan",
  },
  {
    id: "notif-2",
    type: "status_change",
    title: "Request status updated",
    description: "Request #req-003 is now In Progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    requestId: "req-003",
  },
  {
    id: "notif-3",
    type: "assignment",
    title: "Creator assigned",
    description: "Alex Morgan has been assigned to request #req-003",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    requestId: "req-003",
    creatorName: "Alex Morgan",
  },
  {
    id: "notif-4",
    type: "status_change",
    title: "Request approved",
    description: "Request #req-004 has been approved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    requestId: "req-004",
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const { play: playSound } = useNotificationSound();
  const { permission, requestPermission, showNotification, isTabVisible } = useBrowserNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt" | "read">, showToast = true) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        createdAt: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);

      // Play notification sound
      playSound();

      // Show browser notification if tab is not visible
      if (!isTabVisible) {
        showNotification(notification.title, {
          body: notification.description,
          tag: newNotification.id,
        });
      }

      // Show toast notification
      if (showToast) {
        const toastIcon = notification.type === "message" ? "💬" : 
                          notification.type === "status_change" ? "🔄" :
                          notification.type === "assignment" ? "👤" : "ℹ️";
        
        toast(notification.title, {
          description: notification.description,
          icon: toastIcon,
          action: {
            label: "View",
            onClick: () => {
              // Could navigate to request
            },
          },
        });
      }
    },
    [playSound, showNotification, isTabVisible]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Simulate receiving a new notification periodically (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to add a mock notification
      if (Math.random() > 0.95) {
        const mockMessages = [
          { title: "New message from Sam Chen", description: "I've updated the design based on your feedback", creatorName: "Sam Chen" },
          { title: "New message from Jordan Lee", description: "The video draft is ready for review", creatorName: "Jordan Lee" },
          { title: "New message from Casey Taylor", description: "Quick question about the color palette", creatorName: "Casey Taylor" },
        ];
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        addNotification({
          type: "message",
          ...randomMessage,
          requestId: `req-00${Math.floor(Math.random() * 4) + 1}`,
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        notificationPermission: permission,
        requestNotificationPermission: requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
