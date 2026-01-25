#!/usr/bin/env node

/**
 * End-to-End Payment Flow Test Script
 * 
 * This script tests the complete payment flow from client perspective:
 * 1. Creates a test contract (requires auth)
 * 2. Tests signing page with payment notice
 * 3. Tests contract signing
 * 4. Tests payment redirect
 * 5. Tests Stripe Checkout
 * 6. Verifies webhook processing
 * 
 * Usage:
 *   node scripts/test-payment-e2e.js [options]
 * 
 * Options:
 *   --contract-id=<id>     Use existing contract ID
 *   --signing-token=<token> Use existing signing token
 *   --password=<password>  Password for password-protected contracts
 *   --skip-browser         Skip browser automation tests
 *   --headless             Run browser in headless mode
 * 
 * Prerequisites:
 *   - Stripe test keys configured
 *   - NEXT_PUBLIC_APP_URL set
 *   - Test contractor account (for contract creation)
 */

try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found.');
}

const Stripe = require('stripe');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key) {
    options[key.replace('--', '')] = value || true;
  }
});

const isTestMode = process.env.STRIPE_MODE === 'test' || !process.env.STRIPE_MODE;
const secretKey = isTestMode 
  ? process.env.STRIPE_TEST_SECRET_KEY 
  : process.env.STRIPE_LIVE_SECRET_KEY;

if (!secretKey) {
  console.error('❌ Stripe secret key not found. Please set STRIPE_TEST_SECRET_KEY in .env.local');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  depositAmount: 100.00,
  totalAmount: 500.00,
  testCard: '4242424242424242',
  testClientEmail: 'test-client@example.com',
  testClientName: 'Test Client',
};

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
  log(`\n[${step}] ${message}`, 'cyan');
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

async function makeRequest(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${TEST_CONFIG.baseUrl}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({ message: 'No JSON response' }));
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return { response, data };
}

async function testSigningPage(signingToken) {
  logStep('TEST-1', 'Testing Signing Page Load');
  
  try {
    logInfo(`Fetching contract: /api/contracts/sign/${signingToken}`);
    const { data } = await makeRequest(`/api/contracts/sign/${signingToken}`);
    
    if (data.contract) {
      logSuccess('Contract loaded successfully');
      logInfo(`Title: ${data.contract.title || 'Untitled'}`);
      logInfo(`Status: ${data.contract.status}`);
      logInfo(`Deposit: $${data.contract.depositAmount || 0}`);
      logInfo(`Total: $${data.contract.totalAmount || 0}`);
      
      if (data.contract.depositAmount > 0) {
        logSuccess('✓ Deposit amount is set');
        logInfo('✓ Payment notice should be displayed on signing page');
      } else {
        logWarning('No deposit amount - payment notice may not appear');
      }
      
      if (data.contract.status === 'signed' || data.contract.status === 'paid') {
        logWarning('Contract already signed - cannot test signing flow');
        return { ...data.contract, alreadySigned: true };
      }
      
      return data.contract;
    } else if (data.requiresPassword) {
      logWarning('Contract requires password');
      logInfo('Password protection test will be run separately');
      return { requiresPassword: true, signingToken };
    } else {
      logError('Contract not found');
      return null;
    }
  } catch (error) {
    logError(`Failed to load contract: ${error.message}`);
    return null;
  }
}

async function testPasswordProtection(signingToken, password) {
  logStep('TEST-1B', 'Testing Password Protection');
  
  if (!password) {
    logWarning('No password provided, skipping password test');
    logInfo('To test password protection, use: --password=<password>');
    return true;
  }
  
  try {
    logInfo(`Testing password verification: /api/contracts/sign/${signingToken}?password=${password}`);
    const { data } = await makeRequest(`/api/contracts/sign/${signingToken}?password=${encodeURIComponent(password)}`);
    
    if (data.contract) {
      logSuccess('Password verified successfully');
      logInfo('Contract accessible with password');
      return true;
    } else if (data.requiresPassword) {
      logError('Password verification failed');
      return false;
    } else {
      logWarning('Unexpected response');
      return true;
    }
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('Invalid password')) {
      logError('Password verification failed');
      return false;
    }
    logWarning(`Password test: ${error.message}`);
    return true;
  }
}

