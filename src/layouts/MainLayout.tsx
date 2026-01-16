import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainSidebar } from "@/components/admin/MainSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const location = useLocation();

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.includes("team")) return "Team";
    if (path.includes("profile")) return "Profile";
    if (path.includes("billing")) return "Billing";
    if (path.includes("my-requests")) return "My Requests";
    if (path.includes("create-request")) return "Create Request";
    if (path.includes("my-jobs")) return "My Jobs";
    return "Settings";
  };

  const handleToggleDesktopSidebar = () =>
    setDesktopSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen w-full bg-card">
      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "hidden shrink-0 bg-card md:block transition-all duration-300 ease-in-out",
          desktopSidebarOpen ? "w-[280px]" : "w-0"
        )}
      >
        <div className="fixed top-0 left-0 h-screen w-[280px] overflow-y-auto">
          <MainSidebar
            onToggleSidebar={handleToggleDesktopSidebar}
            isDesktopSidebarOpen={desktopSidebarOpen}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex flex-1 flex-col overflow-hidden md:py-3 md:pr-3",
          desktopSidebarOpen ? "" : "border border-border/50 md:pl-3"
        )}
      >
        <div className="flex flex-1 flex-col rounded-none md:rounded-[32px] bg-gradient-to-b from-primary/5 via-background to-[hsl(25_100%_95%)] dark:to-[hsl(25_30%_15%)]">
          {/* Desktop Header with Toggle and Notifications */}
          <header className="hidden md:flex items-center justify-between gap-3 px-6 py-4">
            <div className="flex items-center gap-3">
              {!desktopSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg border border-border bg-card/80 hover:bg-card"
                  onClick={handleToggleDesktopSidebar}
                  aria-label="Open sidebar"
                >
                  <PanelLeft className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </header>

          {/* Mobile Header */}
          <header className="flex items-center gap-3 border-b border-border/30 bg-transparent px-4 py-3 md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg border border-border bg-card/80"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0" hideClose>
                <MainSidebar onClose={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            <span className="text-base font-semibold text-foreground">{getPageTitle()}</span>

            <div className="ml-auto flex items-center gap-2">
              <NotificationBell />
            </div>
          </header>

          {/* Page Content */}
          <div className="flex flex-1 flex-col">
            <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
              <div className="mx-auto max-w-2xl">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
