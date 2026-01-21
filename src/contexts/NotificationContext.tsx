import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";
import { notificationsApi, ApiNotification } from "@/lib/api";

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

export interface EmailDigestSettings {
  enabled: boolean;
  frequency: "instant" | "hourly" | "daily" | "weekly";
  email: string;
}

export interface NotificationPreferences {
  types: {
    message: boolean;
    status_change: boolean;
    assignment: boolean;
    system: boolean;
  };
  delivery: {
    inApp: boolean;
    sound: boolean;
    browser: boolean;
    email: boolean;
  };
  emailDigest: EmailDigestSettings;
}

const defaultPreferences: NotificationPreferences = {
  types: {
    message: true,
    status_change: true,
    assignment: true,
    system: true,
  },
  delivery: {
    inApp: true,
    sound: true,
    browser: false,
    email: false,
  },
  emailDigest: {
    enabled: false,
    frequency: "daily",
    email: "",
  },
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<boolean>;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Map API notification type to UI notification type
const mapNotificationType = (apiType: string): Notification["type"] => {
  switch (apiType) {
    case "message_received":
      return "message";
    case "request_status_changed":
      return "status_change";
    case "request_assigned":
    case "creator_assigned":
      return "assignment";
    case "welcome":
    default:
      return "system";
  }
};

// Convert API notification to UI notification
const mapApiNotification = (apiNotif: ApiNotification): Notification => {
  return {
    id: apiNotif.id,
    type: mapNotificationType(apiNotif.type),
    title: apiNotif.subject,
    description: apiNotif.body,
    createdAt: new Date(apiNotif.created_at),
    read: apiNotif.is_read,
  };
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const { play: playSound } = useNotificationSound();
  const { permission, requestPermission, showNotification, isTabVisible } = useBrowserNotifications();

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...prefs,
      types: { ...prev.types, ...prefs.types },
      delivery: { ...prev.delivery, ...prefs.delivery },
    }));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt" | "read">, showToast = true) => {
      // Check if this notification type is enabled
      if (!preferences.types[notification.type]) {
        return;
      }

      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        createdAt: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);

      // Play notification sound if enabled
      if (preferences.delivery.sound) {
        playSound();
      }

      // Show browser notification if enabled and tab is not visible
      if (preferences.delivery.browser && !isTabVisible) {
        showNotification(notification.title, {
          body: notification.description,
          tag: newNotification.id,
        });
      }

      // Show toast notification if in-app is enabled
      if (showToast && preferences.delivery.inApp) {
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
    [playSound, showNotification, isTabVisible, preferences]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsApi.getNotifications();
      const mappedNotifications = response.data.items.map(mapApiNotification);
      setNotifications(mappedNotifications);
      const unread = mappedNotifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for notification count every 30 seconds
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await notificationsApi.getCount();
        const newCount = response.data.count;

        // If count increased, fetch new notifications
        if (newCount > unreadCount) {
          const notifResponse = await notificationsApi.getNotifications();
          const mappedNotifications = notifResponse.data.items.map(mapApiNotification);
          setNotifications(mappedNotifications);

          // Show toast for new notifications
          const newNotifications = mappedNotifications.filter((n) => !n.read);
          if (newNotifications.length > 0 && preferences.delivery.inApp) {
            const latestNotif = newNotifications[0];
            const toastIcon = latestNotif.type === "message" ? "💬" :
                            latestNotif.type === "status_change" ? "🔄" :
                            latestNotif.type === "assignment" ? "👤" : "ℹ️";

            toast(latestNotif.title, {
              description: latestNotif.description,
              icon: toastIcon,
            });

            // Play sound if enabled
            if (preferences.delivery.sound) {
              playSound();
            }

            // Show browser notification if enabled and tab not visible
            if (preferences.delivery.browser && !isTabVisible) {
              showNotification(latestNotif.title, {
                body: latestNotif.description,
                tag: latestNotif.id,
              });
            }
          }
        }

        setUnreadCount(newCount);
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    // Poll every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [unreadCount, preferences, playSound, showNotification, isTabVisible]);

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
        fetchNotifications,
        notificationPermission: permission,
        requestNotificationPermission: requestPermission,
        preferences,
        updatePreferences,
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
