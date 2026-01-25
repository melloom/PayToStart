"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CreditCard, X, AlertTriangle, Calendar, Zap } from "lucide-react";
import { format } from "date-fns";
import type { Company, SubscriptionTier } from "@/lib/types";
import { TIER_CONFIG } from "@/lib/types";

interface SubscriptionActionsProps {
  company: Company;
  currentTier: SubscriptionTier;
  isActive: boolean;
}

export default function SubscriptionActions({
  company,
  currentTier,
  isActive,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [downgradeTier, setDowngradeTier] = useState<SubscriptionTier | null>(null);
  const [isDowngrading, setIsDowngrading] = useState(false);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === currentTier) {
      toast({
        title: "Already on this plan",
        description: `You are already on the ${tier} plan.`,
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      // Handle specific error cases first (before reading body)
      if (response.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to upgrade your plan.",
          variant: "destructive",
        });
        router.push("/login");
        setIsLoading(false);
        return;
      }

      // Read response body once
      const responseText = await response.text();
      let data: any = {};

      // Try to parse JSON response
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError, "Response:", responseText);
          throw new Error("Invalid response from server. Please try again.");
        }
      }

      // Check if response is ok after parsing
      if (!response.ok) {
        // Handle duplicate subscription error
        if (response.status === 409) {
          const errorMessage = data.message || "You already have an active subscription";
          toast({
            title: "Active Subscription Found",
            description: errorMessage + ". Please manage your existing subscription in the settings.",
            variant: "destructive",
          });
          setIsLoading(false);
          router.refresh();
          return;
        }
        const errorMessage = data.message || `Failed to create checkout session (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      // Handle successful response
      const { url } = data;
      if (url) {
        // Redirect to Stripe Checkout
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
      setIsLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel subscription");
      }

      const data = await response.json();

      toast({
        title: "Subscription Cancelled",
        description: `Your subscription will remain active until ${company.subscriptionCurrentPeriodEnd ? format(company.subscriptionCurrentPeriodEnd, "MMMM d, yyyy") : "the end of your billing period"}. You'll continue to have full access until then.`,
      });

      setShowCancelDialog(false);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/resume", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to resume subscription");
      }

      toast({
        title: "Subscription Resumed",
        description: "Your subscription has been reactivated.",
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resume subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngradeClick = (tier: SubscriptionTier) => {
    setDowngradeTier(tier);
    setShowDowngradeDialog(true);
  };

  const handleDowngrade = async () => {
    if (!downgradeTier) {
      toast({
        title: "Error",
        description: "No downgrade tier selected",
        variant: "destructive",
      });
      return;
    }

    setIsDowngrading(true);
    try {
      const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
      
      const response = await fetch("/api/subscriptions/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tier: downgradeTier,
          instant: isInTrial 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to downgrade subscription");
      }

      const data = await response.json();

      toast({
        title: "Plan Downgraded",
        description: data.message || (isInTrial 
          ? "Your plan has been downgraded and your trial has ended." 
          : "Your plan will be downgraded at the end of your billing period."),
      });

      setShowDowngradeDialog(false);
      setDowngradeTier(null);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to downgrade subscription",
        variant: "destructive",
      });
    } finally {
      setIsDowngrading(false);
    }
  };

  const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
  const currentTierIndex = tiers.indexOf(currentTier);
  // Only show next tier if it exists and is different from current tier
  const nextTier = currentTierIndex >= 0 && currentTierIndex < tiers.length - 1 
    ? tiers[currentTierIndex + 1] 
    : null;

  // Get display name for tier
  const getTierDisplayName = (tier: SubscriptionTier) => {
    const names: Record<SubscriptionTier, string> = {
      free: "Free",
      starter: "Starter",
      pro: "Pro",
      premium: "Premium",
    };
    return names[tier];
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-700">
      {/* Upgrade/Downgrade Buttons */}
      <div className="flex flex-wrap gap-3">
        {nextTier && (
          <Button
            onClick={() => handleUpgrade(nextTier)}
            disabled={isLoading || isCancelling}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade to {getTierDisplayName(nextTier)}
              </>
            )}
          </Button>
        )}

        {currentTierIndex > 0 && (
          <Button
            onClick={() => handleDowngradeClick(tiers[currentTierIndex - 1])}
            disabled={isLoading || isDowngrading}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
          >
            Downgrade Plan
          </Button>
        )}

        {!nextTier && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-lg backdrop-blur-sm">
            <span className="text-sm font-medium text-green-300">
              ✓ You&apos;re on the highest tier
            </span>
          </div>
        )}
      </div>

      {/* Cancel/Resume Subscription */}
      {currentTier !== "free" && (
        <div className="pt-4 border-t border-slate-700">
          {company.subscriptionCancelAtPeriodEnd ? (
            <div className="space-y-3">
              <div className="p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-amber-300 mb-2">
                  Your subscription is set to cancel at the end of your billing period.
                </p>
                <Button
                  onClick={handleResume}
                  disabled={isLoading}
                  variant="outline"
                  className="border-amber-600 text-amber-300 hover:bg-amber-900/50 hover:border-amber-500"
                >
                  Resume Subscription
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                onClick={handleCancelClick}
                disabled={isCancelling}
                variant="outline"
                className="border-red-600 text-red-300 hover:bg-red-900/50 hover:border-red-500"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>

              {/* Cancel Confirmation Dialog */}
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <DialogTitle className="text-xl font-bold">Wait! Before You Cancel...</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400 pt-2">
                      We&apos;d hate to see you go. Here&apos;s what you&apos;ll lose and a special offer to stay.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4 space-y-4">
                    {/* Special Offer */}
                    <div className="p-5 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 border-2 border-indigo-500/50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-white mb-1">
                            🎁 Special Offer: Stay and Save 20%!
                          </p>
                          <p className="text-sm text-indigo-200">
                            Keep your subscription and we&apos;ll apply a <strong className="text-white">20% discount</strong> to your next 3 months. 
                            That&apos;s significant savings while keeping all your features!
                          </p>
                          <Button
                            onClick={() => {
                              setShowCancelDialog(false);
                              toast({
                                title: "Great Choice!",
                                description: "Contact support@pay2start.com to apply your 20% discount. We'll get it set up right away!",
                              });
                            }}
                            className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Yes, I&apos;ll Stay with 20% Off!
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Access Until Date */}
                    <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-300 mb-1">
                            You&apos;ll keep full access until:
                          </p>
                          <p className="text-sm text-amber-200">
                            {company.subscriptionCurrentPeriodEnd
                              ? format(company.subscriptionCurrentPeriodEnd, "EEEE, MMMM d, yyyy")
                              : "the end of your billing period"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* What You'll Lose */}
                    <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <p className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                        <X className="h-4 w-4" />
                        What You&apos;ll Lose at the End of Your Subscription:
                      </p>
                      <div className="space-y-2">
                        {currentTier === "starter" && (
                          <>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>AI Contract Generation</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Contract Templates (limited to 3 contracts only)</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>20 Contracts per month (back to 3 contracts lifetime)</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Email Delivery features</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Priority Support</span>
                            </div>
                          </>
                        )}
                        {currentTier === "pro" && (
                          <>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Unlimited Templates & Contracts</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>AI Contract Generation</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>SMS Reminders</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>File Attachments</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Custom Branding</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Download All Contracts</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Priority Support</span>
                            </div>
                          </>
                        )}
                        {currentTier === "premium" && (
                          <>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Everything in Pro (Unlimited Templates, Contracts, AI, etc.)</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Dropbox Sign Integration</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>DocuSign Integration</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Multi-user Team Roles</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Stripe Connect Payouts</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Dedicated Support</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>Custom Integrations</span>
                            </div>
                          </>
                        )}
                        <div className="mt-3 pt-3 border-t border-red-700/50">
                          <p className="text-sm font-semibold text-red-300">
                            You&apos;ll be moved to the Free plan with only 3 contracts lifetime and no templates.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* What Happens */}
                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="font-semibold">What happens when you cancel:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400 ml-2">
                        <li>Your subscription will remain active until the end of your billing period</li>
                        <li>You&apos;ll continue to have full access to all features until then</li>
                        <li>No further charges will be made</li>
                        <li>You can resume your subscription anytime before it ends</li>
                        <li>After the period ends, you&apos;ll lose all the features listed above</li>
                      </ul>
                    </div>
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(false)}
                      disabled={isCancelling}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white flex-1"
                    >
                      Keep My Subscription
                    </Button>
                    <Button
                      onClick={handleCancelConfirm}
                      disabled={isCancelling}
                      className="bg-red-600 hover:bg-red-700 text-white flex-1"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Yes, Cancel Anyway
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )}

      {/* Downgrade Confirmation Dialog */}
      <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <DialogTitle className="text-xl font-bold">
                {(() => {
                  const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
                  return isInTrial ? "Downgrade Plan (Trial)" : "Downgrade Plan";
                })()}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-400 pt-2">
              {(() => {
                const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
                if (isInTrial) {
                  return "Downgrading will end your trial immediately. Are you sure you want to continue?";
                }
                return "Your plan will be downgraded at the end of your current billing period. You'll keep full access until then.";
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {(() => {
              const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
              const currentFeatures = getTierFeatures(currentTier);
              const downgradeFeatures = downgradeTier ? getTierFeatures(downgradeTier) : [];
              
              // Find features that will be lost
              const lostFeatures = currentFeatures.filter(f => 
                !downgradeFeatures.some(df => df === f || df.includes(f))
              );

              return (
                <>
                  {/* Trial Warning */}
                  {isInTrial && (
                    <div className="p-4 bg-red-900/20 border-2 border-red-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-red-300 mb-1">
                            ⚠️ Trial Will End Immediately
                          </p>
                          <p className="text-sm text-red-200">
                            If you downgrade now, your 7-day free trial will end immediately and you&apos;ll lose access to all premium features.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Downgrade Info */}
                  {!isInTrial && company.subscriptionCurrentPeriodEnd && (
                    <div className="p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-300 mb-1">
                            Downgrade Scheduled
                          </p>
                          <p className="text-sm text-amber-200">
                            Your plan will be downgraded on {format(company.subscriptionCurrentPeriodEnd, "EEEE, MMMM d, yyyy")}. 
                            You&apos;ll continue to have full access to your current plan until then.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* What You'll Lose */}
                  {lostFeatures.length > 0 && (
                    <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <p className="font-semibold text-red-300 mb-3 flex items-center gap-2">
                        <X className="h-4 w-4" />
                        What You&apos;ll Lose:
                      </p>
                      <div className="space-y-2">
                        {lostFeatures.map((feature, index) => {
                          const isUpgradeHeader = feature.startsWith("Everything in");
                          if (isUpgradeHeader) return null;
                          return (
                            <div key={index} className="flex items-start gap-2 text-sm text-red-200">
                              <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* New Plan Info */}
                  {downgradeTier && (
                    <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                      <p className="font-semibold text-slate-300 mb-2">
                        Moving to: {getTierDisplayName(downgradeTier)} Plan
                      </p>
                      <p className="text-sm text-slate-400">
                        ${TIER_CONFIG[downgradeTier].price}/month
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDowngradeDialog(false);
                setDowngradeTier(null);
              }}
              disabled={isDowngrading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white flex-1"
            >
              Keep Current Plan
            </Button>
            <Button
              onClick={handleDowngrade}
              disabled={isDowngrading}
              className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
            >
              {isDowngrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downgrading...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {(() => {
                    const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
                    return isInTrial ? "Yes, Downgrade Now" : "Yes, Schedule Downgrade";
                  })()}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to get tier features
function getTierFeatures(tier: SubscriptionTier): string[] {
  const baseFeatures: Record<SubscriptionTier, string[]> = {
    free: [
      "3 Contracts only (lifetime)",
      "No templates",
      "Basic features",
    ],
    starter: [
      "2 Contract Templates",
      "20 Contracts per month",
      "AI Contract Generation",
      "Click to Sign",
      "Email Delivery",
      "Basic Support",
    ],
    pro: [
      "Unlimited Templates",
      "Unlimited Contracts",
      "AI Contract Generation",
      "Click to Sign",
      "Email Delivery",
      "SMS Reminders",
      "File Attachments",
      "Custom Branding",
      "Download All Contracts",
      "Priority Support",
    ],
    premium: [
      "Everything in Pro, plus:",
      "Dropbox Sign Integration",
      "DocuSign Integration",
      "Multi-user Team Roles",
      "Stripe Connect Payouts",
      "Dedicated Support",
      "Custom Integrations",
    ],
  };
  return baseFeatures[tier] || [];
}
