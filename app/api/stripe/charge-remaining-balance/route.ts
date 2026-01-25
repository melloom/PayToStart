import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

/**
 * Charge the remaining balance for a contract using a saved payment method
 * This can be called manually or via cron job when balance is due
 */
export async function POST(request: Request) {
  try {
    const { contractId } = await request.json();

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

    // Check if contract is already fully paid
    if (contract.status === "completed" || contract.status === "paid") {
      const payments = await db.payments.findByContractId(contractId);
      const totalPaid = payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= contract.totalAmount) {
        return NextResponse.json(
          { message: "Contract is already fully paid" },
          { status: 400 }
        );
      }
    }

    // Get saved payment method info
    const fieldValues = contract.fieldValues as any;
    const savedPaymentMethodId = fieldValues?.savedPaymentMethodId;
    const savedCustomerId = fieldValues?.savedCustomerId;
    const autoPayEnabled = fieldValues?.autoPayEnabled;

    if (!savedPaymentMethodId || !savedCustomerId || !autoPayEnabled) {
      return NextResponse.json(
        { message: "No saved payment method found for automatic payment" },
        { status: 400 }
      );
    }

    // Calculate remaining balance
    const payments = await db.payments.findByContractId(contractId);
    const totalPaid = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = contract.totalAmount - totalPaid;

    if (remainingBalance <= 0.01) {
      return NextResponse.json(
        { message: "No remaining balance to charge" },
        { status: 400 }
      );
    }

    // Get client info for receipt
    const client = await db.clients.findById(contract.clientId);
    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Charge the customer using the saved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(remainingBalance * 100), // Convert to cents
      currency: "usd",
      customer: savedCustomerId,
      payment_method: savedPaymentMethodId,
      off_session: true, // Important: indicates this is an off-session payment
      confirm: true, // Automatically confirm the payment
      description: `Remaining balance for contract: ${contract.title}`,
      metadata: {
        contractId: contract.id,
        contract_id: contract.id,
        companyId: contract.companyId,
        company_id: contract.companyId,
        type: "remaining_balance",
        autoPay: "true",
      },
    });

    // Check if payment was successful
    if (paymentIntent.status === "succeeded") {
      // Create payment record
      await db.payments.create({
        contractId: contract.id,
        companyId: contract.companyId,
        amount: remainingBalance,
        status: "completed",
        paymentIntentId: paymentIntent.id,
        completedAt: new Date(),
      });

      // Update contract status if fully paid
      const newTotalPaid = totalPaid + remainingBalance;
      if (newTotalPaid >= contract.totalAmount - 0.01) {
        await db.contracts.update(contract.id, {
          status: "completed",
          completedAt: new Date(),
        }, true); // Use service role
      }

      // Log the event
      await db.contractEvents.logEvent({
        contractId: contract.id,
        eventType: "payment_completed",
        actorType: "system",
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: remainingBalance,
          type: "remaining_balance",
          autoPay: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Remaining balance charged successfully",
        paymentIntentId: paymentIntent.id,
        amount: remainingBalance,
      });
    } else {
      // Payment failed - log it
      await db.contractEvents.logEvent({
        contractId: contract.id,
        eventType: "payment_failed",
        actorType: "system",
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: remainingBalance,
          status: paymentIntent.status,
          type: "remaining_balance",
          autoPay: true,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: `Payment failed. Status: ${paymentIntent.status}`,
          paymentIntentId: paymentIntent.id,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error charging remaining balance:", error);
    
    // If it's a card error, provide more details
    if (error.type === "StripeCardError") {
      return NextResponse.json(
        {
          message: `Card error: ${error.message}`,
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error.message || "Failed to charge remaining balance" },
      { status: 500 }
    );
  }
}
