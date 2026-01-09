import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
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
      return NextResponse.json({
        paymentMethods: [],
        defaultPaymentMethod: null,
      });
    }

    // Get customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: company.subscriptionStripeCustomerId,
      type: "card",
    });

    // Get customer to find default payment method
    const customer = await stripe.customers.retrieve(company.subscriptionStripeCustomerId);
    const defaultPaymentMethodId = 
      customer && !("deleted" in customer) && customer.invoice_settings?.default_payment_method
        ? customer.invoice_settings.default_payment_method
        : null;

    // Format payment methods
    const formattedPaymentMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : null,
      isDefault: pm.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({
      paymentMethods: formattedPaymentMethods,
      defaultPaymentMethod: defaultPaymentMethodId,
    });
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

