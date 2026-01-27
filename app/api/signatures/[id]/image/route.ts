import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const contractId = resolvedParams.id;

    // Verify the contractor has access
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get contract to verify access
    const contract = await db.contracts.findById(contractId);
    if (!contract || contract.contractorId !== contractor.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get all signatures for this contract
    const { getAllSignatures } = await import("@/lib/signature");
    const { clientSignature, contractorSignature } = await getAllSignatures(contractId);
    
    // Use client signature by default, fallback to contractor signature
    const signature = clientSignature || contractorSignature;
    
    if (!signature || !signature.signature_url || signature.signature_url.trim() === "") {
      return NextResponse.json(
        { error: "No signature image available" },
        { status: 404 }
      );
    }

    const signatureUrl = signature.signature_url;

    // Get fresh signed URL using helper function
    return await getFreshSignedUrl(signatureUrl, contract);
  } catch (error: any) {
    console.error("Error serving signature image:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

async function getFreshSignedUrl(signatureUrl: string, contract: any): Promise<NextResponse> {
  try {
    // Check if it's a Supabase storage URL
    if (signatureUrl.includes("supabase")) {
      const url = new URL(signatureUrl);
      
      // Try to extract path from URL
      // Format: https://<project>.supabase.co/storage/v1/object/sign/<bucket>/<path>
      const pathMatch = url.pathname.match(/\/object\/sign\/([^/]+)\/(.+)$/);
      if (pathMatch && pathMatch.length >= 3) {
        const bucket = pathMatch[1];
        const path = decodeURIComponent(pathMatch[2]);
        
        // Get fresh signed URL (valid for 1 hour)
        const freshUrl = await storage.getSignedUrl(
          bucket as "contracts" | "signatures" | "attachments",
          path,
          3600
        );
        
        // Redirect to the fresh signed URL
        return NextResponse.redirect(freshUrl);
      }
    }

    // Try legacy path format: {companyId}/{contractId}/{clientId}/signature-{timestamp}.png
    if (signatureUrl.includes("signatures")) {
      const url = new URL(signatureUrl);
      const pathMatch = url.pathname.match(/\/signatures\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        const path = decodeURIComponent(pathMatch[1]);
        const freshUrl = await storage.getSignedUrl("signatures", path, 3600);
        return NextResponse.redirect(freshUrl);
      }
    }

    // Try contracts bucket path
    const contractsPath = `company/${contract.companyId}/contracts/${contract.id}/signature.png`;
    try {
      const freshUrl = await storage.getSignedUrl("contracts", contractsPath, 3600);
      return NextResponse.redirect(freshUrl);
    } catch {
      // Fallback to original URL
      return NextResponse.redirect(signatureUrl);
    }
  } catch (error: any) {
    console.error("Error getting fresh signed URL:", error);
    // Fallback: try to redirect to original URL (might work if it's still valid)
    return NextResponse.redirect(signatureUrl);
  }
}
