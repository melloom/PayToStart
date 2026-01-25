#!/usr/bin/env node

/**
 * Clear Rate Limit for Signing Attempts
 * 
 * This script clears rate limit attempts for a specific IP address
 * or all attempts older than the rate limit window.
 * 
 * Usage:
 *   node scripts/clear-rate-limit.js [ip-address]
 *   node scripts/clear-rate-limit.js --all
 * 
 * Options:
 *   [ip-address]  - Clear attempts for specific IP
 *   --all         - Clear ALL attempts (use with caution)
 *   (no args)     - Clear attempts older than 15 minutes
 */

try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found.');
}

async function main() {
  // Import Supabase client directly
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const arg = process.argv[2];
  
  if (arg === '--all') {
    console.log('⚠️  Clearing ALL rate limit attempts...');
    // First get count
    const { count: totalCount } = await supabase
      .from("signing_attempts")
      .select('*', { count: 'exact', head: true });
    
    // Delete all (Supabase allows delete without where clause in service role)
    const { error } = await supabase
      .from("signing_attempts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // This matches all rows
    
    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    
    console.log(`✅ Cleared ${totalCount || 0} rate limit attempts`);
  } else if (arg && arg !== '--all') {
    // Treat as IP address
    const ipAddress = arg;
    console.log(`Clearing rate limit attempts for IP: ${ipAddress}`);
    const { error, count } = await supabase
      .from("signing_attempts")
      .delete()
      .eq("ip_address", ipAddress)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    
    console.log(`✅ Cleared ${count || 0} rate limit attempts for IP address`);
  } else {
    console.log('Clearing old rate limit attempts (older than 15 minutes)...');
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - 15);
    
    const { error, count } = await supabase
      .from("signing_attempts")
      .delete()
      .lt("attempted_at", cutoffDate.toISOString())
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    
    console.log(`✅ Cleared ${count || 0} old rate limit attempts`);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
});
