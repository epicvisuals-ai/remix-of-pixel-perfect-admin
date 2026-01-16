import { Star, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminCreator {
  id: string;
  name: string;
  email: string;
  rating: number;
  available: boolean;
  balance: number;
}

const mockCreators: AdminCreator[] = [
  {
    id: "user-2",
    name: "Maria Santos",
    email: "maria@creative.co",
    rating: 4.9,
    available: true,
    balance: 2500,
  },
  {
    id: "user-3",
    name: "James Wright",
    email: "james@studio.io",
    rating: 4.7,
    available: false,
    balance: 1800,
  },
];

export default function AdminCreatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin · Creators</h1>
        <p className="text-muted-foreground">
          Manage creator accounts and availability
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Rating</TableHead>
              <TableHead className="text-muted-foreground">Available</TableHead>
              <TableHead className="text-muted-foreground">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCreators.map((creator) => (
              <TableRow key={creator.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {creator.id}
                </TableCell>
                <TableCell className="font-medium">{creator.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {creator.email}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{creator.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {creator.available ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="h-4 w-4" />
                      <span>Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <X className="h-4 w-4" />
                      <span>No</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  ${creator.balance}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
