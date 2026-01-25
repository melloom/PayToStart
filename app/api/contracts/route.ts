import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateToken, hashToken, getTokenExpiry } from "@/lib/security/tokens";
import { sendEmail } from "@/lib/email";
import { getContractLinkEmail } from "@/lib/email/templates";
import { canPerformAction, incrementUsage } from "@/lib/subscriptions";
import { contractCreateSchema } from "@/lib/validations";
import { log } from "@/lib/logger";
import {
  checkAPIRateLimit,
  sanitizeInput,
  sanitizeEmail,
  sanitizeHTML,
  validateContentType,
  createSecureErrorResponse,
  validateRequestSecurity,
  requireAuth,
  validateUUID,
} from "@/lib/security/api-security";
import { sanitizePhoneNumber } from "@/lib/security/validation";
import { createSecureResponse } from "@/lib/security/middleware-helpers";

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(request, `contracts:${contractor.id}`);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate content type
    const contentTypeResponse = validateContentType(request);
    if (contentTypeResponse) {
      return contentTypeResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Check for injection attacks
    const securityCheck = validateRequestSecurity(body);
    if (!securityCheck.valid) {
      log.warn({ errors: securityCheck.errors }, "Potential injection attack detected in contract creation");
      return NextResponse.json(
        { error: "Invalid input", message: "Request contains potentially dangerous content" },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validationResult = contractCreateSchema.safeParse(body);
    if (!validationResult.success) {
      log.warn({ errors: validationResult.error.errors }, "Contract creation validation failed");
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Please check your input and try again",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validate UUID if clientId is provided
    if (data.clientId && !validateUUID(data.clientId)) {
      return NextResponse.json(
        { error: "Invalid client ID format" },
        { status: 400 }
      );
    }

    // Validate UUID if templateId is provided
    if (data.templateId && !validateUUID(data.templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID format" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(data.clientEmail);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid email", message: "Please provide a valid client email address" },
        { status: 400 }
      );
    }

    // Sanitize text inputs
    const clientName = sanitizeInput(data.clientName);
    const title = sanitizeInput(data.title);
    const clientPhone = data.clientPhone ? sanitizePhoneNumber(data.clientPhone) : null;
    
    // Sanitize HTML content
    const content = await sanitizeHTML(data.content, true); // Allow basic formatting for contract content
    const { depositAmount, totalAmount } = data;

    // Check tier limit for contracts
    const canCreateContract = await canPerformAction(
      contractor.companyId,
      "contracts",
      1
    );

    if (!canCreateContract.allowed) {
      return NextResponse.json(
        {
          error: "Tier limit exceeded",
          message: canCreateContract.reason || "Contract creation limit reached",
          currentCount: canCreateContract.currentCount,
          limit: canCreateContract.limit,
        },
        { status: 403 }
      );
    }

    // Find or create client within the same company
    let client = await db.clients.findByEmail(sanitizedEmail, contractor.companyId);
    if (!client) {
      client = await db.clients.create({
        companyId: contractor.companyId,
        email: sanitizedEmail,
        name: clientName,
        phone: clientPhone || undefined,
      });
    }

    // Generate secure signing token (32+ bytes)
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const tokenExpiry = getTokenExpiry(7); // 7 days expiry

    // Create contract with hashed token
    const contract = await db.contracts.create({
      contractorId: contractor.id,
      clientId: client.id,
      companyId: contractor.companyId,
      templateId: "", // No template for now
      status: "sent",
      title,
      content,
      fieldValues: {},
      depositAmount: Number(depositAmount) || 0,
      totalAmount: Number(totalAmount) || 0,
      signingToken: rawToken, // Keep for backwards compatibility during migration
      signingTokenHash: tokenHash,
      signingTokenExpiresAt: tokenExpiry,
    });

    // Log audit event
    await db.contractEvents.logEvent({
      contractId: contract.id,
      eventType: "created",
      actorType: "contractor",
        actorId: contractor.id,
        metadata: {
          title,
          clientEmail: sanitizedEmail,
          depositAmount: Number(depositAmount) || 0,
          totalAmount: Number(totalAmount) || 0,
        },
      });

    await db.contractEvents.logEvent({
      contractId: contract.id,
      eventType: "sent",
      actorType: "contractor",
      actorId: contractor.id,
    });

    // Increment usage counter for contracts
    await incrementUsage(contractor.companyId, "contracts").catch((error) => {
      log.error({ error }, "Error incrementing usage counter");
      // Don't fail the request if usage counter fails
    });

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${rawToken}`;

    // Send contract link email to client
    try {
      const { subject, html } = getContractLinkEmail({
        contractTitle: contract.title,
        contractorName: contractor.name,
        contractorEmail: contractor.email,
        contractorCompany: contractor.companyName,
        clientName: client.name,
        clientEmail: client.email,
        signingUrl,
        depositAmount: contract.depositAmount,
        totalAmount: contract.totalAmount,
      });

      await sendEmail({
        to: client.email,
        subject,
        html,
      });
    } catch (emailError) {
      log.error({ error: emailError }, "Error sending contract email");
      // Don't fail contract creation if email fails
    }

    log.info({ 
      event: "contract_created",
      contractId: contract.id,
      contractorId: contractor.id,
      clientEmail: sanitizedEmail,
      title,
      totalAmount,
      depositAmount,
    }, "Contract created successfully");

    return createSecureResponse({
      success: true,
      contract,
      signingUrl,
    });
  } catch (error) {
    return createSecureErrorResponse("Contract creation failed", 500, error);
  }
}
