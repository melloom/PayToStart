import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getContractLinkEmail } from "@/lib/email/templates";
import { hashPassword } from "@/lib/security/tokens";
import { log } from "@/lib/logger";

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

    const { email, password } = await request.json();
    
    // Get client to get email if not provided
    let clientEmailToUse = email;
    if (!clientEmailToUse) {
      const client = await db.clients.findById(contract.clientId);
      if (!client) {
        return NextResponse.json({ message: "Client not found" }, { status: 404 });
      }
      clientEmailToUse = client.email;
    }

    // Hash password if provided
    let passwordHash: string | undefined = undefined;
    if (password && password.trim()) {
      if (password.length < 4) {
        return NextResponse.json(
          { message: "Password must be at least 4 characters" },
          { status: 400 }
        );
      }
      passwordHash = hashPassword(password.trim());
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

      // Update contract status from "draft" or "ready" to "sent" when sending
      // Also update password hash if provided
      const updateData: any = {
        status: "sent",
      };
      if (passwordHash !== undefined) {
        updateData.passwordHash = passwordHash;
      }
      
      if (contract.status === "draft" || contract.status === "ready") {
        await db.contracts.update(contract.id, updateData);

        // Log "sent" event
        await db.contractEvents.logEvent({
          contractId: contract.id,
          eventType: "sent",
          actorType: "contractor",
          actorId: contractor.id,
        });

        log.info({ 
          contractId: contract.id,
          contractorId: contractor.id,
          clientEmail: clientEmailToUse,
        }, "Contract sent to client");
      }
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      // Return error so user knows email failed
      return NextResponse.json(
        { 
          message: emailError.message || "Failed to send email. Please check your email configuration.",
          error: "EMAIL_SEND_FAILED"
        },
        { status: 500 }
      );
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

