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
    if (tier === currentTier) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start upgrade process",
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

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      {/* Upgrade/Downgrade Buttons */}
      <div className="flex flex-wrap gap-3">
        {nextTier && (
          <Button
            onClick={() => handleUpgrade(nextTier)}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade to {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
              </>
            )}
          </Button>
        )}

        {currentTierIndex > 0 && (
          <Button
            onClick={() => handleUpgrade(tiers[currentTierIndex - 1])}
            disabled={isLoading}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Downgrade Plan
          </Button>
        )}

        {!nextTier && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm font-medium text-green-700">
              ✓ You&apos;re on the highest tier
            </span>
          </div>
        )}
      </div>

      {/* Cancel/Resume Subscription */}
      {currentTier !== "free" && (
        <div className="pt-4 border-t border-slate-200">
          {company.subscriptionCancelAtPeriodEnd ? (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-2">
                  Your subscription is set to cancel at the end of your billing period.
                </p>
                <Button
                  onClick={handleResume}
                  disabled={isLoading}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
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
              className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
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

