import { Badge } from "@/components/ui/badge";
import { type AppRole, getRoleInfo } from "@/types/roles";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: AppRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const info = getRoleInfo(role);
  
  return (
    <Badge className={cn(info.color, className)}>
      {info.label}
    </Badge>
  );
}
