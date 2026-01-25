import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { isSubscriptionActive } from "@/lib/subscriptions";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "Not found", message: "No customer found" },
        { status: 404 }
      );
    }

    // Check if user has active subscription
    const hasActiveSubscription = await isSubscriptionActive(company.id);
    
    if (hasActiveSubscription) {
      return NextResponse.json(
        {
          error: "Cannot delete",
          message: "You cannot delete your payment method while you have an active subscription. Please replace it instead or cancel your subscription first.",
        },
        { status: 403 }
      );
    }

    // Get customer to check if this is the default payment method
    const customer = await stripe.customers.retrieve(company.subscriptionStripeCustomerId);
    
    if (customer && !("deleted" in customer)) {
      const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;
      
      // If this is the default payment method, we need to remove it first
      if (defaultPaymentMethodId === params.id) {
        await stripe.customers.update(company.subscriptionStripeCustomerId, {
          invoice_settings: {
            default_payment_method: null,
          },
        });
      }
    }

    // Detach payment method from customer
    await stripe.paymentMethods.detach(params.id);

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to delete payment method",
        message: error.message || "Failed to delete payment method. Please try again.",
      },
      { status: 500 }
    );
  }
}
