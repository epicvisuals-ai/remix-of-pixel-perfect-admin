import { Image, Video } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  company: string;
  type: "Image" | "Video";
  budget: number;
  status: "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: string;
}

// Mock data
const mockJobs: Job[] = [
  {
    id: "req-001",
    company: "Acme Inc",
    type: "Image",
    budget: 250,
    status: "Submitted",
    createdAt: "almost 2 years ago",
  },
  {
    id: "req-003",
    company: "TechCorp",
    type: "Image",
    budget: 350,
    status: "In Progress",
    createdAt: "almost 2 years ago",
  },
  {
    id: "req-004",
    company: "StartupXYZ",
    type: "Video",
    budget: 400,
    status: "Approved",
    createdAt: "about 2 years ago",
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

const MyJobsPage = () => {
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
              <TableRow key={job.id} className="hover:bg-muted/50">
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
    </div>
  );
};

export default MyJobsPage;
