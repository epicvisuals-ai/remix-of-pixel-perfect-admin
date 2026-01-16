import { useState } from "react";
import {
  Download,
  Edit,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  CheckCircle2,
  Circle,
  AlertCircle,
  FileText,
  Image,
  Video,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import FileAttachment, { FileAttachmentItem } from "./FileAttachment";

type DeliverableStatus = "pending" | "in_progress" | "in_review" | "approved" | "revision_requested";
type DeliverableType = "image" | "video" | "document";

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

interface DeliverableCardProps {
  deliverable: Deliverable;
  attachments: FileAttachmentItem[];
  onUpload: (deliverableId: string, files: File[]) => void;
  onRemoveAttachment: (deliverableId: string, attachmentId: string) => void;
  onApprove?: (deliverableId: string) => void;
  onRequestRevision?: (deliverableId: string) => void;
  onDownload?: (attachment: FileAttachmentItem) => void;
}

const deliverableStatusConfig: Record<DeliverableStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Circle },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-600", icon: Clock },
  in_review: { label: "In Review", color: "bg-amber-500/10 text-amber-600", icon: Eye },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
  revision_requested: { label: "Revision Requested", color: "bg-red-500/10 text-red-600", icon: AlertCircle },
};

const deliverableTypeIcons: Record<DeliverableType, React.ElementType> = {
  image: Image,
  video: Video,
  document: FileText,
};

function formatDate(date: Date) {
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export default function DeliverableCard({
  deliverable,
  attachments,
  onUpload,
  onRemoveAttachment,
  onApprove,
  onRequestRevision,
  onDownload,
}: DeliverableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const status = deliverableStatusConfig[deliverable.status];
  const StatusIcon = status.icon;
  const TypeIcon = deliverableTypeIcons[deliverable.type];

  const handleUpload = (files: File[]) => {
    onUpload(deliverable.id, files);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    onRemoveAttachment(deliverable.id, attachmentId);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-lg border border-border transition-colors hover:bg-accent/30">
        {/* Main row */}
        <div className="flex items-center gap-4 p-3">
          {/* Thumbnail or Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {deliverable.thumbnail ? (
              <img
                src={deliverable.thumbnail}
                alt={deliverable.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <TypeIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{deliverable.title}</p>
              {deliverable.version > 0 && (
                <span className="text-xs text-muted-foreground">
                  v{deliverable.version}
                </span>
              )}
              {attachments.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5">
                  <Paperclip className="mr-1 h-3 w-3" />
                  {attachments.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Due {formatDate(deliverable.dueDate)}</span>
            </div>
            {deliverable.feedback && (
              <p className="mt-1 text-xs text-red-600 line-clamp-1">
                {deliverable.feedback}
              </p>
            )}
          </div>

          {/* Status */}
          <Badge variant="secondary" className={cn("shrink-0", status.color)}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {deliverable.status === "in_review" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRequestRevision?.(deliverable.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600"
                  onClick={() => onApprove?.(deliverable.id)}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </>
            )}
            {deliverable.thumbnail && (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        {/* Expanded content with attachments */}
        <CollapsibleContent>
          <div className="border-t bg-muted/30 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium mb-1">Attachments & Files</h4>
              <p className="text-xs text-muted-foreground">
                Upload files related to this deliverable
              </p>
            </div>
            <FileAttachment
              attachments={attachments}
              onUpload={handleUpload}
              onRemove={handleRemoveAttachment}
              onDownload={onDownload}
              onPreview={(file) => file.url && window.open(file.url, "_blank")}
              maxFiles={5}
              maxSize={20}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
