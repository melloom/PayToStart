"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Loader2, AlertCircle, Calendar, Clock, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TIER_CONFIG } from "@/lib/types";
import type { SubscriptionTier, Company } from "@/lib/types";
import { format } from "date-fns";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: SubscriptionTier;
  hasUsedTrial: boolean; // Whether user has already used their free trial
  company?: Company; // Company info to check trial status
  customerId?: string | null; // Customer ID to check for payment method
  isActive?: boolean; // Whether user has an active subscription
}

export default function UpgradePlanModal({
  open,
  onOpenChange,
  currentTier,
  hasUsedTrial,
  company,
  customerId,
  isActive,
}: UpgradePlanModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showTrialStartDialog, setShowTrialStartDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false); // Dialog for paid-to-paid upgrades
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [startNow, setStartNow] = useState(false); // Whether to start subscription now or at end of trial

  const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
  const currentTierIndex = tiers.indexOf(currentTier);
  const availableTiers = tiers.slice(currentTierIndex + 1); // Only show tiers above current

  const getFeatures = (tier: SubscriptionTier, hasUsedTrial: boolean): string[] => {
      const baseFeatures: Record<SubscriptionTier, string[]> = {
        free: ["3 Contracts only", "No templates", "Basic features"],
        starter: [
          "7-Day Free Trial included",
          "2 Contract Templates",
          "20 Contracts per month",
          "AI Contract Generation",
          "Click to Sign",
          "Email Delivery",
          "Basic Support",
        ],
        pro: [
          "7-Day Free Trial included",
          "Everything in Starter, plus:",
          "Unlimited Templates",
          "Unlimited Contracts",
          "SMS Reminders",
          "File Attachments",
          "Custom Branding",
          "Download All Contracts",
          "Priority Support",
        ],
        premium: [
          "7-Day Free Trial included",
          "Everything in Pro, plus:",
          "Dropbox Sign Integration",
          "DocuSign Integration",
          "Multi-user Team Roles",
          "Stripe Connect Payouts",
          "Dedicated Support",
          "Custom Integrations",
        ],
      };

      const features = [...baseFeatures[tier]];
      
      // Check if user is currently in a trial
      const isInTrial = company?.trialEnd && new Date(company.trialEnd) > new Date();
      
      // Remove "7-Day Free Trial included" if they're in trial OR have already used a trial
      if ((isInTrial || hasUsedTrial) && tier !== "free") {
        const trialIndex = features.findIndex(f => f.includes("7-Day Free Trial"));
        if (trialIndex !== -1) {
          features.splice(trialIndex, 1);
        }
      }

      return features;
    };

  const getTierInfo = (tier: SubscriptionTier) => {
    const config = TIER_CONFIG[tier];
    const names: Record<SubscriptionTier, string> = {
      free: "Basic",
      starter: "Starter",
      pro: "Pro",
      premium: "Premium",
    };

    // Check if user is currently in a trial
    const isInTrial = company?.trialEnd && new Date(company.trialEnd) > new Date();
    
    // If user is in trial OR has used trial, no more trial badges
    const canShowTrial = tier !== "free" && !isInTrial && !hasUsedTrial;

    return {
      name: names[tier],
      price: config.price,
      popular: tier === "starter",
      hasTrial: canShowTrial, // Only show trial if not in trial and haven't used one
    };
  };

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === currentTier) {
      toast({
        title: "Already on this plan",
        description: `You are already on the ${getTierInfo(tier).name} plan.`,
        variant: "default",
      });
      return;
    }

    // Check if user already has an active subscription (prevent duplicates)
    if (isActive && currentTier !== "free") {
      toast({
        title: "Active Subscription Found",
        description: "You already have an active subscription. Please manage your existing subscription or cancel it before subscribing to a new plan.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is in trial and has a payment method
    const isInTrial = company?.trialEnd && new Date(company.trialEnd) > new Date();
    const hasPaymentMethod = !!customerId;

    // Check if this is an upgrade from one paid tier to another
    const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
    const currentTierIndex = tiers.indexOf(currentTier);
    const targetTierIndex = tiers.indexOf(tier);
    const isPaidToPaidUpgrade = currentTier !== "free" && targetTierIndex > currentTierIndex && isActive;

    // If in trial and has payment method, redirect to dedicated upgrade page
    if (isInTrial && hasPaymentMethod) {
      router.push(`/dashboard/upgrade/${tier}`);
      return;
    }

    // If upgrading from paid tier to paid tier, show upgrade dialog
    if (isPaidToPaidUpgrade) {
      setSelectedTier(tier);
      setShowUpgradeDialog(true);
      return;
    }

    // Otherwise, show regular confirmation dialog
    setSelectedTier(tier);
    setShowConfirmDialog(true);
  };

  const handleTrialStartChoice = () => {
    // Close trial start dialog and show confirmation
    setShowTrialStartDialog(false);
    setShowConfirmDialog(true);
  };

  // Reset state when dialogs close
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setStartNow(false);
      setSelectedTier(null);
    }
    setShowConfirmDialog(open);
  };

  const handleTrialDialogClose = (open: boolean) => {
    if (!open) {
      setStartNow(false);
      setSelectedTier(null);
    }
    setShowTrialStartDialog(open);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedTier) return;
    
    const tier = selectedTier;
    setShowConfirmDialog(false);
    setShowUpgradeDialog(false);
    setLoading(tier);
    
    // Check if this is a paid-to-paid upgrade
    const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
    const currentTierIndex = tiers.indexOf(currentTier);
    const targetTierIndex = tiers.indexOf(tier);
    const isPaidToPaidUpgrade = currentTier !== "free" && targetTierIndex > currentTierIndex && isActive;
    
    try {
      // Use upgrade endpoint for paid-to-paid upgrades
      const endpoint = isPaidToPaidUpgrade 
        ? "/api/subscriptions/upgrade"
        : "/api/subscriptions/create-checkout";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tier,
          startNow: startNow, // Pass startNow flag if user chose to start immediately
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to upgrade your plan.",
          variant: "destructive",
        });
        router.push("/login");
        setLoading(null);
        return;
      }

      const responseText = await response.text();
      let data: any = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          throw new Error("Invalid response from server. Please try again.");
        }
      }

      if (!response.ok) {
        // Handle duplicate subscription error
        if (response.status === 409) {
          const errorMessage = data.message || "You already have an active subscription";
          toast({
            title: "Active Subscription Found",
            description: errorMessage + ". Please manage your existing subscription in the settings.",
            variant: "destructive",
          });
          setLoading(null);
          onOpenChange(false);
          // Refresh the page to show current subscription
          router.refresh();
          return;
        }
        const errorMessage = data.message || `Failed to create checkout session (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      // Handle paid-to-paid upgrade success
      if (isPaidToPaidUpgrade && data.success) {
        toast({
          title: "Upgrade Successful!",
          description: data.message || `Successfully upgraded to ${getTierInfo(tier).name}`,
        });
        onOpenChange(false);
        router.refresh();
        return;
      }

      // Handle direct subscription creation (when payment method exists)
      if (data.direct && data.success) {
        // Subscription was created directly with saved payment method
        onOpenChange(false);
        // Redirect with tier info for thank you message
        window.location.href = data.url || `/dashboard?subscription=success&tier=${tier}`;
        return;
      }

      const { url } = data;
      if (url) {
        // Close modal and redirect to Stripe Checkout
        onOpenChange(false);
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error: any) {
      console.error("Error upgrading subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Confirm Subscription
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedTier && (
                <>
                  You are about to subscribe to the <strong className="text-white">{getTierInfo(selectedTier).name}</strong> plan.
                  {(() => {
                    const isInTrial = company?.trialEnd && new Date(company.trialEnd) > new Date();
                    if (isInTrial && startNow) {
                      return (
                        <span className="block mt-2 text-amber-400">
                          ⚠️ Your trial will end now and you&apos;ll be charged ${TIER_CONFIG[selectedTier].price} immediately.
                        </span>
                      );
                    }
                    if (isInTrial && !startNow) {
                      return (
                        <span className="block mt-2 text-green-400">
                          ✓ Your subscription will start when your trial ends on {company?.trialEnd ? format(new Date(company.trialEnd), "MMMM d, yyyy") : "trial end date"}.
                        </span>
                      );
                    }
                    // Check if user is currently in a trial
                    const isInTrialCheck = company?.trialEnd && new Date(company.trialEnd) > new Date();
                    if (!hasUsedTrial && !isInTrialCheck) {
                      return (
                        <span className="block mt-2 text-green-400">
                          ✓ You&apos;ll get a 7-day free trial, then ${TIER_CONFIG[selectedTier].price}/month.
                        </span>
                      );
                    }
                    return (
                      <span className="block mt-2">
                        You&apos;ll be charged ${TIER_CONFIG[selectedTier].price}/month starting immediately.
                      </span>
                    );
                  })()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setSelectedTier(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Confirm & Subscribe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Paid-to-Paid Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="h-6 w-6 text-indigo-400" />
              Upgrade to {selectedTier ? getTierInfo(selectedTier).name : ""}
            </DialogTitle>
            <DialogDescription className="text-slate-400 pt-2">
              Upgrade your subscription to unlock more features
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* What happens */}
            <div className="p-4 bg-indigo-900/20 border border-indigo-700/50 rounded-lg">
              <p className="text-sm font-semibold text-indigo-300 mb-2">What happens when you upgrade:</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>Your subscription will be upgraded immediately</span>
                </li>
                {company?.trialEnd && new Date(company.trialEnd) > new Date() && (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Your current trial will end immediately</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>You&apos;ll be charged a prorated amount for the upgrade</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>You&apos;ll get instant access to all {selectedTier ? getTierInfo(selectedTier).name : ""} features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>Your billing cycle will continue as normal</span>
                </li>
              </ul>
            </div>

            {/* Pricing Info */}
            {selectedTier && (
              <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">Current Plan:</span>
                  <span className="text-sm font-semibold text-white">{getTierInfo(currentTier).name} - ${TIER_CONFIG[currentTier].price}/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">New Plan:</span>
                  <span className="text-sm font-semibold text-indigo-400">{getTierInfo(selectedTier).name} - ${TIER_CONFIG[selectedTier].price}/month</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-xs text-slate-400">
                    You&apos;ll be charged a prorated amount based on the difference between plans. 
                    Your next full billing cycle will be at the new rate.
                  </p>
                </div>
              </div>
            )}

            {/* Stripe Info */}
            <div className="p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
              <p className="text-xs text-slate-400 text-center">
                Your payment will be processed securely through Stripe. The upgrade will be applied immediately.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpgradeDialog(false);
                setSelectedTier(null);
              }}
              disabled={loading === selectedTier}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={loading === selectedTier}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex-1"
            >
              {loading === selectedTier ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Confirm Upgrade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {availableTiers.length === 0 ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Upgrade Plan</DialogTitle>
              <DialogDescription className="text-slate-400">
                You&apos;re already on the highest tier available!
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 bg-green-900/20 border border-green-700/50 rounded-lg">
              <p className="text-green-300 text-center">
                ✓ You&apos;re on the {getTierInfo(currentTier).name} plan - the highest tier available.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Upgrade Your Plan</DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose a plan to unlock more features and higher limits
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {availableTiers.map((tier) => {
            const tierInfo = getTierInfo(tier);
            // Only show trial badge if they haven't used a trial before and aren't currently in one
            const showTrialBadge = tierInfo.hasTrial;
            const hasBadges = tierInfo.popular || showTrialBadge;
            // Get features without trial text if they've used trial
            const features = getFeatures(tier, hasUsedTrial);
            return (
              <Card
                key={tier}
                className={`relative transition-all duration-300 border-2 ${
                  tierInfo.popular
                    ? "border-indigo-500 shadow-xl scale-105 bg-slate-800"
                    : "border-slate-700 bg-slate-800"
                }`}
              >
                {/* Badges */}
                {hasBadges && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 flex flex-col gap-2 items-center pointer-events-none">
                    {tierInfo.popular && (
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
                        Most Popular
                      </span>
                    )}
                    {showTrialBadge && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
                        7-Day Free Trial
                      </span>
                    )}
                  </div>
                )}
                <CardHeader className={hasBadges ? (tierInfo.popular && showTrialBadge ? "pt-12" : "pt-10") : "pt-4"}>
                  <CardTitle className="text-xl text-white">{tierInfo.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    ${tierInfo.price}/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4 min-h-[200px]">
                    {features.map((feature, index) => {
                      const isUpgradeHeader = feature.startsWith("Everything in");
                      return (
                        <li key={index} className="flex items-start gap-2">
                          {!isUpgradeHeader && (
                            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-xs ${isUpgradeHeader ? "text-indigo-400 font-bold italic" : "text-slate-300"}`}>
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tierInfo.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(tier)}
                    disabled={loading === tier}
                  >
                    {loading === tier ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to {tierInfo.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
          <p className="text-sm text-slate-400 text-center">
            {(() => {
              const isInTrialCheck = company?.trialEnd && new Date(company.trialEnd) > new Date();
              if (hasUsedTrial || isInTrialCheck) {
                return "Cancel anytime. Upgrade to unlock more features and higher limits.";
              }
              return "All plans include a 7-day free trial. Cancel anytime. No credit card required for trial.";
            })()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
      )}
    </>
  );
}

