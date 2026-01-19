import { useState, useEffect } from "react";
import { TeamCard } from "@/components/admin/TeamCard";
import { MemberList } from "@/components/admin/MemberList";
import { toast } from "@/hooks/use-toast";
import { teamApi, userApi } from "@/lib/api";

interface DisplayMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isCurrentUser?: boolean;
}

export default function TeamPage() {
  const [teamName, setTeamName] = useState("test");
  const [members, setMembers] = useState<DisplayMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user and team members on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch current user to identify them in the list
        const userResponse = await userApi.getMe();
        setCurrentUserId(userResponse.data.id);

        // Fetch team members
        const response = await teamApi.getTeamMembers();
        const transformedMembers = response.data.items.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.user_id, // Using user_id as email for now
          role: member.role.charAt(0).toUpperCase() + member.role.slice(1),
          isCurrentUser: member.user_id === userResponse.data.id,
        }));
        setMembers(transformedMembers);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.detail || "Failed to load team members",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInvite = async (email: string, role: string) => {
    try {
      const response = await teamApi.inviteTeamMember({
        email,
        role: role.toLowerCase(),
      });

      toast({
        title: "Success",
        description: response.data.message,
      });

      // Refresh team members list
      const teamResponse = await teamApi.getTeamMembers();
      const transformedMembers = teamResponse.data.items.map((member) => ({
        id: member.id,
        name: member.name,
        email: member.user_id,
        role: member.role.charAt(0).toUpperCase() + member.role.slice(1),
        isCurrentUser: member.user_id === currentUserId,
      }));
      setMembers(transformedMembers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-foreground">Team</h1>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Team</h1>

      <TeamCard
        teamName={teamName}
        memberCount={members.length}
        onNameChange={setTeamName}
      />

      <MemberList
        members={members}
        onInvite={handleInvite}
      />
    </div>
  );
}
