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
import type { Company, SubscriptionTier } from "@/lib/types";
import { TIER_CONFIG } from "@/lib/types";

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

  const getStatusBadge = () => {
    if (currentTier === "free") {
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

  return (
    <>
      <UpgradePlanModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        currentTier={currentTier}
        hasUsedTrial={!!company.trialEnd} // If trialEnd exists, they've used a trial before
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
                      {getTierDisplayName(currentTier)}
                    </h3>
                    <p className="text-slate-300 mb-2">
                      {TIER_CONFIG[currentTier].price === 0 ? "Free forever" : `$${TIER_CONFIG[currentTier].price}/month`}
                    </p>
                    {company.subscriptionCurrentPeriodEnd && (
                      <p className="text-sm text-slate-400">
                        {company.subscriptionCancelAtPeriodEnd
                          ? `Cancels on ${format(company.subscriptionCurrentPeriodEnd, "MMM d, yyyy")}`
                          : `Renews on ${format(company.subscriptionCurrentPeriodEnd, "MMM d, yyyy")}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {currentTier !== "free" && (
                      <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ${TIER_CONFIG[currentTier].price}
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
                        <span className="text-sm font-medium text-slate-300">Contracts per Month</span>
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
                            : "contracts"}
                        </span>
                      </div>
                      {tierConfig.limits.contracts !== null && tierConfig.limits.contracts > 0 && (
                        <div className="mt-2 text-xs text-slate-400">
                          Used this month: {contractsUsed} of {tierConfig.limits.contracts}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Included Features */}
                <div>
                  <h4 className="font-semibold text-white mb-4">Included Features</h4>
                  {(() => {
                    const allFeatures = Object.entries(tierConfig.limits.features);
                    const featureNames: Record<string, string> = {
                      clickToSign: "Click to Sign",
                      emailDelivery: "Email Delivery",
                      smsReminders: "SMS Reminders",
                      attachments: "File Attachments",
                      customBranding: "Custom Branding",
                      downloadAllContracts: "Download All Contracts",
                      dropboxSignIntegration: "Dropbox Sign Integration",
                      docusignIntegration: "DocuSign Integration",
                      multiUserTeamRoles: "Multi-user Team Roles",
                      stripeConnectPayouts: "Stripe Connect Payouts",
                    };

                    if (allFeatures.length === 0) {
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
                        {allFeatures.map(([feature, enabled]) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            {enabled ? (
                              <>
                                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                                <span className="text-slate-300">{featureNames[feature] || feature}</span>
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 text-slate-600 flex-shrink-0" />
                                <span className="text-slate-500 line-through">{featureNames[feature] || feature}</span>
                                <span className="text-xs text-slate-500 ml-1">(Not included)</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <SubscriptionActions company={company} currentTier={currentTier} isActive={isActive} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upgrade Plan Card - Show for free, starter, and pro tiers */}
          {currentTier !== "premium" && (
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
          )}

          {/* Manage Subscription - Only show for active paid subscriptions (not free tier) */}
          {currentTier !== "free" && isActive && customerId && (
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

