import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createDepositCheckoutSession } from "@/lib/payments";
import { hashToken, verifyToken, isTokenExpired } from "@/lib/security/tokens";

// Helper to verify token for contract access (allows access if signed even if token was used)
async function verifyContractToken(token: string): Promise<{ contract: any; error?: string }> {
  // Hash the provided token
  const tokenHash = hashToken(token);

  // Find contract by token hash
  let contract = await db.contracts.findBySigningTokenHash(tokenHash);

  // Fallback: try old token format for backwards compatibility during migration
  if (!contract) {
    contract = await db.contracts.findBySigningToken(token);
  }

  if (!contract) {
    return {
      contract: null,
      error: "Invalid token",
    };
  }

  // If contract has a hash, verify it matches
  if (contract.signingTokenHash && !verifyToken(token, contract.signingTokenHash)) {
    return {
      contract: null,
      error: "Invalid token",
    };
  }

  // Check if token has expired
  if (isTokenExpired(contract.signingTokenExpiresAt)) {
    return {
      contract: null,
      error: "This link has expired",
    };
  }

  // Check if contract status is void/cancelled
  if (contract.status === "cancelled") {
    return {
      contract: null,
      error: "This contract has been cancelled",
    };
  }

  return { contract };
}

export async function POST(request: Request) {
  try {
    const { contractId, signingToken, amount, currency } = await request.json();

    if (!contractId || !signingToken) {
      return NextResponse.json(
        { message: "Missing required fields: contractId and signingToken are required" },
        { status: 400 }
      );
    }

    // Verify contract exists with secure token verification
    const { contract, error } = await verifyContractToken(signingToken);
    if (!contract || error) {
      return NextResponse.json(
        { message: error || "Contract not found" },
        { status: 404 }
      );
    }

    // Verify contract ID matches
    if (contract.id !== contractId) {
      return NextResponse.json(
        { message: "Contract ID mismatch" },
        { status: 400 }
      );
    }

    // Get client information
    const client = await db.clients.findById(contract.clientId);
    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 }
      );
    }

    // Create checkout session using payment utility
    const session = await createDepositCheckoutSession(
      contract,
      client.email,
      signingToken
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url, // Include session URL for debugging
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

