import { useState, useRef, useCallback, useEffect } from "react";
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
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Upload,
  RotateCcw,
  CheckCheck,
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
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import api, { requestApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  specialty: string;
}

interface CreatorApiItem {
  id: string;
  userId?: string | null;
  specialty?: string | null;
  avatar?: string | null;
  user?: {
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
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
  readAt?: Date;
}

interface Request {
  id: string;
  contentType: "image" | "video";
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

const getContentTypeLabel = (contentType: Request["contentType"]) =>
  contentType === "video" ? "Video" : "Image";

// Mock comments with attachments and read receipts
const mockComments: Comment[] = [
  {
    id: "cm1",
    authorId: "brand1",
    authorName: "You",
    authorRole: "brand",
    content: "Looking forward to seeing the first drafts!",
    createdAt: new Date("2024-01-21T10:30:00"),
    readAt: new Date("2024-01-21T10:35:00"),
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
    readAt: new Date("2024-01-21T14:20:00"),
  },
  {
    id: "cm3",
    authorId: "brand1",
    authorName: "You",
    authorRole: "brand",
    content: "Let's go with the minimalist approach - it aligns better with our current branding.",
    createdAt: new Date("2024-01-21T15:00:00"),
    readAt: new Date("2024-01-21T15:05:00"),
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
  const [availableCreators, setAvailableCreators] = useState<Creator[]>([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [creatorsError, setCreatorsError] = useState<string | null>(null);
  const [assigningCreator, setAssigningCreator] = useState(false);
  const [assignCreatorError, setAssignCreatorError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Attachment[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Zoom and pan state for lightbox
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false);
  const [creatorIsTyping, setCreatorIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  // Reset zoom/pan when changing images or closing lightbox
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [lightboxIndex, lightboxOpen]);

  useEffect(() => {
    if (!open) return;
    let isActive = true;

    const fetchCreators = async () => {
      setCreatorsLoading(true);
      setCreatorsError(null);
      try {
        const response = await api.get("/creators");
        const responseData = response.data?.data ?? response.data?.items ?? response.data ?? [];
        const creatorsList = Array.isArray(responseData)
          ? responseData
          : responseData?.items ?? [];
        const mappedCreators: Creator[] = (creatorsList as CreatorApiItem[]).map((creator) => {
          const firstName = creator.user?.firstName?.trim() ?? "";
          const lastName = creator.user?.lastName?.trim() ?? "";
          const name = `${firstName} ${lastName}`.trim() || "Unknown Creator";
          const userId = creator.userId ?? creator.user?.id ?? creator.id;
          return {
            id: creator.id,
            userId,
            name,
            specialty: creator.specialty ?? "Unknown specialty",
            avatar: creator.avatar ?? undefined,
          };
        });
        if (isActive) {
          setAvailableCreators(mappedCreators);
        }
      } catch (error) {
        console.error("Failed to fetch creators:", error);
        if (isActive) {
          setAvailableCreators([]);
          setCreatorsError("Unable to load creators");
        }
      } finally {
        if (isActive) {
          setCreatorsLoading(false);
        }
      }
    };

    fetchCreators();

    return () => {
      isActive = false;
    };
  }, [open]);

  const handleSubmitForReview = useCallback(async () => {
    if (!request?.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await requestApi.submitRequest(request.id);
      if (response.status === 200) {
        toast({
          title: "Request submitted for review.",
        });
      }
    } catch (error) {
      const response = (error as { response?: { status?: number; data?: { detail?: string } } })
        .response;
      if (response?.status === 400) {
        toast({
          title: response.data?.detail ?? "Unable to submit request.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unable to submit request.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, request?.id, toast]);

  // Simulate creator typing indicator (mock - would be real-time in production)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly show typing indicator for demo
      if (Math.random() > 0.95 && !creatorIsTyping) {
        setCreatorIsTyping(true);
        setTimeout(() => setCreatorIsTyping(false), 3000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [creatorIsTyping]);

  // Handle user typing indicator
  const handleTypingStart = useCallback(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, []);

  // All useCallback hooks MUST be declared before any conditional returns
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
    }
  }, []);

  // Early return AFTER all hooks are declared
  if (!request) return null;

  const currentStatusIndex = getStatusIndex(request.status);

  // Collect all image attachments for lightbox navigation
  const allImageAttachments = comments.flatMap(
    (comment) => comment.attachments?.filter((a) => a.type === "image") || []
  );

  const handleAssignCreator = async () => {
    const creator = availableCreators.find((c) => c.id === selectedCreatorId);
    if (!creator || !request) return;
    setAssigningCreator(true);
    setAssignCreatorError(null);
    try {
      const response = await api.patch(`/requests/${request.id}`, {
        assigned_creator_id: creator.userId,
      });
      const assignedCreatorId = response.data?.data?.assignedCreatorId;
      const nextCreator =
        availableCreators.find(
          (item) => item.id === assignedCreatorId || item.userId === assignedCreatorId
        ) ?? creator;
      setAssignedCreator(nextCreator);
      setSelectedCreatorId("");
    } catch (error) {
      console.error("Failed to assign creator:", error);
      setAssignCreatorError("Unable to assign creator. Please try again.");
    } finally {
      setAssigningCreator(false);
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

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleLightboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") navigateLightbox("prev");
    if (e.key === "ArrowRight") navigateLightbox("next");
    if (e.key === "Escape") setLightboxOpen(false);
    if (e.key === "+" || e.key === "=") handleZoomIn();
    if (e.key === "-") handleZoomOut();
    if (e.key === "0") handleResetZoom();
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
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Select
                    value={selectedCreatorId}
                    onValueChange={setSelectedCreatorId}
                    disabled={creatorsLoading || !!creatorsError || assigningCreator}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={
                          creatorsLoading
                            ? "Loading creators..."
                            : creatorsError
                            ? "Unable to load creators"
                            : "Select a creator..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {creatorsLoading ? (
                        <div className="px-2 py-2 space-y-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ) : creatorsError ? (
                        <div className="px-2 py-2 text-sm text-muted-foreground">
                          {creatorsError}
                        </div>
                      ) : availableCreators.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-muted-foreground">
                          No creators available
                        </div>
                      ) : (
                        availableCreators.map((creator) => (
                          <SelectItem key={creator.id} value={creator.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {creator.avatar ? (
                                  <AvatarImage src={creator.avatar} alt={creator.name} />
                                ) : null}
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
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssignCreator}
                    disabled={
                      !selectedCreatorId || creatorsLoading || !!creatorsError || assigningCreator
                    }
                    size="icon"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                {assignCreatorError ? (
                  <p className="text-xs text-destructive">{assignCreatorError}</p>
                ) : null}
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
                {request.contentType === "video" ? (
                  <Video className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Image className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {getContentTypeLabel(request.contentType)}
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
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {comment.authorName} •{" "}
                              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                            </p>
                            {/* Read receipt for brand messages */}
                            {comment.authorRole === "brand" && comment.readAt && (
                              <span title={`Read ${formatDistanceToNow(comment.readAt, { addSuffix: true })}`}>
                                <CheckCheck className="h-3 w-3 text-blue-500 ml-1" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    {creatorIsTyping && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-muted text-foreground">
                            AM
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 max-w-[80%]">
                          <div className="inline-block p-3 rounded-lg bg-muted">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Alex Morgan is typing...
                          </p>
                        </div>
                      </div>
                    )}
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
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      handleTypingStart();
                    }}
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
                {isTyping && (
                  <p className="text-xs text-muted-foreground mt-1 animate-fade-in">
                    You are typing...
                  </p>
                )}
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
              <Button
                className="flex-1"
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
              >
                Submit for Review
              </Button>
            )}
          </div>
        </div>

        {/* Image Lightbox with Zoom/Pan */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent 
            className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none"
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

                {/* Zoom controls - top left */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 rounded-lg p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <div className="w-24 px-1">
                    <Slider
                      value={[zoomLevel]}
                      min={1}
                      max={4}
                      step={0.1}
                      onValueChange={([value]) => setZoomLevel(value)}
                      className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-white"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 4}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-white/70 min-w-[40px]">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={handleResetZoom}
                    disabled={zoomLevel === 1}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Navigation arrows */}
                {lightboxImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12"
                      onClick={() => navigateLightbox("prev")}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12"
                      onClick={() => navigateLightbox("next")}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}

                {/* Image container with zoom and pan */}
                <div
                  className="overflow-hidden w-full h-full flex items-center justify-center"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: zoomLevel > 1 ? (isPanning ? "grabbing" : "grab") : "default" }}
                >
                  <img
                    ref={imageRef}
                    src={lightboxImages[lightboxIndex]?.url}
                    alt={lightboxImages[lightboxIndex]?.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-100"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                    }}
                    draggable={false}
                  />
                </div>

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

                {/* Zoom hint */}
                {zoomLevel === 1 && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-fade-in">
                    Scroll to zoom • Drag to pan when zoomed
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
