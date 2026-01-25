import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateContractPDF } from "@/lib/pdf";
import { hashToken, verifyToken } from "@/lib/security/tokens";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Helper to verify token for contract access (allows access if signed even if token was used)
async function verifyContractToken(token: string): Promise<{ contract: any; error?: string }> {
  // Try to find contract by raw token first (for contracts created before SIGNING_TOKEN_SECRET was set)
  // This ensures backwards compatibility
  let contract: any = null;
  try {
    contract = await db.contracts.findBySigningToken(token);
  } catch (error: any) {
    // Ignore error, try hash lookup
  }
  
  // If not found by raw token, try hash lookup (for newer contracts with secure tokens)
  if (!contract) {
    try {
      const tokenHash = hashToken(token);
      contract = await db.contracts.findBySigningTokenHash(tokenHash);
      
      // If found by hash, verify it matches
      if (contract && contract.signingTokenHash && !verifyToken(token, contract.signingTokenHash)) {
        return {
          contract: null,
          error: "Invalid token",
        };
      }
    } catch (error: any) {
      // Ignore error, try URL-decoded token
    }
  }

  // Contract not found - try URL-decoded token in case it was double-encoded
  if (!contract) {
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
      if (decodedToken !== token) {
        contract = await db.contracts.findBySigningToken(decodedToken);
        if (!contract) {
          const decodedHash = hashToken(decodedToken);
          contract = await db.contracts.findBySigningTokenHash(decodedHash);
        }
      }
    } catch (e) {
      // Already decoded or invalid, ignore
    }
    
    if (!contract) {
      return {
        contract: null,
        error: "Invalid token",
      };
    }
  }

  return { contract };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    let token = resolvedParams.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    // URL decode the token (Next.js might have already decoded it, but be safe)
    try {
      token = decodeURIComponent(token);
    } catch (e) {
      // Token might not be encoded, that's okay
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
    let client = await db.clients.findById(contract.clientId).catch(() => null);
    
    // If client not found, try to get info from contract fieldValues
    if (!client) {
      const fieldValues = contract.fieldValues && typeof contract.fieldValues === "object" 
        ? contract.fieldValues as Record<string, any>
        : {};
      
      // Get client info from fieldValues
      const clientEmail = fieldValues.clientEmail || fieldValues.email || "";
      const clientName = fieldValues.clientName || fieldValues.name || "Client";
      
      if (clientEmail || clientName) {
        client = {
          id: contract.clientId,
          name: clientName,
          email: clientEmail,
          phone: fieldValues.phone || fieldValues.clientPhone || undefined,
        } as any;
      } else {
        // Last resort: use placeholder
        client = {
          id: contract.clientId,
          name: "Client",
          email: "client@example.com",
          phone: undefined,
        } as any;
      }
    }

    let contractor = await db.contractors.findById(contract.contractorId).catch(() => null);
    
    // If contractor not found, try to get info using service client (bypasses RLS)
    if (!contractor) {
      try {
        const supabase = createServiceClient();
        const { data: contractorData, error: contractorError } = await supabase
          .from("contractors")
          .select("*")
          .eq("id", contract.contractorId)
          .maybeSingle();
        
        if (contractorData && !contractorError) {
          // Get company info if available
          let companyData = null;
          if (contractorData.company_id) {
            const { data } = await supabase
              .from("companies")
              .select("*")
              .eq("id", contractorData.company_id)
              .maybeSingle();
            companyData = data;
          }
          
          contractor = {
            id: contractorData.id,
            name: contractorData.name,
            email: contractorData.email,
            companyName: contractorData.company_name || companyData?.name || undefined,
            companyLogo: companyData?.logo_url || null,
            companyAddress: companyData?.address || null,
          } as any;
        } else {
          // Last resort: use placeholder
          contractor = {
            id: contract.contractorId,
            name: "Contractor",
            email: "contractor@example.com",
            companyName: undefined,
            companyLogo: null,
            companyAddress: null,
          } as any;
        }
      } catch (error) {
        // If all else fails, use placeholder
        contractor = {
          id: contract.contractorId,
          name: "Contractor",
          email: "contractor@example.com",
          companyName: undefined,
          companyLogo: null,
          companyAddress: null,
        } as any;
      }
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
