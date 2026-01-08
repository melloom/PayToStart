import { NextResponse } from "next/server";
import { retrieveCheckoutSession } from "@/lib/payments";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { verified: false, message: "Session ID required" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await retrieveCheckoutSession(sessionId);

    // Check if payment is completed
    const isPaid = session.payment_status === "paid";

    // Get contract information if available
    // Support both old and new metadata format for backward compatibility
    let contract = null;
    const contractId = session.metadata?.contract_id || session.metadata?.contractId;
    if (contractId) {
      contract = await db.contracts.findById(contractId);
    }

    return NextResponse.json({
      verified: isPaid,
      paid: isPaid, // Alias for easier access
      paymentStatus: session.payment_status,
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
      },
      contract: contract
        ? {
            id: contract.id,
            status: contract.status,
            title: contract.title,
          }
        : null,
      message: isPaid
        ? "Payment verified successfully"
        : `Payment status: ${session.payment_status}`,
    });
  } catch (error: any) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { verified: false, message: error.message },
      { status: 500 }
    );
  }
}

