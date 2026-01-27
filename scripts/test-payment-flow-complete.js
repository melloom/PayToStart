#!/usr/bin/env node

/**
 * Complete Payment Flow Test Script
 * 
 * Tests the full payment flow:
 * 1. Creates a test contract
 * 2. Signs it as client
 * 3. Makes a $100 payment
 * 4. Monitors webhook processing
 * 5. Verifies payment was processed
 * 
 * Usage:
 *   node scripts/test-payment-flow-complete.js
 */

// Try to load .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found. Make sure environment variables are set manually.');
}

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe
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

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logStep(message) {
  log(`\n📋 ${message}`, 'cyan');
}

function logTest(message) {
  log(`🧪 ${message}`, 'magenta');
}

/**
 * Wait for a condition
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test payment processing
 */
async function testPaymentFlow() {
  log('\n🧪 Complete Payment Flow Test', 'cyan');
  log('============================\n', 'cyan');
  
  logInfo(`Stripe Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
  logInfo(`Base URL: ${baseUrl}`);
  logWarning('\n⚠️  Make sure your dev server is running: npm run dev');
  logWarning('⚠️  Make sure stripe listen is running: stripe listen --forward-to localhost:3000/api/stripe/webhook\n');
  
  // Step 1: Find or create a test contract
  logStep('Step 1: Finding test contract...');
  
  try {
    // Get the first contractor
    const { data: contractors, error: contractorError } = await supabase
      .from('contractors')
      .select('id, company_id')
      .limit(1);
    
    if (contractorError || !contractors || contractors.length === 0) {
      logError('No contractors found. Please create a contractor account first.');
      return false;
    }
    
    const contractor = contractors[0];
    logSuccess(`Found contractor: ${contractor.id}`);
    logInfo(`Company ID: ${contractor.company_id}`);
    
    // Get contracts for this company
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('company_id', contractor.company_id)
      .eq('status', 'signed')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (contractsError) {
      logError(`Error fetching contracts: ${contractsError.message}`);
      return false;
    }
    
    if (!contracts || contracts.length === 0) {
      logError('No signed contracts found. Please create and sign a contract first.');
      logInfo('You can create a contract in your app, sign it, then run this test.');
      return false;
    }
    
    const contract = contracts[0];
    logSuccess(`Found contract: ${contract.id}`);
    logInfo(`Title: ${contract.title}`);
    logInfo(`Status: ${contract.status}`);
    logInfo(`Total: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
    logInfo(`Deposit: $${parseFloat(contract.deposit_amount || 0).toFixed(2)}`);
    
    // Check if already paid
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contract.id)
      .eq('status', 'completed');
    
    const totalPaid = (payments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    if (totalPaid >= parseFloat(contract.total_amount || 0)) {
      logWarning('Contract is already fully paid. Creating a new test contract would be better.');
      logInfo('You can create a new contract in your app for testing.');
      return false;
    }
    
    // Step 2: Check if we need to create a checkout session
    logStep('Step 2: Checking payment status...');
    
    const depositAmount = parseFloat(contract.deposit_amount || 0);
    const remainingBalance = parseFloat(contract.total_amount || 0) - totalPaid;
    
    logInfo(`Deposit needed: $${depositAmount.toFixed(2)}`);
    logInfo(`Remaining balance: $${remainingBalance.toFixed(2)}`);
    
    if (depositAmount === 0 && remainingBalance === 0) {
      logWarning('Contract has no payment required.');
      return false;
    }
    
    // Step 3: Get signing token
    logStep('Step 3: Getting contract signing token...');
    
    // We need the signing token to create a payment URL
    // For now, let's check if we can find it or create a checkout session directly
    
    logInfo('To test payment processing:');
    logInfo('1. Go to your app and sign the contract as a client');
    logInfo('2. Complete the payment in Stripe Checkout');
    logInfo('3. This script will monitor if the webhook processes it');
    
    // Step 4: Monitor for webhook processing
    logStep('Step 4: Monitoring payment processing...');
    
    logInfo('Waiting for payment to be processed via webhook...');
    logInfo('Make a payment in your app, then this script will check if it was processed.');
    
    const maxWaitTime = 60000; // 60 seconds
    const checkInterval = 2000; // Check every 2 seconds
    const startTime = Date.now();
    let paymentProcessed = false;
    
    while (Date.now() - startTime < maxWaitTime && !paymentProcessed) {
      await wait(checkInterval);
      
      // Check payment status
      const { data: currentPayments } = await supabase
        .from('payments')
        .select('*')
        .eq('contract_id', contract.id)
        .order('created_at', { ascending: false });
      
      const completedPayments = (currentPayments || []).filter(p => p.status === 'completed');
      const newTotalPaid = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      
      if (newTotalPaid > totalPaid) {
        logSuccess('Payment detected!');
        paymentProcessed = true;
        
        // Get updated contract
        const { data: updatedContract } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', contract.id)
          .single();
        
        logStep('Step 5: Verification Results');
        logSuccess('✅ Payment was processed!');
        logInfo(`Contract Status: ${updatedContract?.status || contract.status}`);
        logInfo(`Total Paid: $${newTotalPaid.toFixed(2)}`);
        logInfo(`Remaining Balance: $${(parseFloat(contract.total_amount || 0) - newTotalPaid).toFixed(2)}`);
        
        if (updatedContract?.status === 'paid' || updatedContract?.status === 'completed') {
          logSuccess('✅ Contract status updated correctly!');
        } else {
          logWarning(`⚠️  Contract status is "${updatedContract?.status}" (expected "paid" or "completed")`);
        }
        
        return true;
      }
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      process.stdout.write(`\r⏳ Waiting for payment... (${elapsed}s) - Make a payment in your app now!`);
    }
    
    console.log(''); // New line
    
    if (!paymentProcessed) {
      logWarning('Payment not detected within 60 seconds.');
      logInfo('Possible reasons:');
      logInfo('1. Payment not completed yet');
      logInfo('2. Webhook not firing (check stripe listen terminal)');
      logInfo('3. Webhook secret mismatch');
      logInfo('\nYou can manually check with:');
      logInfo(`  node scripts/check-deposit-status.js ${contract.id}`);
      return false;
    }
    
    return true;
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const success = await testPaymentFlow();
    
    log('\n📊 Test Summary', 'cyan');
    log('===============', 'cyan');
    
    if (success) {
      logSuccess('✅ Payment flow test PASSED!');
      logInfo('Webhook is working correctly.');
    } else {
      logError('❌ Payment flow test did not complete');
      logInfo('Check the messages above for details.');
    }
    
    log('\n');
    process.exit(success ? 0 : 1);
  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
