#!/usr/bin/env node

/**
 * Check Contract Details
 * 
 * This script checks detailed information about a contract
 * to help diagnose why it's not accessible.
 */

try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found.');
}

async function main() {
  const token = process.argv[2] || 'bb11af763f0b601b1b75c08c8bba35653d2fbc4c39b88093e7c671d022380fc1';
  
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log(`\n🔍 Checking contract details for token: ${token.substring(0, 16)}...\n`);
  
  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("signing_token", token)
    .maybeSingle();
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  if (!contract) {
    console.log('❌ Contract not found');
    process.exit(1);
  }
  
  console.log('✅ Contract Found!\n');
  console.log('Contract Details:');
  console.log(`  ID: ${contract.id}`);
  console.log(`  Title: ${contract.title || 'Untitled'}`);
  console.log(`  Status: ${contract.status}`);
  console.log(`  Created: ${new Date(contract.created_at).toLocaleString()}`);
  console.log(`  Updated: ${new Date(contract.updated_at).toLocaleString()}`);
  console.log(`\nToken Details:`);
  console.log(`  Signing Token: ${contract.signing_token ? contract.signing_token.substring(0, 16) + '...' : 'NULL'}`);
  console.log(`  Token Hash: ${contract.signing_token_hash ? contract.signing_token_hash.substring(0, 16) + '...' : 'NULL'}`);
  console.log(`  Token Expires At: ${contract.signing_token_expires_at ? new Date(contract.signing_token_expires_at).toLocaleString() : 'NULL (never expires)'}`);
  console.log(`  Token Used At: ${contract.signing_token_used_at ? new Date(contract.signing_token_used_at).toLocaleString() : 'NULL (not used)'}`);
  console.log(`  Password Hash: ${contract.password_hash ? 'SET (password protected)' : 'NULL (no password)'}`);
  
  // Check expiry
  if (contract.signing_token_expires_at) {
    const expiresAt = new Date(contract.signing_token_expires_at);
    const now = new Date();
    if (now > expiresAt) {
      console.log(`\n⚠️  TOKEN IS EXPIRED!`);
      console.log(`  Expired: ${expiresAt.toLocaleString()}`);
      console.log(`  Current: ${now.toLocaleString()}`);
    } else {
      console.log(`\n✅ Token is valid (expires: ${expiresAt.toLocaleString()})`);
    }
  } else {
    console.log(`\n✅ Token has no expiry (valid forever)`);
  }
  
  // Check status
  const validStatuses = ['draft', 'ready', 'sent'];
  if (!validStatuses.includes(contract.status)) {
    console.log(`\n⚠️  Contract status is "${contract.status}" (not in valid signing statuses: ${validStatuses.join(', ')})`);
  } else {
    console.log(`\n✅ Contract status is valid for signing`);
  }
  
  // Check if used
  if (contract.signing_token_used_at) {
    console.log(`\n⚠️  Token has already been used`);
    if (['signed', 'paid', 'completed'].includes(contract.status)) {
      console.log(`  But contract is ${contract.status}, so viewing should be allowed`);
    } else {
      console.log(`  And contract is ${contract.status}, so signing is blocked`);
    }
  } else {
    console.log(`\n✅ Token has not been used yet`);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
});
