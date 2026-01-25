import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";
import { canPerformAction, getTierLimits } from "@/lib/subscriptions";
import Stripe from "stripe";

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

    const { tier, instant } = await request.json();

    if (!tier || !["free", "starter", "pro", "premium"].includes(tier)) {
      return NextResponse.json(
        { message: "Invalid tier" },
        { status: 400 }
      );
    }

    const currentTier = company.subscriptionTier;
    const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
    const currentTierIndex = tiers.indexOf(currentTier);
    const downgradeTierIndex = tiers.indexOf(tier as SubscriptionTier);

    // Validate it's actually a downgrade
    if (downgradeTierIndex >= currentTierIndex) {
      return NextResponse.json(
        { message: "Cannot downgrade to same or higher tier" },
        { status: 400 }
      );
    }

    // Check if user is in trial
    const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();

    // If instant downgrade (during trial) or no active subscription
    if (instant || isInTrial || !company.subscriptionStripeSubscriptionId) {
      // Check if user has exceeded limits for the downgraded tier
      const downgradeTierLimits = getTierLimits(tier as SubscriptionTier);
      const exceededLimits: string[] = [];

      // Check contracts limit
      if (downgradeTierLimits.contracts !== null) {
        const contractsCheck = await canPerformAction(company.id, "contracts", 0);
        if (contractsCheck.currentCount > downgradeTierLimits.contracts) {
          exceededLimits.push(`contracts (${contractsCheck.currentCount}/${downgradeTierLimits.contracts})`);
        }
      }

      // Check templates limit
      if (downgradeTierLimits.templates !== null) {
        const templatesCheck = await canPerformAction(company.id, "templates", 0);
        if (templatesCheck.currentCount > downgradeTierLimits.templates) {
          exceededLimits.push(`templates (${templatesCheck.currentCount}/${downgradeTierLimits.templates})`);
        }
      }

      // If in trial, end the trial and downgrade immediately
      if (isInTrial) {
        // Update company to remove trial and set to downgraded tier
        await db.companies.update(company.id, {
          subscriptionTier: tier as SubscriptionTier,
          trialEnd: null,
          trialTier: null,
          subscriptionStatus: tier === "free" ? undefined : company.subscriptionStatus,
        });

        // If they have a Stripe subscription, cancel it
        if (company.subscriptionStripeSubscriptionId) {
          try {
            await stripe.subscriptions.cancel(company.subscriptionStripeSubscriptionId);
            console.log(`Cancelled subscription ${company.subscriptionStripeSubscriptionId} due to trial downgrade`);
          } catch (stripeError: any) {
            console.error("Error cancelling Stripe subscription:", stripeError);
            // Continue even if Stripe cancellation fails
          }
        }

        // If limits exceeded, warn user but still allow downgrade
        if (exceededLimits.length > 0) {
          console.warn(`User ${company.id} downgraded but exceeds limits: ${exceededLimits.join(", ")}`);
        }

        return NextResponse.json({
          success: true,
          message: exceededLimits.length > 0 
            ? `Plan downgraded. Trial ended. Warning: You have exceeded limits for ${exceededLimits.join(", ")}. Access to these features may be restricted.`
            : "Plan downgraded. Trial ended.",
          instant: true,
          exceededLimits: exceededLimits.length > 0 ? exceededLimits : undefined,
        });
      }

      // If no subscription, just update the tier
      await db.companies.update(company.id, {
        subscriptionTier: tier as SubscriptionTier,
      });

      // If limits exceeded, warn user
      if (exceededLimits.length > 0) {
        console.warn(`User ${company.id} downgraded but exceeds limits: ${exceededLimits.join(", ")}`);
      }

      return NextResponse.json({
        success: true,
        message: exceededLimits.length > 0 
          ? `Plan downgraded. Warning: You have exceeded limits for ${exceededLimits.join(", ")}. Access to these features may be restricted.`
          : "Plan downgraded",
        instant: true,
        exceededLimits: exceededLimits.length > 0 ? exceededLimits : undefined,
      });
    }

    // For active subscriptions, schedule downgrade at period end
    if (!company.subscriptionStripeSubscriptionId) {
      return NextResponse.json(
        { message: "No active subscription found" },
        { status: 400 }
      );
    }

    try {
      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(
        company.subscriptionStripeSubscriptionId
      );

      // Get the price ID for the downgraded tier
      const downgradeTierConfig = TIER_CONFIG[tier as SubscriptionTier];
      const priceIdFromEnv = process.env[`STRIPE_${tier.toUpperCase()}_PRICE_ID`];
      
      let priceId: string | null = null;

      if (priceIdFromEnv) {
        try {
          const existingPrice = await stripe.prices.retrieve(priceIdFromEnv);
          if (existingPrice && existingPrice.active) {
            priceId = priceIdFromEnv;
          }
        } catch (error) {
          console.warn(`Price ID ${priceIdFromEnv} not found, will search for existing`);
        }
      }

      // If no valid price from env, try to find an existing one
      if (!priceId) {
        try {
          const productName = `${downgradeTierConfig.name} Plan`;
          const products = await stripe.products.list({ limit: 100, active: true });
          const existingProduct = products.data.find(p => p.name === productName);

          if (existingProduct) {
            const prices = await stripe.prices.list({ 
              product: existingProduct.id, 
              active: true, 
              limit: 10 
            });
            const matchingPrice = prices.data.find(
              p => p.unit_amount === downgradeTierConfig.price * 100 && 
                   p.currency === "usd" && 
                   p.recurring?.interval === "month"
            );
            if (matchingPrice) {
              priceId = matchingPrice.id;
            }
          }
        } catch (error) {
          console.warn("Error searching for existing price:", error);
        }
      }

      // If still no price, create one
      if (!priceId) {
        const product = await stripe.products.create({
          name: `${downgradeTierConfig.name} Plan`,
          description: `Pay2Start ${downgradeTierConfig.name} subscription`,
          metadata: { tier: tier },
        });
        priceId = (
          await stripe.prices.create({
            currency: "usd",
            unit_amount: downgradeTierConfig.price * 100,
            recurring: { interval: "month" },
            product: product.id,
            metadata: { tier: tier },
          })
        ).id;
      }

      // Update subscription to new price at period end
      await stripe.subscriptions.update(company.subscriptionStripeSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: "none", // Don't prorate, change at period end
        metadata: {
          ...subscription.metadata,
          tier: tier,
          downgradeScheduled: "true",
        },
      });

      // Update company metadata to track scheduled downgrade
      await db.companies.update(company.id, {
        // Don't change tier yet - it will change when period ends
        // The webhook will handle the actual tier change
      });

      return NextResponse.json({
        success: true,
        message: "Downgrade scheduled for end of billing period",
        instant: false,
        effectiveDate: company.subscriptionCurrentPeriodEnd,
      });
    } catch (stripeError: any) {
      console.error("Error updating Stripe subscription:", stripeError);
      return NextResponse.json(
        { message: `Failed to schedule downgrade: ${stripeError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error downgrading subscription:", error);
    return NextResponse.json(
      { message: error.message || "Failed to downgrade subscription" },
      { status: 500 }
    );
  }
}
