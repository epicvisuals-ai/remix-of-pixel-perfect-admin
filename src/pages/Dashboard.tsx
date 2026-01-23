import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Star, Briefcase, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { creatorRequestsApi, RevisionRequestedItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const RevisionCard = ({ item, onClick }: { item: RevisionRequestedItem; onClick: () => void }) => {
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 p-4 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 hover:bg-amber-100">
              Revision Requested
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">
              {item.contentType}
            </span>
          </div>
          <p className="text-sm text-foreground line-clamp-2">{item.brief}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ${item.budget.toFixed(0)} · {formatDistanceToNow(new Date(item.createdAt))} ago
          </p>
        </div>
        {item.companyLogoUrl && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.companyLogoUrl} />
            <AvatarFallback>{item.companyName?.[0] || "C"}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [revisionItems, setRevisionItems] = useState<RevisionRequestedItem[]>([]);
  const [isLoadingRevisions, setIsLoadingRevisions] = useState(true);

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const response = await creatorRequestsApi.getRevisionRequested();
        setRevisionItems(response.data.data);
      } catch (error) {
        console.error("Failed to fetch revision requests:", error);
      } finally {
        setIsLoadingRevisions(false);
      }
    };
    fetchRevisions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your creator dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-foreground">$2500</p>
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Star className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold text-foreground">4.9</p>
            </div>
          </div>
        </div>

        {/* Active Jobs Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Needs Revision Section */}
      {isLoadingRevisions ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ) : revisionItems.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Needs Revision ({revisionItems.length})
            </h2>
            <Button variant="link" onClick={() => navigate("/my-jobs")}>
              View All
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {revisionItems.slice(0, 4).map((item) => (
              <RevisionCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/my-jobs/${item.id}`)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const DefaultDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Overview</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your dashboard overview will appear here.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Activity</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Recent activity will be shown here.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground">Stats</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Key statistics will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === "creator") {
    return <CreatorDashboard />;
  }
  return <DefaultDashboard />;
};

export default Dashboard;
