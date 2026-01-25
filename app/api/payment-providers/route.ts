import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET - Fetch all payment providers for the current company
export async function GET() {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const providers = await db.paymentProviders.findByCompanyId(contractor.companyId);
    
    return NextResponse.json({ providers, success: true });
  } catch (error: any) {
    console.error("Error fetching payment providers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment providers" },
      { status: 500 }
    );
  }
}

// POST - Create a new payment provider connection
export async function POST(request: NextRequest) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      providerType,
      providerName,
      connectionData,
      stripeCustomerId,
      stripeAccountId,
      isDefault,
    } = body;

    if (!providerType || !providerName) {
      return NextResponse.json(
        { error: "Missing required fields", message: "providerType and providerName are required" },
        { status: 400 }
      );
    }

    // Check if a provider of this type already exists for this company
    const existingProviders = await db.paymentProviders.findByCompanyId(contractor.companyId);
    const existingProvider = existingProviders.find(p => p.providerType === providerType);
    
    if (existingProvider) {
      return NextResponse.json(
        { 
          error: "Provider already exists", 
          message: `You already have a ${providerName} provider connected. Please connect or delete the existing one first.`,
          existingProviderId: existingProvider.id
        },
        { status: 409 }
      );
    }

    const provider = await db.paymentProviders.create({
      companyId: contractor.companyId,
      providerType,
      providerName,
      status: "pending",
      isDefault: isDefault || false,
      connectionData: connectionData || {},
      stripeCustomerId,
      stripeAccountId,
    });

    return NextResponse.json({ provider, success: true }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating payment provider:", error);
    
    // Check for unique constraint violation
    if (error.message?.includes("unique") || error.message?.includes("duplicate") || error.code === "23505") {
      return NextResponse.json(
        { 
          error: "Provider already exists", 
          message: "A provider of this type already exists for your account. Please connect or delete the existing one first."
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create payment provider" },
      { status: 500 }
    );
  }
}
