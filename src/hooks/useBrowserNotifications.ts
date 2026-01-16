import { useCallback, useEffect, useState } from "react";

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  useEffect(() => {
    // Check initial permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Track tab visibility
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (e) {
      console.warn("Could not request notification permission:", e);
      return false;
    }
  }, []);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!("Notification" in window)) return null;
      if (permission !== "granted") return null;
      if (isTabVisible) return null; // Only show when tab is not active

      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Focus window when clicked
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (e) {
        console.warn("Could not show notification:", e);
        return null;
      }
    },
    [permission, isTabVisible]
  );

  return {
    permission,
    isTabVisible,
    requestPermission,
    showNotification,
    isSupported: "Notification" in window,
  };
}
