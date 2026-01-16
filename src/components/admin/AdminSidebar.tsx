import {
  Users,
  User,
  CreditCard,
  HelpCircle,
  LogOut,
  ArrowLeft,
  PanelLeft,
  Search,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Users, label: "Team", path: "/settings/team" },
  { icon: User, label: "Profile", path: "/settings/profile" },
  { icon: CreditCard, label: "Billing", path: "/settings/billing" },
];

interface AdminSidebarProps {
  onClose?: () => void;
  onToggleSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
}

export function AdminSidebar({
  onClose,
  onToggleSidebar,
  isDesktopSidebarOpen,
}: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleBack = () => {
    navigate("/");
    onClose?.();
  };

  const handleLogout = () => {
    navigate("/auth");
    onClose?.();
  };

  return (
    <div className="flex min-h-screen flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-base font-semibold text-foreground">Settings</span>
        <div className="ml-auto">
          {onToggleSidebar ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent"
              onClick={onToggleSidebar}
              aria-pressed={isDesktopSidebarOpen}
              aria-label={isDesktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
              <PanelLeft className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Button
                key={item.path}
                variant={isActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "gap-3 rounded-lg",
                  isActive && "bg-sidebar-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto flex items-center gap-3 px-4 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border bg-card hover:bg-accent"
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg"
          >
            <DropdownMenuItem className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors focus:bg-accent focus:text-foreground">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span>Search Help Center</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors focus:bg-accent focus:text-foreground">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span>Contact support</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-9 w-9 rounded-full border border-border bg-card hover:bg-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
