import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import { sendNotificationIfEnabled } from "@/lib/email/notifications";
import { getInvoiceUpcomingEmail } from "@/lib/email/subscription-templates";

/**
 * Cron job to notify users whose subscriptions will renew in 3 days
 * Should be run daily (e.g., via Vercel Cron or external cron service)
 * 
 * This checks for subscriptions that:
 * - Are active (not cancelled)
 * - Will renew in 3 days (within 72-96 hours)
 * - Are not set to cancel at period end
 */
export async function GET(request: Request) {
  // Verify this is a cron request
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0); // Start of day in 3 days
    
    const fourDaysFromNow = new Date(threeDaysFromNow);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 1);

    // Find all companies with active subscriptions renewing in 3 days
    // We'll check subscriptions that renew between 3 days from now 00:00 and 4 days from now 00:00
    const supabase = createServiceClient();
    const { data: companies, error: fetchError } = await supabase
      .from("companies")
      .select("id, name, subscription_tier, subscription_stripe_subscription_id, subscription_current_period_end, subscription_cancel_at_period_end, subscription_status")
      .eq("subscription_status", "active") // Only active subscriptions
      .eq("subscription_cancel_at_period_end", false) // Not cancelling
      .not("subscription_current_period_end", "is", null)
      .gte("subscription_current_period_end", threeDaysFromNow.toISOString())
      .lt("subscription_current_period_end", fourDaysFromNow.toISOString());

    if (fetchError) {
      console.error("Error fetching companies for renewal notification:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    let notifiedCount = 0;
    let errorCount = 0;
    const errors: Array<{ companyId: string; error: string }> = [];

    for (const company of companies || []) {
      try {
        const contractor = await db.contractors.findByCompanyId(company.id);
        
        if (!contractor || !contractor.email) {
          console.warn(`No contractor or email found for company ${company.id}`);
          continue;
        }

        const renewalDate = company.subscription_current_period_end 
          ? new Date(company.subscription_current_period_end)
          : null;

        if (!renewalDate) {
          continue;
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : "http://localhost:3000";
        const billingPortalUrl = `${baseUrl}/dashboard/subscription`;

        // Get subscription amount from Stripe if possible (optional)
        let amount: number | undefined;
        try {
          if (company.subscription_stripe_subscription_id) {
            const stripe = (await import("@/lib/stripe")).stripe;
            const subscription = await stripe.subscriptions.retrieve(company.subscription_stripe_subscription_id);
            // Get the price from the subscription
            if (subscription.items.data[0]?.price?.unit_amount) {
              amount = subscription.items.data[0].price.unit_amount;
            }
          }
        } catch (stripeError) {
          // If we can't get amount from Stripe, continue without it
          console.warn(`Could not fetch subscription amount for company ${company.id}:`, stripeError);
        }

        const { subject, html } = getInvoiceUpcomingEmail({
          contractorName: contractor.name,
          contractorEmail: contractor.email,
          companyName: company.name,
          tier: company.subscription_tier,
          amount: amount,
          nextBillingDate: renewalDate,
          billingPortalUrl: billingPortalUrl,
        });

        // Send email with notification preference check
        await sendNotificationIfEnabled(
          contractor.id,
          "invoiceUpcoming",
          async () => {
            try {
              await sendEmail({
                to: contractor.email,
                subject,
                html,
              });
              console.log(`Renewal reminder sent to ${contractor.email} for company ${company.id} (renewal in 3 days)`);
            } catch (emailError: any) {
              console.error(`Failed to send renewal reminder email to ${contractor.email} for company ${company.id}:`, emailError);
              throw emailError; // Re-throw to be caught by outer try-catch
            }
          }
        );

        notifiedCount++;
      } catch (error: any) {
        const errorMessage = error?.message || "Unknown error";
        console.error(`Error sending renewal notification to company ${company.id}:`, error);
        errors.push({ companyId: company.id, error: errorMessage });
        errorCount++;
      }
    }

    const response: any = {
      success: true,
      message: `Processed ${companies?.length || 0} subscriptions renewing in 3 days`,
      notified: notifiedCount,
      errors: errorCount,
    };

    // Include error details in development
    if (process.env.NODE_ENV === "development" && errors.length > 0) {
      response.errorDetails = errors;
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in notify-renewal-upcoming cron:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

// Also allow POST for external cron services
export async function POST(request: Request) {
  return GET(request);
}
