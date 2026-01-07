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

  const limits = getTierLimits(company.subscriptionTier);
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

  const limits = getTierLimits(company.subscriptionTier);
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
 * Verify subscription is active
 */
export async function isSubscriptionActive(companyId: string): Promise<boolean> {
  const company = await db.companies.findById(companyId);
  if (!company) return false;

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

  // Check subscription is active
  const isActive = await isSubscriptionActive(companyId);
  if (!isActive && company.subscriptionTier !== "free") {
    return {
      hasAccess: false,
      reason: "Subscription is not active",
    };
  }

  // Check feature access
  const limits = getTierLimits(company.subscriptionTier);
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

