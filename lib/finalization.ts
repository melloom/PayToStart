// Finalization Brain: Verify signature + payment → Generate PDF → Store → Email

import { db } from "./db";
import { storage } from "./storage";
import { generateContractPDF } from "./pdf";
import { sendEmail } from "./email";
import { getSignature } from "./signature";
import { createClient } from "./supabase-server";
import { getDepositReceivedEmail } from "./email/templates";
import { sendNotificationIfEnabled } from "./email/notifications";
import type { Contract } from "./types";

export async function finalizeContract(
  contractId: string,
  paymentInfo?: {
    receiptId?: string | null;
    receiptUrl?: string | null;
  }
) {
  try {
    // Get contract with all related data
    const contract = await db.contracts.findById(contractId);
    if (!contract) {
      throw new Error("Contract not found");
    }

    // Verify contract is signed and paid
    if (contract.status !== "paid") {
      throw new Error(`Contract status is ${contract.status}, expected 'paid'`);
    }

    if (!contract.signedAt) {
      throw new Error("Contract is not signed");
    }

    if (!contract.paidAt) {
      throw new Error("Contract payment not confirmed");
    }

    // Get client and contractor
    const client = await db.clients.findById(contract.clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const contractor = await db.contractors.findById(contract.contractorId);
    if (!contractor) {
      throw new Error("Contractor not found");
    }

    // Get signature and copy to contracts bucket if it exists in old bucket
    const signature = await getSignature(contract.id);
    if (signature?.signature_url) {
      try {
        // Check if signature exists in old signatures bucket
        const supabase = await createClient();
        const url = new URL(signature.signature_url);
        const pathMatch = url.pathname.match(/\/signatures\/(.+)$/);
        
        if (pathMatch && pathMatch[1]) {
          // Get the signature file from old bucket
          const { data: signatureData, error: downloadError } = await supabase.storage
            .from("signatures")
            .download(pathMatch[1]);
          
          if (!downloadError && signatureData) {
            // Convert blob to buffer
            const arrayBuffer = await signatureData.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Upload to contracts bucket at correct path
            await storage.uploadSignature(
              contract.id,
              contract.companyId,
              buffer
            );
          }
        }
      } catch (error) {
        console.warn("Could not copy signature to contracts bucket:", error);
        // Continue anyway - signature might already be in contracts bucket or not needed
      }
    }

    // Generate final PDF with payment info
    const pdfBuffer = await generateContractPDF(
      contract,
      client,
      {
        name: contractor.name,
        email: contractor.email,
        companyName: contractor.companyName,
        // TODO: Add company logo and address when company table is extended
        companyLogo: null,
        companyAddress: null,
      },
      paymentInfo || null
    );

    // Upload PDF to storage at correct path (company/<companyId>/contracts/<contractId>/final.pdf)
    const pdfUrl = await storage.uploadPDF(
      contract.id,
      contract.companyId,
      pdfBuffer
    );

    // Update contract with PDF URL and mark as completed
    const completedContract = await db.contracts.update(contractId, {
      status: "completed",
      completedAt: new Date(),
      pdfUrl,
    });

    if (!completedContract) {
      throw new Error("Failed to update contract");
    }

    // Log audit events
    await db.contractEvents.logEvent({
      contractId: contractId,
      eventType: "finalized",
      actorType: "system",
      metadata: {
        pdfUrl,
        finalizedAt: new Date().toISOString(),
      },
    });

    await db.contractEvents.logEvent({
      contractId: contractId,
      eventType: "completed",
      actorType: "system",
    });

    // Send "Deposit received" emails to both parties
    const clientEmailTemplate = getDepositReceivedEmail(
      {
        contractTitle: contract.title,
        contractorName: contractor.name,
        contractorEmail: contractor.email,
        contractorCompany: contractor.companyName,
        clientName: client.name,
        clientEmail: client.email,
        pdfUrl,
        depositAmount: contract.depositAmount,
        totalAmount: contract.totalAmount,
      },
      true // isClient
    );

    const contractorEmailTemplate = getDepositReceivedEmail(
      {
        contractTitle: contract.title,
        contractorName: contractor.name,
        contractorEmail: contractor.email,
        contractorCompany: contractor.companyName,
        clientName: client.name,
        clientEmail: client.email,
        pdfUrl,
        depositAmount: contract.depositAmount,
        totalAmount: contract.totalAmount,
      },
      false // isClient
    );

    await Promise.all([
      // Email to client (always send - clients don't have preferences)
      sendEmail({
        to: client.email,
        subject: clientEmailTemplate.subject,
        html: clientEmailTemplate.html,
      }),
      // Email to contractor (check preferences for contractPaid and paymentReceived)
      sendNotificationIfEnabled(
        contractor.id,
        "contractPaid",
        () => sendEmail({
        to: contractor.email,
        subject: contractorEmailTemplate.subject,
        html: contractorEmailTemplate.html,
        })
      ),
    ]);

    return {
      success: true,
      contract: completedContract,
      pdfUrl,
    };
  } catch (error: any) {
    console.error("Error finalizing contract:", error);
    throw error;
  }
}

