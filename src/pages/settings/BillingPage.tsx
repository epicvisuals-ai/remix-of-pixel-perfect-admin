import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Billing</h1>

      {/* Current Plan */}
      <div className="admin-card animate-fade-in">
        <div className="admin-card-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold text-foreground">Free</p>
            </div>
            <Button variant="outline" className="rounded-lg">
              Upgrade
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="admin-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="admin-card-section">
          <h2 className="mb-4 text-base font-medium text-foreground">Payment Method</h2>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/50 p-4">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No payment method added</span>
          </div>
          <Button variant="outline" className="mt-4 rounded-lg">
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="admin-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="admin-card-section">
          <h2 className="mb-4 text-base font-medium text-foreground">Billing History</h2>
          <p className="text-sm text-muted-foreground">No billing history available</p>
        </div>
      </div>
    </div>
  );
}
