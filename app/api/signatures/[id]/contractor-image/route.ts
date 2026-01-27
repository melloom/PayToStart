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
    const { contractorSignature } = await getAllSignatures(contractId);
    
    if (!contractorSignature) {
      return NextResponse.json(
        { error: "No contractor signature found" },
        { status: 404 }
      );
    }

    // Check for signature_url in both snake_case and camelCase
    const signatureUrl = (contractorSignature as any).signature_url || (contractorSignature as any).signatureUrl;
    
    if (!signatureUrl || (typeof signatureUrl === 'string' && signatureUrl.trim() === "")) {
      return NextResponse.json(
        { error: "No contractor signature image available" },
        { status: 404 }
      );
    }

    // Get fresh signed URL
    return await getFreshSignedUrl(signatureUrl, contract);
  } catch (error: any) {
    console.error("Error serving contractor signature image:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

async function getFreshSignedUrl(signatureUrl: string, contract: any): Promise<NextResponse> {
  try {
    console.log("Getting fresh signed URL for contractor signature:", signatureUrl);
    
    // Check if it's a Supabase storage URL
    if (signatureUrl.includes("supabase")) {
      try {
        const url = new URL(signatureUrl);
        console.log("Parsed URL:", url.pathname);
        
        // Try to extract path from URL
        // Format: https://<project>.supabase.co/storage/v1/object/sign/<bucket>/<path>
        const pathMatch = url.pathname.match(/\/object\/sign\/([^/]+)\/(.+)$/);
        if (pathMatch && pathMatch.length >= 3) {
          const bucket = pathMatch[1];
          const path = decodeURIComponent(pathMatch[2]);
          console.log("Extracted bucket:", bucket, "path:", path);
          
          // Get fresh signed URL (valid for 1 hour)
          const freshUrl = await storage.getSignedUrl(
            bucket as "contracts" | "signatures" | "attachments",
            path,
            3600
          );
          
          console.log("Generated fresh URL");
          // Redirect to the fresh signed URL
          return NextResponse.redirect(freshUrl);
        }
        
        // Try alternative format: /storage/v1/object/public/<bucket>/<path> or /storage/v1/object/<bucket>/<path>
        const altPathMatch = url.pathname.match(/\/object\/(?:public\/)?([^/]+)\/(.+)$/);
        if (altPathMatch && altPathMatch.length >= 3) {
          const bucket = altPathMatch[1];
          const path = decodeURIComponent(altPathMatch[2]);
          console.log("Extracted (alt) bucket:", bucket, "path:", path);
          
          const freshUrl = await storage.getSignedUrl(
            bucket as "contracts" | "signatures" | "attachments",
            path,
            3600
          );
          
          return NextResponse.redirect(freshUrl);
        }
      } catch (urlError) {
        console.error("Error parsing Supabase URL:", urlError);
      }
    }

    // Try legacy path format: {companyId}/{contractId}/{clientId}/signature-{timestamp}.png
    if (signatureUrl.includes("signatures")) {
      try {
        const url = new URL(signatureUrl);
        const pathMatch = url.pathname.match(/\/signatures\/(.+)$/);
        if (pathMatch && pathMatch[1]) {
          const path = decodeURIComponent(pathMatch[1]);
          console.log("Using legacy signatures path:", path);
          const freshUrl = await storage.getSignedUrl("signatures", path, 3600);
          return NextResponse.redirect(freshUrl);
        }
      } catch (urlError) {
        console.error("Error parsing legacy URL:", urlError);
      }
    }

    // Try contracts bucket path
    const contractsPath = `company/${contract.companyId}/contracts/${contract.id}/signature.png`;
    try {
      console.log("Trying contracts bucket path:", contractsPath);
      const freshUrl = await storage.getSignedUrl("contracts", contractsPath, 3600);
      return NextResponse.redirect(freshUrl);
    } catch (contractsError) {
      console.error("Error getting contracts bucket URL:", contractsError);
    }

    // Fallback to original URL
    console.log("Falling back to original URL");
    return NextResponse.redirect(signatureUrl);
  } catch (error: any) {
    console.error("Error getting fresh signed URL:", error);
    // Fallback: try to redirect to original URL (might work if it's still valid)
    return NextResponse.redirect(signatureUrl);
  }
}
