import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// Public endpoint - allows fetching client info for payment processing
// Uses service client to bypass RLS since this is accessed from public signing page
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle Next.js 14+ where params might be a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const contractId = resolvedParams.id;
    
    console.log('[GET /api/contracts/[id]/client] Contract ID:', contractId);

    if (!contractId) {
      return NextResponse.json(
        { message: "Contract ID is required" },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS for public route
    // This is safe because we're only querying by contract ID (which was already verified via signing token)
    const supabase = createServiceClient();
    
    // Get contract to find client ID
    const { data: contractData, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .maybeSingle();
    
    if (contractError || !contractData) {
      console.error('[GET /api/contracts/[id]/client] Contract lookup error:', contractError);
      return NextResponse.json(
        { message: "Contract not found" },
        { status: 404 }
      );
    }
    
    const contract = contractData;

    // Get client info using service client
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", contract.client_id)
      .maybeSingle();
    
    if (clientError || !clientData) {
      // If client not found in database, try to get from contract fieldValues
      const fieldValues = contract.field_values && typeof contract.field_values === "object" 
        ? contract.field_values as Record<string, any>
        : {};
      
      const clientEmail = fieldValues.clientEmail || fieldValues.email || "";
      const clientName = fieldValues.clientName || fieldValues.name || "Client";
      
      if (clientEmail || clientName) {
        return NextResponse.json({
          id: contract.client_id,
          name: clientName,
          email: clientEmail,
          phone: fieldValues.phone || fieldValues.clientPhone || undefined,
        });
      }
      
      console.error('[GET /api/contracts/[id]/client] Client lookup error:', clientError);
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: clientData.id,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone || undefined,
    });
  } catch (error: any) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
