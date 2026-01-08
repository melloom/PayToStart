// Supabase-based authentication
import { createClient } from "./supabase-server";
import { db } from "./db";
import type { Contractor } from "./types";

export async function getCurrentContractor(): Promise<Contractor | null> {
  try {
    return await db.contractors.getCurrent();
  } catch (error) {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Handle specific error cases
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Invalid email or password" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Please verify your email address before signing in" };
    }
    return { error: error.message };
  }

  // Verify user exists and has confirmed email (if email confirmation is enabled)
  if (data.user && !data.user.email_confirmed_at) {
    // Still allow login if email confirmation is not strictly required
    // But log a warning
    console.warn("User logged in without confirmed email:", email);
  }

  return { user: data.user, session: data.session };
}

export async function signInWithMagicLink(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signUp(email: string, password: string, metadata?: { name?: string; company_name?: string }) {
  const supabase = await createClient();

  // Ensure we have a valid redirect URL
  const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const emailRedirectTo = `${redirectUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        name: metadata?.name || "",
        company_name: metadata?.company_name || "My Company",
      },
    },
  });

  if (error) {
    console.error("Supabase signUp error:", {
      message: error.message,
      status: error.status,
      name: error.name,
      fullError: error,
    });
    
    // Check if it's a database trigger error
    if (error.message.includes("trigger") || 
        error.message.includes("Database error") ||
        error.message.includes("new row for relation") ||
        error.message.includes("violates") ||
        error.message.includes("constraint")) {
      console.error("Database trigger error detected. This usually means:");
      console.error("1. The database trigger function might have an error");
      console.error("2. Required columns might be missing from the companies table");
      console.error("3. RLS policies might be blocking the insert");
      return { error: `Database error: ${error.message}` };
    }
    
    return { error: error.message };
  }

  // Check if user was created but trigger failed
  // Wait a moment for trigger to complete, then check if company exists
  if (data.user) {
    try {
      // Small delay to allow trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to verify the company was created by checking the contractor
      const { data: contractorData, error: contractorError } = await supabase
        .from("contractors")
        .select("id, company_id")
        .eq("id", data.user.id)
        .single();
      
      if (contractorError || !contractorData) {
        console.error("Contractor not found after signup:", contractorError);
        return { error: "Database error saving new user" };
      }
    } catch (err) {
      console.error("Error verifying contractor creation:", err);
      // Don't fail signup if verification fails, but log it
    }
  }

  // Note: In Supabase, when email confirmation is enabled, data.user might be null
  // The user will need to confirm their email before accessing the app
  return { user: data.user, needsEmailConfirmation: !data.user?.email_confirmed_at };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
