import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { templateSchema } from "@/lib/validations";
import {
  checkAPIRateLimit,
  sanitizeInput,
  sanitizeHTML,
  validateContentType,
  createSecureErrorResponse,
  validateRequestSecurity,
  requireAuth,
  validateUUID,
} from "@/lib/security/api-security";
import { createSecureResponse } from "@/lib/security/middleware-helpers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;

    // Validate UUID format
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: "Invalid template ID format" },
        { status: 400 }
      );
    }

    const template = await db.templates.findById(params.id);
    if (!template || template.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    return createSecureResponse({ template });
  } catch (error) {
    return createSecureErrorResponse("Failed to fetch template", 500, error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;

    // Validate UUID format
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: "Invalid template ID format" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(request, `templates:update:${contractor.id}`);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate content type
    const contentTypeResponse = validateContentType(request);
    if (contentTypeResponse) {
      return contentTypeResponse;
    }

    const template = await db.templates.findById(params.id);
    if (!template || template.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    // Parse and validate request body
    const data = await request.json();

    // Check for injection attacks
    const securityCheck = validateRequestSecurity(data);
    if (!securityCheck.valid) {
      return NextResponse.json(
        { error: "Invalid input", message: "Request contains potentially dangerous content" },
        { status: 400 }
      );
    }

    // Validate with Zod schema
    const validationResult = templateSchema.safeParse(data);
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

    const { name, content, fields } = validationResult.data;

    // Sanitize inputs
    const updateData: any = {};
    if (name !== undefined) updateData.name = sanitizeInput(name);
    if (content !== undefined) updateData.content = await sanitizeHTML(content, true);
    if (fields !== undefined) {
      updateData.fields = (fields || []).map((field: any) => ({
        ...field,
        label: sanitizeInput(field.label || ""),
        placeholder: field.placeholder ? sanitizeInput(field.placeholder) : undefined,
      }));
    }

    const updatedTemplate = await db.templates.update(params.id, updateData);

    return createSecureResponse({
      success: true,
      template: updatedTemplate,
    });
  } catch (error) {
    return createSecureErrorResponse("Failed to update template", 500, error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;

    // Validate UUID format
    if (!validateUUID(params.id)) {
      return NextResponse.json(
        { error: "Invalid template ID format" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(request, `templates:delete:${contractor.id}`);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const template = await db.templates.findById(params.id);
    if (!template || template.contractorId !== contractor.id) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 });
    }

    await db.templates.delete(params.id);

    return createSecureResponse({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    return createSecureErrorResponse("Failed to delete template", 500, error);
  }
}

