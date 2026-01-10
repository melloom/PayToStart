import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET - Fetch all template drafts for the current contractor
export async function GET() {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await db.templateDrafts.findByContractorId(contractor.id);
    return NextResponse.json({ drafts, success: true });
  } catch (error: any) {
    console.error("Error fetching template drafts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

// POST - Create or update a template draft
export async function POST(request: NextRequest) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id, // Optional: if provided, update existing draft
      name,
      content,
      fields,
    } = body;

    // If id provided, update existing draft
    if (id) {
      const draft = await db.templateDrafts.update(id, {
        name: name || "",
        content: content || "",
        fields: fields || [],
      });

      if (!draft) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }

      return NextResponse.json({ draft, success: true });
    }

    // Create new draft
    const draft = await db.templateDrafts.create({
      contractorId: contractor.id,
      companyId: contractor.companyId,
      name: name || "",
      content: content || "",
      fields: fields || [],
    });

    return NextResponse.json({ draft, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving template draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template draft
export async function DELETE(request: NextRequest) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
    }

    // Verify the draft belongs to the contractor
    const draft = await db.templateDrafts.findById(id);
    if (!draft || draft.contractorId !== contractor.id) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    await db.templateDrafts.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting template draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete draft" },
      { status: 500 }
    );
  }
}