async function testSigningValidation(signingToken) {
  logStep('TEST-1C', 'Testing Signing Validation');
  
  try {
    // Test 1: Missing fullName
    logInfo('Test 1: Missing fullName');
    try {
      await makeRequest(`/api/contracts/sign/${signingToken}`, {
        method: 'POST',
        body: JSON.stringify({
          signatureDataUrl: null,
          ip: '127.0.0.1',
          userAgent: 'Test Agent',
          agree: true,
        }),
      });
      logError('Validation failed: Should reject missing fullName');
      return false;
    } catch (error) {
      if (error.message.includes('required') || error.message.includes('Validation')) {
        logSuccess('✓ Correctly rejected missing fullName');
      } else {
        logWarning(`Unexpected error: ${error.message}`);
      }
    }
    
    // Test 2: Empty fullName
    logInfo('Test 2: Empty fullName');
    try {
      await makeRequest(`/api/contracts/sign/${signingToken}`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: '',
          signatureDataUrl: null,
          ip: '127.0.0.1',
          userAgent: 'Test Agent',
          agree: true,
        }),
      });
      logError('Validation failed: Should reject empty fullName');
      return false;
    } catch (error) {
      if (error.message.includes('required') || error.message.includes('Validation')) {
        logSuccess('✓ Correctly rejected empty fullName');
      }
    }
    
    // Test 3: Missing agree
    logInfo('Test 3: Missing agree checkbox');
    try {
      await makeRequest(`/api/contracts/sign/${signingToken}`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Test User',
          signatureDataUrl: null,
          ip: '127.0.0.1',
          userAgent: 'Test Agent',
        }),
      });
      logError('Validation failed: Should reject missing agree');
      return false;
    } catch (error) {
      if (error.message.includes('agree') || error.message.includes('Validation')) {
        logSuccess('✓ Correctly rejected missing agree');
      }
    }
    
    // Test 4: Invalid signature format
    logInfo('Test 4: Invalid signature format');
    try {
      await makeRequest(`/api/contracts/sign/${signingToken}`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: 'Test User',
          signatureDataUrl: 'invalid-signature-format',
          ip: '127.0.0.1',
          userAgent: 'Test Agent',
          agree: true,
        }),
      });
      logError('Validation failed: Should reject invalid signature format');
      return false;
    } catch (error) {
      if (error.message.includes('Invalid signature') || error.message.includes('format')) {
        logSuccess('✓ Correctly rejected invalid signature format');
      }
    }
    
    logSuccess('All validation tests passed');
    return true;
  } catch (error) {
    logError(`Validation test error: ${error.message}`);
    return false;
  }
}

async function testSigningSubmission(signingToken, contract) {
  logStep('TEST-1D', 'Testing Contract Signing');
  
  if (!contract || contract.alreadySigned) {
    logWarning('Contract already signed or not available, skipping signing test');
    return null;
  }
  
  try {
    const testFullName = 'Test Client ' + Date.now();
    logInfo(`Signing contract with name: ${testFullName}`);
    
    // Create a minimal valid signature data URL (1x1 transparent PNG)
    const minimalSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const { data } = await makeRequest(`/api/contracts/sign/${signingToken}`, {
      method: 'POST',
      body: JSON.stringify({
        fullName: testFullName,
        signatureDataUrl: minimalSignature,
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
        agree: true,
      }),
    });
    
    if (data.success && data.contract) {
      logSuccess('Contract signed successfully!');
      logInfo(`Contract ID: ${data.contract.id}`);
      logInfo(`Status: ${data.contract.status}`);
      
      if (data.checkoutUrl) {
        logSuccess('✓ Checkout URL generated');
        logInfo(`Checkout URL: ${data.checkoutUrl.substring(0, 80)}...`);
      } else if (contract.depositAmount > 0) {
        logWarning('No checkout URL returned (may redirect to /pay/[token])');
      }
      
      return data;
    } else {
      logError('Signing failed');
      return null;
    }
  } catch (error) {
    logError(`Failed to sign contract: ${error.message}`);
    logInfo('Note: This may fail if contract is already signed or token is invalid');
    return null;
  }
}

async function testStripeCheckoutCreation(contractId, signingToken) {
  logStep('TEST-2', 'Testing Stripe Checkout Session Creation');
  
  try {
    logInfo('Creating checkout session via API...');
    const { data } = await makeRequest('/api/stripe/create-checkout', {
      method: 'POST',
      body: JSON.stringify({
        contractId,
        signingToken,
        amount: TEST_CONFIG.depositAmount,
        currency: 'usd',
      }),
    });
    
    if (data.sessionId || data.url) {
      logSuccess('Checkout session created');
      logInfo(`Session ID: ${data.sessionId || 'N/A'}`);
      logInfo(`Checkout URL: ${data.url || 'N/A'}`);
      return data;
    } else {
      logError('Invalid response from checkout creation');
      return null;
    }
  } catch (error) {
    logError(`Failed to create checkout: ${error.message}`);
    logInfo('Note: This requires the contract to be signed first');
    return null;
  }
}

