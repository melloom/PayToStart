import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const contract = await db.contracts.findById(params.id);
    if (!contract || contract.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Contract not found" }, { status: 404 });
    }

    if (contract.status === "cancelled") {
      return NextResponse.json(
        { message: "Contract is already cancelled" },
        { status: 400 }
      );
    }

    if (contract.status === "completed") {
      return NextResponse.json(
        { message: "Cannot cancel a completed contract" },
        { status: 400 }
      );
    }

    // Verify contractor owns this contract (additional check)
    if (contract.companyId !== contractor.companyId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Update contract status to cancelled
    const updatedContract = await db.contracts.update(params.id, {
      status: "cancelled",
    });

    if (!updatedContract) {
      return NextResponse.json(
        { message: "Failed to update contract" },
        { status: 500 }
      );
    }

    // Log audit event
    await db.contractEvents.logEvent({
      contractId: params.id,
      eventType: "voided",
      actorType: "contractor",
      actorId: contractor.id,
      metadata: {
        previousStatus: contract.status,
        voidedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contract has been marked as void",
      contract: updatedContract,
    });
  } catch (error: any) {
    console.error("Error voiding contract:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

