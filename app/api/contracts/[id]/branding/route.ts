import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { getEffectiveTier, hasFeature } from "@/lib/subscriptions";
import { log } from "@/lib/logger";

export async function PATCH(
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

    // Check if user is the contract creator
    if (contract.contractorId !== contractor.id) {
      return NextResponse.json(
        { message: "Only the contract creator can update styling" },
        { status: 403 }
      );
    }

    // Check subscription tier - starter+ can change style
    const effectiveTier = await getEffectiveTier(contractor.companyId);
    const tierOrder = { free: 0, starter: 1, pro: 2, premium: 3 };
    
    if (tierOrder[effectiveTier] < tierOrder.starter) {
      return NextResponse.json(
        { 
          message: "Subscription required",
          error: "Style customization is available for Starter tier and above. Please upgrade your plan."
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { branding } = body;

    if (!branding || typeof branding !== "object") {
      return NextResponse.json(
        { message: "Branding settings are required" },
        { status: 400 }
      );
    }

    // Get current fieldValues and update branding
    const currentFieldValues = contract.fieldValues || {};
    const updatedFieldValues = {
      ...currentFieldValues,
      _branding: branding,
    };

    // Update contract with new branding
    const updatedContract = await db.contracts.update(contract.id, {
      fieldValues: updatedFieldValues,
    });

    if (!updatedContract) {
      return NextResponse.json(
        { message: "Failed to update contract styling" },
        { status: 500 }
      );
    }

    log.info({
      contractId: contract.id,
      contractorId: contractor.id,
      tier: effectiveTier,
    }, "Contract styling updated");

    return NextResponse.json({
      success: true,
      message: "Contract styling updated successfully",
      contract: updatedContract,
    });
  } catch (error: any) {
    console.error("Error updating contract branding:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
