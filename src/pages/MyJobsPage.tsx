import { useState, useRef, useMemo, useEffect } from "react";
import { Image, Video, DollarSign, Clock, FileText, Upload, Check, X, File, Trash2, MessageCircle, Send, Circle, Search, ArrowUpDown, Filter, TrendingUp, BarChart3 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { creatorRequestsApi, type CreatorRequestItem, type RequestStatsData } from "@/lib/api";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis } from "recharts";
import { Progress } from "@/components/ui/progress";

interface Deliverable {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
}

interface Message {
  id: string;
  author: string;
  authorType: "creator" | "client";
  content: string;
  createdAt: Date;
}

interface Job {
  id: string;
  company: string;
  type: "Image" | "Video";
  budget: number;
  status: "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
  tone: string;
  deadline: string;
  deliverables: Deliverable[];
  messages: Message[];
}

// Map API response to Job interface
const mapApiRequestToJob = (request: CreatorRequestItem): Job => {
  // Capitalize first letter of content type (video -> Video, image -> Image)
  const type = (request.contentType.charAt(0).toUpperCase() + request.contentType.slice(1)) as Job["type"];

  // Capitalize first letter of status (submitted -> Submitted, in progress -> In Progress, approved -> Approved)
  const statusMap: Record<string, Job["status"]> = {
    'submitted': 'Submitted',
    'in progress': 'In Progress',
    'in_progress': 'In Progress',
    'approved': 'Approved',
    'rejected': 'Rejected',
  };
  const status = statusMap[request.status.toLowerCase()] || 'Submitted';

  // Format company name from creator's name
  const company = `${request.creator.firstName} ${request.creator.lastName}`;

  // Capitalize tone of voice (playful -> Playful)
  const tone = request.toneOfVoice.charAt(0).toUpperCase() + request.toneOfVoice.slice(1);

  // Format deadline
  const deadline = request.deadline ? format(new Date(request.deadline), "MMM d") : "TBD";

  return {
    id: request.id,
    company,
    type,
    budget: request.budget,
    status,
    createdAt: new Date(request.createdAt),
    brief: request.brief,
    tone,
    deadline,
    deliverables: [],
    messages: [],
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

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

const STATUS_STEPS = ["Submitted", "In Progress", "Approved"] as const;

const getStepStatus = (currentStatus: Job["status"], step: typeof STATUS_STEPS[number]): "completed" | "current" | "upcoming" | "rejected" => {
  if (currentStatus === "Rejected") {
    if (step === "Submitted") return "completed";
    return "rejected";
  }
  
  const currentIndex = STATUS_STEPS.indexOf(currentStatus as typeof STATUS_STEPS[number]);
  const stepIndex = STATUS_STEPS.indexOf(step);
  
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
};

const StatusTimeline = ({ status }: { status: Job["status"] }) => {
  return (
    <div className="flex items-center justify-between">
      {STATUS_STEPS.map((step, index) => {
        const stepStatus = getStepStatus(status, step);
        const isLast = index === STATUS_STEPS.length - 1;
        
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${stepStatus === "completed" ? "bg-green-500 text-white" : ""}
                  ${stepStatus === "current" ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                  ${stepStatus === "upcoming" ? "bg-muted text-muted-foreground" : ""}
                  ${stepStatus === "rejected" ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {stepStatus === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : stepStatus === "current" ? (
                  <Circle className="h-3 w-3 fill-current" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium text-center
                  ${stepStatus === "completed" ? "text-green-600 dark:text-green-400" : ""}
                  ${stepStatus === "current" ? "text-primary" : ""}
                  ${stepStatus === "upcoming" || stepStatus === "rejected" ? "text-muted-foreground" : ""}
                `}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 mt-[-16px] transition-all duration-300
                  ${getStepStatus(status, STATUS_STEPS[index + 1]) === "completed" || getStepStatus(status, STATUS_STEPS[index + 1]) === "current" 
                    ? "bg-green-500" 
                    : "bg-muted"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

interface JobDetailsSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (jobId: string, newStatus: Job["status"]) => void;
  onAddDeliverable: (jobId: string, deliverable: Deliverable) => void;
  onRemoveDeliverable: (jobId: string, deliverableId: string) => void;
  onAddMessage: (jobId: string, message: Message) => void;
}

const JobDetailsSheet = ({
  job,
  open,
  onOpenChange,
  onStatusChange,
  onAddDeliverable,
  onRemoveDeliverable,
  onAddMessage,
}: JobDetailsSheetProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  if (!job) return null;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      author: "You",
      authorType: "creator",
      content: newMessage.trim(),
      createdAt: new Date(),
    };
    
    onAddMessage(job.id, message);
    setNewMessage("");
    toast.success("Message sent");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await creatorRequestsApi.acceptRequest(job.id);
      if (response.data.success) {
        onStatusChange(job.id, "In Progress");
        toast.success("Job accepted! Status changed to In Progress.");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept job. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      const response = await creatorRequestsApi.declineRequest(job.id);
      if (response.data.success) {
        onStatusChange(job.id, "Rejected");
        toast.info("Job declined.");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error("Failed to decline job. Please try again.");
    } finally {
      setIsDeclining(false);
    }
  };

  const handleSubmitDeliverable = () => {
    if (job.deliverables.length === 0) {
      toast.error("Please upload at least one file before submitting.");
      return;
    }
    toast.success("Deliverable submitted for review!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const newDeliverable: Deliverable = {
        id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: new Date(),
      };
      onAddDeliverable(job.id, newDeliverable);
      toast.success(`Uploaded: ${file.name}`);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (deliverableId: string) => {
    onRemoveDeliverable(job.id, deliverableId);
    toast.info("File removed.");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Job {job.id}</SheetTitle>
            <Badge
              variant="secondary"
              className={getStatusBadgeVariant(job.status)}
            >
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {format(job.createdAt, "MMM d, yyyy")}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline status={job.status} />
              {job.status === "Rejected" && (
                <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This job was declined
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brief Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {job.brief}
              </p>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TypeIcon type={job.type} />
                  <span>Type</span>
                </div>
                <span className="text-sm font-medium">{job.type}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </div>
                <span className="text-sm font-medium">${job.budget}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tone</span>
                <span className="text-sm font-medium">{job.tone}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Deadline</span>
                </div>
                <span className="text-sm font-medium">{job.deadline}</span>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables Upload Card - Show for In Progress and Approved */}
          {(job.status === "In Progress" || job.status === "Approved") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area - Only show for In Progress */}
                {job.status === "In Progress" && (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*,.pdf,.zip,.psd,.ai,.fig"
                    />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload files
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Images, videos, PDFs, or design files
                    </p>
                  </div>
                )}

                {/* Uploaded Files List */}
                {job.deliverables.length > 0 && (
                  <div className="space-y-2">
                    {job.deliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {deliverable.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {deliverable.size} • {format(deliverable.uploadedAt, "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        {job.status === "In Progress" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleRemoveFile(deliverable.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {job.deliverables.length === 0 && job.status === "Approved" && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No deliverables uploaded
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Messages Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages List */}
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {job.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    job.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.authorType === "creator" ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className={message.authorType === "creator" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                            {message.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex-1 ${message.authorType === "creator" ? "text-right" : ""}`}>
                          <div className="flex items-center gap-2 mb-1" style={{ justifyContent: message.authorType === "creator" ? "flex-end" : "flex-start" }}>
                            <span className="text-sm font-medium">{message.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(message.createdAt, "MMM d, h:mm a")}
                            </span>
                          </div>
                          <div
                            className={`inline-block rounded-lg px-3 py-2 text-sm ${
                              message.authorType === "creator"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  size="icon"
                  className="h-[80px] w-10 flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            {job.status === "Submitted" && (
              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  className="flex-1"
                  disabled={isAccepting || isDeclining}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isAccepting ? "Accepting..." : "Accept Job"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="flex-1"
                  disabled={isAccepting || isDeclining}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isDeclining ? "Declining..." : "Decline"}
                </Button>
              </div>
            )}

            {job.status === "In Progress" && (
              <Button onClick={handleSubmitDeliverable} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Submit Deliverable
              </Button>
            )}

            {job.status === "Approved" && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-center">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  ✓ This job has been completed
                </p>
              </div>
            )}

            {job.status === "Rejected" && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-center">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  This job was declined
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

type SortOption = "date-desc" | "date-asc" | "budget-desc" | "budget-asc";
type StatusFilter = "all" | Job["status"];

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
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading requests...
                </TableCell>
              </TableRow>
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
                  onClick={() => setSelectedJob(job)}
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
