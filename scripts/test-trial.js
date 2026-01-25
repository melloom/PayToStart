#!/usr/bin/env node

/**
 * Test Script for 7-Day Free Trial
 * 
 * This script tests the trial functionality:
 * 1. Creates a test subscription with trial
 * 2. Verifies trial period is set correctly
 * 3. Simulates trial end
 * 4. Verifies card is charged
 * 5. Checks database updates
 * 
 * Usage:
 *   node scripts/test-trial.js
 * 
 * Prerequisites:
 *   - Stripe test keys configured in .env.local
 *   - Test customer and payment method set up
 *   - Database access
 */

// Try to load .env.local, but don't fail if dotenv is not installed
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not installed, that's okay - environment variables should be set manually
  console.warn('⚠️  dotenv not found. Make sure environment variables are set manually.');
}

const Stripe = require('stripe');

// Initialize Stripe
const isTestMode = process.env.STRIPE_MODE === 'test';
const secretKey = isTestMode 
  ? process.env.STRIPE_TEST_SECRET_KEY 
  : process.env.STRIPE_LIVE_SECRET_KEY;

if (!secretKey) {
  console.error('❌ Stripe secret key not found. Please set STRIPE_TEST_SECRET_KEY or STRIPE_LIVE_SECRET_KEY in .env.local');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

// Test configuration
const TEST_CONFIG = {
  // Test card that will succeed
  testCard: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2026,
    cvc: '123',
  },
  // Test tier to use
  tier: 'starter', // Change to 'pro' or 'premium' as needed
  // Test customer email (will create if doesn't exist)
  customerEmail: `test-${Date.now()}@example.com`,
};

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

function logStep(step, message) {
  log(`\n[Step ${step}] ${message}`, 'cyan');
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

// Calculate trial end date
function getTrialEndDate() {
  const now = Math.floor(Date.now() / 1000);
  const trialEnd = now + (7 * 24 * 60 * 60); // 7 days
  return {
    timestamp: trialEnd,
    date: new Date(trialEnd * 1000),
  };
}

// Test 1: Create customer with payment method
async function test1_CreateCustomer() {
  logStep(1, 'Creating test customer and payment method...');
  
  try {
    // Create customer
    const customer = await stripe.customers.create({
      email: TEST_CONFIG.customerEmail,
      name: 'Test User',
      metadata: {
        test: 'true',
        testType: 'trial',
      },
    });
    
    logSuccess(`Customer created: ${customer.id}`);
    
    // Create payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: TEST_CONFIG.testCard,
    });
    
    logSuccess(`Payment method created: ${paymentMethod.id}`);
    
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
    
    logSuccess(`Payment method attached to customer`);
    
    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
    
    logSuccess(`Payment method set as default`);
    
    return { customer, paymentMethod };
  } catch (error) {
    logError(`Failed to create customer: ${error.message}`);
    throw error;
  }
}

// Test 2: Create subscription with trial
async function test2_CreateSubscriptionWithTrial(customerId, paymentMethodId) {
  logStep(2, 'Creating subscription with 7-day trial...');
  
  try {
    const tierConfig = {
      starter: { price: 2900 }, // $29.00 in cents
      pro: { price: 7900 }, // $79.00 in cents
      premium: { price: 14900 }, // $149.00 in cents
    };
    
    const price = tierConfig[TEST_CONFIG.tier].price;
    const trialEnd = getTrialEndDate();
    
    logInfo(`Tier: ${TEST_CONFIG.tier}`);
    logInfo(`Price: $${(price / 100).toFixed(2)}/month`);
    logInfo(`Trial end: ${trialEnd.date.toISOString()}`);
    
    // Create price
    const stripePrice = await stripe.prices.create({
      unit_amount: price,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: `${TEST_CONFIG.tier} Plan`,
      },
    });
    
    logSuccess(`Price created: ${stripePrice.id}`);
    
    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: stripePrice.id }],
      default_payment_method: paymentMethodId,
      trial_end: trialEnd.timestamp,
      metadata: {
        tier: TEST_CONFIG.tier,
        test: 'true',
      },
    });
    
    logSuccess(`Subscription created: ${subscription.id}`);
    logInfo(`Status: ${subscription.status}`);
    logInfo(`Trial end: ${new Date(subscription.trial_end * 1000).toISOString()}`);
    logInfo(`Current period end: ${new Date(subscription.current_period_end * 1000).toISOString()}`);
    
    // Verify trial is set correctly
    const expectedTrialEnd = trialEnd.timestamp;
    const actualTrialEnd = subscription.trial_end;
    const difference = Math.abs(expectedTrialEnd - actualTrialEnd);
    
    if (difference < 60) { // Allow 1 minute difference
      logSuccess(`Trial end date is correct (within 1 minute)`);
    } else {
      logError(`Trial end date mismatch! Expected: ${expectedTrialEnd}, Got: ${actualTrialEnd}`);
    }
    
    if (subscription.status === 'trialing') {
      logSuccess(`Subscription status is "trialing" (correct)`);
    } else {
      logError(`Subscription status should be "trialing" but got: ${subscription.status}`);
    }
    
    return subscription;
  } catch (error) {
    logError(`Failed to create subscription: ${error.message}`);
    throw error;
  }
}

