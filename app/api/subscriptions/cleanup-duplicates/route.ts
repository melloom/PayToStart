import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const company = await db.companies.findById(contractor.companyId);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    const customerId = company.subscriptionStripeCustomerId;
    if (!customerId) {
      return NextResponse.json(
        { message: "No Stripe customer found" },
        { status: 404 }
      );
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });

    const activeSubscriptionStatuses = ["active", "trialing", "past_due"];
    const activeSubscriptions = subscriptions.data.filter(sub => 
      activeSubscriptionStatuses.includes(sub.status)
    );

    if (activeSubscriptions.length <= 1) {
      return NextResponse.json({
        message: "No duplicate subscriptions found",
        subscriptions: activeSubscriptions.length,
      });
    }

    // Sort by creation date (keep the newest one)
    activeSubscriptions.sort((a, b) => b.created - a.created);
    const keepSubscription = activeSubscriptions[0];
    const cancelSubscriptions = activeSubscriptions.slice(1);

    // Cancel duplicate subscriptions
    const cancelled = [];
    for (const sub of cancelSubscriptions) {
      try {
        await stripe.subscriptions.cancel(sub.id);
        cancelled.push(sub.id);
        console.log(`Cancelled duplicate subscription: ${sub.id}`);
      } catch (error: any) {
        console.error(`Error cancelling subscription ${sub.id}:`, error);
      }
    }

    // Update company with the subscription we're keeping
    await db.companies.update(company.id, {
      subscriptionStripeSubscriptionId: keepSubscription.id,
      subscriptionStatus: keepSubscription.status,
      subscriptionTier: (keepSubscription.metadata?.tier as any) || company.subscriptionTier,
      subscriptionCurrentPeriodStart: new Date(keepSubscription.current_period_start * 1000),
      subscriptionCurrentPeriodEnd: new Date(keepSubscription.current_period_end * 1000),
      subscriptionCancelAtPeriodEnd: keepSubscription.cancel_at_period_end || false,
    });

    return NextResponse.json({
      message: `Cleaned up ${cancelled.length} duplicate subscription(s)`,
      kept: keepSubscription.id,
      cancelled: cancelled,
    });
  } catch (error: any) {
    console.error("Error cleaning up duplicates:", error);
    return NextResponse.json(
      { message: error.message || "Failed to clean up duplicate subscriptions" },
      { status: 500 }
    );
  }
}
