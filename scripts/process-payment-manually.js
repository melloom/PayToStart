#!/usr/bin/env node

/**
 * Manually Process Payment Script
 * 
 * If a payment succeeded in Stripe but wasn't processed by webhook,
 * this script manually processes it.
 * 
 * Usage:
 *   node scripts/process-payment-manually.js <checkout_session_id>
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
 * Manually process payment by calling the webhook endpoint
 */
async function processPaymentManually(sessionId) {
  logStep('Step 1: Retrieving checkout session from Stripe...');
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });
    
    logSuccess('Session retrieved:');
    logInfo(`  ID: ${session.id}`);
    logInfo(`  Status: ${session.payment_status}`);
    logInfo(`  Amount: $${(session.amount_total / 100).toFixed(2)}`);
    
    if (session.payment_status !== 'paid') {
      logError(`Payment status is "${session.payment_status}", not "paid". Cannot process.`);
      return false;
    }
    
    logStep('Step 2: Calling webhook endpoint to process payment...');
    
    // Create a webhook event payload
    const webhookEvent = {
      id: `evt_manual_${Date.now()}`,
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: session,
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
 * Alternative: Process via API endpoint (if available)
 */
async function processPaymentViaAPI(sessionId) {
  logStep('Attempting to process via API endpoint...');
  
  try {
    // Try calling a processing endpoint if it exists
    const response = await fetch(`${baseUrl}/api/stripe/process-payment?session_id=${sessionId}`, {
      method: 'POST',
    });
    
    if (response.ok) {
      const result = await response.json();
      logSuccess('Payment processed via API!');
      logInfo(`Result: ${JSON.stringify(result, null, 2)}`);
      return true;
    } else {
      logWarning('API endpoint not available or returned error');
      return false;
    }
  } catch (error) {
    logWarning(`API endpoint not available: ${error.message}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const sessionId = process.argv[2];
  
  log('\n🔧 Manual Payment Processing Script', 'cyan');
  log('====================================\n', 'cyan');
  
  if (!sessionId) {
    logError('Please provide a Stripe checkout session ID');
    logInfo('Usage: node scripts/process-payment-manually.js <session_id>');
    logInfo('\nExample:');
    logInfo('  node scripts/process-payment-manually.js cs_test_abc123...');
    process.exit(1);
  }
  
  // Validate session ID format
  if (!sessionId.startsWith('cs_')) {
    logWarning('Session ID should start with "cs_" - continuing anyway...');
  }
  
  logInfo(`Processing payment for session: ${sessionId}`);
  logInfo(`Base URL: ${baseUrl}`);
  logWarning('\n⚠️  Note: This script attempts to manually trigger webhook processing.');
  logWarning('If this fails, you may need to use Stripe Dashboard to resend the webhook.\n');
  
  // Try API endpoint first (if available)
  const apiSuccess = await processPaymentViaAPI(sessionId);
  
  if (!apiSuccess) {
    // Try webhook endpoint
    await processPaymentManually(sessionId);
  }
  
  log('\n📊 Next Steps', 'cyan');
  log('=============', 'cyan');
  logInfo('1. Run verification script to check if payment was processed:');
  logInfo(`   node scripts/verify-payment-processed.js ${sessionId}`);
  logInfo('\n2. Or check contract status:');
  logInfo('   node scripts/check-deposit-status.js <contract_id>');
  logInfo('\n3. If still not processed, use Stripe Dashboard:');
  logInfo('   - Go to Developers → Webhooks');
  logInfo('   - Find the webhook endpoint');
  logInfo('   - Click "Send test webhook"');
  logInfo('   - Select "checkout.session.completed"');
  logInfo('   - Enter session ID and send');
  log('\n');
}

// Run the script
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
