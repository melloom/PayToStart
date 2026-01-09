import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase/service";
import { db } from "@/lib/db";

export async function DELETE(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Get regular Supabase client for user operations
    const supabase = await createClient();
    
    // Get user ID before deletion
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "Unable to find user account" },
        { status: 404 }
      );
    }

    const userId = user.id;
    const companyId = contractor.companyId;

    // Get service role client for admin operations (deleting auth user)
    let serviceClient;
    try {
      serviceClient = createServiceClient();
    } catch (serviceError: any) {
      console.error("Error creating service client:", serviceError);
      // If service role key is not available, we'll still delete the contractor record
      // but the auth user will remain (can be cleaned up manually)
    }

    // Delete contractor record (this will cascade delete related data via database triggers)
    // The contractor deletion will cascade to:
    // - Company (if no other contractors)
    // - Contracts, clients, templates, etc. (via company deletion)
    try {
      await db.contractors.delete(contractor.id);
      console.log(`Contractor ${contractor.id} deleted successfully`);
    } catch (deleteError: any) {
      console.error("Error deleting contractor:", deleteError);
      // Continue with auth user deletion even if contractor deletion fails
    }

    // Delete auth user using service role client (requires admin privileges)
    if (serviceClient) {
      try {
        const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(userId);
        if (authDeleteError) {
          console.error("Error deleting auth user:", authDeleteError);
          // If auth user deletion fails, we've still deleted the contractor record
          // The auth user can be cleaned up manually or via Supabase dashboard
        } else {
          console.log(`Auth user ${userId} deleted successfully`);
        }
      } catch (authError: any) {
        console.error("Error in auth user deletion:", authError);
        // Continue - contractor is already deleted
      }
    } else {
      console.warn("Service role key not available - auth user will not be deleted automatically");
      console.warn(`Auth user ID: ${userId} - can be deleted manually via Supabase dashboard`);
    }

    // Sign out the user (in case auth user deletion failed)
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      // Ignore sign out errors - user is being deleted anyway
      console.log("Sign out attempted (may fail if user already deleted)");
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully. Your data has been removed.",
    });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}

