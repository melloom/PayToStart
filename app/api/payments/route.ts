import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId") || contractor.companyId;

    // Verify the company belongs to the contractor
    if (companyId !== contractor.companyId) {
      return NextResponse.json(
        { error: "Forbidden", message: "Access denied" },
        { status: 403 }
      );
    }

    // Get all contracts for this company
    const contracts = await db.contracts.findByContractorId(contractor.id);
    const contractIds = contracts.map(c => c.id);

    if (contractIds.length === 0) {
      return NextResponse.json({
        payments: [],
      });
    }

    // Get all payments for these contracts
    const supabase = await createClient();
    const { data: paymentsData, error } = await supabase
      .from("payments")
      .select("*")
      .in("contract_id", contractIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
      return NextResponse.json(
        { error: "Internal server error", message: error.message },
        { status: 500 }
      );
    }

    // Get contract and client details for each payment
    const paymentsWithDetails = await Promise.all(
      (paymentsData || []).map(async (payment: any) => {
        const contract = contracts.find(c => c.id === payment.contract_id);
        let client = null;
        
        if (contract) {
          client = await db.clients.findById(contract.clientId).catch(() => null);
        }

        return {
          id: payment.id,
          contractId: payment.contract_id,
          amount: payment.amount,
          status: payment.status,
          createdAt: new Date(payment.created_at),
          completedAt: payment.completed_at ? new Date(payment.completed_at) : undefined,
          paymentIntentId: payment.payment_intent_id,
          contract: contract ? {
            id: contract.id,
            title: contract.title,
            clientId: contract.clientId,
            client: client ? {
              name: client.name,
              email: client.email,
            } : undefined,
          } : undefined,
        };
      })
    );

    return NextResponse.json({
      payments: paymentsWithDetails,
    });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
