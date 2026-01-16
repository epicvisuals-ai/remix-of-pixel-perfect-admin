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

interface AdminRequest {
  id: string;
  type: "Image" | "Video";
  budget: number;
  status: "Submitted" | "Created" | "In Progress" | "Approved";
  buyer: string;
  creator: string | null;
  createdAt: string;
}

const mockRequests: AdminRequest[] = [
  {
    id: "req-001",
    type: "Image",
    budget: 250,
    status: "Submitted",
    buyer: "user-1",
    creator: "user-2",
    createdAt: "almost 2 years ago",
  },
  {
    id: "req-002",
    type: "Video",
    budget: 500,
    status: "Created",
    buyer: "user-1",
    creator: null,
    createdAt: "almost 2 years ago",
  },
  {
    id: "req-003",
    type: "Image",
    budget: 350,
    status: "In Progress",
    buyer: "user-1",
    creator: "user-3",
    createdAt: "almost 2 years ago",
  },
  {
    id: "req-004",
    type: "Video",
    budget: 400,
    status: "Approved",
    buyer: "user-1",
    creator: "user-2",
    createdAt: "about 2 years ago",
  },
];

const getStatusVariant = (status: AdminRequest["status"]) => {
  switch (status) {
    case "Submitted":
      return "default";
    case "Created":
      return "secondary";
    case "In Progress":
      return "warning";
    case "Approved":
      return "success";
    default:
      return "default";
  }
};

export default function AdminRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin · Requests</h1>
        <p className="text-muted-foreground">
          Manage all requests and assign creators
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Budget</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Buyer</TableHead>
              <TableHead className="text-muted-foreground">Creator</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {request.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {request.type === "Image" ? (
                      <Image className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{request.type}</span>
                  </div>
                </TableCell>
                <TableCell>$ {request.budget}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.buyer}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.creator || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {request.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
