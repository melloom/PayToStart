// PDF Generation using @react-pdf/renderer
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPDF } from "@/lib/pdf/contract-pdf";
import { getSignature } from "./signature";
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
  // Get signature data if available
  const signature = await getSignature(contract.id);

  // Get signed URL for signature image if it exists (for private storage)
  // Try to get from contracts bucket first, then fallback to signatures bucket
  let signatureImageUrl: string | null = null;
  if (signature?.signature_url) {
    try {
      // Try to get from contracts bucket (new path)
      try {
        const contractsPath = `company/${contract.companyId}/contracts/${contract.id}/signature.png`;
        signatureImageUrl = await storage.getSignedUrl("contracts", contractsPath, 3600);
      } catch {
        // Fallback to old signatures bucket path
        if (signature.signature_url.includes("supabase")) {
          // Extract path from URL
          const url = new URL(signature.signature_url);
          const pathMatch = url.pathname.match(/\/signatures\/(.+)$/);
          if (pathMatch && pathMatch[1]) {
            signatureImageUrl = await storage.getSignedUrl("signatures", pathMatch[1], 3600);
          } else {
            // Try public URL path
            signatureImageUrl = signature.signature_url;
          }
        } else {
          signatureImageUrl = signature.signature_url;
        }
      }
    } catch (error) {
      console.error("Error getting signature URL:", error);
      // Fallback to original URL
      signatureImageUrl = signature.signature_url;
    }
  }

  // Render PDF using React component
  const pdfDocument = React.createElement(ContractPDF, {
    contract,
    client,
    contractor,
    signature: signature
      ? {
          ...signature,
          signature_url: signatureImageUrl,
        }
      : null,
    payment: payment || null,
  });

  // Render to buffer
  const buffer = await renderToBuffer(pdfDocument);

  return buffer;
}