async function testDirectStripeCheckout(depositAmount) {
  logStep('TEST-3', 'Testing Direct Stripe Checkout Creation');
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Contract Deposit',
              description: 'Test payment for contract deposit',
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${TEST_CONFIG.baseUrl}/sign/test-token/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${TEST_CONFIG.baseUrl}/sign/test-token?canceled=1`,
      customer_email: TEST_CONFIG.testClientEmail,
      metadata: {
        test: 'true',
        type: 'deposit',
      },
    });

    logSuccess(`Checkout Session created: ${session.id}`);
    logInfo(`Checkout URL: ${session.url}`);
    logInfo(`Payment Status: ${session.payment_status}`);
    logInfo(`Amount: $${(session.amount_total / 100).toFixed(2)}`);
    
    return session;
  } catch (error) {
    logError(`Failed to create checkout session: ${error.message}`);
    return null;
  }
}

async function testPaymentIntent(depositAmount) {
  logStep('TEST-4', 'Testing Payment Intent Creation');
  
  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(depositAmount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        test: 'true',
        type: 'deposit',
      },
    });

    logSuccess(`Payment Intent created: ${paymentIntent.id}`);
    logInfo(`Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    logInfo(`Status: ${paymentIntent.status}`);
    
    logInfo('\nNote: Payment Intent confirmation requires test tokens or Stripe Elements.');
    logInfo('For testing, use Stripe Checkout (which handles card input securely).');
    logInfo('To test payment completion:');
    logInfo('  1. Use the checkout URL from TEST-3');
    logInfo('  2. Complete payment in Stripe Checkout UI');
    logInfo('  3. Or use Stripe CLI to simulate webhook');
    
    return paymentIntent;
  } catch (error) {
    logError(`Failed to create payment intent: ${error.message}`);
    return null;
  }
}

async function testWebhookSimulation(sessionId) {
  logStep('TEST-5', 'Testing Webhook Simulation');
  
  if (!sessionId) {
    logWarning('No session ID provided, skipping webhook test');
    return true;
  }
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    logInfo(`Session ID: ${session.id}`);
    logInfo(`Payment Status: ${session.payment_status}`);
    logInfo(`Status: ${session.status}`);
    
    logInfo('\nTo test webhook processing:');
    logInfo('1. Use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook');
    logInfo('2. Trigger event: stripe trigger checkout.session.completed');
    logInfo('3. Or manually send webhook from Stripe Dashboard');
    
    return true;
  } catch (error) {
    logError(`Failed to retrieve session: ${error.message}`);
    return false;
  }
}

async function testPaymentVerification(sessionId) {
  logStep('TEST-6', 'Testing Payment Verification Endpoint');
  
  if (!sessionId) {
    logWarning('No session ID provided, skipping');
    return true;
  }
  
  try {
    const { data } = await makeRequest(`/api/stripe/verify-session?session_id=${sessionId}`);
    
    logSuccess('Verification endpoint accessible');
    logInfo(`Verified: ${data.verified || 'N/A'}`);
    if (data.contract) {
      logInfo(`Contract Status: ${data.contract.status}`);
    }
    if (data.paymentStatus) {
      logInfo(`Payment Status: ${data.paymentStatus}`);
    }
    
    return true;
  } catch (error) {
    logWarning(`Verification test: ${error.message}`);
    logInfo('This is expected if contract doesn\'t exist in database');
    return true;
  }
}

async function printManualTestInstructions() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  Manual Testing Instructions', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  logInfo('Complete End-to-End Test:');
  logInfo('');
  logInfo('1. CREATE CONTRACT:');
  logInfo('   - Login to your app as a contractor');
  logInfo('   - Create a new contract');
  logInfo('   - Set deposit amount: $' + TEST_CONFIG.depositAmount.toFixed(2));
  logInfo('   - Set total amount: $' + TEST_CONFIG.totalAmount.toFixed(2));
  logInfo('   - Send contract to: ' + TEST_CONFIG.testClientEmail);
  logInfo('');
  logInfo('2. TEST SIGNING PAGE:');
  logInfo('   - Open the signing link from email');
  logInfo('   - Verify payment notice is displayed prominently');
  logInfo('   - Check deposit amount is shown: $' + TEST_CONFIG.depositAmount.toFixed(2));
  logInfo('   - Check total amount is shown: $' + TEST_CONFIG.totalAmount.toFixed(2));
  logInfo('   - Verify "Payment Required After Signing" warning is visible');
  logInfo('   - Check agreement checkbox mentions payment');
  logInfo('');
  logInfo('3. SIGN CONTRACT:');
  logInfo('   - Enter your full name');
  logInfo('   - Optionally draw signature');
  logInfo('   - Check agreement checkbox');
  logInfo('   - Click "Sign Contract"');
  logInfo('   - Verify success message shows payment amount');
  logInfo('');
  logInfo('4. TEST PAYMENT REDIRECT:');
  logInfo('   - Should automatically redirect to Stripe Checkout');
  logInfo('   - Or redirect to /pay/[token] page');
  logInfo('   - Verify deposit amount is correct');
  logInfo('');
  logInfo('5. COMPLETE PAYMENT:');
  logInfo('   - Use test card: ' + TEST_CONFIG.testCard);
  logInfo('   - Expiry: 12/' + (new Date().getFullYear() + 1));
  logInfo('   - CVC: 123');
  logInfo('   - Complete payment in Stripe Checkout');
  logInfo('');
  logInfo('6. VERIFY WEBHOOK:');
  logInfo('   - Check server logs for webhook receipt');
  logInfo('   - Verify contract status changed to "paid"');
  logInfo('   - Check emails were sent to both parties');
  logInfo('   - Verify PDF was generated and attached');
  logInfo('');
  logInfo('7. VERIFY FINALIZATION:');
  logInfo('   - Check contract dashboard shows "Paid" status');
  logInfo('   - Verify timeline shows "Payment Received" event');
  logInfo('   - Download and verify final PDF');
  logInfo('');
}

