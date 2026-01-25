import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

// POST - Setup payment method for subscription
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { paymentMethodId, setAsDefault = true } = body;

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: "Missing payment method", message: "paymentMethodId is required" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = company.subscriptionStripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: contractor.email,
        name: contractor.name,
        metadata: {
          companyId: company.id,
          contractorId: contractor.id,
        },
      });

      customerId = customer.id;

      // Update company with customer ID
      await db.companies.update(company.id, {
        subscriptionStripeCustomerId: customerId,
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method if requested
    if (setAsDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment method added successfully",
      customerId,
    });
  } catch (error: any) {
    console.error("Error setting up payment method:", error);
    console.error("Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    
    // Provide more specific error messages
    let errorMessage = "Failed to setup payment method";
    if (error.type === "StripeCardError") {
      errorMessage = error.message || "Your card was declined. Please check your card details and try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? {
          type: error.type,
          code: error.code,
        } : undefined,
      },
      { status: 500 }
    );
  }
}
