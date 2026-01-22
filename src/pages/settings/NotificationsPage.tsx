import { useState } from "react";
import { Bell, MessageSquare, RefreshCw, UserPlus, Info, Volume2, BellRing, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications, NotificationPreferences as Preferences, EmailDigestSettings } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

type DeliveryMethodKey = "inApp" | "sound" | "browser" | "email";

interface DeliveryMethod {
  key: DeliveryMethodKey;
  label: string;
  description: string;
  icon: typeof Bell;
  requiresBackend?: boolean;
}

const deliveryMethods: DeliveryMethod[] = [
  {
    key: "inApp",
    label: "In-App Notifications",
    description: "Show notifications in the app",
    icon: Bell,
  },
  {
    key: "sound",
    label: "Sound Alerts",
    description: "Play a sound for new notifications",
    icon: Volume2,
  },
  {
    key: "browser",
    label: "Browser Notifications",
    description: "Show browser notifications when inactive",
    icon: BellRing,
  },
  {
    key: "email",
    label: "Email Digest",
    description: "Receive email summaries of notifications",
    icon: Mail,
    requiresBackend: true,
  },
];

const digestFrequencies = [
  { value: "instant", label: "Instant" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
] as const;

function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Notification Types Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Methods Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NotificationsPage() {
  const {
    preferences,
    updatePreferences,
    notificationPermission,
    requestNotificationPermission,
    isLoadingPreferences,
  } = useNotifications();

  const [emailInput, setEmailInput] = useState(preferences.emailDigest.email);

  // Show skeleton while loading
  if (isLoadingPreferences) {
    return <NotificationsSkeleton />;
  }

  const handleTypeToggle = async (type: keyof Preferences["types"]) => {
    const isCurrentlyEnabled = preferences.types[type];
    const willBeEnabled = !isCurrentlyEnabled;

    // Find the notification type details for the toast message
    const notifType = notificationTypes.find((t) => t.key === type);
    const typeName = notifType?.label || type;

    await updatePreferences({
      types: {
        ...preferences.types,
        [type]: willBeEnabled,
      },
    });

    // Show success toast
    toast.success(
      `${typeName} notifications ${willBeEnabled ? "enabled" : "disabled"}`,
      {
        description: `You will ${willBeEnabled ? "now" : "no longer"} receive ${typeName.toLowerCase()} notifications.`,
      }
    );
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
    } else if (method === "email") {
      const newEmailEnabled = !preferences.delivery.email;
      updatePreferences({
        delivery: {
          ...preferences.delivery,
          email: newEmailEnabled,
        },
        emailDigest: {
          ...preferences.emailDigest,
          enabled: newEmailEnabled,
        },
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

  const handleEmailBlur = () => {
    updatePreferences({
      emailDigest: {
        ...preferences.emailDigest,
        email: emailInput,
      },
    });
  };

  const handleFrequencyChange = (frequency: EmailDigestSettings["frequency"]) => {
    updatePreferences({
      emailDigest: {
        ...preferences.emailDigest,
        frequency,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-full bg-muted", type.color)}>
                  <type.icon className="h-5 w-5" />
                </div>
                <div>
                  <Label htmlFor={`type-${type.key}`} className="text-sm font-medium">
                    {type.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Methods</CardTitle>
          <CardDescription>
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {deliveryMethods.filter((method) => method.key !== "email").map((method) => (
            <div key={method.key}>
              <div
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-muted text-foreground">
                    <method.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`delivery-${method.key}`} className="text-sm font-medium">
                        {method.label}
                      </Label>
                      {"requiresBackend" in method && method.requiresBackend && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={`delivery-${method.key}`}
                  checked={preferences.delivery[method.key]}
                  onCheckedChange={() => handleDeliveryToggle(method.key)}
                  disabled={method.key === "browser" && notificationPermission === "denied"}
                />
              </div>
              
              {/* Email digest settings */}
              {method.key === "email" && preferences.delivery.email && (
                <div className="mt-3 ml-14 space-y-4 p-4 rounded-lg bg-muted/50 border border-dashed">
                  <div className="space-y-2">
                    <Label htmlFor="digest-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="digest-email"
                      type="email"
                      placeholder="your@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onBlur={handleEmailBlur}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Digest Frequency
                    </Label>
                    <Select 
                      value={preferences.emailDigest.frequency}
                      onValueChange={handleFrequencyChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {digestFrequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <p className="text-xs text-muted-foreground italic">
                    Email notifications will be available once a backend is connected.
                  </p>
                </div>
              )}
            </div>
          ))}
          
          {notificationPermission === "denied" && (
            <p className="text-sm text-destructive">
              Browser notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
