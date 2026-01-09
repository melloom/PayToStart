"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, X } from "lucide-react";
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

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period.")) {
      return;
    }

    setIsCancelling(true);
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

  const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
  const currentTierIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentTierIndex + 1];

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
            onClick={() => handleUpgrade(tiers[currentTierIndex - 1])}
            disabled={isLoading}
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
            <Button
              onClick={handleCancel}
              disabled={isCancelling}
              variant="outline"
              className="border-red-600 text-red-300 hover:bg-red-900/50 hover:border-red-500"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

