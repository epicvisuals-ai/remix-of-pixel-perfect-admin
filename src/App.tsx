import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { ChatPanel } from "@/components/messaging/ChatPanel";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import MyJobsPage from "./pages/MyJobsPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import CreatorsPage from "./pages/CreatorsPage";
import CreatorProfilePage from "./pages/CreatorProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import TeamPage from "./pages/settings/TeamPage";
import ProfilePage from "./pages/settings/ProfilePage";
import NotificationsPage from "./pages/settings/NotificationsPage";
import BillingPage from "./pages/settings/BillingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NotificationProvider>
        <FavoritesProvider>
          <MessagingProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  
                  {/* Main Layout with all routes */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/my-jobs" element={<MyJobsPage />} />
                    <Route path="/my-requests" element={<MyRequestsPage />} />
                    <Route path="/create-request" element={<CreateRequestPage />} />
                    <Route path="/creators" element={<CreatorsPage />} />
                    <Route path="/creators/:id" element={<CreatorProfilePage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/settings" element={<Navigate to="/settings/team" replace />} />
                    <Route path="/settings/team" element={<TeamPage />} />
                    <Route path="/settings/profile" element={<ProfilePage />} />
                    <Route path="/settings/notifications" element={<NotificationsPage />} />
                    <Route path="/settings/billing" element={<BillingPage />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ChatPanel />
              </BrowserRouter>
            </TooltipProvider>
          </MessagingProvider>
        </FavoritesProvider>
      </NotificationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
