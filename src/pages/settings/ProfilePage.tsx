import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/admin/MemberAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const [name, setName] = useState("Oleh Kuprovskyi");
  const [email] = useState("oleh.kuprovskyi@gmail.com");
  const { theme, setTheme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleDeleteAccount = () => {
    if (confirmEmail === email) {
      // Handle delete account logic
      console.log("Account deleted");
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Profile</h1>

      <div className="admin-card animate-fade-in">
        {/* Avatar Section */}
        <div className="admin-card-section flex items-center gap-4">
          <MemberAvatar name={name} className="h-16 w-16 text-xl" />
          <div>
            <p className="text-base font-medium text-foreground">{name}</p>
            {/* <p className="text-sm text-muted-foreground">{email}</p> */}
          </div>
        </div>

        {/* Name Field */}
        <div className="admin-card-section flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">Full Name</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-[250px] rounded-lg border-border bg-card text-right text-sm"
          />
        </div>

        {/* Email Field */}
        <div className="admin-card-section flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">Email</span>
          <div className="flex h-10 w-full max-w-[250px] items-center justify-end rounded-lg bg-card px-3 text-sm text-foreground">
            {email}
          </div>
        </div>

        {/* Appearance */}
        <div className="admin-card-section flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">Appearance</span>
          <div className="flex rounded-full bg-muted p-1">
            {(["light", "dark", "system"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all capitalize ${
                  theme === mode
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="admin-card animate-fade-in">
        <div className="admin-card-section flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">Delete account</span>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive border-border hover:bg-destructive/10 hover:text-destructive"
          >
            Delete account
          </Button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              All the videos and projects made by this account will also be deleted. 
              This cannot be undone, and you will no longer be able to create an account with this email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-foreground">Type the email below to delete your account.</p>
            <Input
              placeholder={email}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmEmail("");
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={confirmEmail !== email}
              onClick={handleDeleteAccount}
              className="rounded-full text-destructive hover:text-destructive disabled:opacity-50"
            >
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
