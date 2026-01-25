"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, CreditCard, Calendar, Zap, Shield, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import ManageSubscription from "../subscription/manage-subscription";
import SubscriptionActions from "../subscription/subscription-actions";
import UpgradePlanModal from "./upgrade-plan-modal";
import SubscriptionCardInput from "./subscription-card-input";
import type { Company, SubscriptionTier } from "@/lib/types";
import { TIER_CONFIG } from "@/lib/types";
import InvoiceHistory from "../subscription/invoice-history";

interface SubscriptionTabProps {
  customerId: string | null | undefined;
  effectiveTier: string;
  tierConfig: any;
  company: Company;
  isActive: boolean;
  currentTier: SubscriptionTier;
  templatesUsed: number;
  contractsUsed: number;
}

export default function SubscriptionTab({
  customerId,
  effectiveTier,
  tierConfig,
  company,
  isActive,
  currentTier,
  templatesUsed,
  contractsUsed,
}: SubscriptionTabProps) {
  const getTierDisplayName = (tier: SubscriptionTier) => {
    const names: Record<SubscriptionTier, string> = {
      free: "Free",
      starter: "Starter",
      pro: "Pro",
      premium: "Premium",
    };
    return names[tier];
  };

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Use effectiveTier if currentTier is "free" but user has an active subscription
  // This handles cases where the database hasn't updated yet
  const actualCurrentTier = (currentTier === "free" && isActive && effectiveTier !== "free") 
    ? (effectiveTier as SubscriptionTier) 
    : currentTier;

  const getStatusBadge = () => {
    if (actualCurrentTier === "free") {
      return <Badge className="bg-slate-700 text-slate-300 border-slate-600">Free Plan</Badge>;
    }

    if (!isActive) {
      return <Badge className="bg-red-900/50 text-red-300 border-red-700">Inactive</Badge>;
    }

    if (company.subscriptionCancelAtPeriodEnd) {
      return <Badge className="bg-amber-900/50 text-amber-300 border-amber-700">Cancelling</Badge>;
    }

    return <Badge className="bg-green-900/50 text-green-300 border-green-700">Active</Badge>;
  };

  // Determine if user has used trial or is currently in trial
  // If trialEnd exists (past or future), they shouldn't get another trial
  const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
  const hasUsedTrialBefore = company.trialEnd && new Date(company.trialEnd) <= new Date();
  const hasUsedTrial = !!company.trialEnd; // If trialEnd exists at all, they've used/are using a trial

  return (
    <>
      <UpgradePlanModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        currentTier={actualCurrentTier}
        hasUsedTrial={hasUsedTrial} // If trialEnd exists (past or future), no more trials
        company={company}
        customerId={customerId}
        isActive={isActive} // Pass isActive to prevent upgrades when already subscribed
      />
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Current Plan</CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    Your active subscription details
                  </CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Cancellation Notice */}
                {company.subscriptionCancelAtPeriodEnd && company.subscriptionCurrentPeriodEnd && (
                  <div className="p-4 bg-amber-900/30 border-2 border-amber-700/50 rounded-lg backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-300 mb-1">
                          Subscription Cancelled
                        </p>
                        <p className="text-sm text-amber-200">
                          Your subscription will end on {format(company.subscriptionCurrentPeriodEnd, "MMMM d, yyyy")}. 
                          You&apos;ll continue to have full access until then. You can resume your subscription anytime before it ends.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plan Info */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-2 border-indigo-500/30 rounded-xl backdrop-blur-sm">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {getTierDisplayName(actualCurrentTier)}
                    </h3>
                    <p className="text-slate-300 mb-2">
                      {TIER_CONFIG[actualCurrentTier].price === 0 ? "Free forever" : `$${TIER_CONFIG[actualCurrentTier].price}/month`}
                    </p>
                    {(() => {
                      // Check if in trial
                      const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
                      const trialEndDate = company.trialEnd ? new Date(company.trialEnd) : null;
                      const periodEndDate = company.subscriptionCurrentPeriodEnd ? new Date(company.subscriptionCurrentPeriodEnd) : null;

                      if (isInTrial && trialEndDate) {
                        // Show trial end date and when they'll be charged
                        return (
                          <div className="space-y-1">
                            <p className="text-sm text-amber-400">
                              Trial ends: {format(trialEndDate, "MMM d, yyyy")}
                            </p>
                            <p className="text-sm text-slate-400">
                              First charge: {format(trialEndDate, "MMM d, yyyy")}
                            </p>
                          </div>
                        );
                      } else if (periodEndDate) {
                        // Show renewal date
                        return (
                          <p className="text-sm text-slate-400">
                            {company.subscriptionCancelAtPeriodEnd
                              ? `Cancels on ${format(periodEndDate, "MMM d, yyyy")}`
                              : `Renews on ${format(periodEndDate, "MMM d, yyyy")}`}
                          </p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="text-right">
                    {actualCurrentTier !== "free" && (
                      <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ${TIER_CONFIG[actualCurrentTier].price}
                        <span className="text-lg text-slate-400">/mo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Details Section */}
                <div>
                  <h4 className="font-semibold text-white mb-4">Plan Details</h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">Contract Templates</span>
                        <FileText className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">
                          {tierConfig.limits.templates === null ? "∞" : tierConfig.limits.templates}
                        </span>
                        <span className="text-sm text-slate-400">
                          {tierConfig.limits.templates === null
                            ? "Unlimited"
                            : tierConfig.limits.templates === 0
                            ? "Not included"
                            : "templates"}
                        </span>
                      </div>
                      {tierConfig.limits.templates !== null && tierConfig.limits.templates > 0 && (
                        <div className="mt-2 text-xs text-slate-400">
                          Using: {templatesUsed} of {tierConfig.limits.templates}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">
                          {actualCurrentTier === "free" ? "Contracts (lifetime)" : "Contracts per Month"}
                        </span>
                        <FileText className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">
                          {tierConfig.limits.contracts === null ? "∞" : tierConfig.limits.contracts}
                        </span>
                        <span className="text-sm text-slate-400">
                          {tierConfig.limits.contracts === null
                            ? "Unlimited"
                            : tierConfig.limits.contracts === 0
                            ? "Not included"
                            : actualCurrentTier === "free"
                            ? "contracts only"
                            : "contracts"}
                        </span>
                      </div>
                      {tierConfig.limits.contracts !== null && tierConfig.limits.contracts > 0 && (
                        <div className="mt-2 text-xs text-slate-400">
                          {actualCurrentTier === "free" 
                            ? `Used: ${contractsUsed} of ${tierConfig.limits.contracts} (lifetime)`
                            : `Used this month: ${contractsUsed} of ${tierConfig.limits.contracts}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Included Features */}
                <div>
                  <h4 className="font-semibold text-white mb-4">Included Features</h4>
                  {(() => {
                    // Get tier-specific features list
                    const getTierFeatures = (tier: SubscriptionTier): string[] => {
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
                    };

                    const features = getTierFeatures(actualCurrentTier);

                    if (features.length === 0) {
                      return (
                        <div className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                          <p className="text-sm text-slate-400 text-center">
                            No features configured for this plan.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        {features.map((feature, index) => {
                          const isUpgradeHeader = feature.startsWith("Everything in");
                          return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {!isUpgradeHeader ? (
                                <>
                                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                  <span className="text-slate-300">{feature}</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                                  <span className="text-indigo-400 font-semibold italic">{feature}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <SubscriptionActions company={company} currentTier={actualCurrentTier} isActive={isActive} />
              </div>
            </CardContent>
          </Card>

          {/* Invoice History - Below Current Plan */}
          {actualCurrentTier !== "free" && isActive && customerId && (
            <InvoiceHistory customerId={customerId} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscribe/Upgrade Plan Card */}
          {actualCurrentTier === "free" ? (
            <Card className="border-2 border-indigo-500/30 shadow-xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Subscribe to a Plan</CardTitle>
                <CardDescription className="text-slate-300">
                  Unlock more features and higher limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold"
                >
                  Subscribe Now
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : actualCurrentTier !== "premium" ? (
            <Card className="border-2 border-indigo-500/30 shadow-xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Upgrade Plan</CardTitle>
                <CardDescription className="text-slate-300">
                  Unlock more features and higher limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold"
                >
                  Upgrade Plan
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {/* Payment Method Card - Show for all users */}
          <SubscriptionCardInput
            customerId={customerId}
            hasActiveSubscription={actualCurrentTier !== "free" && isActive}
          />

          {/* Manage Subscription - Only show for active paid subscriptions (not free tier) */}
          {actualCurrentTier !== "free" && isActive && customerId && (
            <ManageSubscription customerId={customerId} />
          )}

          {/* Support Card */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 mb-4">
                Have questions about your subscription? Our support team is here to help.
              </p>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}

