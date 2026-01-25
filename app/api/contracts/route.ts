import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateToken, hashToken, getTokenExpiry, hashPassword } from "@/lib/security/tokens";
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
    // Skip 'content' and 'fieldValues' fields validation as they can legitimately contain SQL keywords
    // and will be sanitized separately
    const securityCheck = validateRequestSecurity(body, ['content', 'fieldValues', 'paymentTerms']);
    if (!securityCheck.valid) {
      log.warn({ 
        errors: securityCheck.errors,
        bodyKeys: Object.keys(body),
        title: body.title?.substring(0, 50),
        clientName: body.clientName?.substring(0, 50),
      }, "Potential injection attack detected in contract creation");
      return NextResponse.json(
        { 
          error: "Invalid input", 
          message: "Request contains potentially dangerous content",
          details: securityCheck.errors 
        },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validationResult = contractCreateSchema.safeParse(body);
    if (!validationResult.success) {
      log.warn({ 
        errors: validationResult.error.errors,
        bodyKeys: Object.keys(body),
        hasTitle: !!body.title,
        hasContent: !!body.content,
        hasClientEmail: !!body.clientEmail,
        hasClientName: !!body.clientName,
      }, "Contract creation validation failed");
      
      // Provide more helpful error messages
      const errorMessages = validationResult.error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });
      
      return NextResponse.json(
        {
          error: "Validation failed",
          message: errorMessages.length > 0 
            ? errorMessages[0] 
            : "Please check your input and try again",
          errors: validationResult.error.errors,
          details: errorMessages,
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

    // Sanitize inputs - handle missing client info for development
    let sanitizedEmail = data.clientEmail ? sanitizeEmail(data.clientEmail) : null;
    let clientName = data.clientName ? sanitizeInput(data.clientName) : null;
    
    // If no client info provided, create a placeholder for development
    if (!sanitizedEmail || !clientName) {
      // Create a placeholder client for development/testing
      const placeholderEmail = `dev-client-${contractor.id.slice(0, 8)}-${Date.now()}@example.com`;
      sanitizedEmail = placeholderEmail;
      clientName = "Development Client";
      log.info({ contractorId: contractor.id }, "Creating contract with placeholder client for development");
    }

    // Sanitize text inputs
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
    // If no client info provided, create a placeholder client for development
    if (!sanitizedEmail || !clientName) {
      // For development: create a placeholder client if none provided
      const placeholderEmail = sanitizedEmail || `placeholder-${Date.now()}@example.com`;
      const placeholderName = clientName || "Development Client";
      
      let client = await db.clients.findByEmail(placeholderEmail, contractor.companyId);
      if (!client) {
        client = await db.clients.create({
          companyId: contractor.companyId,
          email: placeholderEmail,
          name: placeholderName,
          phone: clientPhone || undefined,
        });
      }
      // Update the client reference
      const clientRef = client;
      client = clientRef;
    } else {
      let client = await db.clients.findByEmail(sanitizedEmail, contractor.companyId);
      if (!client) {
        client = await db.clients.create({
          companyId: contractor.companyId,
          email: sanitizedEmail,
          name: clientName,
          phone: clientPhone || undefined,
        });
      }
    }
    
    // Ensure we have a client
    let client = await db.clients.findByEmail(sanitizedEmail || `placeholder-${Date.now()}@example.com`, contractor.companyId);
    if (!client && sanitizedEmail && clientName) {
      client = await db.clients.create({
        companyId: contractor.companyId,
        email: sanitizedEmail,
        name: clientName,
        phone: clientPhone || undefined,
      });
    } else if (!client) {
      // Create placeholder client for development
      const placeholderEmail = `dev-client-${contractor.id.slice(0, 8)}@example.com`;
      client = await db.clients.findByEmail(placeholderEmail, contractor.companyId);
      if (!client) {
        client = await db.clients.create({
          companyId: contractor.companyId,
          email: placeholderEmail,
          name: "Development Client",
          phone: undefined,
        });
      }
    }

    // Generate secure signing token (32+ bytes)
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const tokenExpiry = getTokenExpiry(7); // 7 days expiry

    // Store payment terms, compensation info, payment schedule, contract type, and branding in fieldValues for easy access
    const fieldValues: Record<string, any> = {
      ...(data.fieldValues || {}),
      ...(data.paymentTerms ? { paymentTerms: data.paymentTerms } : {}),
      ...(data.compensationType ? { compensationType: data.compensationType } : {}),
      ...(data.hasCompensation !== undefined ? { hasCompensation: data.hasCompensation } : {}),
      // Store contract type (contract or proposal)
      ...(body.contractType ? { contractType: body.contractType } : {}),
      // Store payment schedule information if available
      ...(data.paymentSchedule ? { paymentSchedule: data.paymentSchedule } : {}),
      ...(data.paymentScheduleConfig ? { paymentScheduleConfig: data.paymentScheduleConfig } : {}),
      // Store branding/styling settings for PDF generation (from body, not validated data)
      ...((body as any).branding ? { _branding: (body as any).branding } : {}),
    };

    // Hash password if provided
    let passwordHash: string | undefined = undefined;
    if (body.password && typeof body.password === "string" && body.password.trim()) {
      if (body.password.length < 4) {
        return NextResponse.json(
          { message: "Password must be at least 4 characters" },
          { status: 400 }
        );
      }
      passwordHash = hashPassword(body.password.trim());
    }

    // Create contract with hashed token - set as "ready" since all steps are complete
    // "draft" is for incomplete contracts, "ready" means complete and ready to send
    const contract = await db.contracts.create({
      contractorId: contractor.id,
      clientId: client.id,
      companyId: contractor.companyId,
      templateId: "", // No template for now
      status: "ready", // Contract is complete and ready to send
      title,
      content,
      fieldValues,
      depositAmount: Number(depositAmount) || 0,
      totalAmount: Number(totalAmount) || 0,
      signingToken: rawToken, // Keep for backwards compatibility during migration
      signingTokenHash: tokenHash,
      signingTokenExpiresAt: tokenExpiry,
      passwordHash: passwordHash, // Store password hash if provided
    });

    // Log audit event - only log creation, not sent (since it's a draft)
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

    // Increment usage counter for contracts
    await incrementUsage(contractor.companyId, "contracts").catch((error) => {
      log.error({ error }, "Error incrementing usage counter");
      // Don't fail the request if usage counter fails
    });

    const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sign/${rawToken}`;

    // Don't send email automatically - contract is created as draft
    // User can send it later from the contract detail page

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
