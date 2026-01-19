import { useState, useEffect } from "react";
import { TeamCard } from "@/components/admin/TeamCard";
import { MemberList } from "@/components/admin/MemberList";
import { Skeleton } from "@/components/ui/skeleton";
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
          email: member.email,
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
        email: member.email,
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

        {/* TeamCard Skeleton */}
        <div className="admin-card animate-fade-in">
          <div className="admin-card-section flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="admin-card-section flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-52" />
          </div>
        </div>

        {/* MemberList Skeleton */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="admin-card">
            {/* Member Count Header Skeleton */}
            <div className="admin-card-section flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-8" />
            </div>

            {/* Member Items Skeleton - Show 3 placeholder members */}
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="admin-card-section flex items-center gap-3"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
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
