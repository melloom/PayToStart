import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createDepositCheckoutSession } from "@/lib/payments";
import { hashToken, verifyToken, isTokenExpired } from "@/lib/security/tokens";
import { log } from "@/lib/logger";

// Helper to verify token for contract access (allows access if signed even if token was used)
async function verifyContractToken(token: string): Promise<{ contract: any; error?: string }> {
  // Try to find contract by raw token first (for contracts created before SIGNING_TOKEN_SECRET was set)
  // This ensures backwards compatibility
  let contract: any = null;
  try {
    contract = await db.contracts.findBySigningToken(token);
  } catch (error: any) {
    log.warn({ error: error.message }, "Error in findBySigningToken");
  }
  
  // If not found by raw token, try hash lookup (for newer contracts with secure tokens)
  if (!contract) {
    try {
      const tokenHash = hashToken(token);
      contract = await db.contracts.findBySigningTokenHash(tokenHash);
      
      // If found by hash, verify it matches
      if (contract && contract.signingTokenHash && !verifyToken(token, contract.signingTokenHash)) {
        log.warn({
          contractId: contract.id,
        }, "Token hash verification failed");
        return {
          contract: null,
          error: "Invalid token",
        };
      }
    } catch (error: any) {
      log.warn({ error: error.message }, "Error in findBySigningTokenHash");
    }
  }

  // Contract not found - try URL-decoded token in case it was double-encoded
  if (!contract) {
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
      if (decodedToken !== token) {
        log.info({}, "Trying URL-decoded token");
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
      log.warn({
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 16),
      }, "Contract not found for token after all lookup attempts");
      return {
        contract: null,
        error: "Invalid token",
      };
    }
  }

  // If we found by raw token, skip hash verification (backwards compatibility)
  // This allows contracts created before SIGNING_TOKEN_SECRET was set to still work

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
    const body = await request.json();
    const { contractId, signingToken, amount, currency } = body;

    if (!contractId || !signingToken) {
      log.warn({ contractId: !!contractId, hasToken: !!signingToken }, "Missing required fields in create-checkout");
      return NextResponse.json(
        { message: "Missing required fields: contractId and signingToken are required" },
        { status: 400 }
      );
    }

    log.info({
      contractId,
      tokenLength: signingToken?.length,
      tokenPrefix: signingToken?.substring(0, 16),
    }, "Creating checkout session");

    // Verify contract exists with secure token verification
    const { contract, error } = await verifyContractToken(signingToken);
    if (!contract || error) {
      log.warn({
        contractId,
        tokenPrefix: signingToken?.substring(0, 16),
        error,
      }, "Token verification failed in create-checkout");
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

    log.info({
      contractId: contract.id,
      sessionId: session.id,
    }, "Checkout session created successfully");

    return NextResponse.json({
      sessionId: session.id,
      url: session.url, // Include session URL for debugging
    });
  } catch (error: any) {
    log.error({
      error: error.message,
      stack: error.stack,
    }, "Error creating checkout session");
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

