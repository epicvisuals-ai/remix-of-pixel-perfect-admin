import { useState } from "react";
import { Image, Video, DollarSign, Clock, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Job {
  id: string;
  company: string;
  type: "Image" | "Video";
  budget: number;
  status: "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: string;
  brief: string;
  tone: string;
  deadline: string;
}

// Mock data
const mockJobs: Job[] = [
  {
    id: "req-001",
    company: "Acme Inc",
    type: "Image",
    budget: 250,
    status: "Submitted",
    createdAt: "Jan 20, 2024",
    brief: "Need a hero banner for our new SaaS product launch. Modern, clean, with abstract tech elements. Should convey innovation and trust.",
    tone: "Corporate",
    deadline: "Feb 15",
  },
  {
    id: "req-003",
    company: "TechCorp",
    type: "Image",
    budget: 350,
    status: "In Progress",
    createdAt: "Jan 18, 2024",
    brief: "Create a series of social media graphics for our upcoming product launch campaign. Need 5 variations for different platforms.",
    tone: "Professional",
    deadline: "Feb 20",
  },
  {
    id: "req-004",
    company: "StartupXYZ",
    type: "Video",
    budget: 400,
    status: "Approved",
    createdAt: "Jan 15, 2024",
    brief: "30-second promotional video for our mobile app. Should be energetic and appeal to young professionals.",
    tone: "Casual",
    deadline: "Feb 28",
  },
];

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
}

const JobDetailsSheet = ({ job, open, onOpenChange }: JobDetailsSheetProps) => {
  if (!job) return null;

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
          <p className="text-sm text-muted-foreground">Created {job.createdAt}</p>
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

const MyJobsPage = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
        <p className="text-muted-foreground">Jobs assigned to you</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
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
            {mockJobs.map((job) => (
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
                  {job.createdAt}
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
      />
    </div>
  );
};

export default MyJobsPage;
