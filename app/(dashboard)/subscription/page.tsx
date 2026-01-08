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
import type { Metadata } from "next";

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
      return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Free Plan</Badge>;
    }

    if (!isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }

    if (company.subscriptionCancelAtPeriodEnd) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-300">Cancelling</Badge>;
    }

    return <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Subscription & Billing</h1>
        <p className="text-slate-600 text-lg">
          Manage your subscription, view usage, and update your plan
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-slate-200 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Current Plan</CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Your active subscription details
                  </CardDescription>
                </div>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Plan Info */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">
                      {getTierDisplayName(currentTier)}
                    </h3>
                    <p className="text-slate-600 mb-2">{TIER_CONFIG[currentTier].price === 0 ? "Free forever" : `$${TIER_CONFIG[currentTier].price}/month`}</p>
                    {company.subscriptionCurrentPeriodEnd && (
                      <p className="text-sm text-slate-500">
                        {company.subscriptionCancelAtPeriodEnd
                          ? `Cancels on ${format(company.subscriptionCurrentPeriodEnd, "MMM d, yyyy")}`
                          : `Renews on ${format(company.subscriptionCurrentPeriodEnd, "MMM d, yyyy")}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {currentTier !== "free" && (
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        ${TIER_CONFIG[currentTier].price}
                        <span className="text-lg text-slate-600">/mo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Templates</span>
                      <FileText className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">{templatesUsed}</span>
                      <span className="text-sm text-slate-500">
                        / {tierConfig.limits.templates === null ? "∞" : tierConfig.limits.templates}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">Contracts (This Month)</span>
                      <FileText className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">{contractsUsed}</span>
                      <span className="text-sm text-slate-500">
                        / {tierConfig.limits.contracts === null ? "∞" : tierConfig.limits.contracts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Included Features</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {Object.entries(tierConfig.limits.features).map(([feature, enabled]) => {
                      if (!enabled) return null;
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
                      return (
                        <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{featureNames[feature] || feature}</span>
                        </div>
                      );
                    })}
                  </div>
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
            <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">Upgrade Plan</CardTitle>
                <CardDescription className="text-slate-600">
                  Unlock more features and higher limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pricing">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                    View Plans
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Billing Info */}
          {currentTier !== "free" && (
            <Card className="border-2 border-slate-200 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.subscriptionCurrentPeriodStart && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Current Period</p>
                    <p className="font-semibold text-slate-900">
                      {format(company.subscriptionCurrentPeriodStart, "MMM d")} - {format(company.subscriptionCurrentPeriodEnd || new Date(), "MMM d, yyyy")}
                    </p>
                  </div>
                )}
                {company.subscriptionStatus && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <Badge className="bg-slate-100 text-slate-700">
                      {company.subscriptionStatus}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Support Card */}
          <Card className="border-2 border-slate-200 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Have questions about your subscription? Our support team is here to help.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

