import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET - Fetch a single payment provider
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const provider = await db.paymentProviders.findById(params.id);
    
    if (!provider) {
      return NextResponse.json(
        { error: "Not found", message: "Payment provider not found" },
        { status: 404 }
      );
    }

    // Verify the provider belongs to the contractor's company
    if (provider.companyId !== contractor.companyId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ provider, success: true });
  } catch (error: any) {
    console.error("Error fetching payment provider:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment provider" },
      { status: 500 }
    );
  }
}

// PATCH - Update a payment provider
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const provider = await db.paymentProviders.findById(params.id);
    
    if (!provider) {
      return NextResponse.json(
        { error: "Not found", message: "Payment provider not found" },
        { status: 404 }
      );
    }

    // Verify the provider belongs to the contractor's company
    if (provider.companyId !== contractor.companyId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updated = await db.paymentProviders.update(params.id, body);

    return NextResponse.json({ provider: updated, success: true });
  } catch (error: any) {
    console.error("Error updating payment provider:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment provider" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a payment provider
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const provider = await db.paymentProviders.findById(params.id);
    
    if (!provider) {
      return NextResponse.json(
        { error: "Not found", message: "Payment provider not found" },
        { status: 404 }
      );
    }

    // Verify the provider belongs to the contractor's company
    if (provider.companyId !== contractor.companyId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Access denied" },
        { status: 403 }
      );
    }

    await db.paymentProviders.delete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting payment provider:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete payment provider" },
      { status: 500 }
    );
  }
}
