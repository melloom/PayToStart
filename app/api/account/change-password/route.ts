import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { validateContentType } from "@/lib/security/api-security";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
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
    const validationResult = changePasswordSchema.safeParse(body);

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

    const { currentPassword, newPassword } = validationResult.data;

    // Verify current password by attempting to sign in
    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: contractor.email,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: "Invalid password", message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { error: "Password update failed", message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}

