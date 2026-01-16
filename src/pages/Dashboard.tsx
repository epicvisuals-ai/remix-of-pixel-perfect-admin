import { DollarSign, Star, Briefcase } from "lucide-react";

// Mock: In real app, this would come from auth context
const currentUserRole = "CREATOR";

const CreatorDashboard = () => {
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Star className="h-6 w-6 text-amber-500" />
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
          </div>
        </div>
      </div>
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
  if (currentUserRole === "CREATOR") {
    return <CreatorDashboard />;
  }
  return <DefaultDashboard />;
};

export default Dashboard;
