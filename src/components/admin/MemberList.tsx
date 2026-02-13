import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  isCurrentUser?: boolean;
}

interface MemberListProps {
  members: Member[];
  onInvite?: (email: string, role: string) => Promise<void>;
  onDelete?: (memberId: string) => Promise<void>;
}

export function MemberList({ members, onInvite, onDelete }: MemberListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("brand");
  const [isInviting, setIsInviting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentUser = members.find((m) => m.isCurrentUser);
  const currentUserRole = currentUser?.role.toLowerCase();

  const handleInvite = async () => {
    if (email.trim() && onInvite) {
      setIsInviting(true);
      try {
        await onInvite(email.trim(), role);
        setEmail("");
        setRole("brand");
        setDialogOpen(false);
      } finally {
        setIsInviting(false);
      }
    }
  };

  const handleDelete = async (memberId: string) => {
    if (onDelete && !deletingId) {
      setDeletingId(memberId);
      try {
        await onDelete(memberId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">People</h2>
        <Button
          onClick={() => setDialogOpen(true)}
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{member.role}</span>
              {onDelete && currentUserRole === "brand" && !member.isCurrentUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(member.id)}
                  disabled={deletingId === member.id}
                >
                  <Trash2 className={`h-4 w-4 ${deletingId === member.id ? "animate-pulse" : ""}`} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email.trim() && !isInviting) {
                    handleInvite();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleInvite} disabled={!email.trim() || isInviting}>
              {isInviting ? "Sending..." : "Send invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
