import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  isCurrentUser?: boolean;
}

interface MemberListProps {
  members: Member[];
  onInvite?: () => void;
}

export function MemberList({ members, onInvite }: MemberListProps) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">People</h2>
        <Button
          onClick={onInvite}
          className="gap-2 rounded-full px-5"
        >
          <Plus className="h-4 w-4" />
          Invite members
        </Button>
      </div>

      {/* Members Card */}
      <div className="admin-card">
        {/* Member Count Header */}
        <div className="admin-card-section flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {members.length} {members.length === 1 ? "Member" : "Members"}
          </span>
          <span className="text-sm text-muted-foreground">({members.length})</span>
        </div>

        {/* Member Items */}
        {members.map((member) => (
          <div
            key={member.id}
            className="admin-card-section flex items-center gap-3"
          >
            <MemberAvatar name={member.name} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-foreground truncate">
                  {member.name}
                </span>
                {member.isCurrentUser && (
                  <span className="text-sm text-muted-foreground">(you)</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{member.email}</p>
            </div>
            <span className="text-sm text-muted-foreground">{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
