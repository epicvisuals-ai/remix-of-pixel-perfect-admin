import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestDetailsSheet } from "@/components/admin/RequestDetailsSheet";
import api from "@/lib/api";

interface Request {
  id: string;
  contentType: "image" | "video";
  budget: number;
  status: "Created" | "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
  toneOfVoice?: string;
  deadline?: Date;
  assignedCreator?: AssignedCreator;
}

interface AssignedCreator {
  id: string;
  userId: string;
  name?: string;
  avatar?: string | null;
  specialty?: string | null;
}

interface ApiRequestDetail
  extends Omit<Request, "createdAt" | "deadline" | "contentType" | "assignedCreator"> {
  contentType?: "image" | "video";
  type?: "Image" | "Video" | "image" | "video";
  createdAt?: string;
  deadline?: string | null;
  assignedCreator?: {
    id?: string | null;
    userId?: string | null;
    name?: string | null;
    avatar?: string | null;
    specialty?: string | null;
  } | null;
}

const normalizeStatus = (value?: string): Request["status"] => {
  switch (value?.toLowerCase()) {
    case "submitted":
      return "Submitted";
    case "in progress":
    case "in_progress":
      return "In Progress";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "created":
    default:
      return "Created";
  }
};

const normalizeContentType = (value?: string): Request["contentType"] =>
  value?.toLowerCase() === "video" ? "video" : "image";

const mapRequestDetail = (requestId: string, data?: ApiRequestDetail): Request => {
  const assignedCreator = data?.assignedCreator;
  const mappedAssignedCreator = assignedCreator
    ? {
        id: assignedCreator.id ?? assignedCreator.userId ?? "",
        userId: assignedCreator.userId ?? assignedCreator.id ?? "",
        name: assignedCreator.name ?? undefined,
        avatar: assignedCreator.avatar ?? undefined,
        specialty: assignedCreator.specialty ?? undefined,
      }
    : undefined;

  return {
    id: data?.id ?? requestId,
    contentType: normalizeContentType(data?.contentType ?? data?.type),
    brief: data?.brief ?? "",
    toneOfVoice: data?.toneOfVoice ?? undefined,
    deadline: data?.deadline ? new Date(data.deadline) : undefined,
    status: normalizeStatus(data?.status),
    createdAt: data?.createdAt ? new Date(data.createdAt) : new Date(),
    budget: data?.budget ?? 0,
    assignedCreator: mappedAssignedCreator,
  };
};

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

const MyRequestDetailPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
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
        const response = await api.get(`/requests/${requestId}`, {
          signal: controller.signal,
        });
        const payload = response.data;
        const detail = (payload?.data ?? payload) as ApiRequestDetail | undefined;
        if (isActive) {
          setRequest(mapRequestDetail(requestId, detail));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load request detail", error);
        if (isActive) {
          setRequest(null);
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

  if (!requestId || !request) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Request not found
          </h1>
          <p className="text-muted-foreground">
            We couldn't locate that request. Please return to your request list.
          </p>
        </div>
        <Button onClick={() => navigate("/my-requests")}>Back to My Requests</Button>
      </div>
    );
  }

  return (
    <RequestDetailsSheet
      request={request}
      open
      onOpenChange={(open) => {
        if (!open) {
          navigate("/my-requests");
        }
      }}
    />
  );
};

export default MyRequestDetailPage;
