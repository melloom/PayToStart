import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { validateContentType } from "@/lib/security/api-security";
import { z } from "zod";

const notificationPreferencesSchema = z.object({
  contractSigned: z.boolean().optional(),
  contractPaid: z.boolean().optional(),
  contractSent: z.boolean().optional(),
  paymentReceived: z.boolean().optional(),
  invoiceUpcoming: z.boolean().optional(),
  subscriptionUpdates: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contractors")
      .select("notification_preferences")
      .eq("id", contractor.id)
      .single();

    if (error) {
      console.error("Error fetching notification preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: data.notification_preferences || {
        contractSigned: true,
        contractPaid: true,
        contractSent: true,
        paymentReceived: true,
        invoiceUpcoming: true,
        subscriptionUpdates: true,
        marketingEmails: false,
      },
    });
  } catch (error: any) {
    console.error("Error getting notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to get preferences" },
      { status: 500 }
    );
  }
}

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
    const validationResult = notificationPreferencesSchema.safeParse(body);

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

    const supabase = await createClient();
    
    // Get current preferences
    const { data: currentData } = await supabase
      .from("contractors")
      .select("notification_preferences")
      .eq("id", contractor.id)
      .single();

    // Merge with existing preferences
    const currentPreferences = currentData?.notification_preferences || {
      contractSigned: true,
      contractPaid: true,
      contractSent: true,
      paymentReceived: true,
      invoiceUpcoming: true,
      subscriptionUpdates: true,
      marketingEmails: false,
    };

    const updatedPreferences = {
      ...currentPreferences,
      ...validationResult.data,
    };

    const { error: updateError } = await supabase
      .from("contractors")
      .update({ notification_preferences: updatedPreferences })
      .eq("id", contractor.id);

    if (updateError) {
      console.error("Error updating notification preferences:", updateError);
      return NextResponse.json(
        { error: "Update failed", message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      preferences: updatedPreferences,
    });
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}

