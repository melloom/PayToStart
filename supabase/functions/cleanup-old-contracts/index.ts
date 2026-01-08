// Supabase Edge Function: Cleanup old draft contracts
// Deploy: supabase functions deploy cleanup-old-contracts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get date 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Find old draft/cancelled contracts
    const { data: oldContracts, error } = await supabase
      .from("contracts")
      .select("id, company_id, status")
      .in("status", ["draft", "cancelled"])
      .lt("created_at", ninetyDaysAgo.toISOString())
      .limit(100); // Process in batches

    if (error) {
      throw error;
    }

    if (!oldContracts || oldContracts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No old contracts to clean up", count: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Delete old contracts (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("contracts")
      .delete()
      .in(
        "id",
        oldContracts.map((c) => c.id)
      );

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cleanup completed",
        deleted: oldContracts.length,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

