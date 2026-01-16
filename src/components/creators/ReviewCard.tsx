import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReviewCardProps {
  reviewerName: string;
  reviewerAvatar: string;
  reviewerCompany: string;
  rating: number;
  date: string;
  content: string;
  projectType: string;
}

export function ReviewCard({
  reviewerName,
  reviewerAvatar,
  reviewerCompany,
  rating,
  date,
  content,
  projectType,
}: ReviewCardProps) {
  const initials = reviewerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={reviewerAvatar} alt={reviewerName} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{reviewerName}</p>
            <p className="text-sm text-muted-foreground">{reviewerCompany}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-1">{projectType}</span>
        <span>{date}</span>
      </div>
    </div>
  );
}
