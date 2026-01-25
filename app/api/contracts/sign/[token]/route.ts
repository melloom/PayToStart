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
  // Try to find contract by raw token first (for contracts created before SIGNING_TOKEN_SECRET was set)
  // This ensures backwards compatibility
  console.log('[verifySigningToken] Starting lookup for token:', token.substring(0, 20) + '...');
  let contract: any = null;
  try {
    contract = await db.contracts.findBySigningToken(token);
    console.log('[verifySigningToken] Raw token lookup result:', {
      found: !!contract,
      contractId: contract?.id,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20),
    });
  } catch (error: any) {
    console.error('[verifySigningToken] Error in findBySigningToken:', error);
    log.warn({ ipAddress, error: error.message }, "Error in findBySigningToken");
  }
  
  let foundByRawToken = !!contract;
  
  log.info({
    ipAddress,
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 16),
    foundByRawToken,
    contractId: contract?.id,
  }, "Token lookup attempt - raw token");

  // If not found by raw token, try hash lookup (for newer contracts with secure tokens)
  if (!contract) {
    try {
      const tokenHash = hashToken(token);
      contract = await db.contracts.findBySigningTokenHash(tokenHash);
      
      log.info({
        ipAddress,
        tokenHashPrefix: tokenHash.substring(0, 16),
        foundByHash: !!contract,
        contractId: contract?.id,
      }, "Token lookup attempt - hash");
      
      // If found by hash, verify it matches
      if (contract && contract.signingTokenHash && !verifyToken(token, contract.signingTokenHash)) {
        // This is a security threat - invalid token for existing contract
        // Apply rate limiting here
        const rateLimitConfig = getRateLimitConfig();
        const recentAttempts = await db.signingAttempts.getRecentAttempts(
          ipAddress,
          rateLimitConfig.windowMinutes
        );

        if (recentAttempts >= rateLimitConfig.maxAttempts) {
          await db.signingAttempts.recordAttempt({
            ipAddress,
            contractId: contract.id,
            success: false,
          });
          return {
            contract: null,
            error: "Too many attempts. Please try again later.",
          };
        }
        
        await db.signingAttempts.recordAttempt({
          ipAddress,
          contractId: contract.id,
          success: false,
        });
        log.warn({
          contractId: contract.id,
          ipAddress,
        }, "Token hash verification failed");
        return {
          contract: null,
          error: "Invalid token",
        };
      }
    } catch (error: any) {
      log.warn({ ipAddress, error: error.message }, "Error in findBySigningTokenHash");
    }
  }

  // Contract not found - don't count this as a security threat (could be invalid link)
  // Only log for debugging, don't rate limit
  if (!contract) {
    // Try one more time with URL-decoded token in case it was double-encoded
    let decodedToken = token;
    try {
      decodedToken = decodeURIComponent(token);
      if (decodedToken !== token) {
        log.info({ ipAddress }, "Trying URL-decoded token");
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
        ipAddress,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 16),
        tokenFormat: /^[a-f0-9]+$/i.test(token) ? "hex" : "other",
      }, "Contract not found for token after all lookup attempts");
      return {
        contract: null,
        error: "Contract not found. This contract link is invalid or has expired. Please request a new signing link.",
      };
    }
  }

  // Rate limiting check - only for actual security threats (invalid tokens for existing contracts)
  // Check rate limit only if we have an existing contract with potential security issues
  const rateLimitConfig = getRateLimitConfig();
  const recentAttempts = await db.signingAttempts.getRecentAttempts(
    ipAddress,
    rateLimitConfig.windowMinutes
  );

  if (recentAttempts >= rateLimitConfig.maxAttempts) {
    await db.signingAttempts.recordAttempt({
      ipAddress,
      contractId: contract.id,
      success: false,
    });
    return {
      contract: null,
      error: "Too many attempts. Please try again later.",
    };
  }

  // If we found by raw token, skip hash verification (backwards compatibility)
  // This allows contracts created before SIGNING_TOKEN_SECRET was set to still work

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
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const ipAddress = getClientIP(request);
    
    // Handle Next.js 14+ where params might be a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const tokenParam = resolvedParams.token;
    
    console.log('[GET] Received params:', {
      tokenParam: tokenParam?.substring(0, 20) + '...',
      tokenType: typeof tokenParam,
      tokenLength: tokenParam?.length,
      paramsType: typeof params,
      isPromise: params instanceof Promise
    });
    
    // Validate token exists and is a string
    if (!tokenParam || typeof tokenParam !== "string") {
      console.error('[GET] Missing or invalid token param');
      log.warn({ 
        ipAddress,
        tokenLength: tokenParam?.length,
        tokenType: typeof tokenParam,
        paramsType: typeof params
      }, "Missing token in signing request");
      return NextResponse.json(
        { message: "Invalid link - missing contract token" },
        { status: 400 }
      );
    }

    // Use the token directly - Next.js handles URL encoding
    const token = tokenParam;
    
    console.log('[GET] Processing signing request with token:', token.substring(0, 20) + '...');
    log.info({
      ipAddress,
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 16),
    }, "Processing signing request");

    const { contract, error } = await verifySigningToken(token, ipAddress);
    
    console.log('[GET] verifySigningToken result:', {
      hasContract: !!contract,
      contractId: contract?.id,
      error: error
    });

    if (!contract || error) {
      // Return specific error message to help with debugging
      return NextResponse.json(
        { message: error || "Invalid or expired signing link" },
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
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  let contract: any = null; // Declare at function scope for error handling
  try {
    const ipAddress = getClientIP(request);
    
    // Handle Next.js 14+ where params might be a Promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const token = resolvedParams.token;
    
    // Validate token exists and is a string
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Invalid link" },
        { status: 400 }
      );
    }
    
    // Verify token with rate limiting
    const tokenResult = await verifySigningToken(token, ipAddress);
    contract = tokenResult.contract;
    const error = tokenResult.error;

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
    try {
      console.log("[SIGN] Attempting to save signature for contract:", contract.id);
      await saveSignature(contract.id, contract.companyId, contract.clientId, {
        fullName: sanitizedName,
        signatureDataUrl: sanitizedSignatureUrl,
        ip: ipAddress, // Always use server-detected IP, not client-provided
        userAgent: (userAgent || "unknown").substring(0, 500), // Limit length
        contractHash,
      });
      console.log("[SIGN] Signature saved successfully");
    } catch (signatureError: any) {
      console.error("[SIGN] Error saving signature:", {
        contractId: contract.id,
        error: signatureError.message,
        stack: signatureError.stack 
      });
      log.error({ 
        contractId: contract.id,
        error: signatureError.message,
        stack: signatureError.stack 
      }, "Error saving signature");
      
      // If signature saving fails, we should still allow the contract to be signed
      // but log the error. The signature can be optional.
      // However, if it's a critical error, we should fail the request
      if (signatureError.message?.includes("Failed to save signature")) {
        return NextResponse.json(
          { 
            message: "Failed to save signature. Please try again without the signature image, or contact support if the problem persists.",
            error: signatureError.message 
          },
          { status: 500 }
        );
      }
      // Re-throw other errors to be caught by outer catch
      throw signatureError;
    }

    // Update contract status to signed and mark token as used (one-time token)
    let updatedContract: any;
    try {
      console.log("[SIGN] Attempting to update contract status:", contract.id);
      const now = new Date();
      // Use service role to bypass RLS (signing is via public token, not authenticated user)
      updatedContract = await db.contracts.update(contract.id, {
        status: "signed",
        signedAt: now,
        signingTokenUsedAt: now, // REQUIRED: Mark token as used (one-time use)
      }, true); // true = use service role
      console.log("[SIGN] Contract updated successfully with token marked as used");
      
      if (!updatedContract) {
        console.error("[SIGN] Contract update returned null for contract:", contract.id);
        return NextResponse.json(
          { message: "Failed to update contract status" },
          { status: 500 }
        );
      }
      console.log("[SIGN] Contract updated successfully");
    } catch (updateError: any) {
      console.error("[SIGN] Error updating contract status:", {
        contractId: contract.id,
        error: updateError.message,
        stack: updateError.stack,
        name: updateError.name,
      });
      return NextResponse.json(
        { 
          message: "Failed to update contract status",
          error: updateError.message 
        },
        { status: 500 }
      );
    }

    // Log audit event with security information (don't fail if this fails)
    try {
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
    } catch (eventError: any) {
      log.warn({ 
        contractId: contract.id,
        error: eventError.message 
      }, "Failed to log contract event (non-critical)");
      // Continue - event logging failure shouldn't block signing
    }

    // If deposit is required, create Stripe Checkout session (do this quickly before response)
    let checkoutUrl: string | null = null;
    if (updatedContract.depositAmount > 0) {
      try {
        // Get client email quickly for checkout
        const client = await db.clients.findById(updatedContract.clientId).catch(() => null);
        if (client) {
          const checkoutSession = await createDepositCheckoutSession(
            updatedContract,
            client.email,
            token
          );
          checkoutUrl = checkoutSession.url;
        }
      } catch (error: any) {
        console.error("[SIGN] Error creating checkout session:", error.message);
        // Don't fail the signing if checkout creation fails - user can still access payment page
      }
    }

    // Return response IMMEDIATELY - don't wait for emails/logging
    const response = NextResponse.json({
      success: true,
      contract: updatedContract,
      checkoutUrl,
    });

    // Do non-critical operations asynchronously after response is sent
    // This doesn't block the redirect
    (async () => {
      try {
        // Get contractor and client for notifications
        const contractor = await db.contractors.findById(updatedContract.contractorId).catch(() => null);
        const client = await db.clients.findById(updatedContract.clientId).catch(() => null);

        // Send notification to contractor that contract was signed
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
            console.error("[SIGN] Error sending contractor notification:", emailError);
          }
        }

        // Send "Signed but unpaid" email to client (if deposit required)
        if (updatedContract.depositAmount > 0 && client && contractor) {
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
            console.error("[SIGN] Error sending client email:", emailError);
          }
        }
      } catch (error) {
        console.error("[SIGN] Error in async notification tasks:", error);
      }
    })();

    return response;
  } catch (error: any) {
    console.error("[SIGN] Error signing contract:", {
      error: error.message, 
      stack: error.stack,
      name: error.name,
      contractId: contract?.id,
    });
    
    // Provide more specific error messages
    let errorMessage = "Internal server error";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.name === "TypeError") {
      errorMessage = "Invalid data format. Please try again.";
    } else if (error.name === "DatabaseError") {
      errorMessage = "Database error. Please try again or contact support.";
    }
    
    return NextResponse.json(
      { 
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

