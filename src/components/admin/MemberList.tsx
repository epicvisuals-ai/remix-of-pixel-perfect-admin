import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export function MemberList({ members, onInvite }: MemberListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (email.trim() && onInvite) {
      setIsInviting(true);
      try {
        await onInvite(email.trim(), role);
        setEmail("");
        setRole("admin");
        setDialogOpen(false);
      } finally {
        setIsInviting(false);
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
            <span className="text-sm text-muted-foreground">{member.role}</span>
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
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                </SelectContent>
              </Select>
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
