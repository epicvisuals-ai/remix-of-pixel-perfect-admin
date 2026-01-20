import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { cn } from "@/lib/utils";

interface FavoriteCreatorCardProps {
  userId: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  onRemove?: () => void;
}

export function FavoriteCreatorCard({ userId, name, avatar, specialty, rating, onRemove }: FavoriteCreatorCardProps) {
  const navigate = useNavigate();
  const { toggleFavorite, isToggling } = useFavorites();
  const [showHeart, setShowHeart] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleRemoveFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(userId);
    onRemove?.();
  };

  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50 cursor-pointer"
      onClick={() => navigate(`/creators/${userId}`)}
      onMouseEnter={() => setShowHeart(true)}
      onMouseLeave={() => setShowHeart(false)}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {showHeart && (
          <button
            onClick={handleRemoveFavorite}
            disabled={isToggling === userId}
            className="absolute -bottom-1 -left-1 flex items-center justify-center rounded-full bg-red-500 p-1 hover:bg-red-600 transition-colors disabled:opacity-50"
            aria-label="Remove from favorites"
          >
            <Heart className={cn("h-3 w-3 fill-white text-white", isToggling === userId && "animate-pulse")} />
          </button>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{name}</h4>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{specialty}</Badge>
          <span className="text-xs text-muted-foreground">★ {rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
