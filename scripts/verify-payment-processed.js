#!/usr/bin/env node

/**
 * Verify Payment Processing Script
 * 
 * Checks if a payment that succeeded in Stripe was properly processed in the system:
 * 1. Checks Stripe payment status
 * 2. Checks database payment records
 * 3. Checks contract status
 * 4. Verifies webhook was received
 * 
 * Usage:
 *   node scripts/verify-payment-processed.js <session_id_or_payment_intent_id>
 */

// Try to load .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found. Make sure environment variables are set manually.');
}

const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe
const isTestMode = process.env.STRIPE_MODE === 'test' || !process.env.STRIPE_MODE;
const secretKey = isTestMode 
  ? process.env.STRIPE_TEST_SECRET_KEY 
  : process.env.STRIPE_LIVE_SECRET_KEY;

if (!secretKey) {
  console.error('❌ Stripe secret key not found. Please set STRIPE_TEST_SECRET_KEY in .env.local');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Colors for console output
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

/**
 * Find contract ID from Stripe session
 */
async function findContractFromSession(sessionId) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    
    const contractId = session.metadata?.contract_id || session.metadata?.contractId;
    return { session, contractId };
  } catch (error) {
    // Try as payment intent ID
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(sessionId);
      const contractId = paymentIntent.metadata?.contract_id || paymentIntent.metadata?.contractId;
      return { session: null, paymentIntent, contractId };
    } catch (piError) {
      throw new Error(`Could not find session or payment intent: ${error.message}`);
    }
  }
}

/**
 * Check payment in database
 */
async function checkPaymentInDatabase(contractId, sessionId) {
  logStep('Checking payment records in database...');
  
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: false });
  
  if (error) {
    logError(`Database error: ${error.message}`);
    return null;
  }
  
  if (!payments || payments.length === 0) {
    logWarning('No payment records found in database');
    return null;
  }
  
  logInfo(`Found ${payments.length} payment record(s)`);
  
  // Find payment matching this session
  const matchingPayment = payments.find(p => 
    p.payment_intent_id === sessionId || 
    p.payment_intent_id?.includes(sessionId) ||
    p.payment_intent_id?.startsWith(sessionId.substring(0, 10))
  );
  
  if (matchingPayment) {
    logSuccess(`Found matching payment record:`);
    logInfo(`  ID: ${matchingPayment.id}`);
    logInfo(`  Amount: $${parseFloat(matchingPayment.amount || 0).toFixed(2)}`);
    logInfo(`  Status: ${matchingPayment.status}`);
    logInfo(`  Created: ${matchingPayment.created_at}`);
    logInfo(`  Completed: ${matchingPayment.completed_at || 'Not completed'}`);
    
    if (matchingPayment.status === 'completed') {
      logSuccess('✅ Payment status is "completed" in database');
      return { found: true, status: 'completed', payment: matchingPayment };
    } else {
      logWarning(`⚠️  Payment status is "${matchingPayment.status}" (expected "completed")`);
      return { found: true, status: matchingPayment.status, payment: matchingPayment };
    }
  } else {
    logWarning('No payment record found matching this session ID');
    logInfo('All payment records:');
    payments.forEach((p, i) => {
      logInfo(`  ${i + 1}. Amount: $${parseFloat(p.amount || 0).toFixed(2)}, Status: ${p.status}, ID: ${p.payment_intent_id}`);
    });
    return { found: false, payments };
  }
}

/**
 * Check contract status
 */
