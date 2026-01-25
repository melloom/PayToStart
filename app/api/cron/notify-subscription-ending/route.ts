import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import { getSubscriptionEndingEmail } from "@/lib/email/subscription-templates";

/**
 * Cron job to notify users whose subscriptions end tomorrow
 * Should be run daily (e.g., via Vercel Cron or external cron service)
 * 
 * This checks for subscriptions that:
 * - Are set to cancel at period end
 * - End tomorrow (within 24-48 hours)
 * - Haven't been notified yet (optional: track in database)
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
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all companies with subscriptions ending tomorrow
    // We'll check subscriptions that end between tomorrow 00:00 and day after tomorrow 00:00
    const supabase = createServiceClient();
    const { data: companies, error: fetchError } = await supabase
      .from("companies")
      .select("id, name, subscription_tier, subscription_stripe_subscription_id, subscription_current_period_end, subscription_cancel_at_period_end")
      .eq("subscription_cancel_at_period_end", true)
      .not("subscription_current_period_end", "is", null)
      .gte("subscription_current_period_end", tomorrow.toISOString())
      .lt("subscription_current_period_end", dayAfterTomorrow.toISOString());

    if (fetchError) {
      console.error("Error fetching companies:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    let notifiedCount = 0;
    let errorCount = 0;

    for (const company of companies || []) {
      try {
        const contractor = await db.contractors.findByCompanyId(company.id);
        
        if (!contractor || !contractor.email) {
          console.warn(`No contractor or email found for company ${company.id}`);
          continue;
        }

        const periodEnd = company.subscription_current_period_end 
          ? new Date(company.subscription_current_period_end)
          : null;

        if (!periodEnd) {
          continue;
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : "http://localhost:3000";
        const billingPortalUrl = `${baseUrl}/dashboard/subscription`;

        const { subject, html } = getSubscriptionEndingEmail({
          contractorName: contractor.name,
          contractorEmail: contractor.email,
          companyName: company.name,
          tier: company.subscription_tier,
          subscriptionEndDate: periodEnd,
          billingPortalUrl: billingPortalUrl,
        });

        await sendEmail({
          to: contractor.email,
          subject,
          html,
        });

        notifiedCount++;
        console.log(`Subscription ending notification sent to ${contractor.email} for company ${company.id}`);
      } catch (error: any) {
        console.error(`Error sending notification to company ${company.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${companies?.length || 0} subscriptions ending tomorrow`,
      notified: notifiedCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error("Error in notify-subscription-ending cron:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Also allow POST for external cron services
export async function POST(request: Request) {
  return GET(request);
}
