import { Settings2, MessageSquare, RefreshCw, UserPlus, Info, Volume2, Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useNotifications, NotificationPreferences as Preferences } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

const notificationTypes = [
  {
    key: "message" as const,
    label: "Messages",
    description: "When creators send you messages",
    icon: MessageSquare,
    color: "text-blue-600",
  },
  {
    key: "status_change" as const,
    label: "Status Changes",
    description: "When request status is updated",
    icon: RefreshCw,
    color: "text-amber-600",
  },
  {
    key: "assignment" as const,
    label: "Assignments",
    description: "When creators are assigned to requests",
    icon: UserPlus,
    color: "text-green-600",
  },
  {
    key: "system" as const,
    label: "System",
    description: "Important system announcements",
    icon: Info,
    color: "text-gray-600",
  },
];

const deliveryMethods = [
  {
    key: "inApp" as const,
    label: "In-App",
    description: "Show notifications in the app",
    icon: Bell,
  },
  {
    key: "sound" as const,
    label: "Sound",
    description: "Play a sound for new notifications",
    icon: Volume2,
  },
  {
    key: "browser" as const,
    label: "Browser",
    description: "Show browser notifications when inactive",
    icon: BellRing,
  },
];

export function NotificationPreferences() {
  const { 
    preferences, 
    updatePreferences,
    notificationPermission,
    requestNotificationPermission,
  } = useNotifications();

  const handleTypeToggle = (type: keyof Preferences["types"]) => {
    updatePreferences({
      types: {
        ...preferences.types,
        [type]: !preferences.types[type],
      },
    });
  };

  const handleDeliveryToggle = (method: keyof Preferences["delivery"]) => {
    if (method === "browser" && !preferences.delivery.browser && notificationPermission !== "granted") {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          updatePreferences({
            delivery: {
              ...preferences.delivery,
              browser: true,
            },
          });
        }
      });
    } else {
      updatePreferences({
        delivery: {
          ...preferences.delivery,
          [method]: !preferences.delivery[method],
        },
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Choose which notifications you receive and how
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notification Types */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Notification Types</h4>
            <div className="space-y-3">
              {notificationTypes.map((type) => (
                <div
                  key={type.key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full bg-muted", type.color)}>
                      <type.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <Label htmlFor={`type-${type.key}`} className="text-sm font-medium">
                        {type.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={`type-${type.key}`}
                    checked={preferences.types[type.key]}
                    onCheckedChange={() => handleTypeToggle(type.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Delivery Methods */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Delivery Methods</h4>
            <div className="space-y-3">
              {deliveryMethods.map((method) => (
                <div
                  key={method.key}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted text-foreground">
                      <method.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <Label htmlFor={`delivery-${method.key}`} className="text-sm font-medium">
                        {method.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={`delivery-${method.key}`}
                    checked={preferences.delivery[method.key]}
                    onCheckedChange={() => handleDeliveryToggle(method.key)}
                    disabled={
                      method.key === "browser" && 
                      notificationPermission === "denied"
                    }
                  />
                </div>
              ))}
              {notificationPermission === "denied" && (
                <p className="text-xs text-destructive">
                  Browser notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
