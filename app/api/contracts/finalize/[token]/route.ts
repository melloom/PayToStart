import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { finalizeContract } from "@/lib/finalization";
import { hashToken, verifyToken, isTokenExpired } from "@/lib/security/tokens";

// Helper to verify token for contract access (allows access if signed/paid even if token was used)
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

// For contracts without deposits - finalize immediately after signing
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { contract, error } = await verifyContractToken(params.token);

    if (!contract || error) {
      return NextResponse.json(
        { message: error || "Contract not found" },
        { status: 404 }
      );
    }

    if (contract.status !== "signed") {
      return NextResponse.json(
        { message: "Contract must be signed first" },
        { status: 400 }
      );
    }

    if (contract.depositAmount > 0) {
      return NextResponse.json(
        { message: "Contract requires payment" },
        { status: 400 }
      );
    }

    // Mark as paid (no payment needed) and finalize
    await db.contracts.update(contract.id, {
      status: "paid",
      paidAt: new Date(),
    });

    // Finalize the contract
    await finalizeContract(contract.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error finalizing contract:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

