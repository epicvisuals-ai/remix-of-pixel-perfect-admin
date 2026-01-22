export interface AssignedCreator {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  specialty: string;
}

export interface UploadedBy {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface DeliverableFile {
  id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string | null;
  uploadedBy: UploadedBy;
  createdAt: Date;
}

export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  dueDate?: Date | null;
  status: string;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  revisionFeedback?: string | null;
  approvedBy?: any | null;
  files: DeliverableFile[];
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
  deliverables?: Deliverable[];
}

export interface ApiDeliverableFile {
  id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string | null;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface ApiDeliverable {
  id: string;
  name: string;
  description?: string;
  dueDate?: string | null;
  status: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  revisionFeedback?: string | null;
  approvedBy?: any | null;
  files: ApiDeliverableFile[];
}

export interface ApiRequestDetail
  extends Omit<RequestDetail, "createdAt" | "deadline" | "contentType" | "assignedCreator" | "deliverables"> {
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
  deliverables?: ApiDeliverable[];
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

  const mappedDeliverables = data?.deliverables?.map((deliverable) => ({
    id: deliverable.id,
    name: deliverable.name,
    description: deliverable.description,
    dueDate: deliverable.dueDate ? new Date(deliverable.dueDate) : null,
    status: deliverable.status,
    submittedAt: deliverable.submittedAt ? new Date(deliverable.submittedAt) : null,
    approvedAt: deliverable.approvedAt ? new Date(deliverable.approvedAt) : null,
    revisionFeedback: deliverable.revisionFeedback,
    approvedBy: deliverable.approvedBy,
    files: deliverable.files.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      url: file.url,
      thumbnailUrl: file.thumbnailUrl,
      uploadedBy: {
        id: file.uploadedBy.id,
        firstName: file.uploadedBy.firstName,
        lastName: file.uploadedBy.lastName,
        avatar: file.uploadedBy.avatar,
      },
      createdAt: new Date(file.createdAt),
    })),
  }));

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
    deliverables: mappedDeliverables,
  };
};
