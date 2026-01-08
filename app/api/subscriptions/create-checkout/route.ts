import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";

export async function POST(request: Request) {
  try {
    // Check authentication
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tier } = await request.json();

    if (!tier) {
      return NextResponse.json(
        { message: "Tier is required" },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers: SubscriptionTier[] = ["starter", "pro", "premium"];
    if (!validTiers.includes(tier as SubscriptionTier)) {
      return NextResponse.json(
        { message: "Invalid tier" },
        { status: 400 }
      );
    }

    // Don't allow subscribing to free tier
    if (tier === "free") {
      return NextResponse.json(
        { message: "Cannot subscribe to free tier" },
        { status: 400 }
      );
    }

    // Get company
    const company = await db.companies.findById(contractor.companyId);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    // Get tier configuration
    const tierConfig = TIER_CONFIG[tier as SubscriptionTier];
    if (!tierConfig) {
      return NextResponse.json(
        { message: "Tier configuration not found" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create or get Stripe customer
    let customerId = company.subscriptionStripeCustomerId;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: contractor.email,
        name: contractor.name,
        metadata: {
          companyId: company.id,
          contractorId: contractor.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to company
      await db.companies.update(company.id, {
        subscriptionStripeCustomerId: customerId,
      });
    }

    // Get Price ID from environment or use dynamic creation
    const priceId = process.env[`STRIPE_${tier.toUpperCase()}_PRICE_ID`];

    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        priceId
          ? {
              // Use pre-created price
              price: priceId,
              quantity: 1,
            }
          : {
              // Fallback to dynamic price creation
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${tierConfig.name} Plan`,
                  description: `Pay2Start ${tierConfig.name} subscription`,
                },
                unit_amount: tierConfig.price * 100, // Convert to cents
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
      ],
      subscription_data: {
        metadata: {
          companyId: company.id,
          contractorId: contractor.id,
          tier: tier,
        },
      },
      success_url: `${baseUrl}/dashboard?subscription=success`,
      cancel_url: `${baseUrl}/pricing?subscription=cancelled`,
      metadata: {
        companyId: company.id,
        contractorId: contractor.id,
        tier: tier,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating subscription checkout:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

