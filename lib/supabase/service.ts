// Service role client for admin operations (audit logging, etc.)
// This bypasses RLS and should only be used in secure server-side contexts

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let serviceClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createServiceClient() {
  if (serviceClient) {
    return serviceClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  serviceClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}

