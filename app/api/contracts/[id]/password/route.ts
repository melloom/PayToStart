import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/security/tokens";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const contract = await db.contracts.findById(params.id);
    if (!contract || contract.contractorId !== contractor.id) {
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }

    const { password } = await request.json();
    
    if (!password || typeof password !== "string" || password.trim().length < 4) {
      return NextResponse.json(
        { message: "Password must be at least 4 characters" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password.trim());

    await db.contracts.update(contract.id, {
      passwordHash: passwordHash,
    });

    return NextResponse.json({
      success: true,
      message: "Password protection enabled",
    });
  } catch (error: any) {
    console.error("Error updating contract password:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update password" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const contract = await db.contracts.findById(params.id);
    if (!contract || contract.contractorId !== contractor.id) {
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }

    await db.contracts.update(contract.id, {
      passwordHash: null,
    });

    return NextResponse.json({
      success: true,
      message: "Password protection removed",
    });
  } catch (error: any) {
    console.error("Error removing contract password:", error);
    return NextResponse.json(
      { message: error.message || "Failed to remove password" },
      { status: 500 }
    );
  }
}
