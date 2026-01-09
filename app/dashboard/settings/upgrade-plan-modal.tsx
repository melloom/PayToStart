"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TIER_CONFIG } from "@/lib/types";
import type { SubscriptionTier } from "@/lib/types";

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: SubscriptionTier;
}

export default function UpgradePlanModal({
  open,
  onOpenChange,
  currentTier,
}: UpgradePlanModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);

  const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
  const currentTierIndex = tiers.indexOf(currentTier);
  const availableTiers = tiers.slice(currentTierIndex + 1); // Only show tiers above current

  const getTierInfo = (tier: SubscriptionTier) => {
    const config = TIER_CONFIG[tier];
    const names: Record<SubscriptionTier, string> = {
      free: "Basic",
      starter: "Starter",
      pro: "Pro",
      premium: "Premium",
    };

    const features: Record<SubscriptionTier, string[]> = {
      free: ["3 Contracts (lifetime)", "No templates", "Basic features"],
      starter: [
        "7-Day Free Trial included",
        "2 Contract Templates",
        "20 Contracts per month",
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

    return {
      name: names[tier],
      price: config.price,
      features: features[tier],
      popular: tier === "starter",
      hasTrial: tier !== "free",
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

    setLoading(tier);
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
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
        const errorMessage = data.message || `Failed to create checkout session (Status: ${response.status})`;
        throw new Error(errorMessage);
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

  if (availableTiers.length === 0) {
    return (
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
    );
  }

  return (
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
            const hasBadges = tierInfo.popular || tierInfo.hasTrial;
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
                    {tierInfo.hasTrial && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
                        7-Day Free Trial
                      </span>
                    )}
                  </div>
                )}
                <CardHeader className={hasBadges ? (tierInfo.popular && tierInfo.hasTrial ? "pt-12" : "pt-10") : "pt-4"}>
                  <CardTitle className="text-xl text-white">{tierInfo.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    ${tierInfo.price}/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4 min-h-[200px]">
                    {tierInfo.features.map((feature, index) => {
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
            All plans include a 7-day free trial. Cancel anytime. No credit card required for trial.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

