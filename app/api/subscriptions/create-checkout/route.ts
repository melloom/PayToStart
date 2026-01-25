import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import { getSubscriptionCreatedEmail } from "@/lib/email/subscription-templates";

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
    let startNow: boolean = false;
    try {
      const body = await request.json();
      tier = body.tier;
      startNow = body.startNow || false; // Whether to start subscription now (ends trial immediately)
      console.log("Request tier:", tier, "startNow:", startNow);
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

    // Check if user already has an active subscription
    const activeSubscriptionStatuses = ["active", "trialing", "past_due"];
    if (company.subscriptionStripeSubscriptionId && activeSubscriptionStatuses.includes(company.subscriptionStatus || "")) {
      console.log("User already has an active subscription:", company.subscriptionStripeSubscriptionId);
      
      // Double-check with Stripe to make sure the subscription is actually active
      try {
        const existingSubscription = await stripe.subscriptions.retrieve(company.subscriptionStripeSubscriptionId);
        if (activeSubscriptionStatuses.includes(existingSubscription.status)) {
          return NextResponse.json(
            { 
              message: "You already have an active subscription. Please manage your existing subscription or cancel it before subscribing to a new plan.",
              existingSubscriptionId: company.subscriptionStripeSubscriptionId,
              existingTier: company.subscriptionTier,
            },
            { status: 409 } // 409 Conflict
          );
        }
      } catch (stripeError: any) {
        // If subscription doesn't exist in Stripe, continue (database might be out of sync)
        console.warn("Existing subscription ID not found in Stripe, continuing:", stripeError.message);
      }
    }

    // Also check if customer has any active subscriptions in Stripe
    let customerId = company.subscriptionStripeCustomerId;
    if (customerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 10,
        });

        // Check for active subscriptions
        const activeSubscriptions = subscriptions.data.filter(sub => 
          activeSubscriptionStatuses.includes(sub.status)
        );

        if (activeSubscriptions.length > 0) {
          console.log("Found active subscriptions in Stripe:", activeSubscriptions.map(s => s.id));
          
          // Update database with the latest subscription info
          const latestSubscription = activeSubscriptions[0];
          await db.companies.update(company.id, {
            subscriptionStripeSubscriptionId: latestSubscription.id,
            subscriptionStatus: latestSubscription.status,
            subscriptionTier: (latestSubscription.metadata?.tier as SubscriptionTier) || company.subscriptionTier,
            subscriptionCurrentPeriodStart: new Date(latestSubscription.current_period_start * 1000),
            subscriptionCurrentPeriodEnd: new Date(latestSubscription.current_period_end * 1000),
            subscriptionCancelAtPeriodEnd: latestSubscription.cancel_at_period_end || false,
          });

          return NextResponse.json(
            { 
              message: "You already have an active subscription. Please manage your existing subscription or cancel it before subscribing to a new plan.",
              existingSubscriptionId: latestSubscription.id,
              existingTier: latestSubscription.metadata?.tier || company.subscriptionTier,
            },
            { status: 409 } // 409 Conflict
          );
        }
      } catch (stripeError: any) {
        console.warn("Error checking Stripe subscriptions:", stripeError.message);
        // Continue if we can't check (customer might not exist yet)
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create or get Stripe customer (customerId already set above if it exists)
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

    // Check if customer has a default payment method
    let defaultPaymentMethod: string | null = null;
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !("deleted" in customer)) {
        defaultPaymentMethod = customer.invoice_settings?.default_payment_method as string | null;
        
        // If no default, check if they have any payment methods
        if (!defaultPaymentMethod) {
          const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: "card",
          });
          if (paymentMethods.data.length > 0) {
            defaultPaymentMethod = paymentMethods.data[0].id;
            // Set it as default
            await stripe.customers.update(customerId, {
              invoice_settings: {
                default_payment_method: defaultPaymentMethod,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking payment methods:", error);
      // Continue with checkout if we can't check
    }

    // If customer has a payment method, create subscription directly
    if (defaultPaymentMethod) {
      console.log("Customer has payment method, creating subscription directly:", defaultPaymentMethod);
      
      // Get Price ID from environment or create price
      const priceId = process.env[`STRIPE_${tier.toUpperCase()}_PRICE_ID`];
      let price: string;

      if (priceId) {
        console.log("Using pre-created price ID:", priceId);
        // Validate that the price exists in Stripe
        try {
          const existingPrice = await stripe.prices.retrieve(priceId);
          if (existingPrice && existingPrice.active) {
            price = priceId;
            console.log("Price ID validated successfully");
          } else {
            console.warn("Price ID exists but is not active, creating new price");
            throw new Error("Price not active");
          }
        } catch (error: any) {
          console.warn(`Price ID ${priceId} not found or invalid: ${error.message}`);
          console.log("Falling back to dynamic price creation");
          // Fall through to create price dynamically
          price = null as any; // Will trigger dynamic creation
        }
      }

      // Create price dynamically if priceId was not provided or was invalid
      if (!price) {
        console.log("No price ID found, checking for existing price for tier:", tier);
        
        // First, try to find an existing price for this tier
        try {
          const productName = `${tierConfig.name} Plan`;
          const products = await stripe.products.list({
            limit: 100,
            active: true,
          });
          
          // Find product by name
          const existingProduct = products.data.find(
            p => p.name === productName
          );
          
          if (existingProduct) {
            // Find price for this product
            const prices = await stripe.prices.list({
              product: existingProduct.id,
              active: true,
              limit: 10,
            });
            
            // Find matching price (same amount and interval)
            const matchingPrice = prices.data.find(
              p => 
                p.unit_amount === tierConfig.price * 100 &&
                p.currency === "usd" &&
                p.recurring?.interval === "month"
            );
            
            if (matchingPrice) {
              console.log("Found existing price, reusing:", matchingPrice.id);
              price = matchingPrice.id;
            }
          }
        } catch (error) {
          console.warn("Error searching for existing price:", error);
        }
        
        // If no existing price found, create a new one
        if (!price) {
          console.log("Creating new price for tier:", tier, "price:", tierConfig.price);
          // Create product and price
          const product = await stripe.products.create({
            name: `${tierConfig.name} Plan`,
            description: `Pay2Start ${tierConfig.name} subscription`,
            metadata: {
              tier: tier,
            },
          });

          price = (
            await stripe.prices.create({
              currency: "usd",
              unit_amount: tierConfig.price * 100,
              recurring: {
                interval: "month",
              },
              product: product.id,
              metadata: {
                tier: tier,
              },
            })
          ).id;
          console.log("Created new price:", price);
        }
      }

      // Check if user is currently in trial
      const isInTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
      
      // Check if user has used trial before
      // If they're on a paid tier (not free), they've used a trial
      // Or if trialEnd exists and is in the past, they've had a trial
      const hasUsedTrial = company.subscriptionTier !== "free" || 
        (company.trialEnd && new Date(company.trialEnd) < new Date());
      
      // Build subscription data
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price }],
        default_payment_method: defaultPaymentMethod,
        metadata: {
          companyId: company.id,
          contractorId: contractor.id,
          tier: tier,
        },
      };

      // If user is in trial and chose to start now, end trial immediately
      if (isInTrial && startNow) {
        console.log("User chose to start subscription now, ending trial immediately");
        // Don't add trial period - subscription starts immediately
        // Mark trial as used
        await db.companies.update(company.id, {
          trialEnd: new Date(), // Set to now to mark as used
          trialTier: null,
        });
      } else if (isInTrial && !startNow) {
        // User is in trial and wants to start at end of trial
        // Calculate when current trial ends and set subscription to start then
        const currentTrialEnd = Math.floor(new Date(company.trialEnd!).getTime() / 1000);
        subscriptionData.trial_end = currentTrialEnd;
        console.log(`Subscription will start when current trial ends at: ${new Date(currentTrialEnd * 1000).toISOString()}`);
      } else if (!hasUsedTrial) {
        // Add trial period if they haven't used one
        // Calculate trial end: 7 days from now (7 * 24 * 60 * 60 = 604,800 seconds)
        const trialEnd = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
        subscriptionData.trial_end = trialEnd;
        console.log(`Adding 7-day trial period. Trial ends at: ${new Date(trialEnd * 1000).toISOString()}`);
        
        // Also update company trial_end for tracking
        await db.companies.update(company.id, {
          trialEnd: new Date(trialEnd * 1000),
          trialTier: tier,
        });
      }

      // Create subscription directly
      const subscription = await stripe.subscriptions.create(subscriptionData);
      console.log("Subscription created directly:", subscription.id);

      // Update company immediately (webhook will also update, but this is faster)
      // Set tier to the subscribed tier regardless of status (active or trialing)
      await db.companies.update(company.id, {
        subscriptionStripeSubscriptionId: subscription.id,
        subscriptionStripeCustomerId: customerId,
        subscriptionStatus: subscription.status,
        subscriptionTier: tier, // Always set to the tier they subscribed to
        subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
        subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        planSelected: true,
      });

      // Send subscription confirmation email
      try {
        const isInTrial = subscription.status === "trialing";
        const trialEndDate = isInTrial && subscription.trial_end 
          ? new Date(subscription.trial_end * 1000)
          : undefined;
        const nextBillingDate = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : undefined;

        const { subject, html } = getSubscriptionCreatedEmail({
          contractorName: contractor.name,
          contractorEmail: contractor.email,
          tier: tier,
          hasTrial: isInTrial,
          trialEndDate: trialEndDate,
          subscriptionStartDate: new Date(subscription.current_period_start * 1000),
          nextBillingDate: nextBillingDate,
          dashboardUrl: `${baseUrl}/dashboard`,
        });

        await sendEmail({
          to: contractor.email,
          subject,
          html,
        });
        console.log("Subscription confirmation email sent to:", contractor.email);
      } catch (emailError) {
        console.error("Error sending subscription confirmation email:", emailError);
        // Don't fail the subscription creation if email fails
      }

      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        url: `${baseUrl}/dashboard?subscription=success&tier=${tier}&direct=true`,
        direct: true, // Indicates subscription was created directly, not via checkout
      });
    }

    // No payment method - use checkout flow
    console.log("No payment method found, using checkout flow");

    // Get Price ID from environment or use dynamic creation
    const priceId = process.env[`STRIPE_${tier.toUpperCase()}_PRICE_ID`];

    // Check if user has used trial before
    const hasUsedTrial = company.subscriptionTier !== "free" || 
      (company.trialEnd && new Date(company.trialEnd) < new Date());

    // Build subscription_data with metadata
    const subscriptionData: any = {
      metadata: {
        companyId: company.id,
        contractorId: contractor.id,
        tier: tier,
      },
    };

    // Add trial period if they haven't used one
    if (!hasUsedTrial) {
      // Calculate trial end: 7 days from now (7 * 24 * 60 * 60 = 604,800 seconds)
      const trialEnd = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
      subscriptionData.trial_end = trialEnd;
      console.log(`Adding 7-day trial period to checkout. Trial ends at: ${new Date(trialEnd * 1000).toISOString()}`);
      
      // Also update company trial_end for tracking
      await db.companies.update(company.id, {
        trialEnd: new Date(trialEnd * 1000),
        trialTier: tier,
      });
    }

    // Build line items
    const lineItems: any[] = [];
    let validatedPriceId = priceId;
    
    // Validate price ID if provided
    if (priceId) {
      try {
        const existingPrice = await stripe.prices.retrieve(priceId);
        if (existingPrice && existingPrice.active) {
          console.log("Using pre-created price ID:", priceId);
          validatedPriceId = priceId;
        } else {
          console.warn("Price ID exists but is not active, will create dynamic price");
          validatedPriceId = null;
        }
      } catch (error: any) {
        console.warn(`Price ID ${priceId} not found or invalid: ${error.message}`);
        console.log("Falling back to dynamic price creation");
        validatedPriceId = null;
      }
    }
    
    if (validatedPriceId) {
      lineItems.push({
        price: validatedPriceId,
        quantity: 1,
      });
    } else {
      console.log("No price ID found, checking for existing price for tier:", tier);
      
      // First, try to find an existing price for this tier
      let foundPrice: string | null = null;
      try {
        const productName = `${tierConfig.name} Plan`;
        const products = await stripe.products.list({
          limit: 100,
          active: true,
        });
        
        // Find product by name
        const existingProduct = products.data.find(
          p => p.name === productName
        );
        
        if (existingProduct) {
          // Find price for this product
          const prices = await stripe.prices.list({
            product: existingProduct.id,
            active: true,
            limit: 10,
          });
          
          // Find matching price (same amount and interval)
          const matchingPrice = prices.data.find(
            p => 
              p.unit_amount === tierConfig.price * 100 &&
              p.currency === "usd" &&
              p.recurring?.interval === "month"
          );
          
          if (matchingPrice) {
            console.log("Found existing price, reusing:", matchingPrice.id);
            foundPrice = matchingPrice.id;
          }
        }
      } catch (error) {
        console.warn("Error searching for existing price:", error);
      }
      
      // Use found price if available, otherwise create new
      if (foundPrice) {
        lineItems.push({
          price: foundPrice,
          quantity: 1,
        });
      } else {
        console.log("Creating new price for tier:", tier, "price:", tierConfig.price);
        // Build detailed description with trial and pricing info
        const getPlanDescription = (tier: SubscriptionTier) => {
          const descriptions: Record<SubscriptionTier, string> = {
            starter: "7 days free, then $29.00 per month. Pay2Start Starter subscription - 2 templates, 20 contracts/month, AI Contract Generation, Click to Sign, Email Delivery, Basic Support",
            pro: "7 days free, then $79.00 per month. Pay2Start Pro subscription - Unlimited templates, Unlimited contracts, SMS Reminders, File Attachments, Custom Branding, Download All Contracts, Priority Support",
            premium: "7 days free, then $149.00 per month. Pay2Start Premium subscription - Everything in Pro, plus: Dropbox Sign Integration, DocuSign Integration, Multi-user Team Roles, Stripe Connect Payouts, Dedicated Support, Custom Integrations",
            free: "Free plan - 3 Contracts only, No templates, Basic features only",
          };
          return descriptions[tier];
        };

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tierConfig.name} Plan`,
              description: getPlanDescription(tier as SubscriptionTier),
              metadata: {
                tier: tier,
              },
            },
            unit_amount: tierConfig.price * 100, // Convert to cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        });
      }
    }

    // Create Stripe Checkout Session for subscription
    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: lineItems,
      subscription_data: subscriptionData,
      success_url: `${baseUrl}/dashboard?subscription=success&tier=${tier}`,
      cancel_url: `${baseUrl}/dashboard/select-plan?subscription=cancelled`,
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
      direct: false, // Indicates checkout flow
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

