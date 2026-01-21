export interface AssignedCreator {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  specialty: string;
}

export interface RequestDetail {
  id: string;
  contentType: "image" | "video";
  budget: number;
  status: "Created" | "Submitted" | "In Review" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
  toneOfVoice?: string;
  deadline?: Date;
  assignedCreator?: AssignedCreator;
}

export interface ApiRequestDetail
  extends Omit<RequestDetail, "createdAt" | "deadline" | "contentType" | "assignedCreator"> {
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

export const normalizeStatus = (value?: string): RequestDetail["status"] => {
  switch (value?.toLowerCase()) {
    case "submitted":
      return "Submitted";
    case "in review":
    case "in_review":
      return "In Review";
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

export const normalizeContentType = (value?: string): RequestDetail["contentType"] =>
  value?.toLowerCase() === "video" ? "video" : "image";

export const mapRequestDetail = (requestId: string, data?: ApiRequestDetail): RequestDetail => {
  const assignedCreator = data?.assignedCreator;
  const mappedAssignedCreator = assignedCreator
    ? {
        id: assignedCreator.id ?? assignedCreator.userId ?? "",
        userId: assignedCreator.userId ?? assignedCreator.id ?? "",
        name: assignedCreator.name ?? "Unknown Creator",
        avatar: assignedCreator.avatar ?? undefined,
        specialty: assignedCreator.specialty ?? "Content Creator",
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
