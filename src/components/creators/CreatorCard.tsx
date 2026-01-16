import { Badge } from "@/components/ui/badge";

interface CreatorCardProps {
  name: string;
  portfolioImage: string;
  specialty: string;
  rating?: number;
}

export function CreatorCard({ name, portfolioImage, specialty, rating }: CreatorCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        <img
          src={portfolioImage}
          alt={`${name}'s portfolio`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-foreground">{name}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-normal">
            {specialty}
          </Badge>
          {rating && (
            <span className="text-xs text-muted-foreground">★ {rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
