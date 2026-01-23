import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authApi.signin(email);
      // Store email for confirmation step
      localStorage.setItem('pending_auth_email', email);
      toast({
        title: "Magic link sent!",
        description: `Check your email at ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12 bg-background">
        <div className="max-w-md">
          {/* Logo */}
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-8">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-3">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to your account to continue managing your settings and preferences.
          </p>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Secure magic link authentication
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Quick Google sign-in option
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              No password required
            </li>
          </ul>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-4 mb-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl gap-2"
              disabled={isLoading || !email}
            >
              {isLoading ? "Sending..." : "Send Magic Link"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Google Auth - only show if client ID is configured */}
          {googleClientId && <GoogleLoginButton />}

          {/* Sign up link */}
          <p className="text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button className="text-primary hover:underline font-medium">
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Gradient */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[hsl(180_60%_90%)] via-[hsl(280_40%_85%)] to-[hsl(330_60%_85%)] dark:from-[hsl(180_40%_20%)] dark:via-[hsl(280_30%_25%)] dark:to-[hsl(330_40%_25%)] items-center justify-center p-12">
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 max-w-sm shadow-lg flex items-center gap-4">
          <p className="text-foreground">
            Manage your account settings and preferences with ease.
          </p>
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-5 h-5 text-background" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
