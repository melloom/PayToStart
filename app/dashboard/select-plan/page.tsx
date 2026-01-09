"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CheckCircle2, Zap, Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TIER_CONFIG } from "@/lib/types";

// Pricing tiers - synced with TIER_CONFIG in lib/types.ts
const TIERS = [
  {
    id: "free" as const,
    name: "Basic",
    price: TIER_CONFIG.free.price,
    description: "Free plan with basic features",
    features: [
      "No contracts",
      "No templates",
      "Basic features",
      "Single company",
    ],
    limits: TIER_CONFIG.free.limits,
    cta: "Select Free Plan",
    popular: false,
    hasTrial: false,
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: TIER_CONFIG.starter.price,
    description: "For small contractors getting started",
    features: [
      "2 Contract Templates",
      "20 Contracts per month",
      "Click to Sign",
      "Email Delivery",
      "Basic Support",
    ],
    limits: TIER_CONFIG.starter.limits,
    cta: "Start Free Trial",
    popular: true,
    hasTrial: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: TIER_CONFIG.pro.price,
    description: "For growing businesses",
    features: [
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
    cta: "Start Free Trial",
    popular: false,
    hasTrial: true,
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: TIER_CONFIG.premium.price,
    description: "For large teams and enterprises",
    features: [
      "Everything in Pro, plus:",
      "Dropbox Sign Integration",
      "DocuSign Integration",
      "Multi-user Team Roles",
      "Stripe Connect Payouts",
      "Dedicated Support",
      "Custom Integrations",
    ],
    limits: TIER_CONFIG.premium.limits,
    cta: "Start Free Trial",
    popular: false,
    hasTrial: true,
  },
];

export default function SelectPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (tierId: string) => {
    setLoading(tierId);
    try {
      if (tierId === "free") {
        // Select free plan
        const response = await fetch("/api/subscriptions/select-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: tierId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to select plan");
        }

        toast({
          title: "Plan selected",
          description: "You've successfully selected the Basic plan. Welcome to Pay2Start!",
        });

        // Redirect to dashboard after successful plan selection
        router.push("/dashboard");
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

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Select Your Plan
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. You can upgrade or downgrade at any time.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={`relative flex flex-col ${
                tier.popular
                  ? "border-2 border-indigo-500 shadow-xl scale-105"
                  : "border-slate-700"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-2xl font-bold text-white">
                    {tier.name}
                  </CardTitle>
                  {tier.popular && (
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      POPULAR
                    </span>
                  )}
                </div>
                <CardDescription className="text-slate-400">
                  {tier.description}
                </CardDescription>
                {tier.hasTrial && (
                  <div className="mt-3 mb-2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      <Zap className="h-3 w-3" />
                      7-Day Free Trial
                    </span>
                  </div>
                )}
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-slate-400 ml-2">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSelectPlan(tier.id)}
                  disabled={loading !== null}
                  className={`w-full ${
                    tier.popular
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      : tier.id === "free"
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                  }`}
                >
                  {loading === tier.id ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {tier.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-indigo-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                All plans include:
              </h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Secure document storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Bank-level encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Email support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span>Cancel anytime</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

