import { useState } from "react";
import {
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  File,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileAttachmentItem } from "./FileAttachment";

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: FileAttachmentItem | null;
  files?: FileAttachmentItem[];
  onNavigate?: (file: FileAttachmentItem) => void;
  onDownload?: (file: FileAttachmentItem) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FilePreviewModal({
  open,
  onOpenChange,
  file,
  files = [],
  onNavigate,
  onDownload,
}: FilePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";
  const isPreviewable = isImage || isVideo || isPdf;

  const currentIndex = files.findIndex((f) => f.id === file.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(files[currentIndex - 1]);
      resetView();
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(files[currentIndex + 1]);
      resetView();
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else if (file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">File Preview: {file.name}</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
                {files.length > 1 && ` • ${currentIndex + 1} of ${files.length}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="h-8 w-8"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="h-8 w-8"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotate}
                  className="h-8 w-8"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-muted/30">
          {/* Navigation arrows */}
          {files.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={!hasPrev}
                className={cn(
                  "absolute left-2 z-10 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background",
                  !hasPrev && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={!hasNext}
                className={cn(
                  "absolute right-2 z-10 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background",
                  !hasNext && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Preview content */}
          <div className="flex items-center justify-center p-8 w-full h-full overflow-auto">
            {isImage && file.url && (
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            )}

            {isVideo && file.url && (
              <video
                src={file.url}
                controls
                className="max-w-full max-h-full"
                autoPlay={false}
              >
                Your browser does not support the video tag.
              </video>
            )}

            {isPdf && file.url && (
              <iframe
                src={file.url}
                className="w-full h-full border-0 rounded-lg bg-white"
                title={file.name}
              />
            )}

            {!isPreviewable && (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted mb-4">
                  {file.type.includes("document") || file.type.includes("text") ? (
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <File className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <p className="font-medium text-lg mb-1">{file.name}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {formatFileSize(file.size)} • {file.type || "Unknown type"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview not available for this file type
                </p>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail strip for multiple files */}
        {files.length > 1 && (
          <div className="border-t p-3 bg-muted/30">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {files.map((f) => {
                const isActive = f.id === file.id;
                const fIsImage = f.type.startsWith("image/");
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      onNavigate?.(f);
                      resetView();
                    }}
                    className={cn(
                      "relative flex-shrink-0 h-14 w-14 rounded-md overflow-hidden border-2 transition-all",
                      isActive
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    {fIsImage && f.url ? (
                      <img
                        src={f.url}
                        alt={f.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
