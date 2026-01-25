import { NextResponse } from "next/server";
import { stripe, getStripeMode } from "@/lib/stripe";
import { processCompletedCheckoutSession, isPaymentProcessed } from "@/lib/payments";
import { finalizeContract } from "@/lib/finalization";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import Stripe from "stripe";
import type { SubscriptionTier } from "@/lib/types";
import { sendEmail } from "@/lib/email";
import { sendNotificationIfEnabled } from "@/lib/email/notifications";
import {
  getInvoicePaymentSucceededEmail,
  getInvoicePaymentFailedEmail,
  getTrialWillEndEmail,
  getInvoiceUpcomingEmail,
  getSubscriptionCreatedEmail,
  getSubscriptionEndingEmail,
} from "@/lib/email/subscription-templates";

// Get webhook secret based on mode (lazy evaluation to avoid build-time errors)
function getWebhookSecret(): string {
  const isTestMode = getStripeMode() === "test";
  return isTestMode
    ? process.env.STRIPE_TEST_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!
    : process.env.STRIPE_LIVE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    console.error("[SECURITY] Webhook: No signature provided");
    return NextResponse.json(
      { error: "Invalid request", message: "Webhook signature required" },
      { status: 400 }
    );
  }

  const webhookSecret = getWebhookSecret();

  // Security: Validate webhook secret is configured
  if (!webhookSecret || webhookSecret === "whsec_your_webhook_secret") {
    console.error("[SECURITY] Webhook secret not configured");
    return NextResponse.json(
      { error: "Configuration error", message: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    // Security: Log but don't expose signature verification details
    console.error("Webhook signature verification failed:", err.message);
    // Return generic error to prevent information leakage
    return NextResponse.json(
      { error: "Invalid webhook signature", message: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // Security: Log webhook type but not sensitive data
  console.log(`Webhook received: ${event.type}`);

  // Handle subscription.created event (when subscription is first created)
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      const tier = subscription.metadata?.tier as SubscriptionTier;
      const companyId = subscription.metadata?.companyId || subscription.metadata?.company_id;
      
      if (companyId && tier) {
        const company = await db.companies.findById(companyId);
        
        if (company) {
          // If subscription is in trial, keep the trial tier active
          // The subscription tier will be activated when trial ends
          const isInTrial = subscription.status === "trialing" || 
            (company.trialEnd && new Date(company.trialEnd) > new Date());
          
          await db.companies.update(company.id, {
            // Set tier to the subscribed tier regardless of status (active or trialing)
            subscriptionTier: tier, // Always set to the tier they subscribed to
            subscriptionStripeSubscriptionId: subscription.id,
            subscriptionStripeCustomerId: subscription.customer as string,
            subscriptionStatus: subscription.status,
            subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
            subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            planSelected: true, // Mark that user has selected a plan (via Stripe subscription)
          });

          console.log(`Subscription created for company ${company.id}: ${tier}, status: ${subscription.status}, in trial: ${isInTrial}`);
        }
      }
    } catch (error: any) {
      console.error("Error processing subscription creation:", error);
    }

    return NextResponse.json({ received: true });
  }

  // Handle checkout.session.completed event (primary)
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Check if this is a subscription checkout (not a one-time payment)
      if (session.mode === "subscription" && session.metadata?.tier) {
        const companyId = session.metadata.companyId;
        const tier = session.metadata.tier as SubscriptionTier;
        const subscriptionId = session.subscription as string;

        if (!companyId || !tier || !subscriptionId) {
          console.error("Missing subscription metadata", session.metadata);
          return NextResponse.json({ received: true });
        }

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Get company to check trial status
        const company = await db.companies.findById(companyId);
        
        // If subscription is in trial (status is "trialing"), keep trial tier active
        // The subscription tier will be activated when trial ends and status becomes "active"
        const isInTrial = subscription.status === "trialing" || 
          (company?.trialEnd && new Date(company.trialEnd) > new Date());

        // Update company subscription
        // Set tier to the subscribed tier regardless of status (active or trialing)
        await db.companies.update(companyId, {
          subscriptionTier: tier, // Always set to the tier they subscribed to
          subscriptionStripeSubscriptionId: subscriptionId,
          subscriptionStripeCustomerId: subscription.customer as string,
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
          subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          planSelected: true, // Mark that user has selected a plan (via Stripe checkout)
        });

        console.log(`Subscription created for company ${companyId}: ${tier}, status: ${subscription.status}, in trial: ${isInTrial}`);

        // Send subscription confirmation email
        try {
          const contractor = await db.contractors.findByCompanyId(companyId);
          if (contractor) {
            const trialEndDate = isInTrial && subscription.trial_end 
              ? new Date(subscription.trial_end * 1000)
              : undefined;
            const nextBillingDate = subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : undefined;

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : "http://localhost:3000";

            const { subject, html } = getSubscriptionCreatedEmail({
              contractorName: contractor.name,
              contractorEmail: contractor.email,
              tier: tier,
              hasTrial: isInTrial,
              trialEndDate: trialEndDate,
              subscriptionStartDate: new Date(subscription.current_period_start * 1000),
              nextBillingDate: nextBillingDate,
              dashboardUrl: `${baseUrl}/dashboard`,
            });

            await sendEmail({
              to: contractor.email,
              subject,
              html,
            });
            console.log("Subscription confirmation email sent to:", contractor.email);
          }
        } catch (emailError) {
          console.error("Error sending subscription confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }

        return NextResponse.json({ received: true });
      }

      // Handle one-time payment checkout (for contract deposits)
      // Idempotency check: verify stripe_checkout_session_id not already processed
      const alreadyProcessed = await isPaymentProcessed(session.id);
      if (alreadyProcessed) {
        console.log(`Payment ${session.id} already processed, skipping`);
        return NextResponse.json({
          received: true,
          message: "Payment already processed",
        });
      }

      // Verify payment status
      if (session.payment_status !== "paid") {
        console.warn(
          `Checkout session ${session.id} not paid. Status: ${session.payment_status}`
        );
        return NextResponse.json({
          received: true,
          message: `Payment status is ${session.payment_status}, not paid`,
        });
      }

      // Process the completed checkout session
      const { contract, receiptId, receiptUrl, isFullyPaid } = await processCompletedCheckoutSession(
        session.id,
        session
      );

      console.log(`Payment processed for contract ${contract.id}`);

      // Only finalize contract if it's fully paid
      if (isFullyPaid) {
        // Finalize contract: Generate PDF + Store + Email (with payment receipt info)
        await finalizeContract(contract.id, {
          receiptId: receiptId || null,
          receiptUrl: receiptUrl || null,
        });

        console.log(`Contract ${contract.id} finalized successfully (fully paid)`);
      } else {
        console.log(`Contract ${contract.id} payment received but not yet fully paid`);
      }

      return NextResponse.json({
        received: true,
        contractId: contract.id,
        message: "Payment processed and contract finalized",
      });
    } catch (error: any) {
      console.error("Error processing checkout.session.completed:", error);
      console.error("Session ID:", session.id);
      console.error("Metadata:", session.metadata);

      // Return 200 to acknowledge receipt, but log the error
      // Stripe will retry automatically, but we don't want to block other webhooks
      return NextResponse.json(
        {
          received: true,
          error: error.message,
          message: "Error processing checkout, will be retried",
        },
        { status: 200 }
      );
    }
  }

  // Handle payment_intent.payment_failed event (optional)
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // Support both old and new metadata format for backward compatibility
    const contractId = paymentIntent.metadata?.contract_id || paymentIntent.metadata?.contractId;

    console.log(`Payment failed for PaymentIntent ${paymentIntent.id}`);
    if (contractId) {
      console.log(`Contract ID: ${contractId}`);

      try {
        // Find pending payments for this contract and mark as failed
        // Note: We store checkout session ID in paymentIntentId, not the payment intent ID
        // So we find by contract ID and update pending payments
        const payments = await db.payments.findByContractId(contractId);
        const pendingPayment = payments.find((p) => p.status === "pending");
        
        if (pendingPayment) {
          await db.payments.update(pendingPayment.id, {
            status: "failed",
          });
          console.log(`Updated payment ${pendingPayment.id} status to failed`);
        } else {
          console.log(`No pending payment found for contract ${contractId}`);
        }
      } catch (error: any) {
        console.error("Error updating failed payment:", error);
      }
    } else {
      console.warn(`Payment intent ${paymentIntent.id} missing contract metadata`);
    }

    return NextResponse.json({ received: true });
  }

  // Handle charge.refunded event (optional)
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string;

    console.log(`Charge ${charge.id} refunded for PaymentIntent ${paymentIntentId}`);

    try {
      if (paymentIntentId) {
        // Retrieve the payment intent to get contract metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        // Support both old and new metadata format for backward compatibility
        const contractId = paymentIntent.metadata?.contract_id || paymentIntent.metadata?.contractId;

        if (contractId) {
          console.log(`Contract ID: ${contractId}`);
          // You might want to update contract status or create a refund record here
          // For MVP, just log the refund
          console.log(`Refund processed for contract ${contractId}`);
          console.log(`Refund amount: $${(charge.amount_refunded || 0) / 100}`);
        } else {
          console.warn(`Payment intent ${paymentIntentId} missing contract metadata`);
        }
      }
    } catch (error: any) {
      console.error("Error processing refund:", error);
    }

    return NextResponse.json({ received: true });
  }


  // Handle subscription updates
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      // Find company by Stripe subscription ID
      const company = await db.companies.findByStripeSubscriptionId(subscription.id);
      
      if (company) {
        const tier = subscription.metadata?.tier as SubscriptionTier;
        
        // Update subscription tier - always use the tier from subscription metadata
        // This ensures the tier is set correctly whether in trial or active
        const wasTrialing = company.subscriptionStatus === "trialing";
        const isNowActive = subscription.status === "active";
        
        // Always update to the subscription tier (from metadata) if available
        // This ensures tier is correct during trial and after trial ends
        const shouldUpdateTier = tier && (tier !== company.subscriptionTier);
        
        await db.companies.update(company.id, {
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
          subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          subscriptionCancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          // Always update tier if provided in metadata (works for both trialing and active)
          subscriptionTier: tier || company.subscriptionTier,
          planSelected: true, // Ensure plan is marked as selected
        });

        if (shouldUpdateTier) {
          console.log(`Subscription tier updated for company ${company.id}: ${company.subscriptionTier} -> ${tier}, status: ${subscription.status}`);
        } else {
          console.log(`Subscription updated for company ${company.id}, status: ${subscription.status}`);
        }

        // Check if subscription ends in 1 day and send notification email
        if (subscription.cancel_at_period_end && subscription.current_period_end) {
          const periodEnd = new Date(subscription.current_period_end * 1000);
          const now = new Date();
          const daysUntilEnd = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          // Send email if subscription ends in 1 day (within 24-48 hours)
          if (daysUntilEnd === 1 || (daysUntilEnd > 0 && daysUntilEnd < 2)) {
            const contractor = await db.contractors.findByCompanyId(company.id);
            
            if (contractor && contractor.email) {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
                ? `https://${process.env.VERCEL_URL}` 
                : "http://localhost:3000";
              const billingPortalUrl = `${baseUrl}/dashboard/subscription`;
              
              try {
                const { subject, html } = getSubscriptionEndingEmail({
                  contractorName: contractor.name,
                  contractorEmail: contractor.email,
                  companyName: company.name,
                  tier: tier || company.subscriptionTier,
                  subscriptionEndDate: periodEnd,
                  billingPortalUrl: billingPortalUrl,
                });
                
                await sendEmail({
                  to: contractor.email,
                  subject,
                  html,
                });
                
                console.log(`Subscription ending notification sent to ${contractor.email} for company ${company.id}`);
              } catch (emailError: any) {
                console.error("Error sending subscription ending email:", emailError);
                // Don't fail the webhook if email fails
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error processing subscription update:", error);
    }

    return NextResponse.json({ received: true });
  }

  // Handle subscription cancellations
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      const company = await db.companies.findByStripeSubscriptionId(subscription.id);
      
      if (company) {
        await db.companies.update(company.id, {
          subscriptionTier: "free",
          subscriptionStatus: "canceled",
          subscriptionStripeSubscriptionId: undefined,
          subscriptionCurrentPeriodStart: undefined,
          subscriptionCurrentPeriodEnd: undefined,
          subscriptionCancelAtPeriodEnd: false,
        });

        console.log(`Subscription cancelled for company ${company.id}`);
      }
    } catch (error: any) {
      console.error("Error processing subscription cancellation:", error);
    }

    return NextResponse.json({ received: true });
  }

  // Handle invoice.payment_succeeded event (HIGH PRIORITY)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    
    try {
      // Only handle subscription invoices
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        const company = await db.companies.findByStripeSubscriptionId(subscriptionId);
        
        if (company) {
          const contractor = await db.contractors.findByCompanyId(company.id);
          
          if (contractor) {
            // Get subscription to get tier
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const tier = subscription.metadata?.tier as SubscriptionTier;
            
            // Create billing portal session URL
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : "http://localhost:3000";
            const billingPortalUrl = `${baseUrl}/dashboard/subscription`;
            
            // Send payment success email (check subscriptionUpdates preference)
            const { subject, html } = getInvoicePaymentSucceededEmail({
              contractorName: contractor.name,
              contractorEmail: contractor.email,
              companyName: company.name,
              tier: tier,
              amount: invoice.amount_paid,
              invoiceUrl: invoice.hosted_invoice_url || undefined,
              billingPortalUrl: billingPortalUrl,
              nextBillingDate: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
            });
            
            await sendNotificationIfEnabled(
              contractor.id,
              "subscriptionUpdates",
              () => sendEmail({
              to: contractor.email,
              subject,
              html,
              })
            );
            
            // Update subscription status if needed
            await db.companies.update(company.id, {
              subscriptionStatus: subscription.status,
              subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
              subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            });
            
            console.log(`Invoice payment succeeded for company ${company.id}, email sent to ${contractor.email}`);
          }
        }
      }
    } catch (error: any) {
      console.error("Error processing invoice.payment_succeeded:", error);
    }
    
    return NextResponse.json({ received: true });
  }

  // Handle invoice.payment_failed event (HIGH PRIORITY)
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    
    try {
      // Only handle subscription invoices
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        const company = await db.companies.findByStripeSubscriptionId(subscriptionId);
        
        if (company) {
          const contractor = await db.contractors.findByCompanyId(company.id);
          
          if (contractor) {
            // Get subscription to get tier
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const tier = subscription.metadata?.tier as SubscriptionTier;
            
            // Create billing portal session URL
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : "http://localhost:3000";
            const billingPortalUrl = `${baseUrl}/dashboard/subscription`;
            
            // Send payment failed email (check subscriptionUpdates preference)
            const { subject, html } = getInvoicePaymentFailedEmail({
              contractorName: contractor.name,
              contractorEmail: contractor.email,
              companyName: company.name,
              tier: tier,
              amount: invoice.amount_due,
              billingPortalUrl: billingPortalUrl,
            });
            
            await sendNotificationIfEnabled(
              contractor.id,
              "subscriptionUpdates",
              () => sendEmail({
              to: contractor.email,
              subject,
              html,
              })
            );
            
            // Update subscription status
            await db.companies.update(company.id, {
              subscriptionStatus: subscription.status,
            });
            
            console.log(`Invoice payment failed for company ${company.id}, email sent to ${contractor.email}`);
          }
        }
      }
    } catch (error: any) {
      console.error("Error processing invoice.payment_failed:", error);
    }
    
    return NextResponse.json({ received: true });
  }

  // Handle customer.subscription.trial_will_end event (MEDIUM PRIORITY)
  if (event.type === "customer.subscription.trial_will_end") {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      const company = await db.companies.findByStripeSubscriptionId(subscription.id);
      
      if (company) {
        const contractor = await db.contractors.findByCompanyId(company.id);
        
        if (contractor) {
          const tier = subscription.metadata?.tier as SubscriptionTier;
          
          // Create billing portal session URL
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : "http://localhost:3000";
          const billingPortalUrl = `${baseUrl}/dashboard/subscription`;
          
          // Send trial ending email (check subscriptionUpdates preference)
          const { subject, html } = getTrialWillEndEmail({
            contractorName: contractor.name,
            contractorEmail: contractor.email,
            companyName: company.name,
            tier: tier,
            trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
            billingPortalUrl: billingPortalUrl,
          });
          
          await sendNotificationIfEnabled(
            contractor.id,
            "subscriptionUpdates",
            () => sendEmail({
            to: contractor.email,
            subject,
            html,
            })
          );
          
          console.log(`Trial will end notification sent to ${contractor.email} for company ${company.id}`);
        }
      }
    } catch (error: any) {
      console.error("Error processing customer.subscription.trial_will_end:", error);
    }
    
    return NextResponse.json({ received: true });
  }

  // Handle invoice.upcoming event (MEDIUM PRIORITY)
  if (event.type === "invoice.upcoming") {
    const invoice = event.data.object as Stripe.Invoice;
    
    try {
      // Only handle subscription invoices
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        const company = await db.companies.findByStripeSubscriptionId(subscriptionId);
        
        if (company) {
          const contractor = await db.contractors.findByCompanyId(company.id);
          
          if (contractor) {
            // Get subscription to get tier
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const tier = subscription.metadata?.tier as SubscriptionTier;
            
            // Create billing portal session URL
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : "http://localhost:3000";
            const billingPortalUrl = `${baseUrl}/dashboard/subscription`;
            
            // Send upcoming invoice email (check invoiceUpcoming preference)
            const { subject, html } = getInvoiceUpcomingEmail({
              contractorName: contractor.name,
              contractorEmail: contractor.email,
              companyName: company.name,
              tier: tier,
              amount: invoice.amount_due,
              nextBillingDate: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
              billingPortalUrl: billingPortalUrl,
            });
            
            await sendNotificationIfEnabled(
              contractor.id,
              "invoiceUpcoming",
              () => sendEmail({
              to: contractor.email,
              subject,
              html,
              })
            );
            
            console.log(`Upcoming invoice notification sent to ${contractor.email} for company ${company.id}`);
          }
        }
      }
    } catch (error: any) {
      console.error("Error processing invoice.upcoming:", error);
    }
    
    return NextResponse.json({ received: true });
  }

  // Handle customer.subscription.paused event (LOW PRIORITY)
  if (event.type === "customer.subscription.paused") {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      const company = await db.companies.findByStripeSubscriptionId(subscription.id);
      
      if (company) {
        await db.companies.update(company.id, {
          subscriptionStatus: subscription.status,
        });
        
        console.log(`Subscription paused for company ${company.id}`);
      }
    } catch (error: any) {
      console.error("Error processing customer.subscription.paused:", error);
    }
    
    return NextResponse.json({ received: true });
  }

  // Handle customer.subscription.resumed event (LOW PRIORITY)
  if (event.type === "customer.subscription.resumed") {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      const company = await db.companies.findByStripeSubscriptionId(subscription.id);
      
      if (company) {
        await db.companies.update(company.id, {
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodStart: new Date(subscription.current_period_start * 1000),
          subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });
        
        console.log(`Subscription resumed for company ${company.id}`);
      }
    } catch (error: any) {
      console.error("Error processing customer.subscription.resumed:", error);
    }
    
    return NextResponse.json({ received: true });
  }

  // Handle other event types if needed
  // For now, just acknowledge receipt
  console.log(`Unhandled event type: ${event.type}`);
  return NextResponse.json({ received: true });
}

