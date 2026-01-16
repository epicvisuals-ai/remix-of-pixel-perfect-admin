import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  creatorId: string;
  variant?: "icon" | "overlay";
  className?: string;
}

export function FavoriteButton({ creatorId, variant = "icon", className }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(creatorId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(creatorId);
  };

  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background",
          className
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            favorited ? "fill-red-500 text-red-500" : "text-foreground"
          )}
        />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          favorited ? "fill-red-500 text-red-500" : ""
        )}
      />
      {favorited ? "Saved" : "Save"}
    </Button>
  );
}
