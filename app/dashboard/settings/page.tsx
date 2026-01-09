import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTierLimits, getEffectiveTier, getUsageCount, canPerformAction } from "@/lib/subscriptions";
import { TIER_CONFIG } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Layout, Settings, Zap, Shield, BarChart3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Settings",
  description: "View your plan limits and usage",
};

export default async function SettingsPage() {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  const company = await db.companies.findById(contractor.companyId);
  if (!company) {
    redirect("/dashboard/select-plan");
  }

  const effectiveTier = await getEffectiveTier(company.id);
  const tierLimits = getTierLimits(effectiveTier);
  const tierConfig = TIER_CONFIG[effectiveTier];

  // Get current usage
  const contractsUsage = await getUsageCount(company.id, "contracts");
  const templatesUsage = await getUsageCount(company.id, "templates");

  // Check if user can perform actions
  const canCreateContract = await canPerformAction(company.id, "contracts", 1);
  const canCreateTemplate = await canPerformAction(company.id, "templates", 1);

  // Calculate usage percentages
  const contractsPercent = tierLimits.contracts === null 
    ? 0 
    : Math.min(100, (contractsUsage / tierLimits.contracts) * 100);
  
  const templatesPercent = tierLimits.templates === null 
    ? 0 
    : Math.min(100, (templatesUsage / tierLimits.templates) * 100);

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "free": return "bg-slate-700 text-slate-300";
      case "starter": return "bg-indigo-900/50 text-indigo-300 border-indigo-700";
      case "pro": return "bg-purple-900/50 text-purple-300 border-purple-700";
      case "premium": return "bg-amber-900/50 text-amber-300 border-amber-700";
      default: return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 text-lg">
          View your plan limits, usage, and account settings
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan & Usage Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Zap className="h-6 w-6 text-indigo-400" />
                    Current Plan
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    Your active subscription tier
                  </CardDescription>
                </div>
                <Badge className={getTierBadgeColor(effectiveTier)}>
                  {tierConfig.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Plan Name</p>
                  <p className="text-lg font-semibold text-white">{tierConfig.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Monthly Price</p>
                  <p className="text-lg font-semibold text-white">
                    ${tierConfig.price === 0 ? "Free" : `${tierConfig.price}/month`}
                  </p>
                </div>
                <Link href="/dashboard/subscription">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-400" />
                Usage & Limits
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Track your usage against plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Contracts Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-white">Contracts</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">
                      {contractsUsage}
                    </span>
                    <span className="text-slate-400 ml-1">
                      / {tierLimits.contracts === null ? "∞" : tierLimits.contracts}
                      {effectiveTier === "free" ? " (lifetime)" : " (this month)"}
                    </span>
                  </div>
                </div>
                {tierLimits.contracts !== null && (
                  <>
                    <Progress value={contractsPercent} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${canCreateContract.allowed ? "text-green-400" : "text-red-400"}`}>
                        {canCreateContract.allowed ? "✓ Can create more" : "✗ Limit reached"}
                      </span>
                      <span className="text-slate-400">
                        {Math.round(contractsPercent)}% used
                      </span>
                    </div>
                  </>
                )}
                {tierLimits.contracts === null && (
                  <p className="text-sm text-green-400">Unlimited contracts</p>
                )}
              </div>

              {/* Templates Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-white">Templates</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">
                      {templatesUsage}
                    </span>
                    <span className="text-slate-400 ml-1">
                      / {tierLimits.templates === null ? "∞" : tierLimits.templates}
                    </span>
                  </div>
                </div>
                {tierLimits.templates !== null && (
                  <>
                    <Progress value={templatesPercent} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${canCreateTemplate.allowed ? "text-green-400" : "text-red-400"}`}>
                        {canCreateTemplate.allowed ? "✓ Can create more" : "✗ Limit reached"}
                      </span>
                      <span className="text-slate-400">
                        {Math.round(templatesPercent)}% used
                      </span>
                    </div>
                  </>
                )}
                {tierLimits.templates === null && (
                  <p className="text-sm text-green-400">Unlimited templates</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features & Quick Actions */}
        <div className="space-y-6">
          {/* Plan Features */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" />
                Plan Features
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {Object.entries(tierLimits.features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 capitalize">
                      {feature.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    {enabled ? (
                      <Badge className="bg-green-900/50 text-green-300 border-green-700 text-xs">
                        ✓ Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-600 text-xs">
                        ✗ Disabled
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Link href="/dashboard/subscription" className="block">
                <Button variant="outline" className="w-full justify-start">
                  Manage Subscription
                </Button>
              </Link>
              <Link href="/pricing" className="block">
                <Button variant="outline" className="w-full justify-start">
                  View Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