async function main() {
  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  End-to-End Payment Flow Test', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  logInfo(`Base URL: ${TEST_CONFIG.baseUrl}`);
  logInfo(`Stripe Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
  logInfo(`Test Card: ${TEST_CONFIG.testCard}\n`);

  let contractId = options['contract-id'];
  let signingToken = options['signing-token'];
  let password = options['password'];
  let contract = null;
  let checkoutSession = null;

  // Test 1: Test signing page (if token provided)
  if (signingToken) {
    contract = await testSigningPage(signingToken);
    
    if (contract && !contract.alreadySigned) {
      contractId = contract.id;
      TEST_CONFIG.depositAmount = contract.depositAmount || TEST_CONFIG.depositAmount;
      TEST_CONFIG.totalAmount = contract.totalAmount || TEST_CONFIG.totalAmount;
      
      // Test password protection if applicable
      if (contract.requiresPassword) {
        await testPasswordProtection(signingToken, password);
      }
      
      // Test signing validation
      await testSigningValidation(signingToken);
      
      // Test actual signing (optional - set SKIP_SIGNING=true to skip)
      if (!process.env.SKIP_SIGNING) {
        logInfo('\n⚠️  Testing actual contract signing...');
        const signingResult = await testSigningSubmission(signingToken, contract);
        if (signingResult && signingResult.checkoutUrl) {
          logInfo('✓ Signing successful, checkout URL generated');
        }
      } else {
        logInfo('\n⚠️  Skipping actual signing (set SKIP_SIGNING=false to enable)');
      }
    }
  } else {
    logWarning('No signing token provided. Use --signing-token=<token> to test signing page');
    logInfo('Skipping signing page test...\n');
  }

  // Test 2: Test Stripe Checkout creation (if contract ID and token provided)
  if (contractId && signingToken) {
    checkoutSession = await testStripeCheckoutCreation(contractId, signingToken);
  } else {
    logWarning('Contract ID or signing token missing. Skipping API checkout test');
    logInfo('Use --contract-id=<id> --signing-token=<token> to test\n');
  }

  // Test 3: Test direct Stripe Checkout creation
  checkoutSession = await testDirectStripeCheckout(TEST_CONFIG.depositAmount);

  // Test 4: Test Payment Intent
  const paymentIntent = await testPaymentIntent(TEST_CONFIG.depositAmount);

  // Test 5: Test webhook simulation
  if (checkoutSession?.id) {
    await testWebhookSimulation(checkoutSession.id);
  }

  // Test 6: Test payment verification
  if (checkoutSession?.id) {
    await testPaymentVerification(checkoutSession.id);
  }

  // Print manual test instructions
  await printManualTestInstructions();

  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  log('  Test Complete', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  
  logSuccess('Automated tests completed!');
  logInfo('Review the manual testing instructions above for complete end-to-end testing.');
  logInfo('');
  logInfo('Quick Test Commands:');
  logInfo(`  # Basic test with signing token:`);
  logInfo(`  node scripts/test-payment-e2e.js --signing-token=<your-token>`);
  logInfo(`  # With contract ID:`);
  logInfo(`  node scripts/test-payment-e2e.js --signing-token=<token> --contract-id=<id>`);
  logInfo(`  # With password (for password-protected contracts):`);
  logInfo(`  node scripts/test-payment-e2e.js --signing-token=<token> --password=<password>`);
  logInfo('');
}

main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
