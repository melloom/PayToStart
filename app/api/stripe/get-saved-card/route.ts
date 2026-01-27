import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

/**
 * Get saved card information for a contract
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get("contractId");

    if (!contractId) {
      return NextResponse.json(
        { message: "Contract ID is required" },
        { status: 400 }
      );
    }

    // Get contract
    const contract = await db.contracts.findById(contractId);
    if (!contract) {
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }

    // Get saved payment method info
    const fieldValues = contract.fieldValues as any;
    const savedPaymentMethodId = fieldValues?.savedPaymentMethodId;
    const autoPayEnabled = fieldValues?.autoPayEnabled;

    if (!savedPaymentMethodId || !autoPayEnabled) {
      return NextResponse.json(
        { message: "No saved payment method found" },
        { status: 404 }
      );
    }

    // Retrieve payment method from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(savedPaymentMethodId);

    if (!paymentMethod.card) {
      return NextResponse.json(
        { message: "Payment method is not a card" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      cardInfo: {
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      },
    });
  } catch (error: any) {
    console.error("Error getting saved card:", error);
    return NextResponse.json(
      { message: error.message || "Failed to get saved card" },
      { status: 500 }
    );
  }
}