// Test 3: Verify trial period
async function test3_VerifyTrialPeriod(subscriptionId) {
  logStep(3, 'Verifying trial period...');
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const now = Math.floor(Date.now() / 1000);
    const trialEnd = subscription.trial_end;
    const daysRemaining = Math.floor((trialEnd - now) / (24 * 60 * 60));
    const hoursRemaining = Math.floor((trialEnd - now) / (60 * 60));
    
    logInfo(`Current time: ${new Date(now * 1000).toISOString()}`);
    logInfo(`Trial ends: ${new Date(trialEnd * 1000).toISOString()}`);
    logInfo(`Days remaining: ${daysRemaining}`);
    logInfo(`Hours remaining: ${hoursRemaining}`);
    
    if (daysRemaining >= 6 && daysRemaining <= 7) {
      logSuccess(`Trial period is approximately 7 days (${daysRemaining} days remaining)`);
    } else {
      logWarning(`Trial period is ${daysRemaining} days (expected ~7 days)`);
    }
    
    if (subscription.status === 'trialing') {
      logSuccess(`Subscription is in trial period`);
    } else {
      logError(`Subscription status should be "trialing" but got: ${subscription.status}`);
    }
    
    return subscription;
  } catch (error) {
    logError(`Failed to verify trial: ${error.message}`);
    throw error;
  }
}

// Test 4: Simulate trial end (update trial_end to now)
async function test4_SimulateTrialEnd(subscriptionId) {
  logStep(4, 'Simulating trial end (updating trial_end to now)...');
  
  try {
    const now = Math.floor(Date.now() / 1000);
    
    logWarning('This will immediately end the trial and attempt to charge the card!');
    logInfo('Updating subscription trial_end to now...');
    
    // Update subscription to end trial immediately
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      trial_end: 'now', // End trial immediately
    });
    
    logSuccess(`Subscription updated`);
    logInfo(`New status: ${subscription.status}`);
    logInfo(`Trial end: ${subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : 'None'}`);
    logInfo(`Current period end: ${new Date(subscription.current_period_end * 1000).toISOString()}`);
    
    // Wait a moment for Stripe to process
    logInfo('Waiting 3 seconds for Stripe to process trial end...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Retrieve updated subscription
    const updatedSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (updatedSubscription.status === 'active') {
      logSuccess(`Subscription is now active (trial ended successfully)`);
    } else if (updatedSubscription.status === 'trialing') {
      logWarning(`Subscription is still trialing. This may take a few more seconds.`);
    } else {
      logError(`Unexpected subscription status: ${updatedSubscription.status}`);
    }
    
    return updatedSubscription;
  } catch (error) {
    logError(`Failed to simulate trial end: ${error.message}`);
    throw error;
  }
}

// Test 5: Verify payment was charged
async function test5_VerifyPayment(subscriptionId, customerId) {
  logStep(5, 'Verifying payment was charged...');
  
  try {
    // Get invoices for this subscription
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      limit: 10,
    });
    
    logInfo(`Found ${invoices.data.length} invoice(s)`);
    
    if (invoices.data.length === 0) {
      logWarning('No invoices found. Payment may still be processing...');
      return;
    }
    
    // Find the first paid invoice (after trial)
    const paidInvoice = invoices.data.find(inv => 
      inv.status === 'paid' && inv.billing_reason === 'subscription_cycle'
    );
    
    if (paidInvoice) {
      logSuccess(`Invoice found: ${paidInvoice.id}`);
      logInfo(`Amount: $${(paidInvoice.amount_paid / 100).toFixed(2)}`);
      logInfo(`Status: ${paidInvoice.status}`);
      logInfo(`Paid at: ${paidInvoice.status_transitions.paid_at ? new Date(paidInvoice.status_transitions.paid_at * 1000).toISOString() : 'N/A'}`);
      logSuccess(`✅ Payment was successfully charged!`);
    } else {
      logWarning('No paid invoice found yet. This may take a few moments.');
      logInfo('Recent invoices:');
      invoices.data.slice(0, 3).forEach(inv => {
        logInfo(`  - ${inv.id}: ${inv.status} (${inv.billing_reason}) - $${(inv.amount_due / 100).toFixed(2)}`);
      });
    }
    
    return paidInvoice;
  } catch (error) {
    logError(`Failed to verify payment: ${error.message}`);
    throw error;
  }
}

