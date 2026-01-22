import { useState, useRef } from "react";
import {
  Upload,
  File,
  Image,
  FileText,
  Video,
  X,
  Download,
  Eye,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface FileAttachmentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url?: string;
  uploading?: boolean;
  progress?: number;
}

interface FileAttachmentProps {
  attachments: FileAttachmentItem[];
  onUpload: (files: File[]) => void;
  onRemove: (id: string) => void;
  onDownload?: (attachment: FileAttachmentItem) => void;
  onPreview?: (attachment: FileAttachmentItem) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  disabled?: boolean;
  compact?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return Video;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function FileAttachment({
  attachments,
  onUpload,
  onRemove,
  onDownload,
  onPreview,
  maxFiles = 10,
  maxSize = 20,
  accept = "*",
  disabled = false,
  compact = false,
}: FileAttachmentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds ${maxSize}MB limit`);
        return false;
      }
      return true;
    });

    const remainingSlots = maxFiles - attachments.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (filesToUpload.length > 0) {
      onUpload(filesToUpload);
    }
  };

  const handleDeleteClick = (fileId: string) => {
    setFileToDelete(fileId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      onRemove(fileToDelete);
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const canUploadMore = attachments.length < maxFiles && !disabled;

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact file list */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 rounded-md border bg-muted/50 px-2 py-1 text-xs"
                >
                  <FileIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="max-w-24 truncate">{file.name}</span>
                  {file.uploading ? (
                    <div className="h-3 w-12">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(file.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Compact upload button */}
        {canUploadMore && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 text-xs"
            >
              <Paperclip className="mr-1 h-3 w-3" />
              Attach Files
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canUploadMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop files here, or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline"
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Max {maxSize}MB per file • {maxFiles - attachments.length} slots remaining
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* File list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file) => {
            const FileIcon = getFileIcon(file.type);
            const isImage = file.type.startsWith("image/");

            return (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                {/* Icon or thumbnail */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {isImage && file.url ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    {!file.uploading && (
                      <>
                        <span>•</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </>
                    )}
                  </div>
                  {file.uploading && (
                    <Progress value={file.progress} className="mt-1 h-1" />
                  )}
                </div>

                {/* Actions */}
                {!file.uploading && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onPreview && (
                        <DropdownMenuItem onClick={() => onPreview(file)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                      )}
                      {onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(file)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(file.id)}
                        className="text-destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
