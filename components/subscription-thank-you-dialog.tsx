"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";

export function SubscriptionThankYouDialog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<SubscriptionTier | null>(null);

  useEffect(() => {
    const subscriptionSuccess = searchParams.get("subscription");
    const tierParam = searchParams.get("tier") as SubscriptionTier | null;
    
    if (subscriptionSuccess === "success" && tierParam) {
      setTier(tierParam);
      setOpen(true);
      
      // Remove query params from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("subscription");
      url.searchParams.delete("tier");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  const getTierFeatures = (tier: SubscriptionTier): string[] => {
    const features: Record<SubscriptionTier, string[]> = {
      free: [],
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
    return features[tier] || [];
  };

  const getTierName = (tier: SubscriptionTier): string => {
    const names: Record<SubscriptionTier, string> = {
      free: "Free",
      starter: "Starter",
      pro: "Pro",
      premium: "Premium",
    };
    return names[tier] || tier;
  };

  if (!tier || tier === "free") {
    return null;
  }

  const features = getTierFeatures(tier);
  const tierName = getTierName(tier);
  const tierConfig = TIER_CONFIG[tier];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full p-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Thank You for Subscribing!
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300 text-lg mt-2">
            Welcome to the <strong className="text-white">{tierName}</strong> plan
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <p className="text-slate-300 text-center mb-4">
              You now have access to all these amazing features:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => {
                const isHeader = feature.includes("Everything in") || feature.includes("plus:");
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      isHeader ? "md:col-span-2" : ""
                    }`}
                  >
                    {!isHeader && (
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={`${
                        isHeader
                          ? "text-indigo-400 font-bold text-sm"
                          : "text-slate-200 text-sm"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg p-4 border border-indigo-500/30">
            <div className="text-center">
              <p className="text-slate-300 text-sm mb-2">
                Your subscription is active at <strong className="text-white">${tierConfig.price}/month</strong>
              </p>
              <p className="text-slate-400 text-xs">
                You can manage your subscription anytime from Settings
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => setOpen(false)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          >
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
