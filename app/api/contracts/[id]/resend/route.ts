import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getContractLinkEmail } from "@/lib/email/templates";
import { hashPassword, generateToken, hashToken, getTokenExpiry } from "@/lib/security/tokens";
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

    const { email, password, paymentMethod } = await request.json();
    
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

    // Ensure signing token exists - regenerate if missing or invalid
    let signingToken = contract.signingToken;
    let needsTokenUpdate = false;
    
    if (!signingToken || signingToken.trim() === "" || !contract.signingTokenHash) {
      // Generate new secure token if missing or hash doesn't exist
      log.warn({
        contractId: contract.id,
        hasToken: !!signingToken,
        hasTokenHash: !!contract.signingTokenHash,
      }, "Regenerating signing token for contract");
      
      signingToken = generateToken();
      const tokenHash = hashToken(signingToken);
      const tokenExpiry = getTokenExpiry(7); // 7 days expiry
      
      // Update contract with new token
      await db.contracts.update(contract.id, {
        signingToken,
        signingTokenHash: tokenHash,
        signingTokenExpiresAt: tokenExpiry,
        signingTokenUsedAt: null, // Reset used status for new token
      });
      
      needsTokenUpdate = true;
    }

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${signingToken}`;

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
      // Also update password hash and payment method if provided
      const updateData: any = {
        status: "sent",
      };
      if (passwordHash !== undefined) {
        updateData.passwordHash = passwordHash;
      }
      
      // Save payment method to fieldValues if provided
      if (paymentMethod && typeof paymentMethod === "string" && paymentMethod.trim()) {
        const currentFieldValues = contract.fieldValues || {};
        updateData.fieldValues = {
          ...currentFieldValues,
          paymentMethod: paymentMethod.trim(),
          paymentMethodSetAt: new Date().toISOString(),
        };
      }
      
      if (contract.status === "draft" || contract.status === "ready") {
        await db.contracts.update(contract.id, updateData);
      } else if (paymentMethod && typeof paymentMethod === "string" && paymentMethod.trim()) {
        // Even if status is already "sent", update payment method if provided
        const currentFieldValues = contract.fieldValues || {};
        await db.contracts.update(contract.id, {
          fieldValues: {
            ...currentFieldValues,
            paymentMethod: paymentMethod.trim(),
            paymentMethodSetAt: new Date().toISOString(),
          },
        });
      }

      // Always log "sent" event when email is successfully sent
      // This ensures the timeline shows the event even if contract was already sent before
      await db.contractEvents.logEvent({
        contractId: contract.id,
        eventType: "sent",
        actorType: "contractor",
        actorId: contractor.id,
        metadata: {
          clientEmail: clientEmailToUse,
          hasPassword: passwordHash !== undefined,
        },
      });

      log.info({ 
        contractId: contract.id,
        contractorId: contractor.id,
        clientEmail: clientEmailToUse,
      }, "Contract sent to client");
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

