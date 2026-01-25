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

  // Get or create Stripe customer for saving payment methods
  let customerId: string | null = null;
  try {
    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: clientEmail,
      limit: 1,
    });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: clientEmail,
        metadata: {
          contractId: contract.id,
          companyId: contract.companyId,
        },
      });
      customerId = customer.id;
    }
  } catch (error) {
    console.error("Error creating/finding customer:", error);
    // Continue without customer - payment method won't be saved
  }

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
    customer: customerId || undefined, // Use customer if available, otherwise use email
    customer_email: customerId ? undefined : clientEmail, // Only set email if no customer
    metadata: {
      contractId: contract.id,
      contract_id: contract.id, // Support both formats for backward compatibility
      signingToken: signingToken,
      companyId: contract.companyId,
      company_id: contract.companyId, // Support both formats
      type: "deposit",
      customerId: customerId || "", // Store customer ID for later use
    },
    payment_intent_data: {
      setup_future_usage: "off_session", // Allow saving payment method for future use
      metadata: {
        contractId: contract.id,
        contract_id: contract.id,
        signingToken: signingToken,
        companyId: contract.companyId,
        company_id: contract.companyId,
        type: "deposit",
        customerId: customerId || "",
      },
    },
    // Allow promotion codes
    allow_promotion_codes: true,
    // Collect billing address
    billing_address_collection: "auto",
  });

  // Create payment record in database
  try {
    await db.payments.create({
      contractId: contract.id,
      companyId: contract.companyId,
      amount: contract.depositAmount,
      status: "pending",
      paymentIntentId: session.id, // Store session ID
    });
  } catch (paymentError: any) {
    // Log error but don't fail checkout session creation
    // Payment record can be created later via webhook
    console.error("Failed to create payment record:", {
      error: paymentError.message,
      stack: paymentError.stack,
      contractId: contract.id,
    });
    // Continue - the webhook will create the payment record when payment completes
  }

  return session;
}

/**
 * Create a Stripe Checkout Session for remaining balance payment
 */
export async function createRemainingBalanceCheckoutSession(
  contract: Contract,
  clientEmail: string,
  signingToken: string
) {
  // Calculate actual remaining balance from payments
  const payments = await db.payments.findByContractId(contract.id);
  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const remainingBalance = contract.totalAmount - totalPaid;

  if (remainingBalance <= 0.01) {
    throw new Error("No remaining balance to pay");
  }

  if (contract.status !== "signed" && contract.status !== "paid") {
    throw new Error("Contract must be signed before payment");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get or create Stripe customer for saving payment methods
  let customerId: string | null = null;
  try {
    // Try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: clientEmail,
      limit: 1,
    });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: clientEmail,
        metadata: {
          contractId: contract.id,
          companyId: contract.companyId,
        },
      });
      customerId = customer.id;
    }
  } catch (error) {
    console.error("Error creating/finding customer:", error);
    // Continue without customer - payment method won't be saved
  }

  // Create Stripe Checkout Session for remaining balance
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Remaining Balance for ${contract.title}`,
            description: `Final payment for Contract #${contract.id.slice(0, 8)} - Remaining balance`,
          },
          unit_amount: Math.round(remainingBalance * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/sign/${signingToken}/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pay/${signingToken}?canceled=1`,
    customer: customerId || undefined,
    customer_email: customerId ? undefined : clientEmail,
    metadata: {
      contractId: contract.id,
      contract_id: contract.id,
      signingToken: signingToken,
      companyId: contract.companyId,
      company_id: contract.companyId,
      type: "remaining_balance",
      customerId: customerId || "",
      remainingBalance: remainingBalance.toFixed(2),
    },
    payment_intent_data: {
      setup_future_usage: "off_session",
      metadata: {
        contractId: contract.id,
        contract_id: contract.id,
        signingToken: signingToken,
        companyId: contract.companyId,
        company_id: contract.companyId,
        type: "remaining_balance",
        customerId: customerId || "",
        remainingBalance: remainingBalance.toFixed(2),
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  // Create payment record in database
  try {
    await db.payments.create({
      contractId: contract.id,
      companyId: contract.companyId,
      amount: remainingBalance,
      status: "pending",
      paymentIntentId: session.id,
    });
  } catch (paymentError: any) {
    console.error("Failed to create payment record:", {
      error: paymentError.message,
      stack: paymentError.stack,
      contractId: contract.id,
    });
    // Continue - the webhook will create the payment record when payment completes
  }

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

  // Verify contract is signed or paid
  if (contract.status !== "signed" && contract.status !== "paid") {
    throw new Error(`Contract not signed. Current status: ${contract.status}`);
  }

  // Determine payment type from metadata
  const paymentType = session.metadata?.type || "deposit";
  const paymentAmount = (session.amount_total || 0) / 100;

  // Verify payment amount based on type
  if (paymentType === "remaining_balance") {
    // For remaining balance, calculate actual remaining balance
    const payments = await db.payments.findByContractId(contractId);
    const totalPaid = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingBalance = contract.totalAmount - totalPaid;
    
    if (Math.abs(paymentAmount - remainingBalance) > 0.01) {
      throw new Error(
        `Payment amount mismatch. Expected remaining balance: $${remainingBalance.toFixed(2)}, Received: $${paymentAmount}`
      );
    }
  } else {
    // For deposit, verify against deposit amount
    if (Math.abs(paymentAmount - contract.depositAmount) > 0.01) {
      throw new Error(
        `Payment amount mismatch. Expected deposit: $${contract.depositAmount}, Received: $${paymentAmount}`
      );
    }
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

  // Calculate total paid after this payment
  const allPayments = await db.payments.findByContractId(contractId);
  const totalPaid = allPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  // Check if contract is fully paid
  const isFullyPaid = totalPaid >= contract.totalAmount - 0.01; // Allow small rounding differences

  // Update contract status
  let updatedContract;
  if (isFullyPaid) {
    // Contract is fully paid - mark as completed
    updatedContract = await db.contracts.update(contractId, {
      status: "completed",
      paidAt: new Date(),
      completedAt: new Date(),
    });
  } else {
    // Still has remaining balance - mark as paid (deposit received)
    updatedContract = await db.contracts.update(contractId, {
      status: "paid",
      paidAt: new Date(),
    });
  }

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
    isFullyPaid,
  };
}

/**
 * Retrieve a Stripe checkout session by ID
 */
export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "payment_intent.payment_method", "customer"],
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

