import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  CheckCircle,
  RotateCw,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import api, { requestApi, deliverablesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PortfolioPreviewModal, {
  PortfolioItem,
} from "@/components/creators/PortfolioPreviewModal";

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
  file?: File; // Store original File object for uploading
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

interface DeliverableFile {
  id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string | null;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: Date;
}

interface Deliverable {
  id: string;
  name: string;
  description?: string;
  dueDate?: Date | null;
  status: string;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  approvedBy?: any | null;
  files: DeliverableFile[];
}

interface Request {
  id: string;
  contentType: "image" | "video";
  budget: number;
  status: "Created" | "Submitted" | "In Review" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
  toneOfVoice?: string;
  deadline?: Date;
  assignedCreator?: Creator;
  comments?: Comment[];
  deliverables?: Deliverable[];
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
    case "In Review":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
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
  const normalizedStatus = status === "In Review" ? "In Progress" : status;
  return statusTimeline.findIndex((s) => s.status === normalizedStatus);
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDateInputValue = (value?: Date) =>
  value ? format(value, "yyyy-MM-dd") : "";

const normalizeRequestStatus = (status: Request["status"]) =>
  status.toLowerCase().replace(/\s+/g, "_");

const isEditableRequestStatus = (status: Request["status"]) => {
  const normalized = normalizeRequestStatus(status);
  return ["created", "submitter", "submitted", "in_review", "rejected", "in_progress"].includes(
    normalized
  );
};

const isFullEditStatus = (status: Request["status"]) => {
  const normalized = normalizeRequestStatus(status);
  return ["created", "submitter", "submitted", "in_review", "rejected"].includes(normalized);
};

const canDeleteRequestStatus = (status: Request["status"]) => {
  const normalized = normalizeRequestStatus(status);
  return ["created", "submitted"].includes(normalized);
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
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<Attachment[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [isSavingRequest, setIsSavingRequest] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<Request["status"]>("Created");
  const [portfolioPreviewOpen, setPortfolioPreviewOpen] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(
    null
  );
  const [requestDetails, setRequestDetails] = useState<{
    brief: string;
    budget: number;
    deadline?: Date;
  }>({ brief: "", budget: 0, deadline: undefined });
  const [editBrief, setEditBrief] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  
  // Zoom and pan state for lightbox
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Typing indicator state
  const [isTyping, setIsTyping] = useState(false);
  const [creatorIsTyping, setCreatorIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Deliverable approval/revision state
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionDeliverableId, setRevisionDeliverableId] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [isApprovingDeliverable, setIsApprovingDeliverable] = useState<string | null>(null);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

  // Request approval state
  const [isApprovingRequest, setIsApprovingRequest] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const portfolioItems = useMemo<PortfolioItem[]>(() => {
    if (deliverables.length === 0) return [];
    return deliverables.flatMap((deliverable) =>
      deliverable.files
        .filter(
          (file) => file.fileType === "image" || file.mimeType?.startsWith("image/")
        )
        .map((file) => ({
          id: file.id,
          title: file.fileName,
          imageUrl: file.url,
        }))
    );
  }, [deliverables]);

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

  useEffect(() => {
    if (!request) return;
    setRequestDetails({
      brief: request.brief,
      budget: request.budget,
      deadline: request.deadline,
    });
    setRequestStatus(request.status);
    setEditBrief(request.brief);
    setEditBudget(String(request.budget));
    setEditDeadline(formatDateInputValue(request.deadline));
    setIsEditingRequest(false);
    setDeliverables(request.deliverables ?? []);
  }, [request]);

  // Deliverable approval handler
  const handleApproveDeliverable = useCallback(async (deliverableId: string) => {
    setIsApprovingDeliverable(deliverableId);
    try {
      const response = await deliverablesApi.approveDeliverable(deliverableId);
      if (response.data?.success) {
        setDeliverables((prev) =>
          prev.map((d) =>
            d.id === deliverableId
              ? { ...d, status: "approved", approvedAt: new Date() }
              : d
          )
        );
        toast({ title: "Deliverable approved successfully." });
      }
    } catch (error) {
      console.error("Failed to approve deliverable:", error);
      toast({
        title: "Failed to approve deliverable.",
        variant: "destructive",
      });
    } finally {
      setIsApprovingDeliverable(null);
    }
  }, [toast]);

  // Request revision handler
  const handleRequestRevision = useCallback(async () => {
    if (!revisionDeliverableId || !revisionFeedback.trim()) return;
    setIsRequestingRevision(true);
    try {
      const response = await deliverablesApi.requestRevision(
        revisionDeliverableId,
        revisionFeedback.trim()
      );
      if (response.data?.success) {
        setDeliverables((prev) =>
          prev.map((d) =>
            d.id === revisionDeliverableId
              ? { ...d, status: "revision_requested" }
              : d
          )
        );
        toast({ title: "Revision requested successfully." });
        setRevisionDialogOpen(false);
        setRevisionDeliverableId(null);
        setRevisionFeedback("");
      }
    } catch (error) {
      console.error("Failed to request revision:", error);
      toast({
        title: "Failed to request revision.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingRevision(false);
    }
  }, [revisionDeliverableId, revisionFeedback, toast]);

  // Approve request handler
  const handleApproveRequest = useCallback(async () => {
    if (!request?.id || isApprovingRequest) return;
    setIsApprovingRequest(true);
    try {
      const response = await requestApi.approveRequest(request.id);
      if (response.data?.success) {
        setRequestStatus("Approved");
        toast({
          title: "Request approved successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to approve request:", error);
      toast({
        title: "Failed to approve request.",
        variant: "destructive",
      });
    } finally {
      setIsApprovingRequest(false);
    }
  }, [request?.id, isApprovingRequest, toast]);

  const openRevisionDialog = (deliverableId: string) => {
    setRevisionDeliverableId(deliverableId);
    setRevisionFeedback("");
    setRevisionDialogOpen(true);
  };

  const getDeliverableStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "submitted":
      case "in_review":
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "revision_requested":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            <RotateCw className="h-3 w-3 mr-1" />
            Revision Requested
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canReviewDeliverable = (status: string) => {
    const normalized = status.toLowerCase();
    return ["submitted", "in_review"].includes(normalized);
  };

  useEffect(() => {
    if (!open) return;
    const assignedCreatorId = request?.assignedCreator?.id;
    const assignedCreatorUserId = request?.assignedCreator?.userId;
    if ((!assignedCreatorId && !assignedCreatorUserId) || availableCreators.length === 0) {
      return;
    }

    const matchedCreator = availableCreators.find((creator) =>
      [assignedCreatorId, assignedCreatorUserId].includes(creator.id) ||
      [assignedCreatorId, assignedCreatorUserId].includes(creator.userId)
    );

    if (matchedCreator) {
      setAssignedCreator(matchedCreator);
      setSelectedCreatorId(matchedCreator.id);
    }
  }, [availableCreators, open, request?.assignedCreator]);

  const handleSubmitForReview = useCallback(async () => {
    if (!request?.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await requestApi.submitRequest(request.id);
      if (response.status === 200) {
        setRequestStatus("Submitted");
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

  const handleEditRequest = () => {
    setEditBrief(requestDetails.brief);
    setEditBudget(String(requestDetails.budget));
    setEditDeadline(formatDateInputValue(requestDetails.deadline));
    setIsEditingRequest(true);
  };

  const handleSaveRequest = async () => {
    if (!request?.id || isSavingRequest) return;

    const updates: { brief?: string; budget?: number; deadline?: string | null } = {};
    const allowBriefBudgetEdits = isFullEditStatus(requestStatus);
    if (allowBriefBudgetEdits) {
      const trimmedBrief = editBrief.trim();
      if (trimmedBrief !== requestDetails.brief) {
        updates.brief = trimmedBrief;
      }

      const budgetValue = editBudget.trim();
      if (!budgetValue) {
        toast({
          title: "Budget is required.",
          variant: "destructive",
        });
        return;
      }
      const parsedBudget = Number(budgetValue);
      if (Number.isNaN(parsedBudget)) {
        toast({
          title: "Budget must be a number.",
          variant: "destructive",
        });
        return;
      }
      if (parsedBudget !== requestDetails.budget) {
        updates.budget = parsedBudget;
      }
    }

    const originalDeadline = formatDateInputValue(requestDetails.deadline);
    if (editDeadline !== originalDeadline) {
      updates.deadline = editDeadline ? editDeadline : null;
    }

    if (Object.keys(updates).length === 0) {
      setIsEditingRequest(false);
      return;
    }

    setIsSavingRequest(true);
    try {
      const response = await api.patch(`/requests/${request.id}`, updates);
      const data = response.data?.data;
      const nextBrief = data?.brief ?? (updates.brief ?? requestDetails.brief);
      const nextBudget = data?.budget ?? (updates.budget ?? requestDetails.budget);
      const nextDeadlineValue = data?.deadline ?? updates.deadline;
      setRequestDetails({
        brief: nextBrief,
        budget: nextBudget,
        deadline: nextDeadlineValue ? new Date(nextDeadlineValue) : undefined,
      });
      setEditBrief(nextBrief);
      setEditBudget(String(nextBudget));
      setEditDeadline(nextDeadlineValue ? formatDateInputValue(new Date(nextDeadlineValue)) : "");
      toast({
        title: "Request updated.",
      });
      setIsEditingRequest(false);
    } catch (error) {
      console.error("Failed to update request:", error);
      toast({
        title: "Unable to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSavingRequest(false);
    }
  };

  const handleDeleteRequest = useCallback(async () => {
    if (!request?.id || isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await requestApi.deleteRequest(request.id);
      if (response.status === 200) {
        const message = response.data?.message ?? response.data?.data?.message ?? "Request deleted.";
        toast({
          title: message,
        });
        setIsDeleteDialogOpen(false);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to delete request:", error);
      const response = (error as { response?: { data?: { message?: string } } }).response;
      toast({
        title: response?.data?.message ?? "Unable to delete request.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, onOpenChange, request?.id, toast]);

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
          file: file, // Store original File object
        };
      });
      setPendingAttachments((prev) => [...prev, ...newAttachments]);
    }
  }, []);

  // Early return AFTER all hooks are declared
  if (!request) return null;

  const normalizedStatus = normalizeRequestStatus(requestStatus);
  const canEditAllFields = isFullEditStatus(requestStatus);
  const canEditDeadlineOnly = normalizedStatus === "in_progress";
  const canEditAssignedCreator = requestStatus !== "Approved";
  const currentStatusIndex = getStatusIndex(requestStatus);
  const displayStatus = requestStatus === "In Review" ? "In Progress" : requestStatus;
  const normalizedRole = user?.role?.toLowerCase() ?? "";
  const isBrandAdmin = normalizedRole === "brand" || normalizedRole === "admin";
  const needsBrandReview = isBrandAdmin && normalizedStatus === "in_review";

  // Check if there are any submitted deliverables that need review
  const hasSubmittedDeliverables = deliverables.some(d => {
    const normalized = d.status.toLowerCase();
    return ["submitted", "in_review"].includes(normalized);
  });

  // Show approve/reject buttons only if needsBrandReview AND there are NO submitted deliverables
  const shouldShowApproveRejectButtons = needsBrandReview && !hasSubmittedDeliverables;

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
        file: file, // Store original File object
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

  const handleSendComment = async () => {
    if (!newComment.trim() && pendingAttachments.length === 0) return;
    if (!request?.id || isSendingMessage) return;

    setIsSendingMessage(true);

    try {
      // Extract File objects from attachments
      const files = pendingAttachments
        .map(att => att.file)
        .filter((file): file is File => file !== undefined);

      // Call the API endpoint
      const response = await requestApi.sendMessage(
        request.id,
        newComment.trim() || null,
        files.length > 0 ? files : null
      );

      // Create comment from API response
      const newCommentObj: Comment = {
        id: response.data.id,
        authorId: response.data.sender.id,
        authorName: `${response.data.sender.firstName} ${response.data.sender.lastName}`,
        authorAvatar: response.data.sender.avatar || undefined,
        authorRole: "brand",
        content: response.data.content,
        createdAt: new Date(response.data.sentAt),
        attachments: response.data.attachments.map(att => ({
          id: att.id,
          name: att.fileName,
          type: att.mimeType.startsWith("image/") ? "image" : "document",
          url: att.url,
          size: formatFileSize(att.fileSize),
        })),
      };

      setComments([...comments, newCommentObj]);
      setNewComment("");
      setPendingAttachments([]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Please try again.",
      });
    } finally {
      setIsSendingMessage(false);
    }
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
            <div className="flex flex-col items-end gap-2">
              {needsBrandReview && (
                <Badge
                  variant="outline"
                  className="border-amber-200 bg-amber-500/10 text-amber-700"
                >
                  Need Review
                </Badge>
              )}
              {!needsBrandReview && (
                <Badge
                  variant="secondary"
                  className={getStatusBadgeVariant(displayStatus)}
                >
                  {displayStatus}
                </Badge>
              )}
            </div>
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
                  const isRejected = requestStatus === "Rejected";

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
                  disabled={!canEditAssignedCreator}
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
                    disabled={
                      creatorsLoading || !!creatorsError || assigningCreator || !canEditAssignedCreator
                    }
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
                      !selectedCreatorId ||
                      creatorsLoading ||
                      !!creatorsError ||
                      assigningCreator ||
                      !canEditAssignedCreator
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
                  {isEditingRequest && canEditAllFields ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editBudget}
                      onChange={(event) => setEditBudget(event.target.value)}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      ${requestDetails.budget}
                    </p>
                  )}
                </div>
              </div>

              {(requestDetails.deadline || isEditingRequest) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 col-span-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    {isEditingRequest && (canEditAllFields || canEditDeadlineOnly) ? (
                      <Input
                        type="date"
                        value={editDeadline}
                        onChange={(event) => setEditDeadline(event.target.value)}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground">
                        {requestDetails.deadline
                          ? format(requestDetails.deadline, "MMM d, yyyy")
                          : "Not set"}
                      </p>
                    )}
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
              {isEditingRequest && canEditAllFields ? (
                <Textarea
                  value={editBrief}
                  onChange={(event) => setEditBrief(event.target.value)}
                  className="min-h-[120px] text-sm"
                />
              ) : (
                <p className="text-sm text-foreground leading-relaxed">
                  {requestDetails.brief}
                </p>
              )}
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

          {/* Deliverables Section */}
          {deliverables.length > 0 && deliverables.some(d => d.files.length > 0) && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">
                    Deliverables
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Review submitted files and approve or request revisions.
                </p>

                <div className="space-y-4">
                  {deliverables.filter(d => d.files.length > 0).map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      {/* Deliverable Header */}
                      <div className="flex items-center justify-between p-3 bg-muted/30 border-b border-border">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">
                            {deliverable.name}
                          </span>
                          {getDeliverableStatusBadge(deliverable.status)}
                        </div>
                        {deliverable.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {format(deliverable.dueDate, "MMM d, yyyy")}
                          </span>
                        )}
                      </div>

                      {/* Deliverable Description */}
                      {deliverable.description && (
                        <div className="px-3 py-2 border-b border-border bg-muted/10">
                          <p className="text-sm text-muted-foreground">
                            {deliverable.description}
                          </p>
                        </div>
                      )}

                      {/* Files */}
                      <div className="p-3 space-y-2">
                        {deliverable.files.map((file) => {
                          const isImage =
                            file.fileType === "image" || file.mimeType?.startsWith("image/");
                          const FileIcon = isImage ? Image : FileText;
                          const portfolioItem = isImage
                            ? portfolioItems.find((item) => item.id === file.id) ?? null
                            : null;
                          const handlePreview = () => {
                            if (!portfolioItem) return;
                            setSelectedPortfolioItem(portfolioItem);
                            setPortfolioPreviewOpen(true);
                          };

                          return (
                            <div
                              key={file.id}
                              role={portfolioItem ? "button" : undefined}
                              tabIndex={portfolioItem ? 0 : -1}
                              onClick={portfolioItem ? handlePreview : undefined}
                              onKeyDown={
                                portfolioItem
                                  ? (event) => {
                                      if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        handlePreview();
                                      }
                                    }
                                  : undefined
                              }
                              className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/60 ${
                                portfolioItem ? "cursor-pointer hover:bg-muted" : ""
                              }`}
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
                                {isImage && file.url ? (
                                  <img
                                    src={file.url}
                                    alt={file.fileName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {file.fileName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.fileSize)} • {format(file.createdAt, "MMM d, yyyy")}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  window.open(file.url, "_blank");
                                }}
                              >
                                <Download className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Buttons for submitted deliverables */}
                      {canReviewDeliverable(deliverable.status) && (
                        <div className="flex gap-2 p-3 border-t border-border bg-muted/10">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleApproveDeliverable(deliverable.id)}
                            disabled={isApprovingDeliverable === deliverable.id}
                          >
                            {isApprovingDeliverable === deliverable.id ? (
                              <>
                                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => openRevisionDialog(deliverable.id)}
                          >
                            <RotateCw className="h-4 w-4 mr-2" />
                            Request Revision
                          </Button>
                        </div>
                      )}

                      {/* Approved info */}
                      {deliverable.status.toLowerCase() === "approved" && deliverable.approvedAt && (
                        <div className="flex items-center gap-2 p-3 border-t border-border bg-green-50 dark:bg-green-950/20">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 dark:text-green-400">
                            Approved {formatDistanceToNow(deliverable.approvedAt, { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                    disabled={(!newComment.trim() && pendingAttachments.length === 0) || isSendingMessage}
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
            {isEditingRequest ? (
              <Button
                className="flex-1"
                onClick={handleSaveRequest}
                disabled={isSavingRequest}
              >
                Save Changes
              </Button>
            ) : (
              <>
                {shouldShowApproveRejectButtons && (
                  <>
                    <Button
                      className="flex-1"
                      onClick={handleApproveRequest}
                      disabled={isApprovingRequest}
                    >
                      {isApprovingRequest ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        toast({ title: "Not yet implemented" });
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {isEditableRequestStatus(requestStatus) && !shouldShowApproveRejectButtons && (
                  <Button variant="outline" className="flex-1" onClick={handleEditRequest}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Request
                  </Button>
                )}
                {canDeleteRequestStatus(requestStatus) && (
                  <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      Delete
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteRequest}
                          disabled={isDeleting}
                        >
                          Yes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {requestStatus === "Created" && (
                  <Button
                    className="flex-1"
                    onClick={handleSubmitForReview}
                    disabled={isSubmitting}
                  >
                    Submit for Review
                  </Button>
                )}
              </>
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

        {/* Revision Request Dialog */}
        <AlertDialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Request Revision</AlertDialogTitle>
              <AlertDialogDescription>
                Provide feedback for the creator about what changes are needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Describe the changes you'd like to see..."
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRequestRevision}
                disabled={!revisionFeedback.trim() || isRequestingRevision}
              >
                {isRequestingRevision ? "Submitting..." : "Request Revision"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <PortfolioPreviewModal
          open={portfolioPreviewOpen}
          onOpenChange={setPortfolioPreviewOpen}
          currentItem={selectedPortfolioItem}
          items={portfolioItems}
          onNavigate={setSelectedPortfolioItem}
        />
      </SheetContent>
    </Sheet>
  );
}
