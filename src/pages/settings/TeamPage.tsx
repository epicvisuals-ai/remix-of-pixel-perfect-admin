import { useState } from "react";
import { TeamCard } from "@/components/admin/TeamCard";
import { MemberList } from "@/components/admin/MemberList";
import { toast } from "@/hooks/use-toast";

const mockMembers = [
  {
    id: "1",
    name: "Oleh Kuprovskyi",
    email: "oleh.kuprovskyi@gmail.com",
    role: "Admin",
    isCurrentUser: true,
  },
];

export default function TeamPage() {
  const [teamName, setTeamName] = useState("test");

  const handleInvite = () => {
    toast({
      title: "Invite members",
      description: "This feature is coming soon!",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Team</h1>
      
      <TeamCard
        teamName={teamName}
        memberCount={mockMembers.length}
        onNameChange={setTeamName}
      />

      <MemberList
        members={mockMembers}
        onInvite={handleInvite}
      />
    </div>
  );
}
