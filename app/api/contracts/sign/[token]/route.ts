import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveSignature, generateContractHash } from "@/lib/signature";
import { createDepositCheckoutSession } from "@/lib/payments";
import { hashToken, verifyToken, isTokenExpired, getRateLimitConfig, verifyPassword } from "@/lib/security/tokens";
import { sendEmail } from "@/lib/email";
import { sendNotificationIfEnabled } from "@/lib/email/notifications";
import { getSignedButUnpaidEmail, getContractSignedEmail } from "@/lib/email/templates";
import { signingPayloadSchema } from "@/lib/validations";
import { log } from "@/lib/logger";

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
    
    // Validate token format (should be hex string, 64 chars for 32 bytes)
    if (!params.token || typeof params.token !== "string" || !/^[a-f0-9]{64}$/i.test(params.token)) {
      log.warn({ 
        ipAddress,
        tokenLength: params.token?.length 
      }, "Invalid token format in signing request");
      return NextResponse.json(
        { message: "Invalid link" },
        { status: 400 }
      );
    }

    const { contract, error } = await verifySigningToken(params.token, ipAddress);

    if (!contract || error) {
      // Don't leak information about whether contract exists
      return NextResponse.json(
        { message: "Invalid or expired signing link" },
        { status: 404 }
      );
    }

    // Check if contract requires password - SECURITY: Do this BEFORE returning any contract data
    const requiresPassword = !!contract.passwordHash;
    
    // Check for password in request (from query param)
    const url = new URL(request.url);
    const providedPassword = url.searchParams.get("password");
    
    if (requiresPassword) {
      if (!providedPassword) {
        // Don't return any contract data - just indicate password is required
        return NextResponse.json(
          { 
            message: "Password required to view this contract",
            requiresPassword: true 
          },
          { status: 401 }
        );
      }
      
      // Verify password using timing-safe comparison
      if (!verifyPassword(providedPassword, contract.passwordHash!)) {
        log.warn({
          contractId: contract.id,
          ipAddress,
        }, "Invalid password attempt for contract");
        // Don't return any contract data - just indicate invalid password
        return NextResponse.json(
          { 
            message: "Invalid password",
            requiresPassword: true 
          },
          { status: 401 }
        );
      }
    }

    // Only fetch and return contract data AFTER password verification passes
    const client = await db.clients.findById(contract.clientId);

    // Return contract data - password verified or not required
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
    if (contract.status !== "sent" && contract.status !== "draft" && contract.status !== "ready") {
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

    // Parse and validate signing payload with body size check
    const bodyText = await request.text();
    
    // Check body size (prevent large payload attacks)
    if (bodyText.length > 5 * 1024 * 1024) { // 5MB max for signature images
      log.warn({ 
        contractId: contract.id,
        bodySize: bodyText.length,
        ipAddress 
      }, "Signing request body too large");
      return NextResponse.json(
        { message: "Request payload too large" },
        { status: 413 }
      );
    }

    // Parse body
    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      log.warn({ 
        contractId: contract.id,
        ipAddress 
      }, "Invalid JSON in signing request");
      return NextResponse.json(
        { message: "Invalid request format" },
        { status: 400 }
      );
    }

    // SECURITY: Verify password BEFORE processing signature
    // This prevents bypassing password protection by directly calling the POST endpoint
    if (contract.passwordHash) {
      const providedPassword = body.password;
      
      if (!providedPassword) {
        return NextResponse.json(
          { 
            message: "Password required to sign this contract",
            requiresPassword: true 
          },
          { status: 401 }
        );
      }
      
      if (!verifyPassword(providedPassword, contract.passwordHash)) {
        log.warn({
          contractId: contract.id,
          ipAddress,
        }, "Invalid password attempt for contract signing");
        return NextResponse.json(
          { 
            message: "Invalid password",
            requiresPassword: true 
          },
          { status: 401 }
        );
      }
      
      // Password verified - remove password from body before validation (it's not part of signing schema)
      delete body.password;
    }

    const validationResult = signingPayloadSchema.safeParse(body);
    
    if (!validationResult.success) {
      log.warn({ 
        contractId: contract.id,
        ipAddress,
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

    // Additional security: Sanitize and validate signature data URL
    let sanitizedSignatureUrl: string | null = null;
    if (signatureDataUrl) {
      // Validate it's actually a data URL with image
      if (!signatureDataUrl.startsWith("data:image/") || !signatureDataUrl.includes(";base64,")) {
        log.warn({ 
          contractId: contract.id,
          ipAddress 
        }, "Invalid signature data URL format");
        return NextResponse.json(
          { message: "Invalid signature format" },
          { status: 400 }
        );
      }

      // Extract and validate base64 data
      const base64Match = signatureDataUrl.match(/;base64,(.+)$/);
      if (!base64Match || !base64Match[1]) {
        log.warn({ 
          contractId: contract.id,
          ipAddress 
        }, "Invalid base64 signature data");
        return NextResponse.json(
          { message: "Invalid signature data" },
          { status: 400 }
        );
      }

      // Validate base64 data size (max 2MB for signature images)
      const base64Data = base64Match[1];
      const estimatedSize = (base64Data.length * 3) / 4; // Base64 is ~33% larger
      if (estimatedSize > 2 * 1024 * 1024) {
        log.warn({ 
          contractId: contract.id,
          ipAddress,
          estimatedSize 
        }, "Signature image too large");
        return NextResponse.json(
          { message: "Signature image too large (max 2MB)" },
          { status: 400 }
        );
      }

      // Validate it's actually valid base64
      try {
        Buffer.from(base64Data, "base64");
      } catch (error) {
        log.warn({ 
          contractId: contract.id,
          ipAddress 
        }, "Invalid base64 encoding in signature");
        return NextResponse.json(
          { message: "Invalid signature encoding" },
          { status: 400 }
        );
      }

      sanitizedSignatureUrl = signatureDataUrl;
    }

    // Sanitize full name (prevent XSS/injection)
    const sanitizedName = fullName
      .trim()
      .replace(/[<>]/g, "") // Remove angle brackets
      .replace(/javascript:/gi, "") // Remove javascript protocol
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .substring(0, 200); // Limit length

    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { message: "Invalid name provided" },
        { status: 400 }
      );
    }

    // Generate contract hash for integrity verification
    const contractHash = generateContractHash(contract.content);

    // Additional security: Verify contract hasn't been tampered with
    // (This would require storing original hash, but for now we generate at signing time)
    
    // Save signature with sanitized data
    await saveSignature(contract.id, contract.companyId, contract.clientId, {
      fullName: sanitizedName,
      signatureDataUrl: sanitizedSignatureUrl,
      ip: ipAddress, // Always use server-detected IP, not client-provided
      userAgent: (userAgent || "unknown").substring(0, 500), // Limit length
      contractHash,
    });

    // Update contract status to signed and mark token as used (one-time token)
    const updatedContract = await db.contracts.update(contract.id, {
      status: "signed",
      signedAt: new Date(),
      signingTokenUsedAt: new Date(), // Rotate token after first use
    });

    // Log audit event with security information
    await db.contractEvents.logEvent({
      contractId: contract.id,
      eventType: "signed",
      actorType: "client",
      actorId: contract.clientId,
      metadata: {
        fullName: sanitizedName,
        ip: ipAddress,
        userAgent: (userAgent || "unknown").substring(0, 200),
        hasSignatureImage: !!sanitizedSignatureUrl,
        tokenUsed: true,
        contractHash,
      },
    });

    // Security logging
    log.info({
      event: "contract_signed",
      contractId: contract.id,
      clientId: contract.clientId,
      ipAddress,
      hasSignature: !!sanitizedSignatureUrl,
    }, "Contract signed successfully");

    if (!updatedContract) {
      return NextResponse.json(
        { error: "Failed to update contract" },
        { status: 500 }
      );
    }

    // Get contractor and client for notifications
    const contractor = await db.contractors.findById(updatedContract.contractorId);
    const client = await db.clients.findById(updatedContract.clientId);

    // Send notification to contractor that contract was signed (check preferences)
    if (contractor && client) {
      try {
        const { subject, html } = getContractSignedEmail({
          contractTitle: updatedContract.title,
          contractorName: contractor.name,
          contractorEmail: contractor.email,
          contractorCompany: contractor.companyName,
          clientName: client.name,
          clientEmail: client.email,
          depositAmount: updatedContract.depositAmount,
          totalAmount: updatedContract.totalAmount,
        });

        await sendNotificationIfEnabled(
          contractor.id,
          "contractSigned",
          () => sendEmail({
            to: contractor.email,
            subject,
            html,
          })
        );
      } catch (emailError) {
        log.error({ error: emailError }, "Error sending contract signed notification to contractor");
        // Don't fail if email fails
      }
    }

    // If deposit is required, create Stripe Checkout session and send email
    let checkoutUrl: string | null = null;
    if (updatedContract.depositAmount > 0 && client && contractor) {
      try {
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
              paymentUrl: checkoutUrl || undefined,
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
      } catch (error: any) {
        log.error({ error: error.message }, "Error creating checkout session");
        // Don't fail the signing if checkout creation fails - user can still access payment page
      }
    }

    log.info({ 
      event: "contract_signed",
      contractId: updatedContract.id,
      clientId: updatedContract.clientId,
      hasSignatureImage: !!signatureDataUrl,
      depositRequired: updatedContract.depositAmount > 0,
    }, "Contract signed successfully");

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

