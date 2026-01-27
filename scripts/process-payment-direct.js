#!/usr/bin/env node

/**
 * Direct Payment Processing Script
 * 
 * This script directly processes a payment intent by updating the database,
 * bypassing the webhook signature requirement.
 * 
 * Usage:
 *   node scripts/process-payment-direct.js <payment_intent_id>
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
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
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

async function processPaymentDirect(paymentIntentId) {
  logStep('Step 1: Retrieving payment intent from Stripe...');
  
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['customer', 'payment_method', 'latest_charge'],
    });
    
    logSuccess('Payment Intent retrieved:');
    logInfo(`  ID: ${paymentIntent.id}`);
    logInfo(`  Status: ${paymentIntent.status}`);
    logInfo(`  Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    logInfo(`  Currency: ${paymentIntent.currency.toUpperCase()}`);
    
    if (paymentIntent.status !== 'succeeded') {
      logError(`Payment status is "${paymentIntent.status}", not "succeeded". Cannot process.`);
      return false;
    }
    
    const contractId = paymentIntent.metadata?.contractId || paymentIntent.metadata?.contract_id;
    if (!contractId) {
      logError('No contract ID found in payment intent metadata');
      return false;
    }
    
    logInfo(`  Contract ID: ${contractId}`);
    logInfo(`  Payment Type: ${paymentIntent.metadata?.type || 'N/A'}`);
    
    logStep('Step 2: Checking if payment already exists...');
    
    // Check if payment already exists
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_intent_id', paymentIntentId);
    
    if (existingPayments && existingPayments.length > 0) {
      logWarning(`Payment ${paymentIntentId} already processed`);
      logInfo(`Found ${existingPayments.length} existing payment record(s)`);
      return true;
    }
    
    logStep('Step 3: Retrieving contract from database...');
    
    // Get contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();
    
    if (contractError || !contract) {
      logError(`Contract not found: ${contractId}`);
      if (contractError) logError(`Error: ${contractError.message}`);
      return false;
    }
    
    logSuccess('Contract found:');
    logInfo(`  Title: ${contract.title || 'N/A'}`);
    logInfo(`  Status: ${contract.status}`);
    logInfo(`  Total Amount: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
    
    const paymentAmount = paymentIntent.amount / 100;
    
    logStep('Step 4: Creating payment record...');
    
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        company_id: contract.company_id,
        contract_id: contract.id,
        amount: paymentAmount.toString(),
        status: 'completed',
        payment_intent_id: paymentIntentId,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (paymentError) {
      logError(`Failed to create payment record: ${paymentError.message}`);
      return false;
    }
    
    logSuccess('Payment record created!');
    logInfo(`  Payment ID: ${payment.id}`);
    
    logStep('Step 5: Calculating total paid and updating contract status...');
    
    // Get all payments for contract
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount, status')
      .eq('contract_id', contractId);
    
    const totalPaid = (allPayments || [])
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    const contractTotal = parseFloat(contract.total_amount || 0);
    const isFullyPaid = totalPaid >= contractTotal - 0.01;
    
    logInfo(`  Total Paid: $${totalPaid.toFixed(2)}`);
    logInfo(`  Contract Total: $${contractTotal.toFixed(2)}`);
    logInfo(`  Fully Paid: ${isFullyPaid ? 'Yes' : 'No'}`);
    
    // Update contract status
    const updateData = {
      status: isFullyPaid ? 'completed' : 'paid',
    };
    
    if (isFullyPaid) {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error: updateError } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId);
    
    if (updateError) {
      logError(`Failed to update contract: ${updateError.message}`);
      return false;
    }
    
    logSuccess(`Contract status updated to: ${updateData.status}`);
    
    logStep('Step 6: Logging contract event...');
    
    // Log contract event
    try {
      const { error: eventError } = await supabase.rpc('log_contract_event', {
        p_contract_id: contractId,
        p_event_type: 'payment_completed',
        p_actor_type: 'system',
        p_actor_id: null,
        p_metadata: {
          paymentIntentId: paymentIntentId,
          amount: paymentAmount,
          type: paymentIntent.metadata?.type || 'remaining_balance',
        },
      });
      
      if (eventError) {
        logWarning(`Failed to log contract event: ${eventError.message}`);
      } else {
        logSuccess('Contract event logged');
      }
    } catch (eventErr) {
      logWarning(`Failed to log contract event: ${eventErr.message}`);
    }
    
    logSuccess('\n🎉 Payment processed successfully!');
    return true;
    
  } catch (error) {
    logError(`Failed to process payment: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function main() {
  const paymentIntentId = process.argv[2];
  
  log('\n🔧 Direct Payment Processing Script', 'cyan');
  log('===================================\n', 'cyan');
  
  if (!paymentIntentId) {
    logError('Please provide a Stripe payment intent ID');
    logInfo('Usage: node scripts/process-payment-direct.js <payment_intent_id>');
    logInfo('\nExample:');
    logInfo('  node scripts/process-payment-direct.js pi_3Stw0lIHbb4sBpOc0binUDvp');
    process.exit(1);
  }
  
  if (!paymentIntentId.startsWith('pi_')) {
    logWarning('Payment intent ID should start with "pi_" - continuing anyway...');
  }
  
  logInfo(`Processing payment intent: ${paymentIntentId}`);
  logWarning('\n⚠️  Note: This script directly updates the database.');
  logWarning('It bypasses webhook signature verification.\n');
  
  const success = await processPaymentDirect(paymentIntentId);
  
  if (success) {
    log('\n✅ Processing complete!', 'green');
  } else {
    log('\n❌ Processing failed. Check errors above.', 'red');
    process.exit(1);
  }
  
  log('\n');
}

main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
