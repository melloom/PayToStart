import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getContractLinkEmail } from "@/lib/email/templates";

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

    if (contract.status === "cancelled" || contract.status === "completed") {
      return NextResponse.json(
        { message: "Cannot resend a cancelled or completed contract" },
        { status: 400 }
      );
    }

    const { email } = await request.json();
    
    // Get client to get email if not provided
    let clientEmailToUse = email;
    if (!clientEmailToUse) {
      const client = await db.clients.findById(contract.clientId);
      if (!client) {
        return NextResponse.json({ message: "Client not found" }, { status: 404 });
      }
      clientEmailToUse = client.email;
    }

    const client = await db.clients.findById(contract.clientId);
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${contract.signingToken}`;

    // Generate email using template
    const { subject, html } = getContractLinkEmail({
      contractTitle: contract.title,
      contractorName: contractor.name,
      contractorEmail: contractor.email,
      contractorCompany: contractor.companyName,
      clientName: client.name,
      clientEmail: client.email,
      signingUrl,
      depositAmount: contract.depositAmount,
      totalAmount: contract.totalAmount,
    });

    // Send email
    try {
      await sendEmail({
        to: clientEmailToUse,
        subject,
        html,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail if email fails - still return success as the link can be shared manually
    }

    return NextResponse.json({
      success: true,
      message: "Contract link sent successfully",
    });
  } catch (error: any) {
    console.error("Error resending contract:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

