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
import { Loader2, User, Mail, Save, Lock, Shield, Trash2, Bell, Eye, EyeOff, Download, AlertTriangle, X, Calendar, Info, Building2, CreditCard, ExternalLink, CheckCircle2 } from "lucide-react";
import PaymentProviderConnectDialog from "./payment-provider-connect-dialog";
import { format } from "date-fns";
import type { Company, SubscriptionTier, PaymentProvider } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Company settings state
  const [companyName, setCompanyName] = useState(company.name);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [hasCompanyChanges, setHasCompanyChanges] = useState(false);

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

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    contractSigned: true,
    contractPaid: true,
    contractSent: true,
    paymentReceived: true,
    invoiceUpcoming: true,
    subscriptionUpdates: true,
    marketingEmails: false,
  });
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Payment methods state (for Stripe cards)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<string | null>(null);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Payment providers state (multi-provider support)
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [showAddProviderDialog, setShowAddProviderDialog] = useState(false);
  const [newProviderType, setNewProviderType] = useState<string>("");
  const [newProviderName, setNewProviderName] = useState<string>("");
  const [connectionData, setConnectionData] = useState<Record<string, string>>({});
  const [connectingProvider, setConnectingProvider] = useState<PaymentProvider | null>(null);

  // Check if user has active paid subscription
  const hasActiveSubscription = currentTier !== "free" && isActive && company.subscriptionStripeSubscriptionId;

  // Load notification preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/account/notifications");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.preferences) {
          setNotificationPrefs(data.preferences);
        }
      } catch (error) {
        // Only log if it's not a network error (which might be expected in some cases)
        if (error instanceof TypeError && error.message.includes("fetch")) {
          // Network error - might be offline or server issue
          console.warn("Network error loading notification preferences - this may be expected if offline");
        } else {
          console.error("Error loading notification preferences:", error);
        }
      } finally {
        setPrefsLoaded(true);
      }
    };
    loadPreferences();
  }, []);

  // Load payment methods on mount
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!company.subscriptionStripeCustomerId) {
        return;
      }
      setIsLoadingPaymentMethods(true);
      try {
        const response = await fetch("/api/subscriptions/payment-methods");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.paymentMethods) {
          setPaymentMethods(data.paymentMethods || []);
          setDefaultPaymentMethod(data.defaultPaymentMethod);
        }
      } catch (error) {
        // Only log if it's not a network error (which might be expected in some cases)
        if (error instanceof TypeError && error.message.includes("fetch")) {
          // Network error - might be offline or server issue
          console.warn("Network error loading payment methods - this may be expected if offline");
        } else {
          console.error("Error loading payment methods:", error);
        }
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    };
    loadPaymentMethods();
  }, [company.subscriptionStripeCustomerId]);

  // Load payment providers on mount (runs every time component mounts, including when switching tabs)
  useEffect(() => {
    const loadPaymentProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const response = await fetch("/api/payment-providers");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.providers) {
          setPaymentProviders(data.providers || []);
        }
      } catch (error) {
        // Only log if it's not a network error (which might be expected in some cases)
        if (error instanceof TypeError && error.message.includes("fetch")) {
          // Network error - might be offline or server issue
          console.warn("Network error loading payment providers - this may be expected if offline");
        } else {
          console.error("Error loading payment providers:", error);
        }
      } finally {
        setIsLoadingProviders(false);
      }
    };
    loadPaymentProviders();
  }, []);

  useEffect(() => {
    const changed = name !== initialName || email !== initialEmail;
    setHasChanges(changed);
  }, [name, email, initialName, initialEmail]);

  useEffect(() => {
    const changed = companyName !== company.name;
    setHasCompanyChanges(changed);
  }, [companyName, company.name]);

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

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/account/export");
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `account-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Your account data has been downloaded.",
      });
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasCompanyChanges) {
      toast({
        title: "No changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }

    setIsLoadingCompany(true);
    try {
      const response = await fetch("/api/account/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update company");
      }

      toast({
        title: "Company updated",
        description: "Your company information has been updated successfully.",
      });

      // Reload page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating company:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const handleNotificationPrefChange = async (key: string, value: boolean) => {
    const updatedPrefs = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(updatedPrefs);

    setIsLoadingPrefs(true);
    try {
      const response = await fetch("/api/account/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update preferences");
      }

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      // Revert on error
      setNotificationPrefs(notificationPrefs);
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  const handleManagePaymentMethods = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/subscriptions/billing-portal", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create billing portal session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No billing portal URL received");
      }
    } catch (error: any) {
      console.error("Error opening billing portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  // Payment provider handlers
  const handleAddProvider = async () => {
    if (!newProviderType || !newProviderName) {
      toast({
        title: "Error",
        description: "Please select a provider type and enter a name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/payment-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerType: newProviderType,
          providerName: newProviderName,
          connectionData: connectionData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If provider already exists, offer to connect it instead
        if (response.status === 409 && data.existingProviderId) {
          toast({
            title: "Provider Already Exists",
            description: data.message || "This provider type is already added. Would you like to connect it?",
            variant: "default",
          });
          // Optionally, you could open the connect dialog here
          // setConnectingProvider(paymentProviders.find(p => p.id === data.existingProviderId));
          return;
        }
        throw new Error(data.message || data.error || "Failed to add payment provider");
      }

      toast({
        title: "Provider Added",
        description: `${newProviderName} has been added. Connect it to start using it.`,
      });

      // Reload providers
      const providersResponse = await fetch("/api/payment-providers");
      const providersData = await providersResponse.json();
      if (providersData.providers) {
        setPaymentProviders(providersData.providers || []);
      }

      // Reset form
      setNewProviderType("");
      setNewProviderName("");
      setConnectionData({});
      setShowAddProviderDialog(false);
    } catch (error: any) {
      console.error("Error adding payment provider:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add payment provider. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnectProvider = (provider: PaymentProvider) => {
    setConnectingProvider(provider);
  };

  const handleProviderConnected = () => {
    // Reload providers
    const loadProviders = async () => {
      try {
        const response = await fetch("/api/payment-providers");
        const data = await response.json();
        if (data.providers) {
          setPaymentProviders(data.providers || []);
        }
      } catch (error) {
        console.error("Error reloading providers:", error);
      }
    };
    loadProviders();
    setConnectingProvider(null);
  };

  const handleDisconnectProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/payment-providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "disconnected",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to disconnect payment provider");
      }

      toast({
        title: "Provider Disconnected",
        description: "Your payment provider has been disconnected.",
      });

      // Reload providers
      const providersResponse = await fetch("/api/payment-providers");
      const providersData = await providersResponse.json();
      if (providersData.providers) {
        setPaymentProviders(providersData.providers || []);
      }
    } catch (error: any) {
      console.error("Error disconnecting payment provider:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect payment provider. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm("Are you sure you want to delete this payment provider? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/payment-providers/${providerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete payment provider");
      }

      toast({
        title: "Provider Deleted",
        description: "Your payment provider has been deleted.",
      });

      // Reload providers
      const providersResponse = await fetch("/api/payment-providers");
      const providersData = await providersResponse.json();
      if (providersData.providers) {
        setPaymentProviders(providersData.providers || []);
      }
    } catch (error: any) {
      console.error("Error deleting payment provider:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment provider. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/payment-providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isDefault: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to set default provider");
      }

      toast({
        title: "Default Provider Updated",
        description: "Your default payment provider has been updated.",
      });

      // Reload providers
      const providersResponse = await fetch("/api/payment-providers");
      const providersData = await providersResponse.json();
      if (providersData.providers) {
        setPaymentProviders(providersData.providers || []);
      }
    } catch (error: any) {
      console.error("Error setting default provider:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set default provider. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case "stripe":
        return "💳";
      case "venmo":
        return "💚";
      case "cashapp":
        return "💵";
      case "paypal":
        return "🔵";
      case "zelle":
        return "🏦";
      case "bank_transfer":
        return "🏛️";
      default:
        return "💳";
    }
  };

  const getProviderColor = (type: string) => {
    switch (type) {
      case "stripe":
        return "from-purple-600 to-indigo-600";
      case "venmo":
        return "from-green-600 to-emerald-600";
      case "cashapp":
        return "from-green-500 to-lime-500";
      case "paypal":
        return "from-blue-500 to-cyan-500";
      case "zelle":
        return "from-blue-600 to-indigo-600";
      case "bank_transfer":
        return "from-slate-600 to-gray-600";
      default:
        return "from-slate-600 to-gray-600";
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

      {/* Company Settings */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-400" />
            Company Information
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Update your company name and details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCompanyUpdate} className="space-y-6">
            {/* Company Name Field */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-300 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500"
                placeholder="Enter your company name"
                minLength={2}
                maxLength={200}
                required
              />
              <p className="text-xs text-slate-500">
                This name appears on contracts and invoices
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoadingCompany || !hasCompanyChanges}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg font-semibold"
              >
                {isLoadingCompany ? (
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

      {/* Payment Settings */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-indigo-400" />
                Payment Settings
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Manage your payment methods and billing information
              </CardDescription>
            </div>
            <Dialog open={showAddProviderDialog} onOpenChange={setShowAddProviderDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  + Add Provider
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add Payment Provider</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Connect a payment system to receive payments
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="providerType">Provider Type</Label>
                    <select
                      id="providerType"
                      value={newProviderType}
                      onChange={(e) => {
                        setNewProviderType(e.target.value);
                        setNewProviderName(e.target.value === "stripe" ? "Stripe" : e.target.value === "venmo" ? "Venmo" : e.target.value === "cashapp" ? "Cash App" : e.target.value === "paypal" ? "PayPal" : e.target.value === "zelle" ? "Zelle" : e.target.value === "bank_transfer" ? "Bank Transfer" : "Other");
                      }}
                      className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="">Select a provider</option>
                      <option value="stripe">Stripe</option>
                      <option value="venmo">Venmo</option>
                      <option value="cashapp">Cash App</option>
                      <option value="paypal">PayPal</option>
                      <option value="zelle">Zelle</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="providerName">Provider Name</Label>
                    <Input
                      id="providerName"
                      value={newProviderName}
                      onChange={(e) => setNewProviderName(e.target.value)}
                      placeholder="e.g., Stripe Business Account"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProviderDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProvider} className="bg-gradient-to-r from-purple-600 to-indigo-600">
                    Add Provider
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingProviders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : paymentProviders.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <p className="text-sm text-slate-300 mb-2">
                  No payment account configured yet.
                </p>
                <p className="text-xs text-slate-500">
                  Payment methods will be added automatically when you subscribe to a plan or make your first payment.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {paymentProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`p-4 rounded-lg border ${
                      provider.isDefault
                        ? "border-indigo-500 bg-indigo-900/20"
                        : provider.status === "connected"
                        ? "border-green-500/50 bg-green-900/10"
                        : provider.status === "error"
                        ? "border-red-500/50 bg-red-900/10"
                        : "border-slate-700 bg-slate-700/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl bg-gradient-to-r ${getProviderColor(provider.providerType)} bg-clip-text text-transparent`}>
                          {getProviderIcon(provider.providerType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{provider.providerName}</p>
                            {provider.isDefault && (
                              <span className="text-xs font-semibold text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                            {provider.status === "connected" && (
                              <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
                                Connected
                              </span>
                            )}
                            {provider.status === "pending" && (
                              <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                            {provider.status === "error" && (
                              <span className="text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full">
                                Error
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 capitalize">
                            {provider.providerType.replace("_", " ")}
                            {provider.connectedAt && ` • Connected ${format(new Date(provider.connectedAt), "MMM d, yyyy")}`}
                          </p>
                          {provider.errorMessage && (
                            <p className="text-xs text-red-400 mt-1">{provider.errorMessage}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {provider.status === "connected" && !provider.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultProvider(provider.id)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            Set Default
                          </Button>
                        )}
                        {provider.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectProvider(provider)}
                            className="border-green-600 text-green-400 hover:bg-green-900/20"
                          >
                            Connect
                          </Button>
                        )}
                        {provider.status === "connected" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectProvider(provider.id)}
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
                          >
                            Disconnect
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProvider(provider.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stripe Payment Methods (if Stripe is connected) */}
              {paymentProviders.some(p => p.providerType === "stripe" && p.status === "connected") && (
                <div className="pt-4 border-t border-slate-700">
                  <h4 className="text-sm font-semibold text-white mb-3">Stripe Payment Methods</h4>
                  {isLoadingPaymentMethods ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                      <p className="text-xs text-slate-400">
                        No payment methods on file. Add one through the billing portal.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {paymentMethods.map((pm) => (
                        <div
                          key={pm.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            pm.id === defaultPaymentMethod
                              ? "border-indigo-500 bg-indigo-900/20"
                              : "border-slate-700 bg-slate-700/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                **** **** **** {pm.card?.last4 || "****"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {pm.card?.brand ? `${pm.card.brand.toUpperCase()} • ` : ""}
                                Expires {pm.card?.expMonth || "**"}/{pm.card?.expYear || "**"}
                              </p>
                            </div>
                          </div>
                          {pm.id === defaultPaymentMethod && (
                            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={handleManagePaymentMethods}
                    disabled={isPortalLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    size="sm"
                  >
                    {isPortalLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Opening Portal...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Manage Stripe Payment Methods
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  Payment Information
                </h4>
                <p className="text-xs text-slate-400 mb-2">
                  Connect multiple payment providers to give your clients flexible payment options. 
                  These methods are used for:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Subscription payments</li>
                  <li>Contract deposits and payments</li>
                  <li>Automatic renewals</li>
                </ul>
              </div>
            </div>
          )}
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

      {/* Notification Preferences */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-400" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!prefsLoaded ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="contractSigned"
                    checked={notificationPrefs.contractSigned}
                    onCheckedChange={(checked) =>
                      handleNotificationPrefChange("contractSigned", checked === true)
                    }
                    disabled={isLoadingPrefs}
                    className="border-slate-500"
                  />
                  <Label htmlFor="contractSigned" className="text-slate-300 cursor-pointer">
                    Contract Signed
                  </Label>
                </div>
                <p className="text-xs text-slate-500">When a client signs a contract</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="contractPaid"
                    checked={notificationPrefs.contractPaid}
                    onCheckedChange={(checked) =>
                      handleNotificationPrefChange("contractPaid", checked === true)
                    }
                    disabled={isLoadingPrefs}
                    className="border-slate-500"
                  />
                  <Label htmlFor="contractPaid" className="text-slate-300 cursor-pointer">
                    Contract Paid
                  </Label>
                </div>
                <p className="text-xs text-slate-500">When payment is received</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="contractSent"
                    checked={notificationPrefs.contractSent}
                    onCheckedChange={(checked) =>
                      handleNotificationPrefChange("contractSent", checked === true)
                    }
                    disabled={isLoadingPrefs}
                    className="border-slate-500"
                  />
                  <Label htmlFor="contractSent" className="text-slate-300 cursor-pointer">
                    Contract Sent
                  </Label>
                </div>
                <p className="text-xs text-slate-500">When a contract is sent to a client</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="paymentReceived"
                    checked={notificationPrefs.paymentReceived}
                    onCheckedChange={(checked) =>
                      handleNotificationPrefChange("paymentReceived", checked === true)
                    }
                    disabled={isLoadingPrefs}
                    className="border-slate-500"
                  />
                  <Label htmlFor="paymentReceived" className="text-slate-300 cursor-pointer">
                    Payment Received
                  </Label>
                </div>
                <p className="text-xs text-slate-500">When a payment is processed</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="invoiceUpcoming"
                    checked={notificationPrefs.invoiceUpcoming}
                    onCheckedChange={(checked) =>
                      handleNotificationPrefChange("invoiceUpcoming", checked === true)
                    }
                    disabled={isLoadingPrefs}
                    className="border-slate-500"
                  />
                  <Label htmlFor="invoiceUpcoming" className="text-slate-300 cursor-pointer">
                    Upcoming Invoice
                  </Label>
                </div>
                <p className="text-xs text-slate-500">Before subscription renewal</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="subscriptionUpdates"
                    checked={notificationPrefs.subscriptionUpdates}
                    onCheckedChange={(checked) =>
                      handleNotificationPrefChange("subscriptionUpdates", checked === true)
                    }
                    disabled={isLoadingPrefs}
                    className="border-slate-500"
                  />
                  <Label htmlFor="subscriptionUpdates" className="text-slate-300 cursor-pointer">
                    Subscription Updates
                  </Label>
                </div>
                <p className="text-xs text-slate-500">Changes to your subscription</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border-t border-slate-600 pt-4 mt-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="marketingEmails"
                    checked={notificationPrefs.marketingEmails}
                    onCheckedChange={(checked) =>
                      handleNotificationPrefChange("marketingEmails", checked === true)
                    }
                    disabled={isLoadingPrefs}
                    className="border-slate-500"
                  />
                  <Label htmlFor="marketingEmails" className="text-slate-300 cursor-pointer">
                    Marketing Emails
                  </Label>
                </div>
                <p className="text-xs text-slate-500">Product updates and tips</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Download className="h-6 w-6 text-indigo-400" />
            Data Export
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Download a copy of your account data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Export all your account data including contracts, templates, clients, payments, and signatures
              in JSON format. This is useful for backup purposes or data portability.
            </p>
            <Button
              type="button"
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Account Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Info className="h-6 w-6 text-indigo-400" />
            Account Information
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            View your account details and subscription information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Company ID</p>
                <p className="text-sm text-white font-mono">{company.id.slice(0, 8)}...</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Company Name</p>
                <p className="text-sm text-white">{company.name}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Subscription Tier</p>
                <p className="text-sm text-white capitalize">{currentTier}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Account Status</p>
                <p className="text-sm text-white">
                  {isActive ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-yellow-400">Inactive</span>
                  )}
                </p>
              </div>
              {company.createdAt && (
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Member Since</p>
                  <p className="text-sm text-white">
                    {format(new Date(company.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
              {company.subscriptionCurrentPeriodEnd && (
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">
                    {currentTier === "free" ? "Trial Ends" : "Next Billing Date"}
                  </p>
                  <p className="text-sm text-white">
                    {format(new Date(company.subscriptionCurrentPeriodEnd), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
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

      {/* Payment Provider Connect Dialog */}
      {connectingProvider && (
        <PaymentProviderConnectDialog
          provider={connectingProvider}
          open={!!connectingProvider}
          onOpenChange={(open) => {
            if (!open) {
              setConnectingProvider(null);
            }
          }}
          onConnected={handleProviderConnected}
        />
      )}
    </div>
  );
}

