#!/usr/bin/env node

/**
 * Fix Pending Payment Script
 * 
 * Manually processes a payment that succeeded in Stripe but wasn't processed by webhook.
 * This directly calls the payment processing logic.
 * 
 * Usage:
 *   node scripts/fix-pending-payment.js <checkout_session_id>
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
  console.error('❌ Stripe secret key not found');
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

// Colors
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

/**
 * Process payment directly using database operations
 */
async function processPaymentDirectly(sessionId) {
  logStep('Step 1: Retrieving checkout session from Stripe...');
  
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'customer'],
  });
  
  logSuccess('Session retrieved:');
  logInfo(`  ID: ${session.id}`);
  logInfo(`  Status: ${session.payment_status}`);
  logInfo(`  Amount: $${(session.amount_total / 100).toFixed(2)}`);
  
  if (session.payment_status !== 'paid') {
    logError(`Payment status is "${session.payment_status}", not "paid"`);
    return false;
  }
  
  const contractId = session.metadata?.contract_id || session.metadata?.contractId;
  const companyId = session.metadata?.company_id || session.metadata?.companyId;
  
  if (!contractId || !companyId) {
    logError('Missing contract_id or company_id in session metadata');
    return false;
  }
  
  logStep('Step 2: Finding contract and payment records...');
  
  // Get contract
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single();
  
  if (contractError || !contract) {
    logError(`Contract not found: ${contractError?.message}`);
    return false;
  }
  
  logSuccess('Contract found:');
  logInfo(`  Title: ${contract.title}`);
  logInfo(`  Status: ${contract.status}`);
  logInfo(`  Total: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
  logInfo(`  Deposit: $${parseFloat(contract.deposit_amount || 0).toFixed(2)}`);
  
  // Get payments
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('contract_id', contractId);
  
  if (paymentsError) {
    logError(`Error fetching payments: ${paymentsError.message}`);
    return false;
  }
  
  logInfo(`Found ${payments.length} payment record(s)`);
  
  const paymentAmount = (session.amount_total || 0) / 100;
  
  // Find or create payment record
  let payment = payments.find(p => 
    p.payment_intent_id === sessionId || 
    (p.status === 'pending' && Math.abs(parseFloat(p.amount || 0) - paymentAmount) < 0.01)
  );
  
  logStep('Step 3: Updating payment record...');
  
  if (payment) {
    logInfo(`Updating existing payment record: ${payment.id}`);
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        payment_intent_id: sessionId,
      })
      .eq('id', payment.id);
    
    if (updateError) {
      logError(`Failed to update payment: ${updateError.message}`);
      return false;
    }
    logSuccess('Payment record updated to "completed"');
  } else {
    logInfo('Creating new payment record...');
    const { data: newPayment, error: createError } = await supabase
      .from('payments')
      .insert({
        contract_id: contractId,
        company_id: companyId,
        amount: paymentAmount,
        status: 'completed',
        payment_intent_id: sessionId,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (createError || !newPayment) {
      logError(`Failed to create payment: ${createError?.message}`);
      return false;
    }
    logSuccess('Payment record created');
    payment = newPayment;
  }
  
  logStep('Step 4: Calculating total paid and updating contract...');
  
  // Get all payments to calculate total
  const { data: allPayments } = await supabase
    .from('payments')
    .select('*')
    .eq('contract_id', contractId);
  
  const totalPaid = (allPayments || [])
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  
  const isFullyPaid = totalPaid >= parseFloat(contract.total_amount || 0) - 0.01;
  
  logInfo(`Total paid: $${totalPaid.toFixed(2)}`);
  logInfo(`Contract total: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
  logInfo(`Fully paid: ${isFullyPaid ? 'Yes' : 'No'}`);
  
  // Update contract status
  const updateData = {
    paid_at: new Date().toISOString(),
  };
  
  if (isFullyPaid) {
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
  } else {
    updateData.status = 'paid';
  }
  
  const { error: contractUpdateError } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', contractId);
  
  if (contractUpdateError) {
    logError(`Failed to update contract: ${contractUpdateError.message}`);
    return false;
  }
  
  logSuccess(`Contract status updated to "${updateData.status}"`);
  
  logStep('Step 5: Logging audit events...');
  
  // Log payment_completed event
  const { error: eventError1 } = await supabase
    .from('contract_events')
    .insert({
      contract_id: contractId,
      company_id: companyId,
      event_type: 'payment_completed',
      actor_type: 'system',
      metadata: {
        sessionId: sessionId,
        amount: paymentAmount,
        manual: true,
      },
    });
  
  if (eventError1) {
    logWarning(`Could not log payment_completed event: ${eventError1.message}`);
  } else {
    logSuccess('Payment event logged');
  }
  
  // Log paid event
  const { error: eventError2 } = await supabase
    .from('contract_events')
    .insert({
      contract_id: contractId,
      company_id: companyId,
      event_type: 'paid',
      actor_type: 'system',
      metadata: {
        sessionId: sessionId,
        amount: paymentAmount,
        manual: true,
      },
    });
  
  if (eventError2) {
    logWarning(`Could not log paid event: ${eventError2.message}`);
  } else {
    logSuccess('Paid event logged');
  }
  
  return true;
}

/**
 * Main function
 */
async function main() {
  const sessionId = process.argv[2];
  
  log('\n🔧 Fix Pending Payment Script', 'cyan');
  log('==============================\n', 'cyan');
  
  if (!sessionId) {
    logError('Please provide a Stripe checkout session ID');
    logInfo('Usage: node scripts/fix-pending-payment.js <session_id>');
    logInfo('\nExample:');
    logInfo('  node scripts/fix-pending-payment.js cs_test_abc123...');
    process.exit(1);
  }
  
  logInfo(`Processing payment for session: ${sessionId}`);
  logWarning('\n⚠️  This will manually process the payment in the database.\n');
  
  try {
    const success = await processPaymentDirectly(sessionId);
    
    if (success) {
      log('\n🎉 Payment processed successfully!', 'green');
      log('\n📊 Verification', 'cyan');
      log('===============', 'cyan');
      logInfo('Run this to verify:');
      logInfo(`  node scripts/verify-payment-processed.js ${sessionId}`);
    } else {
      log('\n❌ Failed to process payment', 'red');
      process.exit(1);
    }
  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
  
  log('\n');
}

main();
