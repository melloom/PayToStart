"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TIER_CONFIG } from "@/lib/types";
import type { SubscriptionTier } from "@/lib/types";

// Pricing tiers - synced with TIER_CONFIG in lib/types.ts
const TIERS = [
  {
    id: "free" as const,
    name: "Basic",
    price: TIER_CONFIG.free.price,
    description: "Free plan with basic features",
    features: [
      "3 Contracts (lifetime)",
      "No templates",
      "Basic features",
      "Single company",
    ],
    limits: TIER_CONFIG.free.limits,
    popular: false,
    hasTrial: false,
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: TIER_CONFIG.starter.price,
    description: "For small contractors getting started",
    features: [
      "7-Day Free Trial included",
      "2 Contract Templates",
      "20 Contracts per month",
      "Click to Sign",
      "Email Delivery",
      "Basic Support",
    ],
    limits: TIER_CONFIG.starter.limits,
    popular: true,
    hasTrial: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: TIER_CONFIG.pro.price,
    description: "For growing businesses",
    features: [
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
    limits: TIER_CONFIG.pro.limits,
    popular: false,
    hasTrial: true,
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: TIER_CONFIG.premium.price,
    description: "For large teams and enterprises",
    features: [
      "7-Day Free Trial included",
      "Everything in Pro, plus:",
      "Dropbox Sign Integration",
      "DocuSign Integration",
      "Multi-user Team Roles",
      "Stripe Connect Payouts",
      "Dedicated Support",
      "Custom Integrations",
    ],
    limits: TIER_CONFIG.premium.limits,
    popular: false,
    hasTrial: true,
  },
];

export default function SelectPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Check for cancelled subscription parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "cancelled") {
      toast({
        title: "Subscription cancelled",
        description: "You can select a plan anytime. No charges were made.",
        variant: "default",
      });
      // Clean up URL
      router.replace("/dashboard/select-plan", { scroll: false });
    }
  }, [router, toast]);

  const handleSelectPlan = async (tierId: SubscriptionTier) => {
    // Prevent multiple simultaneous calls
    if (loading || redirecting) {
      return;
    }

    setLoading(tierId);
    try {
      if (tierId === "free") {
        // For Basic plan, just set it directly
        const response = await fetch("/api/subscriptions/select-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: tierId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to select plan");
        }

        // Verify the plan was actually selected by checking the response
        if (!data.success) {
          throw new Error(data.message || "Failed to select plan");
        }

        toast({
          title: "Plan selected!",
          description: "You've selected the Basic plan. You can upgrade anytime from your dashboard.",
        });

        // Prevent multiple redirects
        if (redirecting) return;
        setRedirecting(true);

        // Verify plan selection was successful before redirecting
        // Add a small delay to ensure database update propagates
        setTimeout(async () => {
          try {
            // Double-check that plan was selected by verifying with the server
            const verifyResponse = await fetch("/api/subscriptions/verify-plan", {
              method: "GET",
              cache: "no-store", // Ensure fresh data
            });
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              if (verifyData.planSelected === true) {
                // Plan is confirmed selected, safe to redirect
                router.replace("/dashboard");
              } else {
                // Plan not actually selected, show error and stay on page
                toast({
                  title: "Error",
                  description: "Plan selection was not confirmed. Please try again.",
                  variant: "destructive",
                });
                setRedirecting(false);
                setLoading(null);
              }
            } else {
              // Verification failed, show error
              toast({
                title: "Error",
                description: "Could not verify plan selection. Please try again.",
                variant: "destructive",
              });
              setRedirecting(false);
              setLoading(null);
            }
          } catch (verifyError) {
            console.error("Error verifying plan selection:", verifyError);
            // If verification fails, show error instead of redirecting
            toast({
              title: "Error",
              description: "Could not verify plan selection. Please try again.",
              variant: "destructive",
            });
            setRedirecting(false);
            setLoading(null);
          }
        }, 300);
      } else {
        // For paid plans, redirect to Stripe checkout
        const response = await fetch("/api/subscriptions/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: tierId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create subscription");
        }

        // Prevent multiple redirects
        if (redirecting) return;
        setRedirecting(true);

        // Redirect to Stripe Checkout - use window.location.replace for external redirects
        if (data.url) {
          window.location.replace(data.url);
        } else {
          throw new Error("No checkout URL returned");
        }
      }
    } catch (error: any) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(null);
      setRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Select a plan to get started. You can upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TIERS.map((tier) => {
            const hasBadges = tier.popular || tier.hasTrial;
            const badgeCount = (tier.popular ? 1 : 0) + (tier.hasTrial ? 1 : 0);
            return (
              <Card
                key={tier.id}
                className={`relative transition-all duration-300 border-2 ${
                  tier.popular
                    ? "border-indigo-500 shadow-xl scale-105 bg-slate-800"
                    : "border-slate-700 bg-slate-800"
                }`}
              >
                {/* Badges - positioned above card with proper spacing */}
                {hasBadges && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col gap-2 items-center pointer-events-none">
                    {tier.popular && (
                      <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
                        Most Popular
                      </span>
                    )}
                    {tier.hasTrial && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap">
                        7-Day Free Trial
                      </span>
                    )}
                  </div>
                )}
                <CardHeader className={hasBadges ? (badgeCount === 2 ? "pt-12" : "pt-10") : "pt-4"}>
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <CardDescription className="text-slate-400">{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    <span className="text-slate-400 ml-1">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => {
                      const isUpgradeHeader = feature.startsWith("Everything in");
                      return (
                        <li key={index} className="flex items-start gap-2">
                          {!isUpgradeHeader && (
                            <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-medium ${isUpgradeHeader ? "text-indigo-400 font-bold italic" : "text-slate-300"}`}>
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(tier.id)}
                    disabled={loading === tier.id}
                  >
                    {loading === tier.id ? (
                      "Processing..."
                    ) : tier.id === "free" ? (
                      "Select Basic Plan"
                    ) : (
                      "Start Free Trial"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">All Plans Include</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-500/20 mx-auto mb-4">
                <Shield className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Secure Signatures</h3>
              <p className="text-slate-400 text-sm">
                Bank-level security with encrypted signatures and document storage.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-500/20 mx-auto mb-4">
                <Zap className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Fast Setup</h3>
              <p className="text-slate-400 text-sm">
                Get started in minutes. No complex setup or training required.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-500/20 mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Payment Integration</h3>
              <p className="text-slate-400 text-sm">
                Collect deposits and payments seamlessly with Stripe integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
