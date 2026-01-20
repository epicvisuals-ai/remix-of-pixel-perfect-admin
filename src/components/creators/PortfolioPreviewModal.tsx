import { useEffect } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface PortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
}

interface PortfolioPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentItem: PortfolioItem | null;
  items: PortfolioItem[];
  onNavigate?: (item: PortfolioItem) => void;
}

export default function PortfolioPreviewModal({
  open,
  onOpenChange,
  currentItem,
  items,
  onNavigate,
}: PortfolioPreviewModalProps) {
  if (!currentItem) return null;

  const currentIndex = items.findIndex((item) => item.id === currentItem.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(items[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(items[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handlePrev();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      handleNext();
    }
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, currentIndex]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 gap-0 overflow-hidden bg-background/40 backdrop-blur-xl border-none">
        <DialogTitle className="sr-only">
          Portfolio Preview: {currentItem.title}
        </DialogTitle>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="flex h-full w-full">
          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center p-8 relative">
            {/* Navigation arrows */}
            {items.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className={cn(
                    "absolute top-4 left-1/2 -translate-x-1/2 z-10 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background",
                    !hasPrev && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronUp className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={cn(
                    "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 h-10 w-10 rounded-full bg-background/80 shadow-md hover:bg-background",
                    !hasNext && "opacity-30 cursor-not-allowed"
                  )}
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Centered image */}
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Vertical thumbnail strip on the right */}
          {items.length > 1 && (
            <div className="w-48 h-full bg-background/20 backdrop-blur-sm border-l border-border/50 p-4 overflow-y-auto">
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const isActive = item.id === currentItem.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate?.(item)}
                      className={cn(
                        "relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                        isActive
                          ? "border-primary ring-2 ring-primary/20 h-32 w-full"
                          : "border-transparent hover:border-muted-foreground/30 h-24 w-full opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <p className="text-white text-xs font-medium truncate">
                            {item.title}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
