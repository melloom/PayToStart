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
    return { error: error.message };
  }

  return { user: data.user };
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
      data: metadata,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { user: data.user };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
