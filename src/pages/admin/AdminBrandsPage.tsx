import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AdminBrand {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Enterprise";
  requests: number;
  createdAt: string;
}

const mockBrands: AdminBrand[] = [
  {
    id: "brand-1",
    name: "Acme Corp",
    email: "contact@acme.com",
    plan: "Enterprise",
    requests: 45,
    createdAt: "Jan 2024",
  },
  {
    id: "brand-2",
    name: "TechStart Inc",
    email: "hello@techstart.io",
    plan: "Pro",
    requests: 12,
    createdAt: "Mar 2024",
  },
  {
    id: "brand-3",
    name: "Creative Labs",
    email: "info@creativelabs.co",
    plan: "Free",
    requests: 3,
    createdAt: "Dec 2024",
  },
];

const getPlanVariant = (plan: AdminBrand["plan"]) => {
  switch (plan) {
    case "Enterprise":
      return "default";
    case "Pro":
      return "secondary";
    case "Free":
      return "outline";
    default:
      return "default";
  }
};

export default function AdminBrandsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin · Brands</h1>
        <p className="text-muted-foreground">
          Manage brand accounts and subscriptions
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">ID</TableHead>
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Plan</TableHead>
              <TableHead className="text-muted-foreground">Requests</TableHead>
              <TableHead className="text-muted-foreground">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBrands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {brand.id}
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {brand.email}
                </TableCell>
                <TableCell>
                  <Badge variant={getPlanVariant(brand.plan)}>{brand.plan}</Badge>
                </TableCell>
                <TableCell>{brand.requests}</TableCell>
                <TableCell className="text-muted-foreground">
                  {brand.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
