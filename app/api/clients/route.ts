import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientCreateSchema } from "@/lib/validations";
import {
  checkAPIRateLimit,
  sanitizeInput,
  sanitizeEmail,
  validateContentType,
  createSecureErrorResponse,
  validateRequestSecurity,
  requireAuth,
  validateUUID,
} from "@/lib/security/api-security";
import { sanitizePhoneNumber } from "@/lib/security/validation";
import { createSecureResponse } from "@/lib/security/middleware-helpers";

export async function GET(request: Request) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;
    const clients = await db.clients.findByCompanyId(contractor.companyId);
    
    return createSecureResponse({ clients });
  } catch (error) {
    return createSecureErrorResponse("Failed to fetch clients", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(request, `clients:${contractor.id}`);
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
      return NextResponse.json(
        { error: "Invalid input", message: "Request contains potentially dangerous content" },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validationResult = clientCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Please check your input and try again",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone } = validationResult.data;

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Invalid email", message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const sanitizedPhone = phone ? sanitizePhoneNumber(phone) : null;

    // Check if client with same email already exists
    const existingClient = await db.clients.findByEmail(sanitizedEmail, contractor.companyId);
    if (existingClient) {
      return NextResponse.json(
        { error: "Client already exists", message: "A client with this email already exists" },
        { status: 400 }
      );
    }

    // Create the client
    const client = await db.clients.create({
      companyId: contractor.companyId,
      email: sanitizedEmail,
      name: sanitizedName,
      phone: sanitizedPhone || undefined,
    });

    return createSecureResponse({ client }, 201);
  } catch (error) {
    return createSecureErrorResponse("Failed to create client", 500, error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(request, `clients:delete:${contractor.id}`);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("id");

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    if (!validateUUID(clientId)) {
      return NextResponse.json(
        { error: "Invalid client ID format" },
        { status: 400 }
      );
    }

    // Verify the client belongs to the contractor's company
    const client = await db.clients.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    if (client.companyId !== contractor.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the client
    await db.clients.delete(clientId);

    return createSecureResponse({ success: true });
  } catch (error) {
    return createSecureErrorResponse("Failed to delete client", 500, error);
  }
}

