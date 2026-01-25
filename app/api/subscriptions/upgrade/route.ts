import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";
import { sendEmail } from "@/lib/email";
import { getSubscriptionCreatedEmail } from "@/lib/email/subscription-templates";
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

    const { tier } = await request.json();

    if (!tier || !["starter", "pro", "premium"].includes(tier)) {
      return NextResponse.json(
        { message: "Invalid tier" },
        { status: 400 }
      );
    }

    const currentTier = company.subscriptionTier;
    const tiers: SubscriptionTier[] = ["free", "starter", "pro", "premium"];
    const currentTierIndex = tiers.indexOf(currentTier);
    const upgradeTierIndex = tiers.indexOf(tier as SubscriptionTier);

    // Validate it's actually an upgrade
    if (upgradeTierIndex <= currentTierIndex) {
      return NextResponse.json(
        { message: "Cannot upgrade to same or lower tier" },
        { status: 400 }
      );
    }

    // Check if user has an active subscription
    if (!company.subscriptionStripeSubscriptionId) {
      return NextResponse.json(
        { message: "No active subscription found. Please use the regular subscription flow." },
        { status: 400 }
      );
    }

    // Check if user is in trial
    const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();

    try {
      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(
        company.subscriptionStripeSubscriptionId
      );

      // Get the price ID for the upgraded tier
      const upgradeTierConfig = TIER_CONFIG[tier as SubscriptionTier];
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
          const productName = `${upgradeTierConfig.name} Plan`;
          const products = await stripe.products.list({ limit: 100, active: true });
          const existingProduct = products.data.find(p => p.name === productName);

          if (existingProduct) {
            const prices = await stripe.prices.list({ 
              product: existingProduct.id, 
              active: true, 
              limit: 10 
            });
            const matchingPrice = prices.data.find(
              p => p.unit_amount === upgradeTierConfig.price * 100 && 
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
          name: `${upgradeTierConfig.name} Plan`,
          description: `Pay2Start ${upgradeTierConfig.name} subscription`,
          metadata: { tier: tier },
        });
        priceId = (
          await stripe.prices.create({
            currency: "usd",
            unit_amount: upgradeTierConfig.price * 100,
            recurring: { interval: "month" },
            product: product.id,
            metadata: { tier: tier },
          })
        ).id;
      }

      // If in trial, end trial immediately and upgrade
      if (isInTrial) {
        console.log("User is in trial, ending trial and upgrading immediately");
        
        // Update the existing subscription - this modifies it, doesn't cancel/create new
        // Setting trial_end to "now" ends the trial and charges immediately
        console.log("Updating existing subscription ID:", company.subscriptionStripeSubscriptionId);
        console.log("Upgrading from", currentTier, "to", tier);
        
        const updatedSubscription = await stripe.subscriptions.update(company.subscriptionStripeSubscriptionId, {
          items: [{
            id: subscription.items.data[0].id,
            price: priceId,
          }],
          proration_behavior: "always", // Prorate the upgrade
          trial_end: "now", // End trial immediately and charge
          metadata: {
            ...subscription.metadata,
            tier: tier,
            upgradedFrom: currentTier,
          },
        });

        console.log("Subscription updated successfully:", updatedSubscription.id);
        console.log("New subscription status:", updatedSubscription.status);
        console.log("Trial ended, subscription is now:", updatedSubscription.status);

        // Update company immediately
        await db.companies.update(company.id, {
          subscriptionTier: tier as SubscriptionTier,
          trialEnd: null, // Clear trial end
          trialTier: null, // Clear trial tier
          subscriptionStatus: updatedSubscription.status, // Use actual status from Stripe
          subscriptionCurrentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
          subscriptionCurrentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
          subscriptionCancelAtPeriodEnd: updatedSubscription.cancel_at_period_end || false,
        });

        // Send upgrade confirmation email
        try {
          if (contractor.email) {
            const { subject, html } = getSubscriptionCreatedEmail({
              contractorName: contractor.name,
              contractorEmail: contractor.email,
              tier: tier as SubscriptionTier,
              hasTrial: false, // No trial since we ended it
              trialEndDate: null,
              subscriptionStartDate: new Date(),
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Approximate next billing
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
            });
            await sendEmail({
              to: contractor.email,
              subject: `Upgraded to ${upgradeTierConfig.name} Plan`,
              html,
            });
            console.log("Upgrade confirmation email sent to:", contractor.email);
          }
        } catch (emailError) {
          console.error("Error sending upgrade email:", emailError);
          // Don't fail the upgrade if email fails
        }

        return NextResponse.json({
          success: true,
          message: `Upgraded to ${upgradeTierConfig.name} successfully. Trial ended and subscription is now active.`,
          instant: true,
        });
      }

      // For active subscriptions, upgrade immediately with proration
      console.log("Upgrading active subscription with proration");
      console.log("Current subscription ID:", company.subscriptionStripeSubscriptionId);
      console.log("Upgrading from", currentTier, "to", tier);
      
      // Update the existing subscription - this modifies it, doesn't cancel/create new
      const updatedSubscription = await stripe.subscriptions.update(company.subscriptionStripeSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: "always", // Prorate the upgrade (charge difference immediately)
        metadata: {
          ...subscription.metadata,
          tier: tier,
          upgradedFrom: currentTier,
        },
      });

      console.log("Subscription updated successfully:", updatedSubscription.id);
      console.log("New subscription status:", updatedSubscription.status);
      console.log("New subscription tier:", updatedSubscription.metadata?.tier);

      // Update company tier and subscription details immediately
      await db.companies.update(company.id, {
        subscriptionTier: tier as SubscriptionTier,
        subscriptionStatus: updatedSubscription.status,
        subscriptionCurrentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
        subscriptionCurrentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        subscriptionCancelAtPeriodEnd: updatedSubscription.cancel_at_period_end || false,
      });

      // Send upgrade confirmation email
      try {
        if (contractor.email) {
          const { subject, html } = getSubscriptionCreatedEmail({
            contractorName: contractor.name,
            contractorEmail: contractor.email,
            tier: tier as SubscriptionTier,
            hasTrial: false,
            trialEndDate: null,
            subscriptionStartDate: new Date(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Approximate next billing
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
          });
          await sendEmail({
            to: contractor.email,
            subject: `Upgraded to ${upgradeTierConfig.name} Plan`,
            html,
          });
          console.log("Upgrade confirmation email sent to:", contractor.email);
        }
      } catch (emailError) {
        console.error("Error sending upgrade email:", emailError);
        // Don't fail the upgrade if email fails
      }

      return NextResponse.json({
        success: true,
        message: `Upgraded to ${upgradeTierConfig.name} successfully. You've been charged a prorated amount for the upgrade.`,
        instant: true,
      });
    } catch (stripeError: any) {
      console.error("Error upgrading Stripe subscription:", stripeError);
      return NextResponse.json(
        { message: `Failed to upgrade subscription: ${stripeError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error upgrading subscription:", error);
    return NextResponse.json(
      { message: error.message || "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}
