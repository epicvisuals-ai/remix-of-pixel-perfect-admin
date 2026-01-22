import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatPanel } from "@/components/messaging/ChatPanel";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import MyJobsPage from "./pages/MyJobsPage";
import MyJobDetailPage from "./pages/MyJobDetailPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import MyRequestDetailPage from "./pages/MyRequestDetailPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import CreatorsPage from "./pages/CreatorsPage";
import CreatorProfilePage from "./pages/CreatorProfilePage";
import MessagesPage from "./pages/MessagesPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import TeamPage from "./pages/settings/TeamPage";
import ProfilePage from "./pages/settings/ProfilePage";
import NotificationsPage from "./pages/settings/NotificationsPage";
import BillingPage from "./pages/settings/BillingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import MagicLinkCallback from "./pages/MagicLinkCallback";
import OnboardingPage from "./pages/OnboardingPage";
import AdminRequestsPage from "./pages/admin/AdminRequestsPage";
import AdminCreatorsPage from "./pages/admin/AdminCreatorsPage";
import AdminBrandsPage from "./pages/admin/AdminBrandsPage";

const queryClient = new QueryClient();

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const AppContent = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <FavoritesProvider>
            <MessagingProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
              <Routes>
                {/* Auth Routes (public) */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/magic-link" element={<MagicLinkCallback />} />
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } />
                
                {/* Protected Routes with Main Layout */}
                <Route element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-jobs" element={<MyJobsPage />} />
                  <Route path="/my-jobs/:requestId" element={<MyJobDetailPage />} />
                  <Route path="/my-requests" element={<MyRequestsPage />} />
                  <Route path="/my-requests/:requestId" element={<MyRequestDetailPage />} />
                  <Route path="/create-request" element={<CreateRequestPage />} />
                  <Route path="/creators" element={<CreatorsPage />} />
                  <Route path="/creators/:creatorId" element={<CreatorProfilePage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/create-project" element={<CreateProjectPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/settings" element={<Navigate to="/settings/team" replace />} />
                  <Route path="/settings/team" element={<TeamPage />} />
                  <Route path="/settings/profile" element={<ProfilePage />} />
                  <Route path="/settings/notifications" element={<NotificationsPage />} />
                  <Route path="/settings/billing" element={<BillingPage />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/requests" element={<AdminRequestsPage />} />
                  <Route path="/admin/creators" element={<AdminCreatorsPage />} />
                  <Route path="/admin/brands" element={<AdminBrandsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatPanel />
            </TooltipProvider>
          </MessagingProvider>
        </FavoritesProvider>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
</ThemeProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppContent />
      </GoogleOAuthProvider>
    ) : (
      <AppContent />
    )}
  </QueryClientProvider>
);

export default App;
