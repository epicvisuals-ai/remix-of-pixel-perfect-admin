import { useState } from "react";
import {
  LayoutDashboard,
  Settings,
  Users,
  User,
  CreditCard,
  HelpCircle,
  LogOut,
  PanelLeft,
  Search,
  MessageCircle,
  ChevronDown,
  Briefcase,
  FileText,
  Plus,
  Bell,
  FolderKanban,
  Palette,
  Shield,
  Building2,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type AppRole } from "@/types/roles";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const settingsItems: NavItem[] = [
  { icon: Users, label: "Team", path: "/settings/team" },
  { icon: User, label: "Profile", path: "/settings/profile" },
  { icon: Bell, label: "Notifications", path: "/settings/notifications" },
  { icon: CreditCard, label: "Billing", path: "/settings/billing" },
];

interface MainSidebarProps {
  onClose?: () => void;
  onToggleSidebar?: () => void;
  isDesktopSidebarOpen?: boolean;
}

export function MainSidebar({
  onClose,
  onToggleSidebar,
  isDesktopSidebarOpen,
}: MainSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Get user role from auth context
  const currentUserRole = user?.role as AppRole | null;

  // Check if we're in settings section
  const isInSettings = location.pathname.startsWith("/settings");
  const [settingsOpen, setSettingsOpen] = useState(isInSettings);

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  const isActive = (path: string) => location.pathname === path;
  const isDashboardActive = location.pathname === "/" || location.pathname === "/dashboard";
  const isJobsActive = location.pathname === "/my-jobs";
  const isRequestsActive = location.pathname === "/my-requests";
  const isNewRequestActive = location.pathname === "/create-request";
  const isCreatorsActive = location.pathname === "/creators" || location.pathname.startsWith("/creators/");
  const isMessagesActive = location.pathname === "/messages";
  const isProjectsActive = location.pathname === "/projects";
  
  // Admin routes
  const isAdminRequestsActive = location.pathname === "/admin/requests";
  const isAdminCreatorsActive = location.pathname === "/admin/creators";
  const isAdminBrandsActive = location.pathname === "/admin/brands";
  const isSuperadmin = currentUserRole === "superadmin";
  return (
    <div className="flex min-h-screen flex-col bg-sidebar">
      {/* Header with Logo */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">EV</span>
        </div>
        <span className="text-base font-semibold text-foreground">Epic Visuals</span>
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
          {/* Dashboard */}
          <Button
            variant={isDashboardActive ? "sidebarActive" : "sidebar"}
            size="sidebar"
            onClick={() => handleNavClick("/dashboard")}
            className={cn(
              "gap-3 rounded-lg",
              isDashboardActive && "bg-sidebar-accent"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Button>

          {/* Jobs - Creator only */}
          {currentUserRole === "creator" && (
            <Button
              variant={isJobsActive ? "sidebarActive" : "sidebar"}
              size="sidebar"
              onClick={() => handleNavClick("/my-jobs")}
              className={cn(
                "gap-3 rounded-lg",
                isJobsActive && "bg-sidebar-accent"
              )}
            >
              <Briefcase className="h-5 w-5" />
              <span>Jobs</span>
            </Button>
          )}

          {/* Superadmin only section */}
          {isSuperadmin && (
            <>
              <div className="pt-4 pb-2 px-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <Button
                variant={isAdminRequestsActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick("/admin/requests")}
                className={cn(
                  "gap-3 rounded-lg",
                  isAdminRequestsActive && "bg-sidebar-accent"
                )}
              >
                <FileText className="h-5 w-5" />
                <span>Requests</span>
              </Button>
              <Button
                variant={isAdminCreatorsActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick("/admin/creators")}
                className={cn(
                  "gap-3 rounded-lg",
                  isAdminCreatorsActive && "bg-sidebar-accent"
                )}
              >
                <Palette className="h-5 w-5" />
                <span>Creators</span>
              </Button>
              <Button
                variant={isAdminBrandsActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick("/admin/brands")}
                className={cn(
                  "gap-3 rounded-lg",
                  isAdminBrandsActive && "bg-sidebar-accent"
                )}
              >
                <Building2 className="h-5 w-5" />
                <span>Brands</span>
              </Button>
            </>
          )}

          {/* Requests - Brand only */}
          {currentUserRole === "brand" && (
            <>
              <Button
                variant={isRequestsActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick("/my-requests")}
                className={cn(
                  "gap-3 rounded-lg",
                  isRequestsActive && "bg-sidebar-accent"
                )}
              >
                <FileText className="h-5 w-5" />
                <span>Requests</span>
              </Button>
              <Button
                variant={isNewRequestActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick("/create-request")}
                className={cn(
                  "gap-3 rounded-lg pl-8",
                  isNewRequestActive && "bg-sidebar-accent"
                )}
              >
                <Plus className="h-5 w-5" />
                <span>New Request</span>
              </Button>
              <Button
                variant={isCreatorsActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick("/creators")}
                className={cn(
                  "gap-3 rounded-lg",
                  isCreatorsActive && "bg-sidebar-accent"
                )}
              >
                <Palette className="h-5 w-5" />
                <span>Creators</span>
              </Button>
              <Button
                variant={isProjectsActive ? "sidebarActive" : "sidebar"}
                size="sidebar"
                onClick={() => handleNavClick("/projects")}
                className={cn(
                  "gap-3 rounded-lg",
                  isProjectsActive && "bg-sidebar-accent"
                )}
              >
                <FolderKanban className="h-5 w-5" />
                <span>Projects</span>
              </Button>
            </>
          )}

          {/* Messages */}
          <Button
            variant={isMessagesActive ? "sidebarActive" : "sidebar"}
            size="sidebar"
            onClick={() => handleNavClick("/messages")}
            className={cn(
              "gap-3 rounded-lg",
              isMessagesActive && "bg-sidebar-accent"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
          </Button>

          {/* Settings with submenu */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant={isInSettings ? "sidebarActive" : "sidebar"}
                size="sidebar"
                className={cn(
                  "gap-3 rounded-lg justify-between",
                  isInSettings && "bg-sidebar-accent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    settingsOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 pt-1">
              <div className="space-y-1">
                {settingsItems.map((item) => {
                  const isItemActive = isActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Button
                      key={item.path}
                      variant={isItemActive ? "sidebarActive" : "sidebar"}
                      size="sidebar"
                      onClick={() => handleNavClick(item.path)}
                      className={cn(
                        "gap-3 rounded-lg",
                        isItemActive && "bg-sidebar-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
