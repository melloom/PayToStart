import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET - Fetch all contract drafts for the current contractor
export async function GET() {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await db.contractDrafts.findByContractorId(contractor.id);
    return NextResponse.json({ drafts, success: true });
  } catch (error: any) {
    console.error("Error fetching contract drafts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

// POST - Create a new contract draft
export async function POST(request: NextRequest) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id, // Optional: if provided, update existing draft
      title,
      content,
      fieldValues,
      customFields,
      depositAmount,
      totalAmount,
      clientId,
      templateId,
      metadata,
    } = body;

    // Validate UUID format if id is provided
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isValidUUID = id && typeof id === 'string' && uuidRegex.test(id);

    // If id provided and valid UUID, update existing draft
    if (isValidUUID) {
      const draft = await db.contractDrafts.update(id, {
        title: title || "",
        content: content || "",
        fieldValues: fieldValues || {},
        customFields: customFields || [],
        depositAmount: depositAmount || 0,
        totalAmount: totalAmount || 0,
        clientId,
        templateId,
        metadata: metadata || {},
      });

      if (!draft) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }

      return NextResponse.json({ draft, success: true });
    }

    // Create new draft
    const draft = await db.contractDrafts.create({
      contractorId: contractor.id,
      companyId: contractor.companyId,
      clientId,
      templateId,
      title: title || "",
      content: content || "",
      fieldValues: fieldValues || {},
      customFields: customFields || [],
      depositAmount: depositAmount || 0,
      totalAmount: totalAmount || 0,
      metadata: metadata || {},
    });

    return NextResponse.json({ draft, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving contract draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contract draft or all drafts
export async function DELETE(request: NextRequest) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";

    // Delete all drafts
    if (deleteAll) {
      const deletedCount = await db.contractDrafts.deleteAllByContractorId(contractor.id);
      return NextResponse.json({ success: true, deletedCount });
    }

    // Delete single draft
    if (!id) {
      return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
    }

    // Verify the draft belongs to the contractor
    const draft = await db.contractDrafts.findById(id);
    if (!draft || draft.contractorId !== contractor.id) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    await db.contractDrafts.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting contract draft:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete draft" },
      { status: 500 }
    );
  }
}


