import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Image,
  Video,
  Calendar,
  DollarSign,
  Edit2,
  Check,
  UserPlus,
  Send,
  MessageSquare,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Creator {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: "brand" | "creator";
  content: string;
  createdAt: Date;
}

interface Request {
  id: string;
  type: "Image" | "Video";
  budget: number;
  status: "Created" | "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
  toneOfVoice?: string;
  deadline?: Date;
  assignedCreator?: Creator;
  comments?: Comment[];
}

interface RequestDetailsSheetProps {
  request: Request | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock creators
const availableCreators: Creator[] = [
  { id: "c1", name: "Alex Morgan", specialty: "Video Production", avatar: "" },
  { id: "c2", name: "Sam Chen", specialty: "Graphic Design", avatar: "" },
  { id: "c3", name: "Jordan Lee", specialty: "Motion Graphics", avatar: "" },
  { id: "c4", name: "Casey Taylor", specialty: "Photography", avatar: "" },
];

// Mock comments
const mockComments: Comment[] = [
  {
    id: "cm1",
    authorId: "brand1",
    authorName: "You",
    authorRole: "brand",
    content: "Looking forward to seeing the first drafts!",
    createdAt: new Date("2024-01-21T10:30:00"),
  },
  {
    id: "cm2",
    authorId: "c1",
    authorName: "Alex Morgan",
    authorRole: "creator",
    content: "Thanks! I'll have the initial concepts ready by Friday. Should I focus more on the minimalist approach or the bold graphics?",
    createdAt: new Date("2024-01-21T14:15:00"),
  },
  {
    id: "cm3",
    authorId: "brand1",
    authorName: "You",
    authorRole: "brand",
    content: "Let's go with the minimalist approach - it aligns better with our current branding.",
    createdAt: new Date("2024-01-21T15:00:00"),
  },
];

const getStatusBadgeVariant = (status: Request["status"]) => {
  switch (status) {
    case "Created":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
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

const statusTimeline: { status: Request["status"]; label: string }[] = [
  { status: "Created", label: "Created" },
  { status: "Submitted", label: "Submitted" },
  { status: "In Progress", label: "In Progress" },
  { status: "Approved", label: "Approved" },
];

const getStatusIndex = (status: Request["status"]) => {
  if (status === "Rejected") return -1;
  return statusTimeline.findIndex((s) => s.status === status);
};

export function RequestDetailsSheet({
  request,
  open,
  onOpenChange,
}: RequestDetailsSheetProps) {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>("");
  const [assignedCreator, setAssignedCreator] = useState<Creator | null>(null);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");

  if (!request) return null;

  const currentStatusIndex = getStatusIndex(request.status);

  const handleAssignCreator = () => {
    const creator = availableCreators.find((c) => c.id === selectedCreatorId);
    if (creator) {
      setAssignedCreator(creator);
      setSelectedCreatorId("");
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `cm${Date.now()}`,
      authorId: "brand1",
      authorName: "You",
      authorRole: "brand",
      content: newComment.trim(),
      createdAt: new Date(),
    };
    
    setComments([...comments, comment]);
    setNewComment("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold">
                Request {request.id}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {format(request.createdAt, "MMM d, yyyy")}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={getStatusBadgeVariant(request.status)}
            >
              {request.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Timeline */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">
              Status Timeline
            </h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {statusTimeline.map((step, index) => {
                  const isCompleted = currentStatusIndex >= index;
                  const isCurrent = currentStatusIndex === index;
                  const isRejected = request.status === "Rejected";

                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                          ${isRejected && index === 0 ? "bg-red-100 text-red-700" : ""}
                          ${isCompleted && !isRejected ? "bg-primary text-primary-foreground" : ""}
                          ${!isCompleted && !isRejected ? "bg-muted text-muted-foreground" : ""}
                          ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}
                        `}
                      >
                        {isCompleted && !isRejected ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.max(0, (currentStatusIndex / (statusTimeline.length - 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Creator Assignment */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Assigned Creator
            </h3>
            {assignedCreator ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignedCreator.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {assignedCreator.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {assignedCreator.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {assignedCreator.specialty}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAssignedCreator(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={selectedCreatorId} onValueChange={setSelectedCreatorId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a creator..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCreators.map((creator) => (
                      <SelectItem key={creator.id} value={creator.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {creator.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{creator.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {creator.specialty}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAssignCreator}
                  disabled={!selectedCreatorId}
                  size="icon"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Request Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                {request.type === "Video" ? (
                  <Video className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Image className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {request.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-sm font-medium text-foreground">
                    ${request.budget}
                  </p>
                </div>
              </div>

              {request.deadline && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 col-span-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="text-sm font-medium text-foreground">
                      {format(request.deadline, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Brief */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Brief</h3>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-foreground leading-relaxed">
                {request.brief}
              </p>
            </div>
          </div>

          {request.toneOfVoice && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Tone of Voice
                </h3>
                <Badge variant="outline" className="text-foreground">
                  {request.toneOfVoice}
                </Badge>
              </div>
            </>
          )}

          <Separator />

          {/* Messages/Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">
                Messages
              </h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                {comments.length}
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <ScrollArea className="h-[200px] p-3">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation below</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`flex gap-3 ${
                          comment.authorRole === "brand" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={comment.authorAvatar} />
                          <AvatarFallback
                            className={`text-xs ${
                              comment.authorRole === "brand"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            {comment.authorName.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`flex-1 max-w-[80%] ${
                            comment.authorRole === "brand" ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`inline-block p-3 rounded-lg ${
                              comment.authorRole === "brand"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comment.authorName} •{" "}
                            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="border-t p-3 bg-muted/30">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendComment}
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Request
            </Button>
            {request.status === "Created" && (
              <Button className="flex-1">Submit for Review</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
