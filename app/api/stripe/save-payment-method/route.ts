import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { paymentMethodId, customerId, contractId, remainingBalance } = await request.json();

    if (!paymentMethodId || !customerId || !contractId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify contract exists
    const contract = await db.contracts.findById(contractId);
    if (!contract) {
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default payment method for customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Store payment method info in contract metadata or create a separate table entry
    // For now, we'll store it in contract metadata
    await db.contracts.update(contractId, {
      fieldValues: {
        ...contract.fieldValues,
        savedPaymentMethodId: paymentMethodId,
        savedCustomerId: customerId,
        autoPayEnabled: true,
        remainingBalance: remainingBalance,
      },
    }, true); // Use service role

    // Log the event
    await db.contractEvents.logEvent({
      contractId: contractId,
      eventType: "payment_method_saved",
      actorType: "client",
      metadata: {
        paymentMethodId: paymentMethodId,
        customerId: customerId,
        remainingBalance: remainingBalance,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment method saved successfully. Remaining balance will be charged automatically when due.",
    });
  } catch (error: any) {
    console.error("Error saving payment method:", error);
    return NextResponse.json(
      { message: error.message || "Failed to save payment method" },
      { status: 500 }
    );
  }
}
