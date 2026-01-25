import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { getEffectiveTier } from "@/lib/subscriptions";

export async function GET() {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const effectiveTier = await getEffectiveTier(contractor.companyId);

    return NextResponse.json({
      tier: effectiveTier,
    });
  } catch (error: any) {
    console.error("Error fetching current tier:", error);
    return NextResponse.json(
      { error: "Failed to fetch tier information" },
      { status: 500 }
    );
  }
}
