import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SubscriptionTier } from "@/lib/types";

export async function POST(request: Request) {
  try {
    // Check authentication
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tier } = await request.json();

    if (!tier) {
      return NextResponse.json(
        { message: "Tier is required" },
        { status: 400 }
      );
    }

    // Only allow selecting "free" tier through this endpoint
    // Paid tiers should go through create-checkout
    if (tier !== "free") {
      return NextResponse.json(
        { message: "Use create-checkout endpoint for paid plans" },
        { status: 400 }
      );
    }

    // Get company
    const company = await db.companies.findById(contractor.companyId);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 }
      );
    }

    // Update company to Basic plan and mark plan as selected
    await db.companies.update(company.id, {
      subscriptionTier: "free",
      subscriptionStatus: "active", // Free tier is always "active"
      planSelected: true, // Mark that user has explicitly selected a plan
    });

    return NextResponse.json({
      success: true,
      message: "Basic plan selected successfully",
    });
  } catch (error: any) {
    console.error("Error selecting plan:", error);
    return NextResponse.json(
      { message: error.message || "Failed to select plan" },
      { status: 500 }
    );
  }
}



