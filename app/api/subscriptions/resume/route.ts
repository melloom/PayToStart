import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const company = await db.companies.findById(contractor.companyId);
    if (!company) {
      return NextResponse.json(
        { error: "Not found", message: "Company not found" },
        { status: 404 }
      );
    }

    if (!company.subscriptionStripeSubscriptionId) {
      return NextResponse.json(
        { error: "No subscription", message: "No active subscription to resume" },
        { status: 400 }
      );
    }

    // Resume subscription
    const subscription = await stripe.subscriptions.update(
      company.subscriptionStripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    // Update company record
    await db.companies.update(company.id, {
      subscriptionCancelAtPeriodEnd: false,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription has been resumed",
    });
  } catch (error: any) {
    console.error("Error resuming subscription:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

