import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

export function MemberAvatar({ name, avatarUrl, className }: MemberAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <Avatar className={cn("h-9 w-9 text-sm font-medium", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className="bg-success text-success-foreground">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