async function checkContractStatus(contractId) {
  logStep('Checking contract status...');
  
  const { data: contract, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single();
  
  if (error || !contract) {
    logError(`Contract not found: ${error?.message || 'Unknown error'}`);
    return null;
  }
  
  logSuccess('Contract found:');
  logInfo(`  ID: ${contract.id}`);
  logInfo(`  Title: ${contract.title}`);
  logInfo(`  Status: ${contract.status}`);
  logInfo(`  Total Amount: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
  logInfo(`  Deposit Amount: $${parseFloat(contract.deposit_amount || 0).toFixed(2)}`);
  logInfo(`  Paid At: ${contract.paid_at || 'Not set'}`);
  logInfo(`  Signed At: ${contract.signed_at || 'Not set'}`);
  
  // Check if status is correct
  if (contract.status === 'paid' || contract.status === 'completed') {
    logSuccess(`✅ Contract status is "${contract.status}" (correct)`);
  } else {
    logWarning(`⚠️  Contract status is "${contract.status}" (expected "paid" or "completed")`);
  }
  
  return contract;
}

/**
 * Check webhook events
 */
async function checkWebhookEvents(contractId) {
  logStep('Checking webhook events...');
  
  const { data: events, error } = await supabase
    .from('contract_events')
    .select('*')
    .eq('contract_id', contractId)
    .in('event_type', ['payment_completed', 'paid'])
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    logWarning(`Could not check webhook events: ${error.message}`);
    return null;
  }
  
  if (!events || events.length === 0) {
    logWarning('No payment-related webhook events found');
    return null;
  }
  
  logSuccess(`Found ${events.length} payment-related event(s):`);
  events.forEach((event, i) => {
    logInfo(`  ${i + 1}. ${event.event_type} at ${event.created_at}`);
    if (event.metadata) {
      const meta = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;
      if (meta.sessionId) logInfo(`     Session ID: ${meta.sessionId}`);
      if (meta.amount) logInfo(`     Amount: $${meta.amount}`);
    }
  });
  
  return events;
}

/**
 * Main verification function
 */
async function main() {
  const sessionIdOrPaymentIntent = process.argv[2];
  
  log('\n🔍 Payment Processing Verification Script', 'cyan');
  log('==========================================\n', 'cyan');
  
  if (!sessionIdOrPaymentIntent) {
    logError('Please provide a Stripe checkout session ID or payment intent ID');
    logInfo('Usage: node scripts/verify-payment-processed.js <session_id_or_payment_intent_id>');
    logInfo('\nExample:');
    logInfo('  node scripts/verify-payment-processed.js cs_test_abc123...');
    logInfo('  node scripts/verify-payment-processed.js pi_1StcBB...');
    process.exit(1);
  }
  
  try {
    // Step 1: Find contract from Stripe
    logStep('Step 1: Finding contract from Stripe session...');
    const { session, paymentIntent, contractId } = await findContractFromSession(sessionIdOrPaymentIntent);
    
    if (!contractId) {
      logError('Could not find contract ID in Stripe metadata');
      if (session) {
        logInfo('Session metadata:', JSON.stringify(session.metadata, null, 2));
      }
      if (paymentIntent) {
        logInfo('Payment Intent metadata:', JSON.stringify(paymentIntent.metadata, null, 2));
      }
      process.exit(1);
    }
    
    logSuccess(`Found contract ID: ${contractId}`);
    
    // Check Stripe payment status
    if (session) {
      logInfo(`Stripe Session Status: ${session.payment_status}`);
      logInfo(`Amount: $${(session.amount_total / 100).toFixed(2)}`);
    }
    if (paymentIntent) {
      logInfo(`Payment Intent Status: ${paymentIntent.status}`);
      logInfo(`Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    }
    
    // Step 2: Check payment in database
    const paymentResult = await checkPaymentInDatabase(contractId, sessionIdOrPaymentIntent);
    
    // Step 3: Check contract status
    const contract = await checkContractStatus(contractId);
    
    // Step 4: Check webhook events
    const events = await checkWebhookEvents(contractId);
    
    // Summary
    log('\n📊 Verification Summary', 'cyan');
    log('=====================', 'cyan');
    
    let allGood = true;
    
    if (paymentResult?.status === 'completed') {
      logSuccess('✅ Payment record is "completed" in database');
    } else {
      logError('❌ Payment record is NOT "completed" in database');
      allGood = false;
    }
    
    if (contract?.status === 'paid' || contract?.status === 'completed') {
      logSuccess('✅ Contract status is correct');
    } else {
      logError(`❌ Contract status is "${contract?.status}" (should be "paid" or "completed")`);
      allGood = false;
    }
    
    if (events && events.length > 0) {
      logSuccess('✅ Webhook events found (payment was processed)');
    } else {
      logWarning('⚠️  No webhook events found (webhook may not have fired yet)');
    }
    
    if (allGood) {
      log('\n🎉 All checks passed! Payment was processed correctly.', 'green');
    } else {
      log('\n⚠️  Some issues found. Payment may not have been fully processed.', 'yellow');
      logInfo('Possible causes:');
      logInfo('  1. Webhook may not have fired yet (check Stripe Dashboard → Webhooks)');
      logInfo('  2. Webhook may have failed (check webhook logs in Stripe)');
      logInfo('  3. Database update may have failed (check server logs)');
    }
    
    log('\n');
    
  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the verification
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
