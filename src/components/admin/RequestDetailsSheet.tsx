import { useState, useRef, useCallback } from "react";
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
  Paperclip,
  FileText,
  X,
  Download,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Creator {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
}

interface Attachment {
  id: string;
  name: string;
  type: "image" | "document";
  url: string;
  size: string;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: "brand" | "creator";
  content: string;
  createdAt: Date;
  attachments?: Attachment[];
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

// Mock comments with attachments
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
    content: "Here are the initial concepts. Let me know your thoughts!",
    createdAt: new Date("2024-01-21T14:15:00"),
    attachments: [
      {
        id: "att1",
        name: "concept-v1.png",
        type: "image",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
        size: "2.4 MB",
      },
      {
        id: "att2",
        name: "brand-guidelines.pdf",
        type: "document",
        url: "#",
        size: "1.2 MB",
      },
    ],
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

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Attachment[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  if (!request) return null;

  const currentStatusIndex = getStatusIndex(request.status);

  // Collect all image attachments for lightbox navigation
  const allImageAttachments = comments.flatMap(
    (comment) => comment.attachments?.filter((a) => a.type === "image") || []
  );

  const handleAssignCreator = () => {
    const creator = availableCreators.find((c) => c.id === selectedCreatorId);
    if (creator) {
      setAssignedCreator(creator);
      setSelectedCreatorId("");
    }
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newAttachments: Attachment[] = fileArray.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: isImage ? "image" : "document",
        url: isImage ? URL.createObjectURL(file) : "#",
        size: formatFileSize(file.size),
      };
    });
    setPendingAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, []);

  const removePendingAttachment = (id: string) => {
    setPendingAttachments(pendingAttachments.filter((att) => att.id !== id));
  };

  const handleSendComment = () => {
    if (!newComment.trim() && pendingAttachments.length === 0) return;
    
    const comment: Comment = {
      id: `cm${Date.now()}`,
      authorId: "brand1",
      authorName: "You",
      authorRole: "brand",
      content: newComment.trim(),
      createdAt: new Date(),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
    };
    
    setComments([...comments, comment]);
    setNewComment("");
    setPendingAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const openLightbox = (attachment: Attachment) => {
    const imageIndex = allImageAttachments.findIndex((a) => a.id === attachment.id);
    if (imageIndex !== -1) {
      setLightboxImages(allImageAttachments);
      setLightboxIndex(imageIndex);
      setLightboxOpen(true);
    }
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1));
    } else {
      setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0));
    }
  };

  const handleLightboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") navigateLightbox("prev");
    if (e.key === "ArrowRight") navigateLightbox("next");
    if (e.key === "Escape") setLightboxOpen(false);
  };

  const AttachmentPreview = ({ attachment, isBrand }: { attachment: Attachment; isBrand: boolean }) => {
    if (attachment.type === "image") {
      return (
        <div className="relative group mt-2">
          <img
            src={attachment.url}
            alt={attachment.name}
            className="rounded-lg max-w-[200px] max-h-[150px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(attachment)}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 rounded-full p-2">
              <ZoomIn className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity truncate">
            {attachment.name}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-2 mt-2 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
          isBrand ? "bg-primary-foreground/20" : "bg-background/50"
        }`}
        onClick={() => window.open(attachment.url, "_blank")}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{attachment.name}</p>
          <p className={`text-xs ${isBrand ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {attachment.size}
          </p>
        </div>
        <Download className="h-4 w-4 shrink-0" />
      </div>
    );
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

            <div
              ref={dropZoneRef}
              className={`border rounded-lg overflow-hidden transition-colors ${
                isDragging ? "border-primary border-2 bg-primary/5" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                  <Upload className="h-10 w-10 text-primary mb-2 animate-fade-in" />
                  <p className="text-sm font-medium text-primary">Drop files here</p>
                  <p className="text-xs text-muted-foreground">Images and documents</p>
                </div>
              )}
              
              <ScrollArea className="h-[280px] p-3">
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
                            {comment.content && (
                              <p className="text-sm">{comment.content}</p>
                            )}
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className={`${comment.content ? "mt-2" : ""} space-y-2`}>
                                {comment.attachments.map((attachment) => (
                                  <AttachmentPreview
                                    key={attachment.id}
                                    attachment={attachment}
                                    isBrand={comment.authorRole === "brand"}
                                  />
                                ))}
                              </div>
                            )}
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

              {/* Pending attachments preview */}
              {pendingAttachments.length > 0 && (
                <div className="border-t p-2 bg-muted/20">
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1"
                      >
                        {attachment.type === "image" ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs text-foreground max-w-[100px] truncate">
                          {attachment.name}
                        </span>
                        <button
                          onClick={() => removePendingAttachment(attachment.id)}
                          className="p-0.5 hover:bg-background rounded"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t p-3 bg-muted/30">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0"
                    title="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message or drop files..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendComment}
                    disabled={!newComment.trim() && pendingAttachments.length === 0}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Drag & drop files here or click <Paperclip className="h-3 w-3 inline" /> to attach
                </p>
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

        {/* Image Lightbox */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent 
            className="max-w-4xl w-full h-[90vh] p-0 bg-black/95 border-none"
            onKeyDown={handleLightboxKeyDown}
          >
            <VisuallyHidden>
              <DialogTitle>Image Preview</DialogTitle>
            </VisuallyHidden>
            
            {lightboxImages.length > 0 && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
                  onClick={() => setLightboxOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Navigation arrows */}
                {lightboxImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 z-20 text-white hover:bg-white/20 h-12 w-12"
                      onClick={() => navigateLightbox("prev")}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 z-20 text-white hover:bg-white/20 h-12 w-12"
                      onClick={() => navigateLightbox("next")}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}

                {/* Image */}
                <img
                  src={lightboxImages[lightboxIndex]?.url}
                  alt={lightboxImages[lightboxIndex]?.name}
                  className="max-w-full max-h-full object-contain animate-scale-in"
                />

                {/* Image info */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {lightboxImages[lightboxIndex]?.name}
                  </span>
                  {lightboxImages.length > 1 && (
                    <span className="text-xs text-white/70">
                      {lightboxIndex + 1} / {lightboxImages.length}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 h-8"
                    onClick={() => window.open(lightboxImages[lightboxIndex]?.url, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
