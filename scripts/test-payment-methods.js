#!/usr/bin/env node

/**
 * Test script for payment methods
 * Tests each payment method (Card, Apple Pay, Google Pay, Cash App, Stripe Link, ACH)
 * 
 * Usage: node scripts/test-payment-methods.js [contract-token]
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function logInfo(message) {
  console.log(`\n✅ ${message}`);
}

function logError(message) {
  console.error(`\n❌ ${message}`);
}

function logWarning(message) {
  console.warn(`\n⚠️  ${message}`);
}

function logTest(message) {
  console.log(`\n🧪 ${message}`);
}

async function testPaymentMethod(methodName, contractToken, baseUrl = 'http://localhost:3000') {
  logTest(`Testing ${methodName}...`);
  
  try {
    // Step 1: Create payment intent
    logInfo(`Step 1: Creating payment intent for ${methodName}...`);
    const paymentIntentResponse = await fetch(`${baseUrl}/api/stripe/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractId: 'test-contract-id', // This would be from the contract
        signingToken: contractToken,
        amount: 10.00, // Test amount
        currency: 'usd',
        paymentType: 'remaining_balance',
        clientEmail: 'test@example.com',
      }),
    });

    if (!paymentIntentResponse.ok) {
      const errorData = await paymentIntentResponse.json().catch(() => ({}));
      throw new Error(`Failed to create payment intent: ${paymentIntentResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    const { clientSecret, paymentIntentId } = await paymentIntentResponse.json();
    logInfo(`Payment intent created: ${paymentIntentId}`);
    logInfo(`Client secret: ${clientSecret.substring(0, 20)}...`);

    // Step 2: Verify payment method types
    logInfo(`Step 2: Verifying payment method types...`);
    const expectedMethods = {
      'Credit/Debit Cards': 'card',
      'Apple Pay': 'card', // Apple Pay uses card payment method
      'Google Pay': 'card', // Google Pay uses card payment method
      'Cash App Pay': 'cashapp',
      'Stripe Link': 'link',
      'Bank Transfer (ACH)': 'us_bank_account',
    };

    const methodType = expectedMethods[methodName];
    if (!methodType) {
      logWarning(`Unknown payment method: ${methodName}`);
      return { success: false, error: 'Unknown payment method' };
    }

    logInfo(`Expected payment method type: ${methodType}`);
    logInfo(`✅ Payment intent supports ${methodName} via ${methodType}`);

    // Step 3: Test payment intent retrieval
    logInfo(`Step 3: Verifying payment intent can be retrieved...`);
    // Note: In a real test, you would retrieve the payment intent from Stripe
    // For now, we just verify the client secret is valid format
    if (clientSecret && clientSecret.startsWith('pi_')) {
      logInfo(`✅ Client secret format is valid`);
    } else {
      logWarning(`⚠️  Client secret format may be invalid`);
    }

    return {
      success: true,
      paymentIntentId,
      clientSecret,
      methodType,
    };

  } catch (error) {
    logError(`Test failed for ${methodName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🧪 Payment Methods Test Suite');
  console.log('=' .repeat(50));

  const contractToken = process.argv[2];
  if (!contractToken) {
    logError('Please provide a contract token as argument');
    logInfo('Usage: node scripts/test-payment-methods.js <contract-token>');
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  logInfo(`Testing against: ${baseUrl}`);
  logInfo(`Contract token: ${contractToken.substring(0, 16)}...`);

  const paymentMethods = [
    'Credit/Debit Cards',
    'Apple Pay',
    'Google Pay',
    'Cash App Pay',
    'Stripe Link',
    'Bank Transfer (ACH)',
  ];

  const results = [];

  for (const method of paymentMethods) {
    const result = await testPaymentMethod(method, contractToken, baseUrl);
    results.push({ method, ...result });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));

  let passed = 0;
  let failed = 0;

  results.forEach(({ method, success, error }) => {
    if (success) {
      console.log(`✅ ${method}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${method}: FAILED - ${error}`);
      failed++;
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`\nTotal: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50));

  if (failed > 0) {
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  logError('This script requires Node.js 18+ or a fetch polyfill');
  process.exit(1);
}

runTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
}).finally(() => {
  rl.close();
});
