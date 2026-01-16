import { useState } from "react";
import { Plus, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ProjectRole = "owner" | "manager" | "editor" | "viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: ProjectRole;
}

interface TeamMemberAssignmentProps {
  teamMembers: TeamMember[];
  onAddMember: (member: TeamMember) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateRole: (memberId: string, role: ProjectRole) => void;
}

const projectRoles: { value: ProjectRole; label: string; description: string }[] = [
  { value: "owner", label: "Owner", description: "Full control over the project" },
  { value: "manager", label: "Manager", description: "Can manage team and deliverables" },
  { value: "editor", label: "Editor", description: "Can edit content and files" },
  { value: "viewer", label: "Viewer", description: "View-only access" },
];

const roleColors: Record<ProjectRole, string> = {
  owner: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-amber-500/10 text-amber-600 border-amber-200",
  editor: "bg-blue-500/10 text-blue-600 border-blue-200",
  viewer: "bg-muted text-muted-foreground border-border",
};

// Mock available team members to add
const availableMembers = [
  { id: "1", name: "Sarah Miller", email: "sarah@example.com", avatar: "https://i.pravatar.cc/150?u=sarah" },
  { id: "2", name: "Alex Chen", email: "alex@example.com", avatar: "https://i.pravatar.cc/150?u=alex" },
  { id: "3", name: "Jordan Lee", email: "jordan@example.com", avatar: "https://i.pravatar.cc/150?u=jordan" },
  { id: "4", name: "Emma Wilson", email: "emma@example.com", avatar: "https://i.pravatar.cc/150?u=emma" },
  { id: "5", name: "Marcus Johnson", email: "marcus@example.com", avatar: "https://i.pravatar.cc/150?u=marcus" },
  { id: "6", name: "Lisa Park", email: "lisa@example.com", avatar: "https://i.pravatar.cc/150?u=lisa" },
];

export function TeamMemberAssignment({
  teamMembers,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
}: TeamMemberAssignmentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("editor");

  const assignedIds = teamMembers.map((m) => m.id);
  const unassignedMembers = availableMembers.filter((m) => !assignedIds.includes(m.id));

  const handleAddMember = () => {
    const member = availableMembers.find((m) => m.id === selectedMember);
    if (member) {
      onAddMember({
        ...member,
        role: selectedRole,
      });
      setSelectedMember("");
      setSelectedRole("editor");
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Team Members</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={unassignedMembers.length === 0}>
              <UserPlus className="mr-1 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Select a team member and assign their role in this project.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Team Member</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{member.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as ProjectRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={!selectedMember}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {teamMembers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <UserPlus className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            No team members assigned yet
          </p>
          <p className="text-xs text-muted-foreground/70">
            Add team members to collaborate on this project
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(role) => onUpdateRole(member.id, role as ProjectRole)}
                >
                  <SelectTrigger className="h-8 w-28">
                    <Badge
                      variant="outline"
                      className={cn("font-normal", roleColors[member.role])}
                    >
                      {projectRoles.find((r) => r.value === member.role)?.label}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {projectRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveMember(member.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
