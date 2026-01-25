import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { sanitizeInput, validateContentType } from "@/lib/security/api-security";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(200).optional(),
});

export async function PATCH(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate content type
    const contentTypeResponse = validateContentType(request);
    if (contentTypeResponse) {
      return contentTypeResponse;
    }

    const body = await request.json();
    const validationResult = updateCompanySchema.safeParse(body);

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

    const { name } = validationResult.data;

    // If no fields to update
    if (!name) {
      return NextResponse.json(
        { error: "No updates", message: "No fields provided to update" },
        { status: 400 }
      );
    }

    // Update company name
    const sanitizedName = sanitizeInput(name);
    if (!sanitizedName || sanitizedName.trim().length < 2) {
      return NextResponse.json(
        { error: "Invalid name", message: "Company name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const updatedCompany = await db.companies.update(contractor.companyId, {
      name: sanitizedName,
    });

    if (!updatedCompany) {
      return NextResponse.json(
        { error: "Update failed", message: "Failed to update company information" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company information updated successfully",
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
      },
    });
  } catch (error: any) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to update company" },
      { status: 500 }
    );
  }
}

