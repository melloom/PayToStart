"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CheckCircle2, ArrowLeft, Zap, Shield, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
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
      "3 Contracts (lifetime)",
      "No templates",
      "Basic features",
      "Single company",
    ],
    limits: TIER_CONFIG.free.limits,
    cta: "Current Plan",
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
    cta: "Choose Plan",
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
    cta: "Choose Plan",
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
    cta: "Choose Plan",
    popular: false,
    hasTrial: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const [redirecting, setRedirecting] = useState(false);

  const handleSubscribe = async (tierId: string) => {
    // Prevent multiple simultaneous calls
    if (loading || redirecting) {
      return;
    }

    // Don't allow subscribing to free tier
    if (tierId === "free") {
      return;
    }

    setLoading(tierId);
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          toast({
            title: "Authentication required",
            description: "Please log in to subscribe to a plan.",
            variant: "destructive",
          });
          // Use replace to avoid history stack issues
          router.replace("/login");
          setLoading(null);
          return;
        }
        throw new Error(data.message || "Failed to create subscription");
      }

      // Prevent multiple redirects
      if (redirecting) return;
      setRedirecting(true);

      // Redirect to Stripe Checkout - use replace to avoid history issues
      if (data.url) {
        window.location.replace(data.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
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
    <>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Simple, Transparent
            <span className="text-indigo-400"> Pricing</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All paid plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={`relative transition-all duration-300 ${
                tier.popular
                  ? "border-primary border-2 shadow-lg scale-105"
                  : "border"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  {tier.popular && (
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                </div>
                <CardDescription className="text-slate-400">{tier.description}</CardDescription>
                {tier.hasTrial && (
                  <div className="mt-3 mb-2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      <Zap className="h-3 w-3" />
                      7-Day Free Trial
                    </span>
                  </div>
                )}
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
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading === tier.id || tier.id === "free"}
                >
                  {loading === tier.id ? (
                    "Processing..."
                  ) : tier.id === "free" ? (
                    tier.cta
                  ) : (
                    tier.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">All Plans Include</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure Signatures</h3>
            <p className="text-slate-400 text-sm">
              Bank-level security with encrypted signatures and document storage.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Fast Setup</h3>
            <p className="text-slate-400 text-sm">
              Get started in minutes. No complex setup or training required.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Payment Integration</h3>
            <p className="text-slate-400 text-sm">
              Collect deposits and payments seamlessly with Stripe integration.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 mb-6">
            <span className="text-3xl">❓</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about our plans and pricing
          </p>
        </div>
        
        <div className="grid gap-6">
          <div className="group relative bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  Can I change plans later?
                </h3>
                <p className="text-slate-400 leading-relaxed text-base">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  What happens after the trial?
                </h3>
                <p className="text-slate-400 leading-relaxed text-base">
                  After your 7-day free trial, you&apos;ll need to upgrade to a paid plan to continue using Pay2Start. You can cancel anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-slate-800 border-2 border-slate-700 rounded-2xl p-8 hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                  Do you offer refunds?
                </h3>
                <p className="text-slate-400 leading-relaxed text-base">
                  We offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/50 rounded-full">
            <span className="text-sm font-medium text-slate-300">Still have questions?</span>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-indigo-900/20 rounded-2xl p-12 text-center border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Start your 7-day free trial. No credit card required.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

