import { Check, CheckCheck } from "lucide-react";
import { MessageStatus } from "@/contexts/MessagingContext";
import { cn } from "@/lib/utils";

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusIndicator({ status, className }: MessageStatusIndicatorProps) {
  return (
    <span className={cn("inline-flex", className)}>
      {status === "sending" && (
        <span className="h-3 w-3 animate-pulse rounded-full bg-current opacity-50" />
      )}
      {status === "sent" && (
        <Check className="h-3.5 w-3.5 opacity-70" />
      )}
      {status === "delivered" && (
        <CheckCheck className="h-3.5 w-3.5 opacity-70" />
      )}
      {status === "read" && (
        <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
      )}
    </span>
  );
}
