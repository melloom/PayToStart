#!/usr/bin/env node

/**
 * Test $100 Payment Processing
 * 
 * Creates a test contract, signs it, and processes a $100 payment
 * Then monitors webhook processing
 * 
 * Usage:
 *   node scripts/test-payment-100.js
 */

try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found.');
}

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const isTestMode = process.env.STRIPE_MODE === 'test' || !process.env.STRIPE_MODE;
const secretKey = isTestMode 
  ? process.env.STRIPE_TEST_SECRET_KEY 
  : process.env.STRIPE_LIVE_SECRET_KEY;

if (!secretKey) {
  console.error('❌ Stripe secret key not found');
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logStep(message) {
  log(`\n📋 ${message}`, 'cyan');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  log('\n🧪 Test $100 Payment Processing', 'cyan');
  log('================================\n', 'cyan');
  
  logInfo('This script will:');
  logInfo('1. Find an existing signed contract (or you can create one)');
  logInfo('2. Monitor for payment processing via webhook');
  logInfo('3. Verify payment was processed correctly\n');
  
  logWarning('⚠️  Make sure:');
  logWarning('   - Dev server is running: npm run dev');
  logWarning('   - Stripe listen is running: stripe listen --forward-to localhost:3000/api/stripe/webhook\n');
  
  // Find contractor and contracts
  logStep('Step 1: Finding contracts...');
  
  const { data: contractors } = await supabase
    .from('contractors')
    .select('id, company_id')
    .limit(1);
  
  if (!contractors || contractors.length === 0) {
    logError('No contractors found');
    process.exit(1);
  }
  
  const contractor = contractors[0];
  logSuccess(`Found contractor: ${contractor.id}`);
  
  // Get all contracts (signed or not)
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('company_id', contractor.company_id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (!contracts || contracts.length === 0) {
    logError('No contracts found. Please create a contract in your app first.');
    logInfo('\nTo create a test contract:');
    logInfo('1. Go to http://localhost:3000/dashboard');
    logInfo('2. Create a new contract with $100 total, $10 deposit');
    logInfo('3. Sign it as client');
    logInfo('4. Then run this script again\n');
    process.exit(1);
  }
  
  logSuccess(`Found ${contracts.length} contract(s)`);
  
  // Show contracts
  contracts.forEach((c, i) => {
    const total = parseFloat(c.total_amount || 0);
    const deposit = parseFloat(c.deposit_amount || 0);
    logInfo(`\n${i + 1}. ${c.title || 'Untitled'}`);
    logInfo(`   ID: ${c.id}`);
    logInfo(`   Status: ${c.status}`);
    logInfo(`   Total: $${total.toFixed(2)}, Deposit: $${deposit.toFixed(2)}`);
  });
  
  // Use the first contract
  const contract = contracts[0];
  logStep(`\nStep 2: Using contract: ${contract.title || contract.id}`);
  
  // Check current payment status
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('contract_id', contract.id);
  
  const completedPayments = (payments || []).filter(p => p.status === 'completed');
  const totalPaid = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalAmount = parseFloat(contract.total_amount || 0);
  const remaining = totalAmount - totalPaid;
  
  logInfo(`Current status: ${contract.status}`);
  logInfo(`Total paid: $${totalPaid.toFixed(2)}`);
  logInfo(`Remaining: $${remaining.toFixed(2)}`);
  
  if (remaining <= 0) {
    logWarning('Contract is already fully paid!');
    logInfo('Create a new contract to test payment processing.\n');
    process.exit(0);
  }
  
  // Get signing token
  logStep('\nStep 3: Getting signing token...');
  
  const { data: signingTokens } = await supabase
    .from('contract_signing_tokens')
    .select('*')
    .eq('contract_id', contract.id)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (!signingTokens || signingTokens.length === 0) {
    logWarning('No active signing token found.');
    logInfo('\nTo test payment:');
    logInfo(`1. Go to your app and create/sign a contract`);
    logInfo(`2. Complete the payment in Stripe Checkout`);
    logInfo(`3. This script will monitor if webhook processes it\n`);
    
    logStep('Step 4: Monitoring for payment (60 seconds)...');
    logInfo('Make a payment in your app now, and this script will detect it!\n');
    
    const startTime = Date.now();
    const maxWait = 60000;
    const checkInterval = 2000;
    
    while (Date.now() - startTime < maxWait) {
      await wait(checkInterval);
      
      const { data: newPayments } = await supabase
        .from('payments')
        .select('*')
        .eq('contract_id', contract.id)
        .order('created_at', { ascending: false });
      
      const newCompleted = (newPayments || []).filter(p => p.status === 'completed');
      const newTotalPaid = newCompleted.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      
      if (newTotalPaid > totalPaid) {
        logSuccess('\n✅ Payment detected and processed!');
        
        const { data: updatedContract } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', contract.id)
          .single();
        
        logStep('\n📊 Results:');
        logSuccess(`✅ Contract Status: ${updatedContract?.status || contract.status}`);
        logSuccess(`✅ Total Paid: $${newTotalPaid.toFixed(2)}`);
        logSuccess(`✅ Remaining: $${(totalAmount - newTotalPaid).toFixed(2)}`);
        
        if (updatedContract?.status === 'paid' || updatedContract?.status === 'completed') {
          logSuccess('✅ Webhook processed payment correctly!');
        }
        
        log('\n🎉 Test PASSED!\n', 'green');
        process.exit(0);
      }
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      process.stdout.write(`\r⏳ Waiting for payment... ${elapsed}s - Make payment in app now!`);
    }
    
    console.log('');
    logWarning('\n⚠️  No payment detected within 60 seconds.');
    logInfo('Check:');
    logInfo('1. Did you complete the payment in Stripe Checkout?');
    logInfo('2. Is stripe listen running?');
    logInfo('3. Is webhook secret correct in .env.local?');
    logInfo(`\nCheck manually: node scripts/check-deposit-status.js ${contract.id}\n`);
    process.exit(1);
  }
  
  const token = signingTokens[0];
  logSuccess(`Found signing token: ${token.token.substring(0, 20)}...`);
  
  logStep('\nStep 4: Payment URL');
  const paymentUrl = `${baseUrl}/pay/${token.token}`;
  logInfo(`Payment URL: ${paymentUrl}`);
  logInfo('\nTo test:');
  logInfo('1. Open this URL in your browser');
  logInfo('2. Complete the payment');
  logInfo('3. This script will monitor webhook processing\n');
  
  logStep('Step 5: Monitoring for payment (60 seconds)...');
  logInfo('Complete the payment now!\n');
  
  const startTime = Date.now();
  const maxWait = 60000;
  const checkInterval = 2000;
  
  while (Date.now() - startTime < maxWait) {
    await wait(checkInterval);
    
    const { data: newPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contract.id)
      .order('created_at', { ascending: false });
    
    const newCompleted = (newPayments || []).filter(p => p.status === 'completed');
    const newTotalPaid = newCompleted.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    if (newTotalPaid > totalPaid) {
      logSuccess('\n✅ Payment detected and processed!');
      
      const { data: updatedContract } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contract.id)
        .single();
      
      logStep('\n📊 Results:');
      logSuccess(`✅ Contract Status: ${updatedContract?.status || contract.status}`);
      logSuccess(`✅ Total Paid: $${newTotalPaid.toFixed(2)}`);
      logSuccess(`✅ Remaining: $${(totalAmount - newTotalPaid).toFixed(2)}`);
      
      if (updatedContract?.status === 'paid' || updatedContract?.status === 'completed') {
        logSuccess('✅ Webhook processed payment correctly!');
        log('\n🎉 Test PASSED! Webhook is working!\n', 'green');
      } else {
        logWarning(`⚠️  Status is "${updatedContract?.status}" (expected "paid" or "completed")`);
      }
      
      process.exit(0);
    }
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    process.stdout.write(`\r⏳ Waiting for payment... ${elapsed}s`);
  }
  
  console.log('');
  logWarning('\n⚠️  No payment detected within 60 seconds.');
  logInfo('The payment may still be processing. Check manually:');
  logInfo(`  node scripts/check-deposit-status.js ${contract.id}\n`);
  process.exit(1);
}

main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
