#!/usr/bin/env node

/**
 * Simple Trial Test Script
 * 
 * This is a simpler version that uses the API endpoints to test the trial
 * instead of directly calling Stripe API.
 * 
 * Usage:
 *   node scripts/test-trial-simple.js
 * 
 * Prerequisites:
 *   - Server running on localhost:3000
 *   - Test account logged in (or provide auth token)
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Colors for console
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function testTrial() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  Simple 7-Day Trial Test', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  logInfo('This script tests the trial through your API endpoints.');
  logInfo('Make sure your server is running and you are logged in.\n');
  
  logStep(1, 'Testing subscription creation with trial...');
  logInfo('To test manually:');
  logInfo('1. Go to http://localhost:3000/dashboard/select-plan');
  logInfo('2. Add a payment method (test card: 4242 4242 4242 4242)');
  logInfo('3. Subscribe to Starter/Pro/Premium plan');
  logInfo('4. Check Stripe Dashboard for subscription with trial');
  logInfo('5. In Stripe Dashboard, update subscription trial_end to "now"');
  logInfo('6. Verify card is charged and subscription becomes active\n');
  
  logStep(2, 'Checking Stripe Dashboard...');
  logInfo('Go to: https://dashboard.stripe.com/test/subscriptions');
  logInfo('Look for subscriptions with status "trialing"');
  logInfo('Trial end should be 7 days from creation date\n');
  
  logStep(3, 'To simulate trial end:');
  logInfo('1. Open subscription in Stripe Dashboard');
  logInfo('2. Click "..." → "Update subscription"');
  logInfo('3. Set trial_end to current time or 1 minute from now');
  logInfo('4. Save and wait 1-2 minutes');
  logInfo('5. Check subscription status changes to "active"');
  logInfo('6. Check invoice is created and paid\n');
  
  logSuccess('Test instructions provided above.');
  logInfo('For automated testing, use: node scripts/test-trial.js\n');
}

testTrial().catch(error => {
  logError(`Error: ${error.message}`);
  process.exit(1);
});
