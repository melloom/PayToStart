import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase/service";

// This endpoint should be called by a cron job to expire trials
// You can set it up in Vercel Cron Jobs or use an external service like cron-job.org

export async function GET(request: Request) {
  try {
    // Verify request is from cron service (optional security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use service client to bypass RLS
    const supabase = createServiceClient();

    // Call the database function to expire trials
    const { data, error } = await supabase.rpc("expire_trials");

    if (error) {
      console.error("Error expiring trials:", error);
      return NextResponse.json(
        { error: "Failed to expire trials", details: error.message },
        { status: 500 }
      );
    }

    const expiredCount = data || 0;

    return NextResponse.json({
      success: true,
      expiredCount,
      message: `Expired ${expiredCount} trial(s)`,
    });
  } catch (error: any) {
    console.error("Error in expire-trials cron:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Also allow POST for external cron services
export async function POST(request: Request) {
  return GET(request);
}

