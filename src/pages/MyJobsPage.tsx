import { useState, useRef } from "react";
import { Image, Video, DollarSign, Clock, FileText, Upload, Check, X, File, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface Deliverable {
  id: string;
  name: string;
  size: string;
  uploadedAt: Date;
}

interface Job {
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
}

// Mock data
const mockJobs: Job[] = [
  {
    id: "req-001",
    company: "Acme Inc",
    type: "Image",
    budget: 250,
    status: "Submitted",
    createdAt: new Date("2024-01-20"),
    brief: "Need a hero banner for our new SaaS product launch. Modern, clean, with abstract tech elements. Should convey innovation and trust.",
    tone: "Corporate",
    deadline: "Feb 15",
    deliverables: [],
  },
  {
    id: "req-003",
    company: "TechCorp",
    type: "Image",
    budget: 350,
    status: "In Progress",
    createdAt: new Date("2024-01-18"),
    brief: "Create a series of social media graphics for our upcoming product launch campaign. Need 5 variations for different platforms.",
    tone: "Professional",
    deadline: "Feb 20",
    deliverables: [],
  },
  {
    id: "req-004",
    company: "StartupXYZ",
    type: "Video",
    budget: 400,
    status: "Approved",
    createdAt: new Date("2024-01-15"),
    brief: "30-second promotional video for our mobile app. Should be energetic and appeal to young professionals.",
    tone: "Casual",
    deadline: "Feb 28",
    deliverables: [
      { id: "del-1", name: "promo-video-final.mp4", size: "24.5 MB", uploadedAt: new Date("2024-02-10") },
    ],
  },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getStatusBadgeVariant = (status: Job["status"]) => {
  switch (status) {
    case "Submitted":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "In Progress":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "Approved":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "Rejected":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "";
  }
};

const TypeIcon = ({ type }: { type: Job["type"] }) => {
  if (type === "Video") {
    return <Video className="h-4 w-4 text-muted-foreground" />;
  }
  return <Image className="h-4 w-4 text-muted-foreground" />;
};

interface JobDetailsSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (jobId: string, newStatus: Job["status"]) => void;
  onAddDeliverable: (jobId: string, deliverable: Deliverable) => void;
  onRemoveDeliverable: (jobId: string, deliverableId: string) => void;
}

const JobDetailsSheet = ({ 
  job, 
  open, 
  onOpenChange, 
  onStatusChange,
  onAddDeliverable,
  onRemoveDeliverable,
}: JobDetailsSheetProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!job) return null;

  const handleAccept = () => {
    onStatusChange(job.id, "In Progress");
    toast.success("Job accepted! Status changed to In Progress.");
  };

  const handleDecline = () => {
    onStatusChange(job.id, "Rejected");
    toast.info("Job declined.");
    onOpenChange(false);
  };

  const handleSubmitDeliverable = () => {
    if (job.deliverables.length === 0) {
      toast.error("Please upload at least one file before submitting.");
      return;
    }
    toast.success("Deliverable submitted for review!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const newDeliverable: Deliverable = {
        id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: new Date(),
      };
      onAddDeliverable(job.id, newDeliverable);
      toast.success(`Uploaded: ${file.name}`);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (deliverableId: string) => {
    onRemoveDeliverable(job.id, deliverableId);
    toast.info("File removed.");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">Job {job.id}</SheetTitle>
            <Badge
              variant="secondary"
              className={getStatusBadgeVariant(job.status)}
            >
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {format(job.createdAt, "MMM d, yyyy")}
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Brief Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {job.brief}
              </p>
            </CardContent>
          </Card>

          {/* Job Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TypeIcon type={job.type} />
                  <span>Type</span>
                </div>
                <span className="text-sm font-medium">{job.type}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </div>
                <span className="text-sm font-medium">${job.budget}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tone</span>
                <span className="text-sm font-medium">{job.tone}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Deadline</span>
                </div>
                <span className="text-sm font-medium">{job.deadline}</span>
              </div>
            </CardContent>
          </Card>

          {/* Deliverables Upload Card - Show for In Progress and Approved */}
          {(job.status === "In Progress" || job.status === "Approved") && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area - Only show for In Progress */}
                {job.status === "In Progress" && (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*,.pdf,.zip,.psd,.ai,.fig"
                    />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      Click to upload files
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Images, videos, PDFs, or design files
                    </p>
                  </div>
                )}

                {/* Uploaded Files List */}
                {job.deliverables.length > 0 && (
                  <div className="space-y-2">
                    {job.deliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {deliverable.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {deliverable.size} • {format(deliverable.uploadedAt, "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        {job.status === "In Progress" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => handleRemoveFile(deliverable.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {job.deliverables.length === 0 && job.status === "Approved" && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No deliverables uploaded
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {job.status === "Submitted" && (
              <div className="flex gap-3">
                <Button onClick={handleAccept} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Accept Job
                </Button>
                <Button variant="outline" onClick={handleDecline} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            )}

            {job.status === "In Progress" && (
              <Button onClick={handleSubmitDeliverable} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Submit Deliverable
              </Button>
            )}

            {job.status === "Approved" && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-center">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  ✓ This job has been completed
                </p>
              </div>
            )}

            {job.status === "Rejected" && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-center">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  This job was declined
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const MyJobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleStatusChange = (jobId: string, newStatus: Job["status"]) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    setSelectedJob((prev) =>
      prev?.id === jobId ? { ...prev, status: newStatus } : prev
    );
  };

  const handleAddDeliverable = (jobId: string, deliverable: Deliverable) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, deliverables: [...job.deliverables, deliverable] }
          : job
      )
    );
    setSelectedJob((prev) =>
      prev?.id === jobId
        ? { ...prev, deliverables: [...prev.deliverables, deliverable] }
        : prev
    );
  };

  const handleRemoveDeliverable = (jobId: string, deliverableId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, deliverables: job.deliverables.filter((d) => d.id !== deliverableId) }
          : job
      )
    );
    setSelectedJob((prev) =>
      prev?.id === jobId
        ? { ...prev, deliverables: prev.deliverables.filter((d) => d.id !== deliverableId) }
        : prev
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
        <p className="text-muted-foreground">Jobs assigned to you</p>
      </div>

      <div className="rounded-xl border border-border bg-card animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Budget</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <TableCell className="font-medium text-foreground">
                  {job.id}
                </TableCell>
                <TableCell className="text-foreground">{job.company}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TypeIcon type={job.type} />
                    <span className="text-foreground">{job.type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  <span className="text-muted-foreground">$</span> {job.budget}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusBadgeVariant(job.status)}
                  >
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(job.createdAt, "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <JobDetailsSheet
        job={selectedJob}
        open={selectedJob !== null}
        onOpenChange={(open) => !open && setSelectedJob(null)}
        onStatusChange={handleStatusChange}
        onAddDeliverable={handleAddDeliverable}
        onRemoveDeliverable={handleRemoveDeliverable}
      />
    </div>
  );
};

export default MyJobsPage;
