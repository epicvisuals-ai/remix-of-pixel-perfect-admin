import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, setToken, setUser } = useAuth();
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

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsGoogleLoading(true);
      try {
        const response = await authApi.googleLogin({ code: codeResponse.code });
        const { access_token, user } = response.data;

        // Store token and user info
        setToken(access_token);
        setUser(user);

        // Navigate based on onboarding status
        if (!user.onboarding_completed) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }

        toast({
          title: "Welcome back!",
          description: "Successfully signed in with Google",
        });
      } catch (error: any) {
        console.error('Google auth error:', error);
        toast({
          title: "Error",
          description: error.response?.data?.detail || "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    },
    flow: 'auth-code',
  });

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

          {/* Google Auth */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl gap-2"
            onClick={() => handleGoogleAuth()}
            disabled={isGoogleLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Button>

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
