import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MessageCircle,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Upload,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import DeliverableCard from "@/components/projects/DeliverableCard";
import { FileAttachmentItem } from "@/components/projects/FileAttachment";

type DeliverableStatus = "pending" | "in_progress" | "in_review" | "approved" | "revision_requested";
type DeliverableType = "image" | "video" | "document";

interface Milestone {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  current?: boolean;
}

interface Deliverable {
  id: string;
  title: string;
  type: DeliverableType;
  status: DeliverableStatus;
  dueDate: Date;
  thumbnail?: string;
  version: number;
  feedback?: string;
}

interface ActivityItem {
  id: string;
  type: "message" | "upload" | "status_change" | "feedback" | "milestone";
  user: {
    name: string;
    avatar: string;
    isCreator?: boolean;
  };
  content: string;
  timestamp: Date;
  metadata?: {
    fileName?: string;
    oldStatus?: string;
    newStatus?: string;
    milestoneName?: string;
  };
}

const mockProject = {
  id: "1",
  title: "Brand Video Campaign Q1",
  description: "Complete video campaign including 3 promotional videos and 1 behind-the-scenes content piece for Q1 marketing push.",
  creator: {
    name: "Sarah Miller",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    role: "Video Creator",
  },
  status: "in_progress" as const,
  progress: 65,
  startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  budget: 5000,
  paid: 2500,
};

const mockMilestones: Milestone[] = [
  { id: "1", title: "Project Kickoff", date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), completed: true },
  { id: "2", title: "Concept Approval", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), completed: true },
  { id: "3", title: "First Draft Delivery", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completed: true },
  { id: "4", title: "Revisions Complete", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: false, current: true },
  { id: "5", title: "Final Delivery", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: false },
  { id: "6", title: "Project Complete", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false },
];

const mockDeliverables: Deliverable[] = [
  { id: "1", title: "Hero Video (60s)", type: "video", status: "approved", dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200", version: 2 },
  { id: "2", title: "Product Showcase Video", type: "video", status: "in_review", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=200", version: 1 },
  { id: "3", title: "Behind The Scenes", type: "video", status: "in_progress", dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), version: 1 },
  { id: "4", title: "Thumbnail Graphics (5x)", type: "image", status: "revision_requested", dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200", version: 3, feedback: "Please adjust the color palette to match brand guidelines" },
  { id: "5", title: "Project Brief Document", type: "document", status: "approved", dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), version: 1 },
  { id: "6", title: "Social Media Cuts (3x)", type: "video", status: "pending", dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), version: 0 },
];

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "upload",
    user: { name: "Sarah Miller", avatar: "https://i.pravatar.cc/150?u=sarah", isCreator: true },
    content: "Uploaded new version of",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: { fileName: "Product Showcase Video v1" },
  },
  {
    id: "2",
    type: "feedback",
    user: { name: "You", avatar: "https://i.pravatar.cc/150?u=me" },
    content: "Requested revisions on Thumbnail Graphics",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "3",
    type: "status_change",
    user: { name: "Sarah Miller", avatar: "https://i.pravatar.cc/150?u=sarah", isCreator: true },
    content: "Updated deliverable status",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    metadata: { oldStatus: "In Progress", newStatus: "In Review" },
  },
  {
    id: "4",
    type: "milestone",
    user: { name: "System", avatar: "" },
    content: "Milestone completed",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    metadata: { milestoneName: "First Draft Delivery" },
  },
  {
    id: "5",
    type: "message",
    user: { name: "Sarah Miller", avatar: "https://i.pravatar.cc/150?u=sarah", isCreator: true },
    content: "Hi! I've uploaded the first draft of the hero video. Let me know your thoughts!",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "6",
    type: "upload",
    user: { name: "Sarah Miller", avatar: "https://i.pravatar.cc/150?u=sarah", isCreator: true },
    content: "Uploaded",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    metadata: { fileName: "Hero Video (60s) v1" },
  },
  {
    id: "7",
    type: "milestone",
    user: { name: "System", avatar: "" },
    content: "Milestone completed",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    metadata: { milestoneName: "Concept Approval" },
  },
];


