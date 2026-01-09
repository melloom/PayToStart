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

    if (!company.subscriptionStripeCustomerId) {
      return NextResponse.json(
        { error: "No customer", message: "No Stripe customer found. Please create a subscription first." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: company.subscriptionStripeCustomerId,
      return_url: `${baseUrl}/dashboard/subscription`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error: any) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

