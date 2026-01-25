import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";
import { isSubscriptionActive, getUsageCount } from "@/lib/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Calendar, AlertCircle, Zap, Shield, Users, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import SubscriptionActions from "./subscription-actions";
import PaymentMethods from "./payment-methods";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Subscription | Pay2Start",
  description: "Manage your Pay2Start subscription and billing",
};

export default async function SubscriptionPage() {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  const company = await db.companies.findById(contractor.companyId);
  if (!company) {
    redirect("/login");
  }

  const isActive = await isSubscriptionActive(company.id);
  const currentTier = company.subscriptionTier;
  const tierConfig = TIER_CONFIG[currentTier];

  // Get usage counts
  const templatesUsed = await getUsageCount(company.id, "templates");
  const contractsUsed = await getUsageCount(company.id, "contracts");

  const getTierDisplayName = (tier: SubscriptionTier) => {
    const names: Record<SubscriptionTier, string> = {
      free: "Free",
      starter: "Starter",
      pro: "Pro",
      premium: "Premium",
    };
    return names[tier];
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Subscription & Billing</h1>
        <p className="text-slate-400 text-lg">
          Manage your subscription, view usage, and update your plan
        </p>
      </div>

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
                {/* Plan Info */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-2 border-indigo-500/30 rounded-xl backdrop-blur-sm">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {getTierDisplayName(currentTier)}
                    </h3>
                    <p className="text-slate-300 mb-2">{TIER_CONFIG[currentTier].price === 0 ? "Free forever" : `$${TIER_CONFIG[currentTier].price}/month`}</p>
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
                          {tierConfig.limits.templates === null ? "Unlimited" : tierConfig.limits.templates === 0 ? "Not included" : "templates"}
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
                          {currentTier === "free" ? "Contracts (lifetime)" : "Contracts per Month"}
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
                            : currentTier === "free"
                            ? "contracts only"
                            : "contracts"}
                        </span>
                      </div>
                      {tierConfig.limits.contracts !== null && tierConfig.limits.contracts > 0 && (
                        <div className="mt-2 text-xs text-slate-400">
                          {currentTier === "free" 
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
                    const enabledFeatures = Object.entries(tierConfig.limits.features).filter(([_, enabled]) => enabled);
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

                    if (enabledFeatures.length === 0) {
                      return (
                        <div className="p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                          <p className="text-sm text-slate-400 text-center">
                            This plan includes basic features only. Upgrade to unlock more features.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid md:grid-cols-2 gap-3">
                        {enabledFeatures.map(([feature, _]) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span>{featureNames[feature] || feature}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <SubscriptionActions
                  company={company}
                  currentTier={currentTier}
                  isActive={isActive}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upgrade Card */}
          {currentTier !== "premium" && (
            <Card className="border-2 border-indigo-500/30 shadow-xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Upgrade Plan</CardTitle>
                <CardDescription className="text-slate-300">
                  Unlock more features and higher limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold">
                    View Plans
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          {currentTier !== "free" && (
            <PaymentMethods />
          )}

          {/* Billing Info */}
          {currentTier !== "free" && (
            <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.subscriptionCurrentPeriodStart && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Current Period</p>
                    <p className="font-semibold text-white">
                      {format(company.subscriptionCurrentPeriodStart, "MMM d")} - {format(company.subscriptionCurrentPeriodEnd || new Date(), "MMM d, yyyy")}
                    </p>
                  </div>
                )}
                {company.subscriptionStatus && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <Badge className="bg-slate-700 text-slate-300 border-slate-600">
                      {company.subscriptionStatus}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
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
  );
}


