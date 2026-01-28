import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAllSignatures } from "@/lib/signature";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse request body for refund options
    let refundOption: "automatic" | "manual" | "keep" = "automatic";
    let cancellationFee: number | null = null;
    let refundReason: string | null = null;
    
    try {
      const body = await request.json().catch(() => ({}));
      refundOption = body.refundOption || "automatic";
      cancellationFee = body.cancellationFee ? parseFloat(body.cancellationFee) : null;
      refundReason = body.refundReason || null;
    } catch (e) {
      // If no body provided, use defaults
    }

    const contract = await db.contracts.findById(params.id);
    if (!contract || contract.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Contract not found" }, { status: 404 });
    }

    if (contract.status === "cancelled") {
      return NextResponse.json(
        { message: "Contract is already cancelled" },
        { status: 400 }
      );
    }

    if (contract.status === "completed") {
      return NextResponse.json(
        { message: "Cannot cancel a completed contract" },
        { status: 400 }
      );
    }

    // Verify contractor owns this contract (additional check)
    if (contract.companyId !== contractor.companyId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Check if both parties have signed - if so, warn but still allow voiding
    const signatures = await getAllSignatures(contract.id, contract.clientId, contract.contractorId);
    const bothSigned = signatures.clientSignature && signatures.contractorSignature;
    
    if (bothSigned) {
      // Both parties have signed - still allow voiding but log a warning
      console.warn(`Contract ${contract.id} is being voided after both parties signed`);
    }

    // Get payment schedule information for logging
    const paymentSchedule = contract.fieldValues ? (contract.fieldValues as any)?.paymentSchedule : null;
    const paymentScheduleConfig = contract.fieldValues ? (contract.fieldValues as any)?.paymentScheduleConfig : null;
    const isIncremental = paymentSchedule === "incremental";
    
    // Process refunds for any completed payments (handles all payment types: deposit, full, incremental, remaining balance)
    const payments = await db.payments.findByContractId(contract.id);
    const completedPayments = payments.filter(p => p.status === "completed");
    const pendingPayments = payments.filter(p => p.status === "pending");
    
    // Calculate total amounts for reporting
    const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    const refundResults = [];
    
    // Handle refunds based on option selected
    if (completedPayments.length > 0) {
      console.log(`Processing refunds for ${completedPayments.length} completed payment(s) for contract ${contract.id}`);
      console.log(`Payment schedule type: ${paymentSchedule || 'standard'}, Total paid: $${totalPaid.toFixed(2)}`);
      console.log(`Refund option: ${refundOption}`);
      
      if (refundOption === "keep") {
        // Contractor wants to keep the payment - no refunds processed
        console.log(`Contractor chose to keep payments - no refunds will be processed`);
        refundResults.push({
          action: "kept",
          message: "Payments kept per contractor's choice",
          totalAmount: totalPaid,
          paymentsCount: completedPayments.length,
        });
      } else if (refundOption === "manual") {
        // Mark for manual refund processing later
        console.log(`Payments marked for manual refund processing`);
        refundResults.push({
          action: "manual",
          message: "Payments require manual refund processing",
          totalAmount: totalPaid,
          paymentsCount: completedPayments.length,
          note: "Contractor must process refunds manually through Stripe dashboard or payment processor",
        });
      } else {
        // Automatic refund processing
        for (const payment of completedPayments) {
        try {
          // Determine payment type from payment metadata or contract
          const paymentType = (payment as any).type || 
            (payment as any).metadata?.type || 
            (isIncremental ? "incremental_payment" : 
             payment.amount === contract.depositAmount ? "deposit" :
             payment.amount === contract.totalAmount ? "full_payment" : "remaining_balance");
          
          console.log(`Processing refund for payment ${payment.id}: $${payment.amount} (type: ${paymentType})`);
          
          // Try to find the payment intent from the checkout session or payment intent ID
          let paymentIntentId: string | null = null;
          
          // paymentIntentId might be a checkout session ID, so we need to retrieve the session first
          if (payment.paymentIntentId) {
            try {
              // Try to retrieve as checkout session first (with expanded payment_intent)
              const session = await stripe.checkout.sessions.retrieve(payment.paymentIntentId, {
                expand: ['payment_intent'],
              });
              if (session.payment_intent) {
                if (typeof session.payment_intent === 'string') {
                  paymentIntentId = session.payment_intent;
                } else if (typeof session.payment_intent === 'object' && session.payment_intent?.id) {
                  paymentIntentId = session.payment_intent.id;
                }
              }
            } catch (sessionError) {
              // If it's not a checkout session, try as payment intent directly
              try {
                const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentIntentId);
                paymentIntentId = paymentIntent.id;
              } catch (piError: any) {
                // Check if it's a payment intent ID format error or not found
                if (piError.code === 'resource_missing') {
                  console.warn(`Payment intent ${payment.paymentIntentId} not found for payment ${payment.id}`);
                } else {
                  console.error(`Could not retrieve payment intent for payment ${payment.id}:`, piError);
                }
              }
            }
          }

          if (paymentIntentId) {
            // Retrieve the payment intent to get the charge ID
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            // Only refund if payment was successful
            if (paymentIntent.status === 'succeeded' && paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'string') {
              // Check if already refunded
              const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
              const alreadyRefunded = charge.refunded || (charge.amount_refunded && charge.amount_refunded > 0);
              
              if (alreadyRefunded) {
                console.log(`Payment ${payment.id} already refunded - skipping`);
                refundResults.push({
                  paymentId: payment.id,
                  amount: payment.amount,
                  refundId: null,
                  status: "already_refunded",
                  paymentType: paymentType,
                });
              } else {
                // Calculate refund amount (may be reduced by cancellation fee)
                let refundAmount = Number(payment.amount);
                let actualRefundAmount = refundAmount;
                
                // Apply cancellation fee if specified (deduct from refund)
                if (cancellationFee !== null && cancellationFee > 0) {
                  // Distribute cancellation fee proportionally across payments
                  const feePerPayment = cancellationFee / completedPayments.length;
                  actualRefundAmount = Math.max(0, refundAmount - feePerPayment);
                  console.log(`Applying cancellation fee of $${feePerPayment.toFixed(2)} to payment ${payment.id}, refunding $${actualRefundAmount.toFixed(2)} instead of $${refundAmount.toFixed(2)}`);
                }
                
                // Only process refund if amount is greater than 0
                if (actualRefundAmount <= 0) {
                  console.log(`Refund amount is $0 or less for payment ${payment.id} (cancellation fee exceeds payment amount)`);
                  refundResults.push({
                    paymentId: payment.id,
                    amount: payment.amount,
                    refundId: null,
                    status: "fee_exceeds_payment",
                    paymentType: paymentType,
                    cancellationFee: cancellationFee ? (cancellationFee / completedPayments.length) : 0,
                    message: "Cancellation fee exceeds payment amount - no refund",
                  });
                  continue;
                }
                
                // Create refund for the charge
                try {
                  const refund = await stripe.refunds.create({
                    charge: paymentIntent.latest_charge,
                    amount: Math.round(actualRefundAmount * 100), // Convert to cents
                    metadata: {
                      contractId: contract.id,
                      reason: refundReason || "contract_voided",
                      voidedBy: contractor.id,
                      cancellationFee: cancellationFee ? (cancellationFee / completedPayments.length).toFixed(2) : "0",
                      originalAmount: refundAmount.toFixed(2),
                    },
                  });

                  refundResults.push({
                    paymentId: payment.id,
                    amount: payment.amount,
                    refundAmount: actualRefundAmount,
                    refundId: refund.id,
                    status: refund.status,
                    paymentType: paymentType,
                    cancellationFee: cancellationFee ? (cancellationFee / completedPayments.length) : 0,
                  });

                  // Update payment record to reflect refund
                  await db.payments.update(payment.id, {
                    status: "failed", // Mark as failed since it was refunded
                  });

                  console.log(`Refunded payment ${payment.id} for contract ${contract.id}: $${actualRefundAmount.toFixed(2)} of $${payment.amount.toFixed(2)} (${paymentType})`);
                } catch (refundError: any) {
                  // Handle insufficient funds or other Stripe errors
                  if (refundError.code === 'charge_already_refunded') {
                    console.log(`Payment ${payment.id} already refunded`);
                    refundResults.push({
                      paymentId: payment.id,
                      amount: payment.amount,
                      refundId: null,
                      status: "already_refunded",
                      paymentType: paymentType,
                    });
                  } else if (refundError.code === 'insufficient_funds' || refundError.message?.includes('insufficient')) {
                    console.error(`Insufficient funds to refund payment ${payment.id}:`, refundError);
                    refundResults.push({
                      paymentId: payment.id,
                      amount: payment.amount,
                      error: "Insufficient funds in Stripe account to process refund. Please add funds and process manually.",
                      paymentType: paymentType,
                      requiresManualRefund: true,
                    });
                  } else {
                    throw refundError; // Re-throw other errors
                  }
                }
              }
            } else if (paymentIntent.status !== 'succeeded') {
              console.warn(`Payment intent ${paymentIntentId} status is ${paymentIntent.status}, cannot refund`);
              refundResults.push({
                paymentId: payment.id,
                amount: payment.amount,
                error: `Payment status is ${paymentIntent.status}, cannot refund`,
                paymentType: paymentType,
              });
            }
          } else {
            console.warn(`Could not find payment intent for payment ${payment.id} - refund not processed`);
            refundResults.push({
              paymentId: payment.id,
              amount: payment.amount,
              error: "Payment intent not found",
              paymentType: paymentType,
            });
          }
        } catch (refundError: any) {
          console.error(`Error refunding payment ${payment.id} (${paymentType}):`, refundError);
          
          // Check for specific error types
          let errorMessage = refundError.message || "Refund failed";
          let requiresManualRefund = false;
          
          if (refundError.code === 'insufficient_funds' || errorMessage.includes('insufficient')) {
            errorMessage = "Insufficient funds in Stripe account. Please add funds and process refund manually through Stripe dashboard.";
            requiresManualRefund = true;
          } else if (refundError.code === 'charge_already_refunded') {
            errorMessage = "Payment already refunded";
          }
          
          refundResults.push({
            paymentId: payment.id,
            amount: payment.amount,
            error: errorMessage,
            paymentType: paymentType,
            requiresManualRefund: requiresManualRefund,
          });
        }
      }
      } // End of automatic refund processing
    }
      
      // Cancel any pending payments (incremental payments that haven't been processed yet)
      if (pendingPayments.length > 0) {
        console.log(`Cancelling ${pendingPayments.length} pending payment(s) for contract ${contract.id}`);
        for (const payment of pendingPayments) {
          try {
            await db.payments.update(payment.id, {
              status: "failed", // Mark as failed since contract is voided
            });
            console.log(`Cancelled pending payment ${payment.id}: $${payment.amount}`);
          } catch (error: any) {
            console.error(`Error cancelling pending payment ${payment.id}:`, error);
          }
        }
      }
    }

    // Update contract status to cancelled
    const updatedContract = await db.contracts.update(params.id, {
      status: "cancelled",
    });

    if (!updatedContract) {
      return NextResponse.json(
        { message: "Failed to update contract" },
        { status: 500 }
      );
    }

    // Log audit event with comprehensive payment information
    await db.contractEvents.logEvent({
      contractId: params.id,
      eventType: "voided",
      actorType: "contractor",
      actorId: contractor.id,
        metadata: {
        previousStatus: contract.status,
        voidedAt: new Date().toISOString(),
        bothPartiesSigned: bothSigned,
        paymentSchedule: paymentSchedule || "standard",
        isIncremental: isIncremental,
        totalPaid: totalPaid,
        totalPending: totalPending,
        completedPaymentsCount: completedPayments.length,
        pendingPaymentsCount: pendingPayments.length,
        refundOption: refundOption,
        cancellationFee: cancellationFee,
        refundReason: refundReason,
        refundsProcessed: refundResults.filter((r: any) => r.refundId || r.status === "already_refunded" || r.action === "kept" || r.action === "manual").length,
        refundResults: refundResults,
      },
    });

    const successfulRefunds = refundResults.filter((r: any) => r.refundId || r.status === "already_refunded").length;
    const failedRefunds = refundResults.filter((r: any) => r.error).length;
    const keptPayments = refundResults.filter((r: any) => r.action === "keep").length;
    const manualRefunds = refundResults.filter((r: any) => r.action === "manual" || r.requiresManualRefund).length;
    
    let message = "Contract has been marked as void";
    if (refundOption === "keep") {
      message = "Contract voided. Payments kept per your selection.";
    } else if (refundOption === "manual") {
      message = "Contract voided. Payments require manual refund processing.";
    } else if (cancellationFee && cancellationFee > 0) {
      message = `Contract voided. Refunds processed with cancellation fee of $${cancellationFee.toFixed(2)} applied.`;
    }
    
    return NextResponse.json({
      success: true,
      message: message,
      contract: updatedContract,
      paymentInfo: {
        totalPaid: totalPaid,
        totalPending: totalPending,
        completedPaymentsCount: completedPayments.length,
        pendingPaymentsCount: pendingPayments.length,
        paymentSchedule: paymentSchedule || "standard",
        isIncremental: isIncremental,
        cancellationFee: cancellationFee,
      },
      refundOption: refundOption,
      refundsProcessed: successfulRefunds,
      refundsFailed: failedRefunds,
      refundsKept: keptPayments,
      refundsManual: manualRefunds,
      refundResults: refundResults,
      warning: bothSigned ? "Both parties had signed this contract before voiding" : undefined,
    });
  } catch (error: any) {
    console.error("Error voiding contract:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

