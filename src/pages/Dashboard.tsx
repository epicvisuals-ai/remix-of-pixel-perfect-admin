const Dashboard = () => {
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

export default Dashboard;
