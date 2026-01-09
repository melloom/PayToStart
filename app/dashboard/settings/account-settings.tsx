"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, User, Mail, Save, Lock, Shield, Trash2, Bell, Eye, EyeOff, Download, AlertTriangle, X, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Company, SubscriptionTier } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AccountSettingsProps {
  initialName: string;
  initialEmail: string;
  company: Company;
  currentTier: SubscriptionTier;
  isActive: boolean;
}

export default function AccountSettings({
  initialName,
  initialEmail,
  company,
  currentTier,
  isActive,
}: AccountSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account deletion state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);

  // Check if user has active paid subscription
  const hasActiveSubscription = currentTier !== "free" && isActive && company.subscriptionStripeSubscriptionId;

  useEffect(() => {
    const changed = name !== initialName || email !== initialEmail;
    setHasChanges(changed);
  }, [name, email, initialName, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      toast({
        title: "No changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updates: { name?: string; email?: string } = {};
      if (name !== initialName) updates.name = name;
      if (email !== initialEmail) updates.email = email;

      const response = await fetch("/api/account/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update account");
      }

      toast({
        title: "Account updated",
        description: "Your account information has been updated successfully.",
      });

      // Reload page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      // Reset form and close dialog
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordDialog(false);
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportContracts = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/account/export-contracts", {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to export contracts");
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pay2start-contracts-export-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Contracts exported",
        description: "Your contracts have been exported successfully.",
      });
    } catch (error: any) {
      console.error("Error exporting contracts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to export contracts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteClick = () => {
    // If user has active subscription, show cancel subscription dialog first
    if (hasActiveSubscription && !subscriptionCancelled) {
      setShowCancelSubscriptionDialog(true);
    } else {
      // Otherwise, go straight to delete dialog
      setShowDeleteDialog(true);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancellingSubscription(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel subscription");
      }

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of your billing period.",
      });

      setSubscriptionCancelled(true);
      setShowCancelSubscriptionDialog(false);
      // Show delete dialog after cancelling subscription
      setTimeout(() => {
        setShowDeleteDialog(true);
      }, 500);
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      toast({
        title: "Account deleted",
        description: "Your account has been deleted. Redirecting to home page...",
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-400" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Update your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
                placeholder="Enter your full name"
                minLength={2}
                maxLength={200}
                required
              />
              <p className="text-xs text-slate-500">
                This is the name displayed on your contracts and profile
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
                placeholder="Enter your email address"
                required
              />
              <p className="text-xs text-slate-500">
                You may need to verify your email if you change it
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="h-6 w-6 text-indigo-400" />
            Change Password
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Change Password</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white pr-10"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white pr-10"
                      placeholder="Enter new password (min. 8 characters)"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white pr-10"
                      placeholder="Confirm new password"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordDialog(false)}
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-2 border-red-900/50 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-400" />
            Security Settings
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Manage your account security and privacy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-400" />
                Delete Account
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Once you delete your account, there is no going back. This will permanently delete
                your account, contracts, templates, and all associated data. This action cannot be undone.
              </p>

              {/* Export Contracts Button */}
              <div className="mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportContracts}
                  disabled={isExporting}
                  className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700 hover:text-white mb-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export All Contracts
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-500 mt-1">
                  Download all your contracts as a ZIP file before deleting your account
                </p>
              </div>

              {/* Cancel Subscription Dialog */}
              <Dialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                      </div>
                      <DialogTitle className="text-xl font-bold">Cancel Subscription First?</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400 pt-2">
                      You have an active subscription. Would you like to cancel it before deleting your account?
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4 space-y-4">
                    <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-300 mb-1">
                            Your subscription will remain active until:
                          </p>
                          <p className="text-sm text-amber-200">
                            {company.subscriptionCurrentPeriodEnd
                              ? format(company.subscriptionCurrentPeriodEnd, "EEEE, MMMM d, yyyy")
                              : "the end of your billing period"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="font-semibold">What happens:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                        <li>Your subscription will be cancelled</li>
                        <li>You&apos;ll keep access until the end of your billing period</li>
                        <li>After cancellation, you can proceed to delete your account</li>
                      </ul>
                    </div>
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCancelSubscriptionDialog(false);
                        // Skip cancellation and go straight to delete
                        setShowDeleteDialog(true);
                      }}
                      disabled={isCancellingSubscription}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Skip & Delete Account
                    </Button>
                    <Button
                      onClick={handleCancelSubscription}
                      disabled={isCancellingSubscription}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      {isCancellingSubscription ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Yes, Cancel Subscription
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Account Dialog */}
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteClick}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <DialogTitle className="text-xl font-bold text-red-400">Delete Account</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400 pt-2">
                      This action cannot be undone. This will permanently delete your account and
                      all associated data including contracts, templates, and payment information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {subscriptionCancelled && (
                      <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                        <p className="text-sm text-green-300">
                          ✓ Subscription cancelled. You can now delete your account.
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="deleteConfirm" className="text-slate-300">
                        Type <span className="font-bold text-red-400">DELETE</span> to confirm:
                      </Label>
                      <Input
                        id="deleteConfirm"
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="DELETE"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setDeleteConfirmText("");
                      }}
                      disabled={isDeleting}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmText !== "DELETE"}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

