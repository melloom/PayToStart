import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase-server";
import { sanitizeInput, sanitizeEmail, validateContentType } from "@/lib/security/api-security";
import { z } from "zod";

const updateAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200).optional(),
  email: z.string().email("Invalid email address").max(254).optional(),
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
    const validationResult = updateAccountSchema.safeParse(body);

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

    const { name, email } = validationResult.data;

    // If no fields to update
    if (!name && !email) {
      return NextResponse.json(
        { error: "No updates", message: "No fields provided to update" },
        { status: 400 }
      );
    }

    const updates: { name?: string; email?: string } = {};

    // Update name if provided
    if (name) {
      const sanitizedName = sanitizeInput(name);
      if (!sanitizedName || sanitizedName.trim().length < 2) {
        return NextResponse.json(
          { error: "Invalid name", message: "Name must be at least 2 characters" },
          { status: 400 }
        );
      }
      updates.name = sanitizedName;
    }

    // Update email if provided
    if (email) {
      const sanitizedEmail = sanitizeEmail(email);
      if (!sanitizedEmail) {
        return NextResponse.json(
          { error: "Invalid email", message: "Please provide a valid email address" },
          { status: 400 }
        );
      }
      updates.email = sanitizedEmail;

      // Update email in Supabase Auth
      const supabase = await createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        email: sanitizedEmail,
      });

      if (updateError) {
        console.error("Error updating email in Supabase:", updateError);
        return NextResponse.json(
          { error: "Email update failed", message: updateError.message },
          { status: 500 }
        );
      }
    }

    // Update contractor record
    const updatedContractor = await db.contractors.update(contractor.id, updates);

    if (!updatedContractor) {
      return NextResponse.json(
        { error: "Update failed", message: "Failed to update account information" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account updated successfully",
      contractor: {
        id: updatedContractor.id,
        name: updatedContractor.name,
        email: updatedContractor.email,
      },
    });
  } catch (error: any) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to update account" },
      { status: 500 }
    );
  }
}

