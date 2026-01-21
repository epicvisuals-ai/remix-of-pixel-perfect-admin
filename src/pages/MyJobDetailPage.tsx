import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobDetailsSheet } from "@/components/creator/JobDetailsSheet";
import { creatorRequestsApi } from "@/lib/api";
import { mapApiRequestToJob, type Job } from "@/lib/creatorRequestMapper";

function RequestDetailSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="flex gap-3" key={`message-skeleton-${index}`}>
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MyJobDetailPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!requestId) {
      setIsLoading(false);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    setIsLoading(true);

    const fetchRequest = async () => {
      try {
        const response = await creatorRequestsApi.getRequest(requestId, controller.signal);
        if (isActive && response.data.success) {
          setJob(mapApiRequestToJob(response.data.data));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load job detail", error);
        if (isActive) {
          setJob(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchRequest();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestId]);

  if (isLoading) {
    return <RequestDetailSkeleton />;
  }

  if (!requestId || !job) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Job not found</h1>
          <p className="text-muted-foreground">
            We couldn't locate that job. Please return to your job list.
          </p>
        </div>
        <Button onClick={() => navigate("/my-jobs")}>Back to My Jobs</Button>
      </div>
    );
  }

  return (
    <JobDetailsSheet
      job={job}
      open
      onOpenChange={(open) => {
        if (!open) {
          navigate("/my-jobs");
        }
      }}
      onStatusChange={(jobId, newStatus) =>
        setJob((prev) => (prev?.id === jobId ? { ...prev, status: newStatus } : prev))
      }
      onAddDeliverable={(jobId, deliverable) =>
        setJob((prev) =>
          prev?.id === jobId
            ? { ...prev, deliverables: [...prev.deliverables, deliverable] }
            : prev
        )
      }
      onRemoveDeliverable={(jobId, deliverableId) =>
        setJob((prev) =>
          prev?.id === jobId
            ? {
                ...prev,
                deliverables: prev.deliverables.filter((deliverable) => deliverable.id !== deliverableId),
              }
            : prev
        )
      }
      onAddMessage={(jobId, message) =>
        setJob((prev) =>
          prev?.id === jobId
            ? { ...prev, messages: [...prev.messages, message] }
            : prev
        )
      }
    />
  );
};

export default MyJobDetailPage;
