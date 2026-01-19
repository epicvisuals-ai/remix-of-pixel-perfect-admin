import { Skeleton } from "@/components/ui/skeleton";

export function MemberListSkeleton() {
  return (
    <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* Members Card */}
      <div className="admin-card">
        {/* Member Count Header */}
        <div className="admin-card-section flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-8" />
        </div>

        {/* Member Items - Show 3 skeleton members */}
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="admin-card-section flex items-center gap-3"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
