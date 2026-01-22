import { X, FileText, Image as ImageIcon, File } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "file";
  url: string;
  size: number;
  mimeType: string;
  file?: File; // Original file object for upload
}

interface MessageAttachmentProps {
  attachment: Attachment;
  isOwn?: boolean;
}

export function MessageAttachment({ attachment, isOwn }: MessageAttachmentProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (attachment.type === "image") {
    return (
      <div className="mt-2 overflow-hidden rounded-lg">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-48 max-w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(attachment.url, "_blank")}
        />
      </div>
    );
  }

  const Icon = attachment.type === "document" ? FileText : File;

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 ${
        isOwn ? "border-primary-foreground/20" : "border-border"
      }`}
    >
      <div className={`rounded-lg p-2 ${isOwn ? "bg-primary-foreground/20" : "bg-muted"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{attachment.name}</p>
        <p className={`text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {formatFileSize(attachment.size)}
        </p>
      </div>
    </a>
  );
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-border">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group"
        >
          {attachment.type === "image" ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-16 items-center gap-2 rounded-lg border border-border bg-muted px-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="max-w-[100px] truncate text-xs">{attachment.name}</span>
            </div>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(attachment.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
