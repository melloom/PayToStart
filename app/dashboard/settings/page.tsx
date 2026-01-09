import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTierLimits, getEffectiveTier, getUsageCount, canPerformAction } from "@/lib/subscriptions";
import { TIER_CONFIG } from "@/lib/types";
import type { Metadata } from "next";
import SettingsTabs from "./settings-tabs";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 text-lg">
          Manage your account, subscription, and usage settings
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs
        initialName={contractor.name}
        initialEmail={contractor.email}
        customerId={company.subscriptionStripeCustomerId}
        effectiveTier={effectiveTier}
        tierConfig={tierConfig}
        tierLimits={tierLimits}
        contractsUsage={contractsUsage}
        templatesUsage={templatesUsage}
        contractsPercent={contractsPercent}
        templatesPercent={templatesPercent}
        canCreateContract={canCreateContract}
        canCreateTemplate={canCreateTemplate}
      />
    </div>
  );
}

