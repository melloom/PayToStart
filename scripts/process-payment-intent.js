#!/usr/bin/env node

/**
 * Manually Process Payment Intent Script
 * 
 * If a payment intent succeeded in Stripe but wasn't processed by webhook,
 * this script manually processes it by simulating a payment_intent.succeeded event.
 * 
 * Usage:
 *   node scripts/process-payment-intent.js <payment_intent_id>
 */

// Try to load .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found. Make sure environment variables are set manually.');
}

const Stripe = require('stripe');

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

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

/**
 * Manually process payment intent by calling the webhook endpoint
 */
async function processPaymentIntent(paymentIntentId) {
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
    logInfo(`  Customer: ${paymentIntent.customer || 'N/A'}`);
    logInfo(`  Contract ID: ${paymentIntent.metadata?.contractId || paymentIntent.metadata?.contract_id || 'N/A'}`);
    logInfo(`  Payment Type: ${paymentIntent.metadata?.type || 'N/A'}`);
    
    if (paymentIntent.status !== 'succeeded') {
      logError(`Payment status is "${paymentIntent.status}", not "succeeded". Cannot process.`);
      return false;
    }
    
    logStep('Step 2: Calling webhook endpoint to process payment...');
    
    // Create a webhook event payload for payment_intent.succeeded
    const webhookEvent = {
      id: `evt_manual_${Date.now()}`,
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: paymentIntent,
      },
      created: Math.floor(Date.now() / 1000),
    };
    
    // Call the webhook endpoint
    try {
      const response = await fetch(`${baseUrl}/api/stripe/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookEvent),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logError(`Webhook call failed: ${response.status} ${response.statusText}`);
        logInfo(`Response: ${errorText}`);
        return false;
      }
      
      const result = await response.json();
      logSuccess('Webhook processed successfully!');
      logInfo(`Response: ${JSON.stringify(result, null, 2)}`);
      
      return true;
    } catch (fetchError) {
      logError(`Failed to call webhook: ${fetchError.message}`);
      logWarning('Note: Webhook endpoint requires proper Stripe signature verification.');
      logInfo('You may need to process this through Stripe Dashboard → Webhooks → Send test webhook');
      return false;
    }
    
  } catch (error) {
    logError(`Failed to process payment: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const paymentIntentId = process.argv[2];
  
  log('\n🔧 Manual Payment Intent Processing Script', 'cyan');
  log('==========================================\n', 'cyan');
  
  if (!paymentIntentId) {
    logError('Please provide a Stripe payment intent ID');
    logInfo('Usage: node scripts/process-payment-intent.js <payment_intent_id>');
    logInfo('\nExample:');
    logInfo('  node scripts/process-payment-intent.js pi_3Stw0lIHbb4sBpOc0binUDvp');
    process.exit(1);
  }
  
  // Validate payment intent ID format
  if (!paymentIntentId.startsWith('pi_')) {
    logWarning('Payment intent ID should start with "pi_" - continuing anyway...');
  }
  
  logInfo(`Processing payment intent: ${paymentIntentId}`);
  logInfo(`Base URL: ${baseUrl}`);
  logWarning('\n⚠️  Note: This script attempts to manually trigger webhook processing.');
  logWarning('If this fails, you may need to use Stripe Dashboard to resend the webhook.\n');
  
  await processPaymentIntent(paymentIntentId);
  
  log('\n📊 Next Steps', 'cyan');
  log('=============', 'cyan');
  logInfo('1. Check if payment was processed in the database');
  logInfo('2. Verify contract payment status');
  logInfo('3. If still not processed, use Stripe Dashboard:');
  logInfo('   - Go to Developers → Webhooks');
  logInfo('   - Find the webhook endpoint');
  logInfo('   - Click "Send test webhook"');
  logInfo('   - Select "payment_intent.succeeded"');
  logInfo('   - Enter payment intent ID and send');
  log('\n');
}

// Run the script
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
