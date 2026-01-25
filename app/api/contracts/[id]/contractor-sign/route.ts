import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveSignature } from "@/lib/signature";
import { hashContractContent } from "@/lib/security/contract-hash";

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

    // Contractor can sign at any time (before or after client signs)
    // No status restriction needed

    const body = await request.json();
    const { fullName, signatureDataUrl } = body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { message: "Full name is required" },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Generate contract hash
    const contractHash = hashContractContent(contract);

    // Save contractor signature
    // Use contractor's ID as clientId for the signature record (since it's the same table structure)
    await saveSignature(contract.id, contract.companyId, contractor.id, {
      fullName: fullName.trim(),
      signatureDataUrl: signatureDataUrl || null,
      ip: ipAddress,
      userAgent: userAgent.substring(0, 500),
      contractHash,
    });

    // Log the event
    await db.contractEvents.logEvent({
      contractId: contract.id,
      eventType: "contractor_signed",
      actorType: "contractor",
      actorId: contractor.id,
      metadata: {
        fullName: fullName.trim(),
        hasSignatureImage: !!signatureDataUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contract signed successfully",
    });
  } catch (error: any) {
    console.error("Error signing contract as contractor:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
