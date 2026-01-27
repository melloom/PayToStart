import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

/**
 * Charge the remaining balance for a contract using a saved payment method with CVV confirmation
 * This requires the client to provide CVV for security
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

    // Get saved payment method info
    const fieldValues = contract.fieldValues as any;
    const savedPaymentMethodId = fieldValues?.savedPaymentMethodId;
    const savedCustomerId = fieldValues?.savedCustomerId;
    const autoPayEnabled = fieldValues?.autoPayEnabled;

    if (!savedPaymentMethodId || !savedCustomerId || !autoPayEnabled) {
      return NextResponse.json(
        { message: "No saved payment method found. Please use the payment link instead." },
        { status: 400 }
      );
    }

    // Calculate remaining balance
    const payments = await db.payments.findByContractId(contractId);
    const totalPaid = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const remainingBalance = contract.totalAmount - totalPaid;

    if (remainingBalance <= 0.01) {
      return NextResponse.json(
        { message: "No remaining balance to charge" },
        { status: 400 }
      );
    }

    // Get payment method details to show card info
    const paymentMethod = await stripe.paymentMethods.retrieve(savedPaymentMethodId);
    
    // Create payment intent - for saved cards, we need client-side confirmation with CVV
    // Return client secret so client can confirm with Stripe.js
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(remainingBalance * 100), // Convert to cents
      currency: "usd",
      customer: savedCustomerId,
      payment_method: savedPaymentMethodId,
      off_session: true, // Off-session payment with saved card
      confirm: false, // Don't confirm yet - client will confirm with CVV
      description: `Remaining balance for contract: ${contract.title}`,
      metadata: {
        contractId: contract.id,
        contract_id: contract.id,
        companyId: contract.companyId,
        company_id: contract.companyId,
        type: "remaining_balance",
        requiresCvv: "true",
      },
    });

    // Return client secret for client-side confirmation
    return NextResponse.json({
      requiresClientAction: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      cardInfo: paymentMethod.card ? {
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
      } : null,
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

      // Calculate new total paid
      const newTotalPaid = totalPaid + remainingBalance;
      const isFullyPaid = newTotalPaid >= contract.totalAmount - 0.01;

      // Update contract status if fully paid
      if (isFullyPaid) {
        await db.contracts.update(contract.id, {
          status: "completed",
          completedAt: new Date(),
        }, true); // Use service role

        // Delete saved payment method after contract is fully paid
        try {
          // Detach payment method from customer
          await stripe.paymentMethods.detach(savedPaymentMethodId);
          
          // Remove from contract fieldValues
          const updatedFieldValues = { ...fieldValues };
          delete updatedFieldValues.savedPaymentMethodId;
          delete updatedFieldValues.savedCustomerId;
          delete updatedFieldValues.autoPayEnabled;
          
          await db.contracts.update(contract.id, {
            fieldValues: updatedFieldValues,
          }, true);
        } catch (deleteError: any) {
          console.error("Error deleting saved payment method:", deleteError);
          // Don't fail the payment if deletion fails
        }
      } else {
        // Still has remaining balance, just update status
        await db.contracts.update(contract.id, {
          status: "paid",
        }, true);
      }

      // Log the event
      await db.contractEvents.logEvent({
        contractId: contract.id,
        companyId: contract.companyId,
        eventType: "payment_completed",
        actorType: "client",
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: remainingBalance,
          type: "remaining_balance",
          requiresCvv: true,
          isFullyPaid,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Remaining balance charged successfully",
        paymentIntentId: paymentIntent.id,
        amount: remainingBalance,
        isFullyPaid,
        cardInfo: paymentMethod.card ? {
          last4: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
        } : null,
      });
    } else {
      // Payment failed - log it
      await db.contractEvents.logEvent({
        contractId: contract.id,
        companyId: contract.companyId,
        eventType: "payment_failed",
        actorType: "client",
        metadata: {
          paymentIntentId: paymentIntent.id,
          amount: remainingBalance,
          status: paymentIntent.status,
          type: "remaining_balance",
          requiresCvv: true,
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
    console.error("Error charging remaining balance with CVV:", error);
    
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
