import { Input } from "@/components/ui/input";

interface TeamCardProps {
  teamName: string;
  memberCount: number;
  onNameChange?: (name: string) => void;
}

export function TeamCard({ teamName, memberCount, onNameChange }: TeamCardProps) {
  return (
    <div className="admin-card animate-fade-in">
      {/* Team Header */}
      <div className="admin-card-section flex items-center justify-between">
        <span className="text-base font-medium text-foreground">{teamName}</span>
        <span className="text-sm text-muted-foreground">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
      </div>
      
      {/* Team Name Edit */}
      <div className="admin-card-section flex items-center justify-between gap-4">
        <span className="text-sm text-foreground">Name</span>
        <Input
          value={teamName}
          onChange={(e) => onNameChange?.(e.target.value)}
          className="max-w-[200px] rounded-lg border-border bg-card text-right text-sm"
        />
      </div>
    </div>
  );
}
