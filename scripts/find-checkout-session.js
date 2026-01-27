#!/usr/bin/env node

/**
 * Find Checkout Session from Payment Intent
 * 
 * This script finds the checkout session ID associated with a payment intent.
 * 
 * Usage:
 *   node scripts/find-checkout-session.js <payment_intent_id>
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

async function findCheckoutSession(paymentIntentId) {
  try {
    // First, retrieve the payment intent
    console.log(`\n🔍 Retrieving payment intent: ${paymentIntentId}...`);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });
    
    console.log(`✅ Payment Intent found:`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Customer: ${paymentIntent.customer || 'N/A'}`);
    
    // Search for checkout sessions with this payment intent
    // We'll search recent checkout sessions
    console.log(`\n🔍 Searching for checkout sessions...`);
    
    const customerId = paymentIntent.customer;
    const limit = 100; // Check last 100 sessions
    
    if (customerId) {
      // Search by customer
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: limit,
      });
      
      // Find session with matching payment intent
      for (const session of sessions.data) {
        const sessionPaymentIntent = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
          
        if (sessionPaymentIntent === paymentIntentId) {
          console.log(`\n✅ Found checkout session!`);
          console.log(`   Session ID: ${session.id}`);
          console.log(`   Status: ${session.payment_status}`);
          console.log(`   Amount: $${(session.amount_total / 100).toFixed(2)}`);
          console.log(`   Created: ${new Date(session.created * 1000).toLocaleString()}`);
          return session.id;
        }
      }
    }
    
    // If not found by customer, search all recent sessions
    console.log(`\n🔍 Searching all recent checkout sessions...`);
    const allSessions = await stripe.checkout.sessions.list({
      limit: limit,
    });
    
    for (const session of allSessions.data) {
      const sessionPaymentIntent = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
        
      if (sessionPaymentIntent === paymentIntentId) {
        console.log(`\n✅ Found checkout session!`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Status: ${session.payment_status}`);
        console.log(`   Amount: $${(session.amount_total / 100).toFixed(2)}`);
        console.log(`   Created: ${new Date(session.created * 1000).toLocaleString()}`);
        return session.id;
      }
    }
    
    console.log(`\n❌ Could not find checkout session for payment intent ${paymentIntentId}`);
    console.log(`\n💡 You can manually find it in Stripe Dashboard:`);
    console.log(`   1. Go to Payments → Checkout Sessions`);
    console.log(`   2. Look for a session with Payment Intent: ${paymentIntentId}`);
    
    return null;
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.type === 'StripeInvalidRequestError') {
      console.error(`   This might not be a valid payment intent ID.`);
    }
    throw error;
  }
}

async function main() {
  const paymentIntentId = process.argv[2];
  
  if (!paymentIntentId) {
    console.error('❌ Please provide a payment intent ID');
    console.log('Usage: node scripts/find-checkout-session.js <payment_intent_id>');
    console.log('\nExample:');
    console.log('  node scripts/find-checkout-session.js pi_3Stw0lIHbb4sBpOc0binUDvp');
    process.exit(1);
  }
  
  if (!paymentIntentId.startsWith('pi_')) {
    console.warn('⚠️  Payment intent ID should start with "pi_" - continuing anyway...');
  }
  
  const sessionId = await findCheckoutSession(paymentIntentId);
  
  if (sessionId) {
    console.log(`\n📋 Next step:`);
    console.log(`   Run: node scripts/process-payment-manually.js ${sessionId}`);
    console.log('');
  }
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
