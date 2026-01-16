import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageCircle,
  Calendar,
  DollarSign,
  User,
  FileText,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ProjectStatus = "in_progress" | "pending_review" | "completed" | "on_hold";
type QuoteStatus = "pending" | "accepted" | "rejected" | "expired";

interface Project {
  id: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
  };
  status: ProjectStatus;
  progress: number;
  dueDate: Date;
  budget: number;
  deliverables: number;
  completedDeliverables: number;
  lastUpdate: Date;
  unreadMessages: number;
}

interface Quote {
  id: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
  };
  status: QuoteStatus;
  amount: number;
  submittedDate: Date;
  expiresDate: Date;
  description: string;
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Brand Video Campaign Q1",
    creator: { name: "Sarah Miller", avatar: "https://i.pravatar.cc/150?u=sarah" },
    status: "in_progress",
    progress: 65,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    budget: 5000,
    deliverables: 4,
    completedDeliverables: 2,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadMessages: 3,
  },
  {
    id: "2",
    title: "Product Photography Series",
    creator: { name: "Alex Chen", avatar: "https://i.pravatar.cc/150?u=alex" },
    status: "pending_review",
    progress: 100,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    budget: 2500,
    deliverables: 10,
    completedDeliverables: 10,
    lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    unreadMessages: 0,
  },
  {
    id: "3",
    title: "Social Media Content Pack",
    creator: { name: "Jordan Lee", avatar: "https://i.pravatar.cc/150?u=jordan" },
    status: "on_hold",
    progress: 30,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    budget: 1500,
    deliverables: 6,
    completedDeliverables: 2,
    lastUpdate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    unreadMessages: 1,
  },
  {
    id: "4",
    title: "Website Redesign Assets",
    creator: { name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?u=emma" },
    status: "completed",
    progress: 100,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    budget: 3500,
    deliverables: 8,
    completedDeliverables: 8,
    lastUpdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    unreadMessages: 0,
  },
];

const mockQuotes: Quote[] = [
  {
    id: "1",
    title: "Influencer Campaign Package",
    creator: { name: "Marcus Johnson", avatar: "https://i.pravatar.cc/150?u=marcus" },
    status: "pending",
    amount: 8500,
    submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    description: "Complete influencer campaign including 3 videos and 5 posts",
  },
  {
    id: "2",
    title: "Brand Identity Refresh",
    creator: { name: "Lisa Park", avatar: "https://i.pravatar.cc/150?u=lisa" },
    status: "pending",
    amount: 4200,
    submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    description: "Logo redesign, color palette, and brand guidelines document",
  },
  {
    id: "3",
    title: "Event Photography",
    creator: { name: "David Kim", avatar: "https://i.pravatar.cc/150?u=david" },
    status: "accepted",
    amount: 1800,
    submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    expiresDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    description: "Full day event coverage with 200+ edited photos",
  },
  {
    id: "4",
    title: "Motion Graphics Package",
    creator: { name: "Nina Roberts", avatar: "https://i.pravatar.cc/150?u=nina" },
    status: "rejected",
    amount: 6000,
    submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiresDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    description: "5 animated explainer videos with custom illustrations",
  },
  {
    id: "5",
    title: "Content Strategy Consultation",
    creator: { name: "Tom Wright", avatar: "https://i.pravatar.cc/150?u=tom" },
    status: "expired",
    amount: 2500,
    submittedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    expiresDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    description: "3-month content strategy with weekly consultations",
  },
];

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  in_progress: { label: "In Progress", icon: Clock, variant: "default" },
  pending_review: { label: "Pending Review", icon: AlertCircle, variant: "secondary" },
  completed: { label: "Completed", icon: CheckCircle2, variant: "outline" },
  on_hold: { label: "On Hold", icon: XCircle, variant: "destructive" },
};

const quoteStatusConfig: Record<QuoteStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  accepted: { label: "Accepted", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-200" },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground border-border" },
};

function formatDate(date: Date) {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0 && days <= 7) return `In ${days} days`;
  if (days < 0 && days >= -7) return `${Math.abs(days)} days ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("projects");

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.creator.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredQuotes = mockQuotes.filter((quote) =>
    quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.creator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    activeProjects: mockProjects.filter((p) => p.status === "in_progress").length,
    pendingReview: mockProjects.filter((p) => p.status === "pending_review").length,
    pendingQuotes: mockQuotes.filter((q) => q.status === "pending").length,
    totalValue: mockProjects
      .filter((p) => p.status !== "completed")
      .reduce((sum, p) => sum + p.budget, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.activeProjects}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.pendingReview}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.pendingQuotes}</p>
                <p className="text-sm text-muted-foreground">Pending Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="quotes">
              Quotes
              {stats.pendingQuotes > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {stats.pendingQuotes}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === "projects" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <TabsContent value="projects" className="mt-4">
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">No projects found</p>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => {
                const status = statusConfig[project.status];
                const StatusIcon = status.icon;

                return (
                  <Card key={project.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        {/* Project Info */}
                        <div className="flex flex-1 items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={project.creator.avatar} />
                            <AvatarFallback>{project.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{project.title}</h3>
                              {project.unreadMessages > 0 && (
                                <Badge variant="secondary" className="shrink-0">
                                  <MessageCircle className="mr-1 h-3 w-3" />
                                  {project.unreadMessages}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {project.creator.name}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due {formatDate(project.dueDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(project.budget)}
                              </span>
                              <span>
                                {project.completedDeliverables}/{project.deliverables} deliverables
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress and Status */}
                        <div className="flex flex-col items-end gap-2 sm:w-48">
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                          <div className="w-full">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${project.id}`)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Message Creator</DropdownMenuItem>
                              <DropdownMenuItem>View Deliverables</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Cancel Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="mt-4">
          <div className="space-y-4">
            {filteredQuotes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-muted-foreground">No quotes found</p>
                </CardContent>
              </Card>
            ) : (
              filteredQuotes.map((quote) => {
                const status = quoteStatusConfig[quote.status];

                return (
                  <Card key={quote.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        {/* Quote Info */}
                        <div className="flex flex-1 items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={quote.creator.avatar} />
                            <AvatarFallback>{quote.creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{quote.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {quote.creator.name}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                              {quote.description}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span>
                                Submitted {formatDate(quote.submittedDate)}
                              </span>
                              {quote.status === "pending" && (
                                <span className="text-amber-600">
                                  Expires {formatDate(quote.expiresDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount and Status */}
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xl font-semibold">
                            {formatCurrency(quote.amount)}
                          </span>
                          <Badge variant="outline" className={cn("border", status.color)}>
                            {status.label}
                          </Badge>
                        </div>

                        {/* Actions */}
                        {quote.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              Decline
                            </Button>
                            <Button size="sm">
                              Accept
                            </Button>
                          </div>
                        )}
                        {quote.status !== "pending" && (
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
