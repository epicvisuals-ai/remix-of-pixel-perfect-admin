import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Search, ArrowUpDown, Filter, TrendingUp, BarChart3, Image, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { creatorRequestsApi, type RequestStatsData } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { JobDetailsSheet } from "@/components/creator/JobDetailsSheet";
import type { Deliverable, Job, Message } from "@/lib/creatorRequestMapper";
import { mapApiRequestToJob } from "@/lib/creatorRequestMapper";


type SortOption = "date-desc" | "date-asc" | "budget-desc" | "budget-asc";
type StatusFilter = "all" | Job["status"];

const getStatusBadgeVariant = (status: Job["status"]) => {
  switch (status) {
    case "Submitted":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "In Progress":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "Approved":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Rejected":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "";
  }
};

const TypeIcon = ({ type }: { type: Job["type"] }) => {
  if (type === "Video") {
    return <Video className="h-4 w-4 text-muted-foreground" />;
  }
  return <Image className="h-4 w-4 text-muted-foreground" />;
};

const MyJobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RequestStatsData | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch creator requests with filters
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build params object
        const params: {
          page?: number;
          limit?: number;
          status?: string;
          search?: string;
          sortBy?: string;
          sortOrder?: string;
        } = {};

        // Status filter
        if (statusFilter !== "all") {
          // Convert display status to API format (lowercase with underscores)
          const statusMap: Record<string, string> = {
            'Submitted': 'submitted',
            'In Progress': 'in_progress',
            'Approved': 'approved',
            'Rejected': 'rejected',
          };
          params.status = statusMap[statusFilter] || statusFilter.toLowerCase();
        }

        // Search filter
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Sort options
        const sortMap: Record<SortOption, { sortBy: string; sortOrder: string }> = {
          "date-desc": { sortBy: "createdAt", sortOrder: "desc" },
          "date-asc": { sortBy: "createdAt", sortOrder: "asc" },
          "budget-desc": { sortBy: "budget", sortOrder: "desc" },
          "budget-asc": { sortBy: "budget", sortOrder: "asc" },
        };

        const { sortBy, sortOrder } = sortMap[sortOption];
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;

        const response = await creatorRequestsApi.getRequests(params);

        if (isActive && response.data.success) {
          const mappedJobs = response.data.data.map(mapApiRequestToJob);
          setJobs(mappedJobs);
        } else if (isActive) {
          setError("Failed to load requests");
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (isActive) {
          console.error("Error fetching creator requests:", err);
          setError("Failed to load requests. Please try again later.");
          toast.error("Failed to load requests");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchRequests();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [searchQuery, sortOption, statusFilter]);

  // Fetch request stats
  useEffect(() => {
    let isActive = true;

    const fetchStats = async () => {
      try {
        setIsStatsLoading(true);
        const response = await creatorRequestsApi.getRequestStats();

        if (isActive && response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching request stats:", err);
          // Don't show error toast for stats, just log it
        }
      } finally {
        if (isActive) {
          setIsStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isActive = false;
    };
  }, []);

  // Jobs are now filtered and sorted on the server, so we can use them directly
  const filteredAndSortedJobs = jobs;

  const handleStatusChange = (jobId: string, newStatus: Job["status"]) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    setSelectedJob((prev) =>
      prev?.id === jobId ? { ...prev, status: newStatus } : prev
    );
  };

  const handleAddDeliverable = (jobId: string, deliverable: Deliverable) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, deliverables: [...job.deliverables, deliverable] }
          : job
      )
    );
    setSelectedJob((prev) =>
      prev?.id === jobId
        ? { ...prev, deliverables: [...prev.deliverables, deliverable] }
        : prev
    );
  };

  const handleRemoveDeliverable = (jobId: string, deliverableId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, deliverables: job.deliverables.filter((d) => d.id !== deliverableId) }
          : job
      )
    );
    setSelectedJob((prev) =>
      prev?.id === jobId
        ? { ...prev, deliverables: prev.deliverables.filter((d) => d.id !== deliverableId) }
        : prev
    );
  };

  const handleAddMessage = (jobId: string, message: Message) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, messages: [...job.messages, message] }
          : job
      )
    );
    setSelectedJob((prev) =>
      prev?.id === jobId
        ? { ...prev, messages: [...prev.messages, message] }
        : prev
    );
  };

  // Analytics calculations - use real stats data when available
  const analytics = useMemo(() => {
    if (!stats) {
      // Return default values while loading
      return {
        statusCounts: {
          Submitted: 0,
          "In Progress": 0,
          Approved: 0,
          Rejected: 0,
        },
        statusData: [],
        totalJobs: 0,
        completedJobs: 0,
        completionRate: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        earningsByMonth: [],
      };
    }

    const statusCounts = {
      Submitted: stats.jobsByStatus.submitted,
      "In Progress": stats.jobsByStatus.in_progress,
      Approved: stats.jobsByStatus.approved,
      Rejected: stats.jobsByStatus.rejected,
    };

    const totalJobs = Object.values(stats.jobsByStatus).reduce((sum, count) => sum + count, 0);
    const completedJobs = stats.jobsByStatus.approved;
    const completionRate = stats.completionRate;

    const totalEarnings = stats.totalEarnings;
    const pendingEarnings = stats.pendingEarnings;

    // Format earnings trend data for chart
    const earningsByMonth = stats.earningsTrend.map((item) => {
      // Parse month from "YYYY-MM" format to "MMM" format
      const date = new Date(item.month + "-01");
      const monthName = format(date, "MMM");
      return {
        month: monthName,
        earnings: item.amount,
      };
    });

    const statusData = [
      { name: "Submitted", value: statusCounts.Submitted, fill: "hsl(217, 91%, 60%)" },
      { name: "In Progress", value: statusCounts["In Progress"], fill: "hsl(45, 93%, 47%)" },
      { name: "Approved", value: statusCounts.Approved, fill: "hsl(142, 71%, 45%)" },
      { name: "Rejected", value: statusCounts.Rejected, fill: "hsl(0, 84%, 60%)" },
    ].filter((d) => d.value > 0);

    return {
      statusCounts,
      statusData,
      totalJobs,
      completedJobs,
      completionRate,
      totalEarnings,
      pendingEarnings,
      earningsByMonth,
    };
  }, [stats]);

  const chartConfig = {
    earnings: {
      label: "Earnings",
      color: "hsl(var(--primary))",
    },
    Submitted: {
      label: "Submitted",
      color: "hsl(217, 91%, 60%)",
    },
    "In Progress": {
      label: "In Progress",
      color: "hsl(45, 93%, 47%)",
    },
    Approved: {
      label: "Approved",
      color: "hsl(142, 71%, 45%)",
    },
    Rejected: {
      label: "Rejected",
      color: "hsl(0, 84%, 60%)",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
        <p className="text-muted-foreground">Track and manage requests assigned to you</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        {isStatsLoading ? (
          <>
            {/* Skeleton for Total Earnings Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>

            {/* Skeleton for Completion Rate Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>

            {/* Skeleton for Jobs by Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[100px] w-full mb-2" />
                <div className="flex flex-wrap gap-2 justify-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>

            {/* Skeleton for Earnings Trend Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[100px] w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Total Earnings Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${analytics.totalEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +${analytics.pendingEarnings.toFixed(2)} pending
                </p>
              </CardContent>
            </Card>

            {/* Completion Rate Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.completionRate}%</div>
                <Progress value={analytics.completionRate} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {analytics.completedJobs} of {analytics.totalJobs} jobs completed
                </p>
              </CardContent>
            </Card>

            {/* Jobs by Status Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Jobs by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.statusData.length > 0 ? (
                  <>
                    <ChartContainer config={chartConfig} className="h-[100px] w-full">
                      <PieChart>
                        <Pie
                          data={analytics.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {analytics.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                      {analytics.statusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1 text-xs">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[100px] flex items-center justify-center text-sm text-muted-foreground">
                    No jobs yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Earnings Over Time Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Earnings Trend</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analytics.earningsByMonth.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[100px] w-full">
                    <BarChart data={analytics.earningsByMonth}>
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        fontSize={10}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={false}
                      />
                      <Bar
                        dataKey="earnings"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[100px] flex items-center justify-center text-sm text-muted-foreground">
                    No earnings data
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="budget-desc">Highest Budget</SelectItem>
              <SelectItem value="budget-asc">Lowest Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {/* <TableHead className="text-muted-foreground">ID</TableHead> */}
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Budget</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="text-red-600 dark:text-red-400">{error}</div>
                </TableCell>
              </TableRow>
            ) : filteredAndSortedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No jobs found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedJobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/my-jobs/${job.id}`)}
                >
                  {/* <TableCell className="font-medium text-foreground">
                    {job.id}
                  </TableCell> */}
                  <TableCell className="text-foreground">{job.company}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon type={job.type} />
                      <span className="text-foreground">{job.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <span className="text-muted-foreground">$</span> {job.budget}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusBadgeVariant(job.status)}
                    >
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(job.createdAt, "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <JobDetailsSheet
        job={selectedJob}
        open={selectedJob !== null}
        onOpenChange={(open) => !open && setSelectedJob(null)}
        onStatusChange={handleStatusChange}
        onAddDeliverable={handleAddDeliverable}
        onRemoveDeliverable={handleRemoveDeliverable}
        onAddMessage={handleAddMessage}
      />
    </div>
  );
};

export default MyJobsPage;