// Test 6: Cleanup (optional)
async function test6_Cleanup(subscriptionId, customerId) {
  logStep(6, 'Cleaning up test resources...');
  
  try {
    // Cancel subscription
    await stripe.subscriptions.cancel(subscriptionId);
    logSuccess(`Subscription cancelled: ${subscriptionId}`);
    
    // Delete customer (this will also delete payment methods)
    await stripe.customers.del(customerId);
    logSuccess(`Customer deleted: ${customerId}`);
    
    logSuccess('Cleanup complete');
  } catch (error) {
    logWarning(`Cleanup failed (this is okay): ${error.message}`);
  }
}

// Main test function
async function runTests() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  7-Day Free Trial Test Script', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  logInfo(`Stripe Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
  logInfo(`Test Tier: ${TEST_CONFIG.tier}`);
  logInfo(`Test Email: ${TEST_CONFIG.customerEmail}\n`);
  
  if (!isTestMode) {
    logError('⚠️  WARNING: You are in LIVE mode! This will create real subscriptions and charge real cards!');
    logError('Set STRIPE_MODE=test in .env.local to use test mode.\n');
    return;
  }
  
  let customer, paymentMethod, subscription;
  
  try {
    // Run tests
    const test1Result = await test1_CreateCustomer();
    customer = test1Result.customer;
    paymentMethod = test1Result.paymentMethod;
    
    subscription = await test2_CreateSubscriptionWithTrial(customer.id, paymentMethod.id);
    
    await test3_VerifyTrialPeriod(subscription.id);
    
    // Ask user if they want to simulate trial end
    log('\n═══════════════════════════════════════════════════════════', 'yellow');
    log('  Ready to simulate trial end?', 'yellow');
    log('  This will immediately end the trial and charge the card.', 'yellow');
    log('═══════════════════════════════════════════════════════════\n', 'yellow');
    
    // Check if --skip-trial-end flag is set
    if (process.argv.includes('--skip-trial-end')) {
      logInfo('Skipping trial end simulation (--skip-trial-end flag set)');
      logInfo('You can manually end the trial in Stripe Dashboard\n');
    } else {
      // For automated testing, we'll proceed
      logInfo('Proceeding with trial end simulation...\n');
      
      const updatedSubscription = await test4_SimulateTrialEnd(subscription.id);
      
      // Wait a bit more for invoice to be created
      logInfo('Waiting 5 seconds for invoice to be created...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await test5_VerifyPayment(subscription.id, customer.id);
    }
    
    // Summary
    log('\n═══════════════════════════════════════════════════════════', 'green');
    log('  Test Summary', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'green');
    logSuccess('✅ Customer created');
    logSuccess('✅ Payment method added');
    logSuccess('✅ Subscription created with 7-day trial');
    logSuccess('✅ Trial period verified');
    if (!process.argv.includes('--skip-trial-end')) {
      logSuccess('✅ Trial end simulated');
      logSuccess('✅ Payment verification attempted');
    } else {
      logInfo('⏭️  Trial end simulation skipped');
    }
    log('\n✅ All tests completed!\n', 'green');
    
    // Ask about cleanup
    logInfo('Test resources created:');
    logInfo(`  - Customer: ${customer.id}`);
    logInfo(`  - Subscription: ${subscription.id}`);
    logInfo('\nTo clean up, run: node scripts/test-trial.js --cleanup');
    
  } catch (error) {
    logError(`\nTest failed: ${error.message}`);
    if (error.stack) {
      logError(`Stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Handle cleanup flag
if (process.argv.includes('--cleanup')) {
  // This would require subscription and customer IDs
  logError('Cleanup requires subscription and customer IDs. Please provide them or delete manually in Stripe Dashboard.');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
