import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Plus, Search, ArrowUpDown, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Request {
  id: string;
  type: "Image" | "Video";
  budget: number;
  status: "Created" | "Submitted" | "In Progress" | "Approved" | "Rejected";
  createdAt: Date;
  brief: string;
}

// Mock data
const mockRequests: Request[] = [
  {
    id: "req-001",
    type: "Image",
    budget: 250,
    status: "Submitted",
    createdAt: new Date("2024-01-20"),
    brief: "Need a hero banner for our new SaaS product launch.",
  },
  {
    id: "req-002",
    type: "Video",
    budget: 500,
    status: "Created",
    createdAt: new Date("2024-01-19"),
    brief: "Promotional video for social media campaign.",
  },
  {
    id: "req-003",
    type: "Image",
    budget: 350,
    status: "In Progress",
    createdAt: new Date("2024-01-18"),
    brief: "Create a series of social media graphics.",
  },
  {
    id: "req-004",
    type: "Video",
    budget: 400,
    status: "Approved",
    createdAt: new Date("2024-01-15"),
    brief: "30-second promotional video for our mobile app.",
  },
];

const getStatusBadgeVariant = (status: Request["status"]) => {
  switch (status) {
    case "Created":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
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

const TypeIcon = ({ type }: { type: Request["type"] }) => {
  if (type === "Video") {
    return <Video className="h-4 w-4 text-muted-foreground" />;
  }
  return <Image className="h-4 w-4 text-muted-foreground" />;
};

type SortOption = "date-desc" | "date-asc" | "budget-desc" | "budget-asc";
type StatusFilter = "all" | Request["status"];

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const [requests] = useState<Request[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((req) => req.id.toLowerCase().includes(query));
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((req) => req.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "date-asc":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "budget-desc":
          return b.budget - a.budget;
        case "budget-asc":
          return a.budget - b.budget;
        default:
          return 0;
      }
    });

    return result;
  }, [requests, searchQuery, statusFilter, sortOption]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
          <p className="text-muted-foreground">
            Track and manage your creative requests
          </p>
        </div>
        <Button onClick={() => navigate("/create-request")}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Created">Created</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="budget-desc">Highest Budget</SelectItem>
              <SelectItem value="budget-asc">Lowest Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Budget</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No requests found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  <TableCell className="font-medium text-foreground">
                    {request.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon type={request.type} />
                      <span className="text-foreground">{request.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <span className="text-muted-foreground">$</span>{" "}
                    {request.budget}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusBadgeVariant(request.status)}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyRequestsPage;
