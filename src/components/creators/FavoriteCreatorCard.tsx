import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";

interface FavoriteCreatorCardProps {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
}

export function FavoriteCreatorCard({ id, name, avatar, specialty, rating }: FavoriteCreatorCardProps) {
  const navigate = useNavigate();
  const { toggleFavorite } = useFavorites();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div 
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50 cursor-pointer"
      onClick={() => navigate(`/creators/${id}`)}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{name}</h4>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{specialty}</Badge>
          <span className="text-xs text-muted-foreground">★ {rating.toFixed(1)}</span>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(id);
        }}
      >
        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
      </Button>
    </div>
  );
}
