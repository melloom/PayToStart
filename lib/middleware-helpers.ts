// Middleware helpers for tier checking

import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";
import { isSubscriptionActive } from "./subscriptions";

/**
 * Check if user has active subscription for protected routes
 * Use this in API routes that require an active subscription
 */
export async function requireActiveSubscription(
  request: NextRequest,
  companyId: string
): Promise<{ valid: boolean; response?: NextResponse }> {
  const isActive = await isSubscriptionActive(companyId);
  
  if (!isActive) {
    const company = await db.companies.findById(companyId);
    if (company && company.subscriptionTier === "free") {
      return {
        valid: false,
        response: NextResponse.json(
          {
            error: "Subscription required",
            message: "This feature requires an active subscription. Please upgrade your plan.",
            tier: company.subscriptionTier,
          },
          { status: 403 }
        ),
      };
    }

    return {
      valid: false,
      response: NextResponse.json(
        {
          error: "Subscription inactive",
          message: "Your subscription is not active. Please renew your subscription.",
          tier: company?.subscriptionTier || "unknown",
        },
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Get company ID from authenticated user
 * Returns null if not authenticated
 */
export async function getCompanyIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  // Get contractor from authenticated user
  const contractor = await db.contractors.getCurrent();
  if (!contractor) return null;

  return contractor.companyId;
}

