import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get all user data
    const [contracts, templates, clients, company] = await Promise.all([
      // Get contracts
      db.contracts.findByCompanyId(contractor.companyId),
      // Get templates
      db.templates.findByCompanyId(contractor.companyId),
      // Get clients
      db.clients.findByCompanyId(contractor.companyId),
      // Get company
      db.companies.findById(contractor.companyId),
    ]);

    // Get payments
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("company_id", contractor.companyId);

    // Get signatures
    const { data: signatures } = await supabase
      .from("signatures")
      .select("*")
      .eq("company_id", contractor.companyId);

    // Compile export data
    const exportData = {
      account: {
        id: contractor.id,
        name: contractor.name,
        email: contractor.email,
        companyName: contractor.companyName,
        createdAt: contractor.createdAt,
      },
      company: company ? {
        id: company.id,
        name: company.name,
        subscriptionTier: company.subscriptionTier,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      } : null,
      contracts: contracts.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        totalAmount: c.totalAmount,
        depositAmount: c.depositAmount,
        createdAt: c.createdAt,
        signedAt: c.signedAt,
        paidAt: c.paidAt,
        completedAt: c.completedAt,
      })),
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      clients: clients.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt,
      })),
      payments: payments || [],
      signatures: signatures || [],
      exportDate: new Date().toISOString(),
    };

    // Return as JSON download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="account-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting account data:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to export data" },
      { status: 500 }
    );
  }
}

