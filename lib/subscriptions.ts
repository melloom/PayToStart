// Subscription and tier management utilities

import { db } from "./db";
import { TIER_CONFIG, type SubscriptionTier, type TierLimits } from "./types";

/**
 * Get tier limits for a subscription tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_CONFIG[tier].limits;
}

/**
 * Check if a company has access to a feature
 */
export async function hasFeature(
  companyId: string,
  feature: keyof TierLimits["features"]
): Promise<boolean> {
  const company = await db.companies.findById(companyId);
  if (!company) return false;

  // Use effective tier (includes trial tier)
  const effectiveTier = await getEffectiveTier(companyId);
  const limits = getTierLimits(effectiveTier);
  return limits.features[feature];
}

/**
 * Check if a company can perform an action within tier limits
 */
export async function canPerformAction(
  companyId: string,
  action: "templates" | "contracts" | "companies",
  requiredCount: number = 1
): Promise<{ allowed: boolean; currentCount: number; limit: number | null; reason?: string }> {
  const company = await db.companies.findById(companyId);
  if (!company) {
    return {
      allowed: false,
      currentCount: 0,
      limit: null,
      reason: "Company not found",
    };
  }

  // Use effective tier (includes trial tier)
  const effectiveTier = await getEffectiveTier(companyId);
  const limits = getTierLimits(effectiveTier);
  const limit = limits[action];

  // If unlimited (null), allow
  if (limit === null) {
    return {
      allowed: true,
      currentCount: 0,
      limit: null,
    };
  }

  // Get current usage
  const currentCount = await db.usageCounters.getCurrentCount(companyId, action);

  // Check if adding requiredCount would exceed limit
  const allowed = (currentCount + requiredCount) <= limit;

  return {
    allowed,
    currentCount,
    limit,
    reason: allowed
      ? undefined
      : `Limit exceeded: ${currentCount}/${limit} ${action}. Upgrade to ${getRecommendedTier(action)} to continue.`,
  };
}

/**
 * Get recommended tier for a feature/action
 */
function getRecommendedTier(action: "templates" | "contracts" | "companies"): SubscriptionTier {
  if (action === "templates" || action === "contracts") {
    return "pro"; // Pro has unlimited templates and contracts
  }
  return "starter"; // Default recommendation
}

/**
 * Check tier limit using database function (more efficient)
 */
export async function checkTierLimit(
  companyId: string,
  limitType: "templates" | "contracts" | "companies",
  requiredCount: number = 1
): Promise<boolean> {
  return await db.subscriptions.checkTierLimit(companyId, limitType, requiredCount);
}

/**
 * Increment usage counter for a company
 */
export async function incrementUsage(
  companyId: string,
  counterType: "templates" | "contracts" | "sms_sent" | string
): Promise<number> {
  return await db.usageCounters.increment(companyId, counterType);
}

/**
 * Get current usage count for a company
 */
export async function getUsageCount(
  companyId: string,
  counterType: "templates" | "contracts" | "sms_sent" | string
): Promise<number> {
  return await db.usageCounters.getCurrentCount(companyId, counterType);
}

/**
 * Check if company is currently in trial period
 */
export async function isInTrial(companyId: string): Promise<boolean> {
  const company = await db.companies.findById(companyId);
  if (!company) return false;

  // Check if trial exists and hasn't expired
  if (company.trialEnd) {
    return new Date(company.trialEnd) > new Date();
  }

  return false;
}

/**
 * Get effective tier (trial tier if in trial, otherwise subscription tier)
 */
export async function getEffectiveTier(companyId: string): Promise<SubscriptionTier> {
  const company = await db.companies.findById(companyId);
  if (!company) return "free";

  // If in trial, return trial tier
  if (company.trialEnd && new Date(company.trialEnd) > new Date()) {
    return company.trialTier || "starter";
  }

  // Otherwise return subscription tier
  return company.subscriptionTier || "free";
}

/**
 * Get trial information for a company
 */
export async function getTrialInfo(companyId: string): Promise<{
  isInTrial: boolean;
  trialEnd?: Date;
  trialTier?: SubscriptionTier;
  daysRemaining?: number;
} | null> {
  const company = await db.companies.findById(companyId);
  if (!company) return null;

  const inTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
  
  if (!inTrial) {
    return { isInTrial: false };
  }

  const trialEnd = company.trialEnd ? new Date(company.trialEnd) : undefined;
  const now = new Date();
  const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : undefined;

  return {
    isInTrial: true,
    trialEnd,
    trialTier: company.trialTier,
    daysRemaining,
  };
}

/**
 * Verify subscription is active (including trial)
 */
export async function isSubscriptionActive(companyId: string): Promise<boolean> {
  const company = await db.companies.findById(companyId);
  if (!company) return false;

  // Check if in trial first
  if (await isInTrial(companyId)) {
    return true;
  }

  // Free tier is always "active" (no subscription)
  if (company.subscriptionTier === "free") {
    return true;
  }

  // Check if subscription is active
  if (company.subscriptionStatus === "active" || company.subscriptionStatus === "trialing") {
    // Check if subscription period is still valid
    if (company.subscriptionCurrentPeriodEnd) {
      return new Date(company.subscriptionCurrentPeriodEnd) > new Date();
    }
    return true;
  }

  return false;
}

/**
 * Check if company has access to tier-specific feature
 */
export async function checkFeatureAccess(
  companyId: string,
  feature: keyof TierLimits["features"]
): Promise<{ hasAccess: boolean; reason?: string }> {
  const company = await db.companies.findById(companyId);
  if (!company) {
    return {
      hasAccess: false,
      reason: "Company not found",
    };
  }

  // Check subscription is active (includes trial)
  const isActive = await isSubscriptionActive(companyId);
  const effectiveTier = await getEffectiveTier(companyId);
  
  if (!isActive && effectiveTier !== "free") {
    return {
      hasAccess: false,
      reason: "Subscription is not active",
    };
  }

  // Check feature access using effective tier
  const limits = getTierLimits(effectiveTier);
  const hasAccess = limits.features[feature];

  if (!hasAccess) {
    const recommendedTier = getRecommendedTierForFeature(feature);
    return {
      hasAccess: false,
      reason: `Feature requires ${recommendedTier} tier or higher`,
    };
  }

  return { hasAccess: true };
}

/**
 * Get recommended tier for a feature
 */
function getRecommendedTierForFeature(
  feature: keyof TierLimits["features"]
): SubscriptionTier {
  // Check which tier first has this feature
  for (const tier of ["starter", "pro", "premium"] as SubscriptionTier[]) {
    if (TIER_CONFIG[tier].limits.features[feature]) {
      return tier;
    }
  }
  return "premium";
}

