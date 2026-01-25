import { redirect } from "next/navigation";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveTier } from "@/lib/subscriptions";
import type { SubscriptionTier } from "@/lib/types";
import UpgradeTierPage from "./upgrade-tier-page";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

interface UpgradePageProps {
  params: {
    tier: string;
  };
}

export default async function UpgradePage({ params }: UpgradePageProps) {
  const contractor = await getCurrentContractor();

  if (!contractor) {
    redirect("/login");
  }

  const company = await db.companies.findById(contractor.companyId);
  if (!company) {
    redirect("/dashboard/select-plan");
  }

  const effectiveTier = await getEffectiveTier(company.id);
  const validTiers: SubscriptionTier[] = ["starter", "pro", "premium"];
  
  // Validate tier
  if (!validTiers.includes(params.tier as SubscriptionTier)) {
    redirect("/dashboard/settings?tab=subscription");
  }

  // Check if user is in trial
  const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
  
  // If not in trial, redirect to settings
  if (!isInTrial) {
    redirect("/dashboard/settings?tab=subscription");
  }

  // Check if they're trying to upgrade to a different tier than their trial
  const trialTier = company.trialTier || effectiveTier;
  if (trialTier !== params.tier) {
    redirect(`/dashboard/upgrade/${trialTier}`);
  }

  return (
    <UpgradeTierPage
      tier={params.tier as SubscriptionTier}
      company={company}
      customerId={company.subscriptionStripeCustomerId}
      trialEnd={company.trialEnd}
    />
  );
}
