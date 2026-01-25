import { NextResponse } from "next/server";
import { retrieveCheckoutSession } from "@/lib/payments";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

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

    // Retrieve the session from Stripe with expanded payment intent
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

    // Get payment method info if available
    let paymentMethodInfo = null;
    let customerId = null;
    let hasRemainingBalance = false;
    
    if (isPaid && session.payment_intent) {
      try {
        const paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : (session.payment_intent as any).id;
        
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['payment_method'],
        });
        
        customerId = typeof session.customer === 'string' 
          ? session.customer 
          : (session.customer as any)?.id || session.metadata?.customerId;
        
        if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
          const pm = paymentIntent.payment_method as any;
          paymentMethodInfo = {
            id: pm.id,
            type: pm.type,
            card: pm.card ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              exp_month: pm.card.exp_month,
              exp_year: pm.card.exp_year,
            } : null,
          };
        }
        
        // Check if there's a remaining balance
        if (contract) {
          const remainingBalance = contract.totalAmount - contract.depositAmount;
          hasRemainingBalance = remainingBalance > 0.01;
        }
      } catch (error) {
        console.error("Error retrieving payment method info:", error);
      }
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
            depositAmount: contract.depositAmount,
            totalAmount: contract.totalAmount,
            remainingBalance: contract.totalAmount - contract.depositAmount,
            paymentUrl: contract.signingToken 
              ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${contract.signingToken}`
              : null,
          }
        : null,
      paymentMethod: paymentMethodInfo,
      customerId: customerId,
      hasRemainingBalance: hasRemainingBalance,
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

