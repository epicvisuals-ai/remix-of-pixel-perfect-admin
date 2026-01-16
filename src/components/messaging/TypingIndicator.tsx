import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  name?: string;
  className?: string;
}

export function TypingIndicator({ name, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
      {name && (
        <span className="text-sm text-muted-foreground">{name} is typing...</span>
      )}
    </div>
  );
}