function formatDate(date: Date) {
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [deliverableAttachments, setDeliverableAttachments] = useState<Record<string, FileAttachmentItem[]>>({});

  const project = mockProject;
  const completedMilestones = mockMilestones.filter((m) => m.completed).length;
  const approvedDeliverables = mockDeliverables.filter((d) => d.status === "approved").length;

  const handleUploadFiles = (deliverableId: string, files: File[]) => {
    const newAttachments: FileAttachmentItem[] = files.map((file, index) => ({
      id: `${deliverableId}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file),
      uploading: true,
      progress: 0,
    }));

    setDeliverableAttachments((prev) => ({
      ...prev,
      [deliverableId]: [...(prev[deliverableId] || []), ...newAttachments],
    }));

    // Simulate upload progress
    newAttachments.forEach((attachment) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setDeliverableAttachments((prev) => ({
            ...prev,
            [deliverableId]: prev[deliverableId].map((a) =>
              a.id === attachment.id ? { ...a, uploading: false, progress: 100 } : a
            ),
          }));
        } else {
          setDeliverableAttachments((prev) => ({
            ...prev,
            [deliverableId]: prev[deliverableId].map((a) =>
              a.id === attachment.id ? { ...a, progress } : a
            ),
          }));
        }
      }, 200);
    });
  };

  const handleRemoveAttachment = (deliverableId: string, attachmentId: string) => {
    setDeliverableAttachments((prev) => ({
      ...prev,
      [deliverableId]: prev[deliverableId].filter((a) => a.id !== attachmentId),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/projects")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{project.title}</h1>
            <Badge variant="default" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              In Progress
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>View Contract</DropdownMenuItem>
              <DropdownMenuItem>Export Report</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancel Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-semibold">{project.progress}%</p>
              </div>
              <Progress value={project.progress} className="h-2 w-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deliverables</p>
                <p className="text-2xl font-semibold">
                  {approvedDeliverables}/{mockDeliverables.length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-2xl font-semibold">{formatDate(project.dueDate)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-2xl font-semibold">{formatCurrency(project.budget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div
                  className="absolute left-4 top-0 w-0.5 bg-primary transition-all"
                  style={{ height: `${(completedMilestones / mockMilestones.length) * 100}%` }}
                />

                <div className="space-y-6">
                  {mockMilestones.map((milestone, index) => (
                    <div key={milestone.id} className="relative flex items-start gap-4 pl-10">
                      <div
                        className={cn(
                          "absolute left-2 flex h-5 w-5 items-center justify-center rounded-full border-2",
                          milestone.completed
                            ? "border-primary bg-primary"
                            : milestone.current
                            ? "border-primary bg-background"
                            : "border-border bg-background"
                        )}
                      >
                        {milestone.completed && (
                          <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                        )}
                        {milestone.current && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={cn(
                              "font-medium",
                              milestone.completed ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {milestone.title}
                          </p>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(milestone.date)}
                          </span>
                        </div>
                        {milestone.current && (
                          <Badge variant="secondary" className="mt-1">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Deliverables</CardTitle>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Request Upload
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDeliverables.map((deliverable) => (
                  <DeliverableCard
                    key={deliverable.id}
                    deliverable={deliverable}
                    attachments={deliverableAttachments[deliverable.id] || []}
                    onUpload={handleUploadFiles}
                    onRemoveAttachment={handleRemoveAttachment}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Creator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.creator.avatar} />
                  <AvatarFallback>{project.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{project.creator.name}</p>
                  <p className="text-sm text-muted-foreground">{project.creator.role}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                <div className="space-y-4 p-4">
                  {mockActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      {activity.type === "milestone" ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                      ) : (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback>
                            {activity.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          {activity.type === "milestone" ? (
                            <>
                              <span className="font-medium">{activity.metadata?.milestoneName}</span>
                              {" "}completed
                            </>
                          ) : activity.type === "upload" ? (
                            <>
                              <span className="font-medium">{activity.user.name}</span>
                              {" "}{activity.content}{" "}
                              <span className="font-medium">{activity.metadata?.fileName}</span>
                            </>
                          ) : activity.type === "status_change" ? (
                            <>
                              <span className="font-medium">{activity.user.name}</span>
                              {" "}changed status from{" "}
                              <span className="font-medium">{activity.metadata?.oldStatus}</span>
                              {" "}to{" "}
                              <span className="font-medium">{activity.metadata?.newStatus}</span>
                            </>
                          ) : activity.type === "message" ? (
                            <>
                              <span className="font-medium">{activity.user.name}</span>
                              : {activity.content}
                            </>
                          ) : (
                            <>
                              <span className="font-medium">{activity.user.name}</span>
                              {" "}{activity.content}
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Comment Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
                <Button className="mt-2 w-full" disabled={!newComment.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
