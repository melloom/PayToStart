import { NextResponse } from "next/server";
import { signUp } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { TIER_CONFIG, type SubscriptionTier } from "@/lib/types";
import { checkAPIRateLimit, sanitizeEmail, sanitizeInput, validateContentType, createSecureErrorResponse, getClientIP } from "@/lib/security/api-security";
import { z } from "zod";

const signupWithSubscriptionSchema = z.object({
  email: z.string().email("Invalid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(200),
  tier: z.enum(["free", "starter", "pro", "premium"]).optional(),
  startSubscription: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    const rateLimitResponse = checkAPIRateLimit(request, `signup:${ip}`);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate content type
    const contentTypeResponse = validateContentType(request);
    if (contentTypeResponse) {
      return contentTypeResponse;
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid request", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = signupWithSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Signup validation failed:", validationResult.error.errors);
      return NextResponse.json(
        { 
          error: "Validation failed",
          message: "Please check your input and try again",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password, name, companyName, tier, startSubscription } = validationResult.data;

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid email", message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedCompanyName = sanitizeInput(companyName);

    // Validate sanitized inputs
    if (!sanitizedName || sanitizedName.trim().length < 2) {
      return NextResponse.json(
        { error: "Invalid name", message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!sanitizedCompanyName || sanitizedCompanyName.trim().length < 2) {
      return NextResponse.json(
        { error: "Invalid company name", message: "Company name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Password strength check
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Weak password", message: "Password must contain both letters and numbers" },
        { status: 400 }
      );
    }

    // Create the user account first
    const signupResult = await signUp(sanitizedEmail, password, {
      name: sanitizedName,
      company_name: sanitizedCompanyName,
    });

    if (signupResult.error) {
      if (signupResult.error.includes("already registered") || signupResult.error.includes("already exists")) {
        return NextResponse.json(
          { error: "Email exists", message: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Signup failed", message: signupResult.error || "Could not create account. Please try again." },
        { status: 400 }
      );
    }

    // If user wants to start a paid subscription immediately
    if (startSubscription && tier && tier !== "free") {
      try {
        // Wait a moment for the trigger to create the company
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the newly created user's company
        const contractorData = await db.contractors.findByEmail(sanitizedEmail);
        
        if (!contractorData) {
          return NextResponse.json(
            { 
              error: "Account created but company not found",
              message: "Your account was created, but we couldn't find your company. Please try logging in and subscribing from the dashboard.",
              needsLogin: true
            },
            { status: 200 }
          );
        }

        const company = await db.companies.findById(contractorData.companyId);
        if (!company) {
          return NextResponse.json(
            { 
              error: "Account created but company not found",
              message: "Your account was created, but we couldn't find your company. Please try logging in and subscribing from the dashboard.",
              needsLogin: true
            },
            { status: 200 }
          );
        }

        const tierConfig = TIER_CONFIG[tier as SubscriptionTier];
        if (!tierConfig) {
          return NextResponse.json(
            { 
              success: true,
              message: "Account created successfully. You can subscribe from the dashboard.",
              needsEmailConfirmation: signupResult.needsEmailConfirmation,
            }
          );
        }

        // Create Stripe customer
        let customerId = company.subscriptionStripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: sanitizedEmail,
            name: sanitizedName,
            metadata: {
              companyId: company.id,
              contractorId: contractorData.id,
            },
          });
          customerId = customer.id;

          await db.companies.update(company.id, {
            subscriptionStripeCustomerId: customerId,
          });
        }

        // Check if company is in trial and get trial end date
        const inTrial = company.trialEnd && new Date(company.trialEnd) > new Date();
        const trialEndTimestamp = company.trialEnd 
          ? Math.floor(new Date(company.trialEnd).getTime() / 1000)
          : null;

        // Get Price ID from environment or use dynamic creation
        const priceId = process.env[`STRIPE_${tier.toUpperCase()}_PRICE_ID`];
        
        // Create Stripe Checkout Session
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        // Build subscription_data with trial_end if in trial
        const subscriptionData: any = {
          metadata: {
            companyId: company.id,
            contractorId: contractorData.id,
            tier: tier,
          },
        };

        // If in trial, set subscription to start after trial ends
        if (inTrial && trialEndTimestamp) {
          subscriptionData.trial_end = trialEndTimestamp;
        }

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
                    unit_amount: tierConfig.price * 100,
                    recurring: {
                      interval: "month",
                    },
                  },
                  quantity: 1,
                },
          ],
          subscription_data: subscriptionData,
          success_url: `${baseUrl}/dashboard?subscription=success`,
          cancel_url: `${baseUrl}/signup?subscription=cancelled`,
          metadata: {
            companyId: company.id,
            contractorId: contractorData.id,
            tier: tier,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Account created! Redirecting to payment...",
          needsEmailConfirmation: signupResult.needsEmailConfirmation,
          checkoutUrl: session.url,
          sessionId: session.id,
        });
      } catch (error: any) {
        console.error("Error creating subscription checkout:", error);
        // Account was created, but subscription checkout failed
        return NextResponse.json({
          success: true,
          message: "Account created successfully. You can subscribe from the dashboard.",
          needsEmailConfirmation: signupResult.needsEmailConfirmation,
          subscriptionError: "Could not create subscription checkout. Please subscribe from the dashboard.",
        });
      }
    }

    // Free tier or trial - just return success
    return NextResponse.json({
      success: true,
      message: signupResult.needsEmailConfirmation
        ? "Account created successfully. Please check your email to verify your account."
        : "Account created successfully. You can now sign in.",
      needsEmailConfirmation: signupResult.needsEmailConfirmation,
    });
  } catch (error) {
    return createSecureErrorResponse("Account creation failed", 500, error);
  }
}

