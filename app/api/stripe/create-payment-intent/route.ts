import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { hashToken, verifyToken } from "@/lib/security/tokens";
import { log } from "@/lib/logger";

async function verifyContractToken(token: string): Promise<{ contract: any; error?: string }> {
  try {
    // Try to find contract by hashed token first (new method)
    const tokenHash = hashToken(token);
    let contract = await db.contracts.findBySigningTokenHash(tokenHash);

    // If not found, try raw token (backwards compatibility)
    if (!contract) {
      contract = await db.contracts.findBySigningToken(token);
    }

    if (!contract) {
      return {
        contract: null,
        error: "Contract not found or invalid link",
      };
    }

    return { contract };
  } catch (error: any) {
    log.error({ error: error.message }, "Error verifying contract token");
    return {
      contract: null,
      error: "Error verifying contract token",
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractId, signingToken, amount, currency = "usd", clientEmail, paymentType = "deposit" } = body;

    if (!contractId || !signingToken || !amount) {
      return NextResponse.json(
        { message: "Missing required fields: contractId, signingToken, and amount are required" },
        { status: 400 }
      );
    }

    // Verify contract exists with secure token verification
    const { contract, error } = await verifyContractToken(signingToken);
    if (!contract || error) {
      return NextResponse.json(
        { message: error || "Contract not found" },
        { status: 404 }
      );
    }

    // Verify contract ID matches
    if (contract.id !== contractId) {
      return NextResponse.json(
        { message: "Contract ID mismatch" },
        { status: 400 }
      );
    }

    // Get client information
    let client = await db.clients.findById(contract.clientId).catch(() => null);
    
    // Use provided email or client email (email is optional - can be provided later)
    const emailToUse = clientEmail || client?.email || contract.fieldValues?.clientEmail || contract.fieldValues?.email;

    // Get or create Stripe customer (only if email is available)
    let customerId: string | null = null;
    if (emailToUse) {
      try {
        // Try to find existing customer by email
        const customers = await stripe.customers.list({
          email: emailToUse,
          limit: 1,
        });

        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          // Create new customer
          const customer = await stripe.customers.create({
            email: emailToUse,
            name: client?.name || emailToUse,
            metadata: {
              contractId: contract.id,
              companyId: contract.companyId,
            },
          });
          customerId = customer.id;
        }
      } catch (error: any) {
        log.error({ error: error.message }, "Error creating/finding Stripe customer");
        // Don't fail if customer creation fails - payment intent can still be created
        console.warn("Failed to create/find customer, continuing without customer ID");
      }
    }

    // Calculate payment amount (ensure it's in cents)
    const amountInCents = Math.round(Number(amount) * 100);

    if (amountInCents <= 0) {
      return NextResponse.json(
        { message: "Invalid payment amount" },
        { status: 400 }
      );
    }

    // Create Payment Intent with multiple payment methods
    // Note: Zelle and Amazon Pay are not directly supported by Stripe
    const paymentIntentData: any = {
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: [
        'card',           // Credit/Debit cards
        'us_bank_account', // ACH Direct Debit (US bank accounts)
        'link',           // Stripe Link (one-click checkout)
        'cashapp',        // Cash App Pay
      ],
      description: paymentType === "remaining_balance" 
        ? `Remaining balance for contract: ${contract.title}`
        : `Deposit for contract: ${contract.title}`,
      metadata: {
        contractId: contract.id,
        contract_id: contract.id,
        companyId: contract.companyId,
        company_id: contract.companyId,
        type: paymentType,
        signingToken: signingToken.substring(0, 16) + "...", // Only store partial token for security
      },
    };

    // Add customer if available
    if (customerId) {
      paymentIntentData.customer = customerId;
    }

    // Add receipt email if available
    if (emailToUse) {
      paymentIntentData.receipt_email = emailToUse;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    log.info({
      contractId: contract.id,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
      paymentType,
    }, "Payment intent created successfully");

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    log.error({
      error: error.message,
      stack: error.stack,
    }, "Error creating payment intent");
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
