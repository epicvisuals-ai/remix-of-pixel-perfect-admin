import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Video, Plus, Search, ArrowUpDown, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { RequestDetailsSheet } from "@/components/admin/RequestDetailsSheet";
import { API_BASE_URL } from "@/lib/api";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  toneOfVoice?: string;
  deadline?: Date;
}

interface ApiRequest extends Omit<Request, "createdAt" | "deadline"> {
  createdAt: string;
  deadline?: string;
}

interface RequestsResponseMeta {
  total?: number;
  page?: number;
  pageSize?: number;
}

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
  const [requests, setRequests] = useState<Request[]>([]);
  const [, setMeta] = useState<RequestsResponseMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const params = new URLSearchParams();
    setIsLoading(true);

    if (statusFilter !== "all") {
      params.set("status", statusFilter.toLowerCase());
    }

    const sortMap: Record<SortOption, { sortBy: string; sortOrder: string }> = {
      "date-desc": { sortBy: "createdAt", sortOrder: "desc" },
      "date-asc": { sortBy: "createdAt", sortOrder: "asc" },
      "budget-desc": { sortBy: "budget", sortOrder: "desc" },
      "budget-asc": { sortBy: "budget", sortOrder: "asc" },
    };

    const { sortBy, sortOrder } = sortMap[sortOption];
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/requests?${queryString}`
      : `${API_BASE_URL}/requests`;

    const fetchRequests = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }

        const payload = await response.json();
        const items = Array.isArray(payload?.data)
          ? (payload.data as ApiRequest[])
          : [];
        const mappedRequests = items.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          deadline: item.deadline ? new Date(item.deadline) : undefined,
        }));

        setRequests(mappedRequests);
        setMeta(payload?.meta ?? null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load requests", error);
        setRequests([]);
        setMeta(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchRequests();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [searchQuery, sortOption, statusFilter]);

  const handleRowClick = (request: Request) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`request-skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No requests found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow
                  key={request.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleRowClick(request)}
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

      <RequestDetailsSheet
        request={selectedRequest}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default MyRequestsPage;
