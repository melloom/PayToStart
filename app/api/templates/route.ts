import { NextRequest, NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ContractTemplate } from "@/lib/types";
import { canPerformAction, incrementUsage } from "@/lib/subscriptions";
import { templateSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase-server";
import {
  checkAPIRateLimit,
  sanitizeInput,
  sanitizeHTML,
  validateContentType,
  createSecureErrorResponse,
  validateRequestSecurity,
  requireAuth,
} from "@/lib/security/api-security";
import { createSecureResponse } from "@/lib/security/middleware-helpers";

export async function GET(request: Request) {
  try {
    // Authentication check
    const authResult = await requireAuth();
    if (authResult.response) {
      return authResult.response;
    }

    const contractor = authResult.contractor;
    
    // Get contractType from query parameters
    const url = new URL(request.url);
    const contractType = url.searchParams.get("contractType") as "contract" | "proposal" | null;
    
    // Fetch templates with optional contract type filter
    const supabase = await createClient();
    let query = supabase
      .from("contract_templates")
      .select("*")
      .eq("contractor_id", contractor.id);
    
    // Filter by contract type if specified
    if (contractType) {
      query = query.eq("contract_type", contractType);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching templates:", error);
      return createSecureErrorResponse("Failed to fetch templates", 500, error);
    }
    
    // Map database rows to ContractTemplate format
    const templates = (data || []).map((row: any) => ({
      id: row.id,
      contractorId: row.contractor_id,
      companyId: row.company_id,
      name: row.name,
      content: row.content,
      fields: row.fields || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
    
    return createSecureResponse({ templates });
  } catch (error) {
    return createSecureErrorResponse("Failed to fetch templates", 500, error);
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
    const rateLimitResponse = checkAPIRateLimit(request, `templates:${contractor.id}`);
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
    const validationResult = templateSchema.safeParse(body);
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
    const sanitizedName = sanitizeInput(name);
    const sanitizedContent = await sanitizeHTML(content, true); // Allow basic formatting for contract content
    const sanitizedFields = (fields || []).map((field: any) => ({
      ...field,
      label: sanitizeInput(field.label || ""),
      placeholder: field.placeholder ? sanitizeInput(field.placeholder) : undefined,
    }));

    // Check tier limit for templates
    const canCreateTemplate = await canPerformAction(
      contractor.companyId,
      "templates",
      1
    );

    if (!canCreateTemplate.allowed) {
      return NextResponse.json(
        {
          error: "Tier limit exceeded",
          message: canCreateTemplate.reason || "Template creation limit reached",
          currentCount: canCreateTemplate.currentCount,
          limit: canCreateTemplate.limit,
        },
        { status: 403 }
      );
    }

    const template = await db.templates.create({
      companyId: contractor.companyId,
      contractorId: contractor.id,
      name: sanitizedName,
      content: sanitizedContent,
      fields: sanitizedFields,
    });

    // Increment usage counter for templates
    await incrementUsage(contractor.companyId, "templates").catch((error) => {
      console.error("Error incrementing usage counter:", error);
      // Don't fail the request if usage counter fails
    });

    return createSecureResponse({
      success: true,
      template,
    });
  } catch (error) {
    return createSecureErrorResponse("Failed to create template", 500, error);
  }
}

