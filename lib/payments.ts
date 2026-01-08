// Payment utilities for Stripe Checkout Sessions

import { db } from "./db";
import { stripe } from "./stripe";
import type { Contract } from "./types";

/**
 * Create a Stripe Checkout Session for a contract deposit
 */
export async function createDepositCheckoutSession(
  contract: Contract,
  clientEmail: string,
  signingToken: string
) {
  if (contract.depositAmount <= 0) {
    throw new Error("Deposit amount must be greater than zero");
  }

  if (contract.status !== "signed") {
    throw new Error("Contract must be signed before payment");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Create Stripe Checkout Session
  // Note: Apple Pay and Google Pay are automatically available in Checkout
  // when the customer's device/browser supports them and the merchant is eligible
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Deposit for ${contract.title}`,
            description: `Contract deposit payment - Contract #${contract.id.slice(0, 8)}`,
          },
          unit_amount: Math.round(contract.depositAmount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/sign/${signingToken}/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/sign/${signingToken}?canceled=1`,
    customer_email: clientEmail,
    metadata: {
      contractId: contract.id,
      contract_id: contract.id, // Support both formats for backward compatibility
      signingToken: signingToken,
      companyId: contract.companyId,
      company_id: contract.companyId, // Support both formats
      type: "deposit",
    },
    payment_intent_data: {
      metadata: {
        contractId: contract.id,
        contract_id: contract.id,
        signingToken: signingToken,
        companyId: contract.companyId,
        company_id: contract.companyId,
        type: "deposit",
      },
    },
    // Allow promotion codes
    allow_promotion_codes: true,
    // Collect billing address
    billing_address_collection: "auto",
  });

  // Create payment record in database
  await db.payments.create({
    contractId: contract.id,
    companyId: contract.companyId,
    amount: contract.depositAmount,
    status: "pending",
    paymentIntentId: session.id, // Store session ID
  });

  return session;
}

/**
 * Verify and process a completed checkout session
 */
export async function processCompletedCheckoutSession(
  sessionId: string,
  session: any
) {
  // Support both old and new metadata format for backward compatibility
  const contractId = session.metadata?.contract_id || session.metadata?.contractId;
  const companyId = session.metadata?.company_id || session.metadata?.companyId;

  if (!contractId || !companyId) {
    throw new Error("Missing contract or company metadata in checkout session");
  }

  // Retrieve the contract
  const contract = await db.contracts.findById(contractId);
  if (!contract) {
    throw new Error(`Contract not found: ${contractId}`);
  }

  // Verify contract is signed
  if (contract.status !== "signed") {
    throw new Error(`Contract not signed. Current status: ${contract.status}`);
  }

  // Verify payment amount matches deposit
  const paymentAmount = (session.amount_total || 0) / 100;
  if (Math.abs(paymentAmount - contract.depositAmount) > 0.01) {
    throw new Error(
      `Payment amount mismatch. Expected: $${contract.depositAmount}, Received: $${paymentAmount}`
    );
  }

  // Verify payment status
  if (session.payment_status !== "paid") {
    throw new Error(`Payment not completed. Status: ${session.payment_status}`);
  }

  // Get receipt URL from checkout session (Stripe automatically generates this)
  // The receipt URL is available via session.url but we need the actual receipt
  let receiptId: string | null = null;
  let receiptUrl: string | null = null;
  
  try {
    // Retrieve the payment intent to get receipt URL
    if (session.payment_intent && typeof session.payment_intent === 'string') {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
      // Stripe receipt can be generated via the charge receipt_email or accessed via the receipt URL
      receiptId = paymentIntent.id;
      // Receipt URL format: https://pay.stripe.com/receipts/{charge_id}
      if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'string') {
        receiptUrl = `https://pay.stripe.com/receipts/${paymentIntent.latest_charge}`;
      }
    }
  } catch (error) {
    console.warn("Could not retrieve receipt information:", error);
  }

  // Update payment record - use stripe_checkout_session_id for idempotency
  const payments = await db.payments.findByContractId(contractId);
  const payment = payments.find((p) => p.paymentIntentId === sessionId); // paymentIntentId stores checkout session ID

  if (payment) {
    await db.payments.update(payment.id, {
      status: "completed",
      completedAt: new Date(),
    });
  } else {
    // Payment record not found, create one
    await db.payments.create({
      contractId: contract.id,
      companyId: contract.companyId,
      amount: paymentAmount,
      status: "completed",
      paymentIntentId: sessionId,
      completedAt: new Date(),
    });
  }

  // Update contract status to paid
  const updatedContract = await db.contracts.update(contractId, {
    status: "paid",
    paidAt: new Date(),
  });

  if (!updatedContract) {
    throw new Error("Failed to update contract status");
  }

  // Log audit events (import db to access contractEvents)
  const { db: dbModule } = await import("./db");
  await dbModule.contractEvents.logEvent({
    contractId: contractId,
    eventType: "payment_completed",
    actorType: "webhook",
    metadata: {
      sessionId: sessionId,
      amount: paymentAmount,
      stripeSessionId: sessionId,
      receiptId,
      receiptUrl,
    },
  });

  await dbModule.contractEvents.logEvent({
    contractId: contractId,
    eventType: "paid",
    actorType: "webhook",
    metadata: {
      sessionId: sessionId,
      amount: paymentAmount,
    },
  });

  return {
    contract: updatedContract,
    payment,
    receiptId,
    receiptUrl,
  };
}

/**
 * Retrieve a Stripe checkout session by ID
 */
export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "customer"],
  });

  return session;
}

/**
 * Check if a payment is already processed (idempotency check)
 */
export async function isPaymentProcessed(sessionId: string): Promise<boolean> {
  // Idempotency check: verify stripe_checkout_session_id not already processed
  try {
    const session = await retrieveCheckoutSession(sessionId);
    // Support both old and new metadata format for backward compatibility
    const contractId = session.metadata?.contract_id || session.metadata?.contractId;

    if (!contractId) {
      return false;
    }

    // Check if we have a completed payment record for this checkout session ID
    const payments = await db.payments.findByContractId(contractId);
    const payment = payments.find(
      (p) => p.paymentIntentId === sessionId && p.status === "completed"
    );

    if (payment) {
      // Check if contract is already finalized
      const contract = await db.contracts.findById(contractId);
      return contract?.status === "completed" || contract?.status === "paid";
    }

    return false;
  } catch (error) {
    console.error("Error checking payment status:", error);
    return false;
  }
}

