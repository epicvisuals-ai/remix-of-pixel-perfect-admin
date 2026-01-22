import { format } from "date-fns";
import type { CreatorRequestItem } from "@/lib/api";

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
  size: string;
  uploadedAt: Date;
  url?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export interface Message {
  id: string;
  author: string;
  authorType: "creator" | "client";
  content: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  company: string;
  type: "Image" | "Video";
  budget: number;
  status: "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
  tone: string;
  deadline: string;
  deliverables: Deliverable[];
  messages: Message[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const mapApiRequestToJob = (request: CreatorRequestItem): Job => {
  const type = (request.contentType.charAt(0).toUpperCase() + request.contentType.slice(1)) as Job["type"];

  const statusMap: Record<string, Job["status"]> = {
    submitted: "Submitted",
    "in progress": "In Progress",
    in_progress: "In Progress",
    approved: "Approved",
    rejected: "Rejected",
  };
  const status = statusMap[request.status.toLowerCase()] || "Submitted";

  const company = `${request.creator.firstName} ${request.creator.lastName}`;

  const tone = request.toneOfVoice.charAt(0).toUpperCase() + request.toneOfVoice.slice(1);

  const deadline = request.deadline ? format(new Date(request.deadline), "MMM d") : "TBD";

  // Flatten all files from all deliverables into a single array
  const deliverables: Deliverable[] = [];
  if (request.deliverables) {
    request.deliverables.forEach((deliverable) => {
      deliverable.files.forEach((file) => {
        deliverables.push({
          id: file.id,
          name: file.fileName,
          fileName: file.fileName,
          size: formatFileSize(file.fileSize),
          fileSize: file.fileSize,
          uploadedAt: new Date(file.createdAt),
          url: file.url,
          type: file.mimeType,
        });
      });
    });
  }

  return {
    id: request.id,
    company,
    type,
    budget: request.budget,
    status,
    createdAt: new Date(request.createdAt),
    brief: request.brief,
    tone,
    deadline,
    deliverables,
    messages: [],
  };
};
