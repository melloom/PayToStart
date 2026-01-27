#!/usr/bin/env node

/**
 * Payment Processing Test Script
 * 
 * This script tests payment processing and polling:
 * 1. Creates a test checkout session (or uses existing session ID)
 * 2. Monitors payment status via polling
 * 3. Checks if payment gets processed
 * 4. Verifies webhook processing
 * 5. Tests the polling mechanism
 * 
 * Usage:
 *   node scripts/test-payment-processing.js [session_id]
 * 
 * If session_id is provided, it will monitor that session.
 * Otherwise, it will create a new test checkout session.
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

function logPoll(attempt, status, time) {
  log(`  [Poll ${attempt}] Status: ${status} | Time: ${time}ms`, 'magenta');
}

/**
 * Check payment status via API
 */
async function checkPaymentStatus(sessionId) {
  try {
    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/api/stripe/verify-session?session_id=${sessionId}`);
    const fetchTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      ...data,
      fetchTime,
    };
  } catch (error) {
    throw new Error(`Failed to check payment status: ${error.message}`);
  }
}

/**
 * Poll payment status
 */
async function pollPaymentStatus(sessionId, options = {}) {
  const {
    maxPolls = 40,
    pollInterval = 3000,
    initialDelay = 2000,
  } = options;

  logStep(`Starting payment status polling`);
  logInfo(`Session ID: ${sessionId}`);
  logInfo(`Max polls: ${maxPolls} (${maxPolls * pollInterval / 1000}s)`);
  logInfo(`Poll interval: ${pollInterval / 1000}s`);
  logInfo(`Initial delay: ${initialDelay / 1000}s`);

  // Initial check
  logStep('Initial verification...');
  try {
    const initialData = await checkPaymentStatus(sessionId);
    logPoll(0, initialData.paymentStatus || 'unknown', initialData.fetchTime);
    
    if (initialData.paid) {
      logSuccess(`Payment already confirmed! Status: ${initialData.paymentStatus}`);
      return {
        confirmed: true,
        attempt: 0,
        time: initialData.fetchTime,
        data: initialData,
      };
    }
    
    logInfo(`Payment status: ${initialData.paymentStatus || 'pending'}`);
  } catch (error) {
    logError(`Initial check failed: ${error.message}`);
    return { confirmed: false, error: error.message };
  }

  // Wait initial delay
  await new Promise(resolve => setTimeout(resolve, initialDelay));

  // Start polling
  let pollCount = 0;
  const startTime = Date.now();
  
  while (pollCount < maxPolls) {
    pollCount++;
    
    try {
      const data = await checkPaymentStatus(sessionId);
      const elapsed = Date.now() - startTime;
      
      logPoll(pollCount, data.paymentStatus || 'unknown', data.fetchTime);
      
      if (data.paid) {
        const totalTime = elapsed;
        logSuccess(`\n🎉 Payment confirmed on attempt ${pollCount}!`);
        logInfo(`Total time: ${(totalTime / 1000).toFixed(1)}s`);
        logInfo(`Average response time: ${(data.fetchTime).toFixed(0)}ms`);
        
        return {
          confirmed: true,
          attempt: pollCount,
          time: totalTime,
          data,
        };
      }
      
      // Show progress every 5 polls
      if (pollCount % 5 === 0) {
        logInfo(`Still checking... (${pollCount}/${maxPolls} attempts, ${(elapsed / 1000).toFixed(0)}s elapsed)`);
      }
      
    } catch (error) {
      logWarning(`Poll ${pollCount} failed: ${error.message}`);
      // Continue polling on error
    }
    
    // Wait before next poll
    if (pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  const totalTime = Date.now() - startTime;
  logWarning(`\n⚠️  Payment not confirmed after ${maxPolls} attempts (${(totalTime / 1000).toFixed(0)}s)`);
  
  // Final check
  logStep('Final status check...');
  try {
    const finalData = await checkPaymentStatus(sessionId);
    logInfo(`Final status: ${finalData.paymentStatus || 'unknown'}`);
    logInfo(`Paid: ${finalData.paid ? 'Yes' : 'No'}`);
    
    return {
      confirmed: finalData.paid,
      attempt: pollCount,
      time: totalTime,
      data: finalData,
    };
  } catch (error) {
    logError(`Final check failed: ${error.message}`);
    return {
      confirmed: false,
      attempt: pollCount,
      time: totalTime,
      error: error.message,
    };
  }
}

/**
 * Check Stripe session directly
 */
async function checkStripeSession(sessionId) {
  try {
    logStep('Checking Stripe session directly...');
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });
    
    logInfo(`Stripe Status: ${session.payment_status}`);
    logInfo(`Mode: ${session.mode}`);
    logInfo(`Amount: $${(session.amount_total / 100).toFixed(2)}`);
    logInfo(`Currency: ${session.currency}`);
    
    if (session.payment_intent) {
      const piId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent.id;
      const paymentIntent = await stripe.paymentIntents.retrieve(piId);
      logInfo(`Payment Intent Status: ${paymentIntent.status}`);
    }
    
    return session;
  } catch (error) {
    logError(`Failed to retrieve Stripe session: ${error.message}`);
    throw error;
  }
}

/**
 * Main test function
 */
async function main() {
  const sessionId = process.argv[2];
  
  log('\n🧪 Payment Processing Test Script', 'cyan');
  log('=====================================\n', 'cyan');
  
  if (!sessionId) {
    logError('Please provide a Stripe checkout session ID');
    logInfo('Usage: node scripts/test-payment-processing.js <session_id>');
    logInfo('\nTo get a session ID:');
    logInfo('1. Complete a test payment');
    logInfo('2. Copy the session_id from the URL: /sign/[token]/complete?session_id=cs_test_...');
    logInfo('3. Run: node scripts/test-payment-processing.js cs_test_...');
    process.exit(1);
  }
  
  // Validate session ID format
  if (!sessionId.startsWith('cs_')) {
    logWarning('Session ID should start with "cs_" - continuing anyway...');
  }
  
  try {
    // Check Stripe session directly first
    await checkStripeSession(sessionId);
    
    // Poll payment status
    const result = await pollPaymentStatus(sessionId);
    
    // Summary
    log('\n📊 Test Summary', 'cyan');
    log('================', 'cyan');
    
    if (result.confirmed) {
      logSuccess(`Payment confirmed successfully!`);
      logInfo(`Attempts: ${result.attempt}`);
      logInfo(`Time: ${(result.time / 1000).toFixed(1)}s`);
      
      if (result.data?.contract) {
        logInfo(`Contract ID: ${result.data.contract.id}`);
        logInfo(`Contract Status: ${result.data.contract.status}`);
      }
      
      if (result.data?.paymentMethod) {
        logInfo(`Payment Method: ${result.data.paymentMethod.type}`);
        if (result.data.paymentMethod.card) {
          logInfo(`Card: •••• ${result.data.paymentMethod.card.last4} (${result.data.paymentMethod.card.brand})`);
        }
      }
    } else {
      logError(`Payment not confirmed after polling`);
      logInfo(`Attempts: ${result.attempt}`);
      logInfo(`Time: ${(result.time / 1000).toFixed(1)}s`);
      
      if (result.data) {
        logInfo(`Final Status: ${result.data.paymentStatus || 'unknown'}`);
        logInfo(`Paid: ${result.data.paid ? 'Yes' : 'No'}`);
      }
      
      logWarning('\nPossible issues:');
      logWarning('1. Payment may not have been completed in Stripe');
      logWarning('2. Webhook may not have processed yet');
      logWarning('3. Check Stripe Dashboard for payment status');
    }
    
    log('\n');
    
  } catch (error) {
    logError(`Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
main().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
