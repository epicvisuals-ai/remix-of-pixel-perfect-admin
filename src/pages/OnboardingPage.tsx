import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Shield, Coins, Users, Sparkles, Zap, Check } from "lucide-react";
import { ROLES, type AppRole } from "@/types/roles";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial step from navigation state or localStorage user profile
  const getInitialStep = () => {
    const stateStep = location.state?.step;
    if (typeof stateStep === 'number' && stateStep >= 0 && stateStep <= 2) {
      return stateStep + 1; // API uses 0-indexed, UI uses 1-indexed
    }
    
    // Fallback: check localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (typeof user.onboarding_step === 'number') {
          return user.onboarding_step + 1;
        }
      } catch (e) {}
    }
    return 1;
  };
  
  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    role: "",
  });

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const canContinue = () => {
    if (currentStep === 1) return agreed;
    if (currentStep === 2) return formData.firstName && formData.lastName;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(180_60%_90%)] via-[hsl(280_40%_85%)] to-[hsl(330_60%_85%)] dark:from-[hsl(180_40%_20%)] dark:via-[hsl(280_30%_25%)] dark:to-[hsl(330_40%_25%)] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {/* Step 1: Terms Agreement */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                Welcome to Our Platform
              </h1>
              <Card className="p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-border flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    Your use of this platform is subject to our{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Terms of Service
                    </a>
                    , the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      User Terms of Service
                    </a>
                    , the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Terms and Conditions
                    </a>
                    , and the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Privacy Policy
                    </a>
                    . By using this platform, you agree to abide by these Terms and Policies,
                    including the{" "}
                    <a href="#" className="text-foreground underline underline-offset-2">
                      Acceptable Use Policy
                    </a>
                    .
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-border flex items-center justify-center">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    You confirm that you will not use this platform or its output in any way that
                    violates these Terms or Policies and that you have obtained all necessary
                    rights, licenses, and consents to any content you upload.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Label htmlFor="agree" className="text-sm font-medium cursor-pointer">
                    I agree
                  </Label>
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: User Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                Enter your details
              </h1>
              <Card className="p-6 sm:p-8 lg:p-10 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    placeholder="Company Inc."
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: AppRole) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger id="role" className="bg-background">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {Object.values(ROLES).map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex flex-col">
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground">
                Choose your plan
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                {/* Starter Plan */}
                <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Starter</h3>
                    <p className="text-3xl font-bold text-foreground">$19.99</p>
                    <p className="text-sm text-muted-foreground">Get started with basics.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">100 credits per month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">1 team member</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Basic features</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Get Starter
                  </Button>
                  <a href="#" className="text-xs text-center block text-muted-foreground underline">
                    Terms and conditions
                  </a>
                </Card>

                {/* Pro Plan */}
                <Card className="p-6 space-y-4 border-primary/50 hover:shadow-lg transition-shadow">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Pro</h3>
                    <p className="text-3xl font-bold text-foreground">$49.99</p>
                    <p className="text-sm text-muted-foreground">Scale your business.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">500 credits per month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">5 team members</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Advanced features</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>
                  <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                    Get Pro
                  </Button>
                  <a href="#" className="text-xs text-center block text-muted-foreground underline">
                    Terms and conditions
                  </a>
                </Card>

                {/* Enterprise Plan */}
                <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">Enterprise</h3>
                    <p className="text-3xl font-bold text-foreground">Custom</p>
                    <p className="text-sm text-muted-foreground">Custom solutions for teams.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Early access to features</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Unlimited team members</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Dedicated support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Custom integrations</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Talk to our team
                  </Button>
                  <a href="#" className="text-xs text-center block text-muted-foreground underline">
                    Terms and conditions
                  </a>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with step indicator and navigation */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {currentStep} of 3
          </span>
          <Button
            onClick={currentStep === 3 ? handleSkip : handleContinue}
            disabled={!canContinue()}
            className="bg-cyan-500 hover:bg-cyan-600 text-white disabled:opacity-50"
          >
            {currentStep === 3 ? "Skip" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
