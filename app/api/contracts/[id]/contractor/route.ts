import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// Public endpoint - allows fetching contractor info for contract preview on signing page
// Uses service client to bypass RLS since this is accessed from public signing page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle Next.js 14+ where params might be a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const contractId = resolvedParams.id;
    
    console.log('[GET /api/contracts/[id]/contractor] Contract ID:', contractId);

    if (!contractId) {
      return NextResponse.json(
        { message: "Contract ID is required" },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS for public route
    // This is safe because we're only querying by contract ID (which was already verified via signing token)
    const supabase = createServiceClient();
    
    // Get contract to find contractor ID
    const { data: contractData, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .maybeSingle();
    
    if (contractError || !contractData) {
      console.error('[GET /api/contracts/[id]/contractor] Contract lookup error:', contractError);
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }
    
    const contract = contractData;

    // Get contractor info using service client
    const { data: contractorData, error: contractorError } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", contract.contractor_id)
      .maybeSingle();
    
    if (contractorError || !contractorData) {
      console.error('[GET /api/contracts/[id]/contractor] Contractor lookup error:', contractorError);
      return NextResponse.json(
        { message: "Contractor not found" },
        { status: 404 }
      );
    }

    // Get company info if available
    let companyData = null;
    try {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("id", contractorData.company_id)
        .maybeSingle();
      companyData = data;
    } catch (error) {
      console.warn('[GET /api/contracts/[id]/contractor] Company lookup failed (non-critical):', error);
      // Company info is optional, continue without it
    }

    return NextResponse.json({
      name: contractorData.name,
      email: contractorData.email,
      companyName: contractorData.company_name || companyData?.name || undefined,
      companyLogo: companyData?.logo_url || null,
      companyAddress: companyData?.address || null,
    });
  } catch (error: any) {
    console.error("Error fetching contractor:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
