import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get("payment_intent_id");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "payment_intent_id is required" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents to dollars
      currency: paymentIntent.currency,
      paymentIntentId: paymentIntent.id,
      receiptEmail: paymentIntent.receipt_email,
    });
  } catch (error: any) {
    console.error("Error retrieving payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve payment intent" },
      { status: 500 }
    );
  }
}
