import { Skeleton } from "@/components/ui/skeleton";

export function TeamCardSkeleton() {
  return (
    <div className="admin-card animate-fade-in">
      {/* Team Header */}
      <div className="admin-card-section flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Team Name Edit */}
      <div className="admin-card-section flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-9 w-[200px] rounded-lg" />
      </div>
    </div>
  );
}
