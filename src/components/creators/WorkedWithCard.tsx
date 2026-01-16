import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface WorkedWithCardProps {
  name: string;
  avatar: string;
  collaborationCount: number;
  specialty: string;
}

export function WorkedWithCard({ name, avatar, collaborationCount, specialty }: WorkedWithCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50">
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{name}</h4>
        <p className="text-sm text-muted-foreground">
          {collaborationCount} project{collaborationCount !== 1 ? "s" : ""} • {specialty}
        </p>
      </div>
      <Button variant="outline" size="sm" className="shrink-0">
        View
      </Button>
    </div>
  );
}
