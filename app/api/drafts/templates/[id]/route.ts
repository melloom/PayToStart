import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET - Fetch a single template draft by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draft = await db.templateDrafts.findById(params.id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Verify the draft belongs to the contractor
    if (draft.contractorId !== contractor.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ draft, success: true });
  } catch (error: any) {
    console.error("Error fetching template draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch draft" },
      { status: 500 }
    );
  }
}


