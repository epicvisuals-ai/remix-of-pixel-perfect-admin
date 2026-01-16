import { useState } from "react";
import { Settings2, MessageSquare, RefreshCw, UserPlus, Info, Volume2, Bell, BellRing, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNotifications, NotificationPreferences as Preferences, EmailDigestSettings } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  {
    key: "email" as const,
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

export function NotificationPreferences() {
  const { 
    preferences, 
    updatePreferences,
    notificationPermission,
    requestNotificationPermission,
  } = useNotifications();

  const [emailInput, setEmailInput] = useState(preferences.emailDigest.email);

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

  const handleEmailChange = (value: string) => {
    setEmailInput(value);
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
                <div key={method.key}>
                  <div
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted text-foreground">
                        <method.icon className="h-4 w-4" />
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
                        (method.key === "browser" && notificationPermission === "denied")
                      }
                    />
                  </div>
                  
                  {/* Email digest settings */}
                  {method.key === "email" && preferences.delivery.email && (
                    <div className="mt-2 ml-12 space-y-3 p-3 rounded-lg bg-muted/50 border border-dashed">
                      <div className="space-y-2">
                        <Label htmlFor="digest-email" className="text-xs font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="digest-email"
                          type="email"
                          placeholder="your@email.com"
                          value={emailInput}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          onBlur={handleEmailBlur}
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-medium flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          Digest Frequency
                        </Label>
                        <Select 
                          value={preferences.emailDigest.frequency}
                          onValueChange={handleFrequencyChange}
                        >
                          <SelectTrigger className="h-8 text-sm">
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
                      
                      <p className="text-[10px] text-muted-foreground italic">
                        Email notifications will be available once a backend is connected.
                      </p>
                    </div>
                  )}
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
