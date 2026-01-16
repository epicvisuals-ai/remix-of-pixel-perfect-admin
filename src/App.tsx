import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import TeamPage from "./pages/settings/TeamPage";
import ProfilePage from "./pages/settings/ProfilePage";
import BillingPage from "./pages/settings/BillingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
              <Route path="/settings" element={<Navigate to="/settings/team" replace />} />
              <Route path="/settings/team" element={<TeamPage />} />
              <Route path="/settings/profile" element={<ProfilePage />} />
              <Route path="/settings/billing" element={<BillingPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
