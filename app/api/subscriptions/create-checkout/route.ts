import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";
import Stripe from "stripe";

export async function POST(request: Request) {
  // Get Stripe mode (needed for error handling)
  const stripeMode = process.env.STRIPE_MODE || "test";
  
  try {
    // Check Stripe is configured
    const isTestMode = stripeMode === "test";
    const secretKey = isTestMode 
      ? process.env.STRIPE_TEST_SECRET_KEY 
      : process.env.STRIPE_LIVE_SECRET_KEY;

    if (!secretKey) {
      const keyName = isTestMode ? "STRIPE_TEST_SECRET_KEY" : "STRIPE_LIVE_SECRET_KEY";
      console.error(`${keyName} is not set`);
      return NextResponse.json(
        { message: `Stripe is not configured. Missing ${keyName}` },
        { status: 500 }
      );
    }

    // Validate key format
    if (isTestMode && !secretKey.startsWith("sk_test_")) {
      console.error("Invalid test key format. Test keys must start with 'sk_test_'");
      return NextResponse.json(
        { message: "Invalid Stripe test key format" },
        { status: 500 }
      );
    }
    
    if (!isTestMode && !secretKey.startsWith("sk_live_")) {
      console.error("Invalid live key format. Live keys must start with 'sk_live_'");
      return NextResponse.json(
        { message: "Invalid Stripe live key format" },
        { status: 500 }
      );
    }

    console.log(`Using Stripe ${stripeMode.toUpperCase()} mode`);
    
    // Warn if in production but using test keys (or vice versa)
    if (process.env.NODE_ENV === "production" && isTestMode) {
      console.warn("⚠️ WARNING: Running in production but STRIPE_MODE=test. This should be 'live' for production!");
    }
    if (process.env.NODE_ENV === "production" && !isTestMode && secretKey.startsWith("sk_test_")) {
      console.warn("⚠️ WARNING: STRIPE_MODE=live but using test key! Make sure STRIPE_LIVE_SECRET_KEY is set correctly.");
    }

    // Check authentication
    const contractor = await getCurrentContractor();
    if (!contractor) {
      console.error("No contractor found - unauthorized");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Contractor authenticated:", contractor.id, contractor.email);

    let tier: string;
    try {
      const body = await request.json();
      tier = body.tier;
      console.log("Request tier:", tier);
    } catch (jsonError: any) {
      console.error("Error parsing request JSON:", jsonError);
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

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
    let company;
    try {
      company = await db.companies.findById(contractor.companyId);
      if (!company) {
        console.error("Company not found for contractor:", contractor.id);
        return NextResponse.json(
          { message: "Company not found" },
          { status: 404 }
        );
      }
    } catch (dbError: any) {
      console.error("Database error fetching company:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
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
      try {
        console.log("Creating Stripe customer for:", contractor.email);
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: contractor.email,
          name: contractor.name || contractor.email,
          metadata: {
            companyId: company.id,
            contractorId: contractor.id,
          },
        });
        customerId = customer.id;
        console.log("Stripe customer created:", customerId);

        // Save customer ID to company
        try {
          const updatedCompany = await db.companies.update(company.id, {
            subscriptionStripeCustomerId: customerId,
          });
          if (!updatedCompany) {
            console.error("Failed to update company with Stripe customer ID");
            // Don't throw - we have the customer ID and can continue
            // The webhook will handle updating the company later
          } else {
            console.log("Company updated with Stripe customer ID");
          }
        } catch (dbUpdateError: any) {
          console.error("Database update error after creating Stripe customer:", dbUpdateError);
          // Log the error but continue - we have the customer ID and can proceed
          // The webhook will handle the update when subscription is created
          console.log("Continuing despite database update error - customer ID:", customerId);
        }
      } catch (stripeError: any) {
        console.error("Stripe customer creation error:", stripeError);
        const errorMessage = stripeError.message || stripeError.toString() || "Unknown error";
        throw new Error(`Failed to create Stripe customer: ${errorMessage}`);
      }
    } else {
      console.log("Using existing Stripe customer:", customerId);
    }

    // Get Price ID from environment or use dynamic creation
    const priceId = process.env[`STRIPE_${tier.toUpperCase()}_PRICE_ID`];

    // Build subscription_data with metadata
    const subscriptionData: any = {
      metadata: {
        companyId: company.id,
        contractorId: contractor.id,
        tier: tier,
      },
    };

    // Build line items
    const lineItems: any[] = [];
    if (priceId) {
      console.log("Using pre-created price ID:", priceId);
      lineItems.push({
        price: priceId,
        quantity: 1,
      });
    } else {
      console.log("Creating dynamic price for tier:", tier, "price:", tierConfig.price);
            // Build detailed description with trial and pricing info
            const getPlanDescription = (tier: SubscriptionTier) => {
              const descriptions: Record<SubscriptionTier, string> = {
                starter: "7 days free, then $29.00 per month. Pay2Start Starter subscription - 2 templates, 20 contracts/month, Click to Sign, Email Delivery, Basic Support",
                pro: "7 days free, then $79.00 per month. Pay2Start Pro subscription - Unlimited templates, Unlimited contracts, SMS Reminders, File Attachments, Custom Branding, Download All Contracts, Priority Support",
                premium: "7 days free, then $149.00 per month. Pay2Start Premium subscription - Everything in Pro, plus: Dropbox Sign Integration, DocuSign Integration, Multi-user Team Roles, Stripe Connect Payouts, Dedicated Support, Custom Integrations",
                free: "Free plan - No contracts, No templates, Basic features only",
              };
              return descriptions[tier];
            };

            lineItems.push({
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${tierConfig.name} Plan`,
                  description: getPlanDescription(tier as SubscriptionTier),
                },
                unit_amount: tierConfig.price * 100, // Convert to cents
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            });
    }

    // Create Stripe Checkout Session for subscription
    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: lineItems,
      subscription_data: subscriptionData,
      success_url: `${baseUrl}/dashboard?subscription=success`,
      cancel_url: `${baseUrl}/pricing?subscription=cancelled`,
      locale: "en", // Set locale to English to avoid localization errors
      metadata: {
        companyId: company.id,
        contractorId: contractor.id,
        tier: tier,
      },
    });
    console.log("Checkout session created:", session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating subscription checkout:", error);
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw,
      stack: error.stack,
    });

    // Check for specific error: test card used in live mode
    const errorMessage = error.message || "";
    const isTestCardInLiveMode = 
      (errorMessage.includes("test card") && errorMessage.includes("live mode")) ||
      (error.code === "card_declined" && errorMessage.toLowerCase().includes("test")) ||
      (error.type === "StripeCardError" && errorMessage.toLowerCase().includes("test card"));

    let userMessage = error.message || "Internal server error";
    
    if (isTestCardInLiveMode) {
      userMessage = "You cannot use test card numbers in production mode. Please use a real credit card. If you're testing, set STRIPE_MODE=test in your environment variables. For production, use real credit cards only.";
    }

    return NextResponse.json(
      { 
        message: userMessage,
        details: process.env.NODE_ENV === "development" ? {
          type: error.type,
          code: error.code,
          statusCode: error.statusCode,
          stripeMode: stripeMode,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

