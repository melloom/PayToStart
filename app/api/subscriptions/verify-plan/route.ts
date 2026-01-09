import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { planSelected: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const company = await db.companies.findById(contractor.companyId);
    if (!company) {
      return NextResponse.json(
        { planSelected: false, message: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      planSelected: company.planSelected === true,
      subscriptionTier: company.subscriptionTier,
      subscriptionStatus: company.subscriptionStatus,
    });
  } catch (error: any) {
    console.error("Error verifying plan:", error);
    return NextResponse.json(
      { planSelected: false, message: error.message || "Failed to verify plan" },
      { status: 500 }
    );
  }
}

