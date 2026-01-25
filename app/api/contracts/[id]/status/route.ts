import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
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

    return NextResponse.json({
      status: contract.status,
      signedAt: contract.signedAt,
      paidAt: contract.paidAt,
      completedAt: contract.completedAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
