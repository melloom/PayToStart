import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { hasFeature } from "@/lib/subscriptions";

export async function GET(request: NextRequest) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const feature = searchParams.get("feature");

    if (!feature) {
      return NextResponse.json(
        { error: "Missing feature", message: "Feature parameter is required" },
        { status: 400 }
      );
    }

    const hasAccess = await hasFeature(
      contractor.companyId,
      feature as any
    );

    return NextResponse.json({
      hasAccess,
    });
  } catch (error: any) {
    console.error("Error checking feature access:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check feature access" },
      { status: 500 }
    );
  }
}
