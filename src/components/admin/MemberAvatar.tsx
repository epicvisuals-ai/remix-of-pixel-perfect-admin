import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  className?: string;
}

export function MemberAvatar({ name, className }: MemberAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-success text-sm font-medium text-success-foreground",
        className
      )}
    >
      {initial}
    </div>
  );
}
