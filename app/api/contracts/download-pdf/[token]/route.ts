import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateContractPDF } from "@/lib/pdf";
import { hashToken, verifyToken } from "@/lib/security/tokens";

// Helper to verify token for contract access
async function verifyContractToken(token: string): Promise<{ contract: any; error?: string }> {
  // Hash the provided token
  const tokenHash = hashToken(token);

  // Find contract by token hash
  let contract = await db.contracts.findBySigningTokenHash(tokenHash);

  // Fallback: try old token format for backwards compatibility
  if (!contract) {
    contract = await db.contracts.findBySigningToken(token);
  }

  if (!contract) {
    return {
      contract: null,
      error: "Invalid token",
    };
  }

  // If contract has a hash, verify it matches
  if (contract.signingTokenHash && !verifyToken(token, contract.signingTokenHash)) {
    return {
      contract: null,
      error: "Invalid token",
    };
  }

  return { contract };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const token = resolvedParams.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const { contract, error } = await verifyContractToken(token);

    if (!contract || error) {
      return NextResponse.json(
        { message: error || "Contract not found" },
        { status: 404 }
      );
    }

    // Contract must be signed to download PDF
    if (contract.status !== "signed" && contract.status !== "paid" && contract.status !== "completed") {
      return NextResponse.json(
        { message: "Contract must be signed first" },
        { status: 400 }
      );
    }

    // Get client and contractor info
    const client = await db.clients.findById(contract.clientId);
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const contractor = await db.contractors.findById(contract.contractorId);
    if (!contractor) {
      return NextResponse.json({ message: "Contractor not found" }, { status: 404 });
    }

    // Get payment info if available
    const payments = await db.payments.findByContractId(contract.id);
    const payment = payments.find((p) => p.status === "completed") || null;
    const paymentInfo = payment
      ? {
          receiptId: payment.id,
          receiptUrl: null, // Can be added later if needed
        }
      : null;

    // Generate PDF
    const pdfBuffer = await generateContractPDF(
      contract,
      {
        name: client.name,
        email: client.email,
        phone: client.phone,
      },
      {
        name: contractor.name,
        email: contractor.email,
        companyName: contractor.companyName || undefined,
        companyLogo: null, // Can be added later
        companyAddress: null, // Can be added later
      },
      paymentInfo
    );

    // Return PDF as response
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contract-${contract.title.replace(/[^a-z0-9]/gi, "_")}-${contract.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
