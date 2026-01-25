#!/usr/bin/env node

/**
 * Check Contract Token
 * 
 * This script checks if a contract exists for a given token
 * and helps diagnose token lookup issues.
 * 
 * Usage:
 *   node scripts/check-contract-token.js <token>
 */

try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found.');
}

async function main() {
  const token = process.argv[2];
  
  if (!token) {
    console.error('❌ Please provide a token');
    console.log('Usage: node scripts/check-contract-token.js <token>');
    process.exit(1);
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  const crypto = await import('crypto');
  
  // Hash token function (same as in lib/security/tokens.ts)
  function hashToken(token) {
    const TOKEN_SECRET = process.env.SIGNING_TOKEN_SECRET || "change-me-in-production-very-secure-secret-key";
    const hash = crypto.createHash('sha256');
    hash.update(token + TOKEN_SECRET);
    return hash.digest('hex');
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log(`\n🔍 Checking token: ${token.substring(0, 16)}...`);
  console.log(`Token length: ${token.length} characters\n`);
  
  // Try raw token lookup
  console.log('1. Checking raw token in signing_token column...');
  const { data: rawData, error: rawError } = await supabase
    .from("contracts")
    .select("id, title, status, signing_token, signing_token_hash, created_at")
    .eq("signing_token", token)
    .maybeSingle();
  
  if (rawData) {
    console.log('✅ Found contract by raw token!');
    console.log(`   Contract ID: ${rawData.id}`);
    console.log(`   Title: ${rawData.title || 'Untitled'}`);
    console.log(`   Status: ${rawData.status}`);
    console.log(`   Created: ${new Date(rawData.created_at).toLocaleString()}`);
    return;
  } else if (rawError) {
    console.log(`   ⚠️  Error: ${rawError.message}`);
  } else {
    console.log('   ❌ Not found');
  }
  
  // Try hash lookup
  console.log('\n2. Checking token hash in signing_token_hash column...');
  const tokenHash = hashToken(token);
  console.log(`   Hash: ${tokenHash.substring(0, 16)}...`);
  
  const { data: hashData, error: hashError } = await supabase
    .from("contracts")
    .select("id, title, status, signing_token, signing_token_hash, created_at")
    .eq("signing_token_hash", tokenHash)
    .maybeSingle();
  
  if (hashData) {
    console.log('✅ Found contract by hash!');
    console.log(`   Contract ID: ${hashData.id}`);
    console.log(`   Title: ${hashData.title || 'Untitled'}`);
    console.log(`   Status: ${hashData.status}`);
    console.log(`   Created: ${new Date(hashData.created_at).toLocaleString()}`);
    return;
  } else if (hashError) {
    console.log(`   ⚠️  Error: ${hashError.message}`);
  } else {
    console.log('   ❌ Not found');
  }
  
  // Try URL-decoded token
  console.log('\n3. Checking URL-decoded token...');
  try {
    const decodedToken = decodeURIComponent(token);
    if (decodedToken !== token) {
      console.log(`   Decoded token: ${decodedToken.substring(0, 16)}...`);
      
      const { data: decodedData } = await supabase
        .from("contracts")
        .select("id, title, status")
        .eq("signing_token", decodedToken)
        .maybeSingle();
      
      if (decodedData) {
        console.log('✅ Found contract with decoded token!');
        console.log(`   Contract ID: ${decodedData.id}`);
        console.log(`   Title: ${decodedData.title || 'Untitled'}`);
        return;
      }
    }
    console.log('   ❌ Not found');
  } catch (e) {
    console.log('   ⚠️  Could not decode token');
  }
  
  console.log('\n❌ Contract not found with this token.');
  console.log('\n💡 Suggestions:');
  console.log('   1. The contract may have been deleted');
  console.log('   2. The token may have expired');
  console.log('   3. The token may have been regenerated');
  console.log('   4. Try resending the contract to get a new token');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  console.error(error);
  process.exit(1);
});
