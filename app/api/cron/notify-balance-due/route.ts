import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getRemainingBalanceDueEmail } from "@/lib/email/templates";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Cron job to notify clients when remaining balance is due
 * This should be run daily to check for contracts with remaining balance
 * 
 * To set up in Vercel:
 * 1. Go to your project settings > Cron Jobs
 * 2. Add a new cron job:
 *    - Path: /api/cron/notify-balance-due
 *    - Schedule: 0 9 * * * (9 AM daily)
 *    - Authorization: Bearer token (set CRON_SECRET in env)
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
    const supabase = createServiceClient();
    
    // Find contracts that:
    // 1. Are signed (status = 'signed' or 'paid')
    // 2. Have remaining balance (totalAmount > depositAmount)
    // 3. Have not been fully paid
    // 4. Have not sent balance due notification recently (optional - can add a field to track this)
    const { data: contracts, error } = await supabase
      .from("contracts")
      .select("*")
      .in("status", ["signed", "paid"])
      .gt("total_amount", 0);

    if (error) {
      console.error("Error fetching contracts:", error);
      return NextResponse.json(
        { error: "Failed to fetch contracts" },
        { status: 500 }
      );
    }

    if (!contracts || contracts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No contracts with remaining balance found",
        notified: 0,
      });
    }

    let notifiedCount = 0;
    let errorCount = 0;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    for (const contract of contracts) {
      try {
        // Calculate remaining balance
        const payments = await db.payments.findByContractId(contract.id);
        const totalPaid = payments
          .filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + Number(p.amount), 0);
        
        const remainingBalance = Number(contract.total_amount) - totalPaid;

        // Skip if fully paid or no remaining balance
        if (remainingBalance <= 0.01) {
          continue;
        }

        // Get client info
        const client = await db.clients.findById(contract.client_id);
        if (!client || !client.email) {
          console.warn(`No client or email found for contract ${contract.id}`);
          continue;
        }

        // Get contractor info
        const contractor = await db.contractors.findById(contract.contractor_id);
        if (!contractor) {
          console.warn(`No contractor found for contract ${contract.id}`);
          continue;
        }

        // Generate payment URL using signing token
        const paymentUrl = contract.signing_token 
          ? `${baseUrl}/pay/${contract.signing_token}`
          : null;

        if (!paymentUrl) {
          console.warn(`No payment URL available for contract ${contract.id}`);
          continue;
        }

        // Generate and send email
        const { subject, html } = getRemainingBalanceDueEmail({
          contractTitle: contract.title,
          contractorName: contractor.name,
          contractorEmail: contractor.email,
          contractorCompany: contractor.company_name || undefined,
          clientName: client.name,
          clientEmail: client.email,
          paymentUrl,
          depositAmount: Number(contract.deposit_amount) || 0,
          totalAmount: Number(contract.total_amount) || 0,
          remainingBalance,
        });

        await sendEmail({
          to: client.email,
          subject,
          html,
        });

        notifiedCount++;
        console.log(`Remaining balance due notification sent to ${client.email} for contract ${contract.id}`);
      } catch (error: any) {
        console.error(`Error sending notification for contract ${contract.id}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${contracts.length} contracts`,
      notified: notifiedCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error("Error in notify-balance-due cron:", error);
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
