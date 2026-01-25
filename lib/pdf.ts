// PDF Generation using @react-pdf/renderer
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPDF } from "@/lib/pdf/contract-pdf";
import { getAllSignatures } from "./signature";
import { storage } from "./storage";
import type { Contract } from "./types";

export async function generateContractPDF(
  contract: Contract,
  client: { name: string; email: string; phone?: string },
  contractor: { 
    name: string; 
    email: string; 
    companyName?: string;
    companyLogo?: string | null;
    companyAddress?: string | null;
  },
  payment?: {
    receiptId?: string | null;
    receiptUrl?: string | null;
  } | null
): Promise<Buffer> {
  // Get all signatures (client and contractor) if available
  const { clientSignature, contractorSignature } = await getAllSignatures(
    contract.id,
    contract.clientId,
    contract.contractorId
  );

  // Helper function to get signed URL for signature image
  const getSignatureImageUrl = async (signature: any): Promise<string | null> => {
    if (!signature?.signature_url || signature.signature_url.trim() === "") {
      return null;
    }

    try {
      // Try to get from contracts bucket (new path)
      try {
        const contractsPath = `company/${contract.companyId}/contracts/${contract.id}/signature.png`;
        return await storage.getSignedUrl("contracts", contractsPath, 3600);
      } catch {
        // Fallback to old signatures bucket path
        if (signature.signature_url.includes("supabase")) {
          // Extract path from URL
          const url = new URL(signature.signature_url);
          const pathMatch = url.pathname.match(/\/signatures\/(.+)$/);
          if (pathMatch && pathMatch[1]) {
            return await storage.getSignedUrl("signatures", pathMatch[1], 3600);
          } else {
            // Try public URL path
            return signature.signature_url;
          }
        } else {
          return signature.signature_url;
        }
      }
    } catch (error) {
      console.error("Error getting signature URL:", error);
      // Fallback to original URL
      return signature.signature_url;
    }
  };

  // Get signed URLs for both signatures
  const clientSignatureImageUrl = clientSignature ? await getSignatureImageUrl(clientSignature) : null;
  const contractorSignatureImageUrl = contractorSignature ? await getSignatureImageUrl(contractorSignature) : null;

  // Clean contract content - remove "==========" separators
  const cleanedContent = contract.content
    .replace(/={10,}/g, '') // Remove lines of 10+ equals signs
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
    .trim();

  // Create a cleaned contract object
  const cleanedContract = {
    ...contract,
    content: cleanedContent,
  };

  // Extract branding from contract fieldValues
  const branding = contract.fieldValues && typeof contract.fieldValues === 'object' && '_branding' in contract.fieldValues
    ? contract.fieldValues._branding
    : undefined;

  // Render PDF using React component
  const pdfDocument = React.createElement(ContractPDF, {
    contract: cleanedContract,
    client,
    contractor,
    clientSignature: clientSignature
      ? {
          ...clientSignature,
          signature_url: clientSignatureImageUrl,
        }
      : null,
    contractorSignature: contractorSignature
      ? {
          ...contractorSignature,
          signature_url: contractorSignatureImageUrl,
        }
      : null,
    payment: payment || null,
    branding: branding,
  });

  // Render to buffer with high quality settings
  // @react-pdf/renderer uses pdfkit under the hood which produces high-quality PDFs
  const buffer = await renderToBuffer(pdfDocument as any);

  return buffer;
}
