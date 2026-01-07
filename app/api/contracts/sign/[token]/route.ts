import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveSignature, generateContractHash } from "@/lib/signature";
import { createDepositCheckoutSession } from "@/lib/payments";
import { hashToken, verifyToken, isTokenExpired, getRateLimitConfig } from "@/lib/security/tokens";
import { sendEmail } from "@/lib/email";
import { getSignedButUnpaidEmail } from "@/lib/email/templates";
import { signingPayloadSchema } from "@/lib/validations";
import log from "@/lib/logger";

// Public route - no auth required for signing

// Helper to get client IP address
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIP || "unknown";
  return ip.trim();
}

// Helper to verify token and check rate limits
async function verifySigningToken(
  token: string,
  ipAddress: string
): Promise<{ contract: any; error?: string }> {
  // Rate limiting check
  const rateLimitConfig = getRateLimitConfig();
  const recentAttempts = await db.signingAttempts.getRecentAttempts(
    ipAddress,
    rateLimitConfig.windowMinutes
  );

  if (recentAttempts >= rateLimitConfig.maxAttempts) {
    await db.signingAttempts.recordAttempt({
      ipAddress,
      success: false,
    });
    return {
      contract: null,
      error: "Too many attempts. Please try again later.",
    };
  }

  // Hash the provided token
  const tokenHash = hashToken(token);

  // Find contract by token hash
  let contract = await db.contracts.findBySigningTokenHash(tokenHash);

  // Fallback: try old token format for backwards compatibility during migration
  if (!contract) {
    contract = await db.contracts.findBySigningToken(token);
  }

  if (!contract) {
    await db.signingAttempts.recordAttempt({
      ipAddress,
      success: false,
    });
    return {
      contract: null,
      error: "Invalid token",
    };
  }

  // If contract has a hash, verify it matches
  if (contract.signingTokenHash && !verifyToken(token, contract.signingTokenHash)) {
    await db.signingAttempts.recordAttempt({
      ipAddress,
      contractId: contract.id,
      success: false,
    });
    return {
      contract: null,
      error: "Invalid token",
    };
  }

  // Check if token has expired
  if (isTokenExpired(contract.signingTokenExpiresAt)) {
    await db.signingAttempts.recordAttempt({
      ipAddress,
      contractId: contract.id,
      success: false,
    });
    return {
      contract: null,
      error: "This signing link has expired",
    };
  }

  // Check if contract status is valid for signing
  if (contract.status === "cancelled") {
    return {
      contract: null,
      error: "This contract has been cancelled",
    };
  }

  // Check if token has already been used (one-time token)
  if (contract.signingTokenUsedAt) {
    // Token was already used, but we allow viewing if contract is signed
    // This allows users to view their signed contract
    if (contract.status === "signed" || contract.status === "paid" || contract.status === "completed") {
      await db.signingAttempts.recordAttempt({
        ipAddress,
        contractId: contract.id,
        success: true,
      });
      return { contract };
    } else {
      await db.signingAttempts.recordAttempt({
        ipAddress,
        contractId: contract.id,
        success: false,
      });
      return {
        contract: null,
        error: "This signing link has already been used",
      };
    }
  }

  // Record successful verification
  await db.signingAttempts.recordAttempt({
    ipAddress,
    contractId: contract.id,
    success: true,
  });

  return { contract };
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const ipAddress = getClientIP(request);
    const { contract, error } = await verifySigningToken(params.token, ipAddress);

    if (!contract || error) {
      return NextResponse.json(
        { message: error || "Contract not found" },
        { status: 404 }
      );
    }

    const client = await db.clients.findById(contract.clientId);

    return NextResponse.json({
      contract,
      client,
    });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const ipAddress = getClientIP(request);
    
    // Verify token with rate limiting
    const { contract, error } = await verifySigningToken(params.token, ipAddress);

    if (!contract || error) {
      return NextResponse.json(
        { message: error || "Contract not found" },
        { status: 404 }
      );
    }

    // Check if contract can be signed
    if (contract.status !== "sent" && contract.status !== "draft") {
      return NextResponse.json(
        { message: "Contract already signed or cannot be signed" },
        { status: 400 }
      );
    }

    // Check if token has already been used (one-time token enforcement)
    if (contract.signingTokenUsedAt) {
      return NextResponse.json(
        { message: "This signing link has already been used" },
        { status: 400 }
      );
    }

    // Parse and validate signing payload
    const body = await request.json();
    const validationResult = signingPayloadSchema.safeParse(body);
    
    if (!validationResult.success) {
      log.warn({ 
        contractId: contract.id, 
        errors: validationResult.error.errors 
      }, "Signing payload validation failed");
      return NextResponse.json(
        { 
          message: "Validation failed",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { fullName, signatureDataUrl, ip, userAgent } = validationResult.data;

    // Generate contract hash for integrity verification
    const contractHash = generateContractHash(contract.content);

    // Save signature
    await saveSignature(contract.id, contract.companyId, contract.clientId, {
      fullName: fullName.trim(),
      signatureDataUrl: signatureDataUrl || null,
      ip: ip || ipAddress,
      userAgent: userAgent || "unknown",
      contractHash,
    });

    // Update contract status to signed and mark token as used (one-time token)
    const updatedContract = await db.contracts.update(contract.id, {
      status: "signed",
      signedAt: new Date(),
      signingTokenUsedAt: new Date(), // Rotate token after first use
    });

    // Log audit event
    await db.contractEvents.logEvent({
      contractId: contract.id,
      eventType: "signed",
      actorType: "client",
      actorId: contract.clientId,
      metadata: {
        fullName: fullName.trim(),
        ip: ip || ipAddress,
        userAgent: userAgent || "unknown",
        hasSignatureImage: !!signatureDataUrl,
      },
    });

    // If deposit is required, create Stripe Checkout session and send email
    let checkoutUrl: string | null = null;
    if (updatedContract.depositAmount > 0) {
      try {
        const client = await db.clients.findById(updatedContract.clientId);
        const contractor = await db.contractors.findById(updatedContract.contractorId);
        
        if (client && contractor) {
          const checkoutSession = await createDepositCheckoutSession(
            updatedContract,
            client.email,
            params.token
          );
          checkoutUrl = checkoutSession.url;

          // Send "Signed but unpaid" email to client
          try {
            const { subject, html } = getSignedButUnpaidEmail({
              contractTitle: updatedContract.title,
              contractorName: contractor.name,
              contractorEmail: contractor.email,
              contractorCompany: contractor.companyName,
              clientName: client.name,
              clientEmail: client.email,
              paymentUrl: checkoutUrl,
              depositAmount: updatedContract.depositAmount,
              totalAmount: updatedContract.totalAmount,
            });

            await sendEmail({
              to: client.email,
              subject,
              html,
            });
          } catch (emailError) {
            log.error({ error: emailError }, "Error sending signed but unpaid email");
            // Don't fail if email fails
          }
        }
      } catch (error: any) {
        log.error({ error: error.message }, "Error creating checkout session");
        // Don't fail the signing if checkout creation fails - user can still access payment page
      }
    }

    log.contract("signed", updatedContract.id, {
      clientId: updatedContract.clientId,
      hasSignatureImage: !!signatureDataUrl,
      depositRequired: updatedContract.depositAmount > 0,
    });

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      checkoutUrl,
    });
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Error signing contract");
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

