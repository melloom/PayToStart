#!/usr/bin/env node

/**
 * Script to check deposit payment status
 * Usage: node scripts/check-deposit-status.js <contractId>
 * 
 * This script checks:
 * - Payment records in database
 * - Stripe checkout sessions
 * - Contract status
 * - Where the money went (Stripe account, processing, etc.)
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_MODE === 'live' 
  ? process.env.STRIPE_LIVE_SECRET_KEY 
  : process.env.STRIPE_TEST_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

if (!stripeSecretKey) {
  console.error('❌ Missing Stripe secret key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey);

async function checkDepositStatus(contractId) {
  console.log('\n🔍 Checking Deposit Status for Contract:', contractId);
  console.log('=' .repeat(60));

  try {
    // 1. Get contract from database
    console.log('\n📄 Step 1: Fetching contract from database...');
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      console.error('❌ Contract not found:', contractError?.message);
      return;
    }

    console.log('✅ Contract found:');
    console.log(`   Title: ${contract.title}`);
    console.log(`   Status: ${contract.status}`);
    console.log(`   Total Amount: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
    console.log(`   Deposit Amount: $${parseFloat(contract.deposit_amount || 0).toFixed(2)}`);
    console.log(`   Paid At: ${contract.paid_at || 'Not paid'}`);

    // 2. Get payments from database
    console.log('\n💰 Step 2: Checking payment records in database...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError.message);
    } else {
      console.log(`✅ Found ${payments.length} payment record(s):`);
      payments.forEach((payment, index) => {
        console.log(`\n   Payment ${index + 1}:`);
        console.log(`   - ID: ${payment.id}`);
        console.log(`   - Amount: $${parseFloat(payment.amount || 0).toFixed(2)}`);
        console.log(`   - Status: ${payment.status}`);
        console.log(`   - Payment Intent ID: ${payment.payment_intent_id || 'N/A'}`);
        console.log(`   - Created At: ${payment.created_at}`);
        console.log(`   - Completed At: ${payment.completed_at || 'Not completed'}`);
      });
    }

    // 3. Check Stripe for checkout sessions
    console.log('\n💳 Step 3: Checking Stripe checkout sessions...');
    if (payments && payments.length > 0) {
      for (const payment of payments) {
        if (payment.payment_intent_id) {
          try {
            // Try to retrieve as checkout session first
            let session = null;
            try {
              session = await stripe.checkout.sessions.retrieve(payment.payment_intent_id);
              console.log(`\n   ✅ Found Stripe Checkout Session: ${session.id}`);
              console.log(`   - Status: ${session.payment_status}`);
              console.log(`   - Amount: $${(session.amount_total / 100).toFixed(2)}`);
              console.log(`   - Currency: ${session.currency}`);
              console.log(`   - Customer Email: ${session.customer_details?.email || 'N/A'}`);
              console.log(`   - Payment Intent: ${session.payment_intent || 'N/A'}`);
              
              if (session.payment_intent) {
                const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
                console.log(`\n   📊 Payment Intent Details:`);
                console.log(`   - Status: ${paymentIntent.status}`);
                console.log(`   - Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
                console.log(`   - Currency: ${paymentIntent.currency}`);
                
                if (paymentIntent.latest_charge) {
                  const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
                  console.log(`\n   💵 Charge Details:`);
                  console.log(`   - Status: ${charge.status}`);
                  console.log(`   - Amount: $${(charge.amount / 100).toFixed(2)}`);
                  console.log(`   - Paid: ${charge.paid ? 'Yes ✅' : 'No ❌'}`);
                  console.log(`   - Refunded: ${charge.refunded ? 'Yes ⚠️' : 'No'}`);
                  console.log(`   - Balance Transaction: ${charge.balance_transaction || 'N/A'}`);
                  
                  if (charge.balance_transaction) {
                    const balanceTx = await stripe.balanceTransactions.retrieve(charge.balance_transaction);
                    console.log(`\n   🏦 Balance Transaction:`);
                    console.log(`   - Amount: $${(balanceTx.amount / 100).toFixed(2)}`);
                    console.log(`   - Fee: $${(balanceTx.fee / 100).toFixed(2)}`);
                    console.log(`   - Net: $${(balanceTx.net / 100).toFixed(2)}`);
                    console.log(`   - Status: ${balanceTx.status}`);
                    console.log(`   - Type: ${balanceTx.type}`);
                    console.log(`   - Available On: ${new Date(balanceTx.available_on * 1000).toLocaleDateString()}`);
                    
                    if (balanceTx.status === 'available') {
                      console.log(`\n   ✅ MONEY STATUS: Available in your Stripe account!`);
                      console.log(`   💰 Net amount after fees: $${(balanceTx.net / 100).toFixed(2)}`);
                    } else if (balanceTx.status === 'pending') {
                      console.log(`\n   ⏳ MONEY STATUS: Pending - will be available on ${new Date(balanceTx.available_on * 1000).toLocaleDateString()}`);
                    }
                  }
                }
              }
            } catch (sessionError) {
              // Not a checkout session, try payment intent
              try {
                const paymentIntent = await stripe.paymentIntents.retrieve(payment.payment_intent_id);
                console.log(`\n   ✅ Found Stripe Payment Intent: ${paymentIntent.id}`);
                console.log(`   - Status: ${paymentIntent.status}`);
                console.log(`   - Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
                
                if (paymentIntent.latest_charge) {
                  const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
                  console.log(`   - Charge Status: ${charge.status}`);
                  console.log(`   - Paid: ${charge.paid ? 'Yes ✅' : 'No ❌'}`);
                }
              } catch (piError) {
                console.log(`   ⚠️  Could not find in Stripe: ${payment.payment_intent_id}`);
                console.log(`   Error: ${piError.message}`);
              }
            }
          } catch (error) {
            console.error(`   ❌ Error checking Stripe: ${error.message}`);
          }
        }
      }
    } else {
      console.log('   ⚠️  No payment records found in database');
    }

    // 4. Calculate payment summary
    console.log('\n📊 Step 4: Payment Summary');
    console.log('=' .repeat(60));
    const totalPaid = payments
      ?.filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
    const remainingBalance = parseFloat(contract.total_amount || 0) - totalPaid;
    
    console.log(`\n   Total Contract Amount: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
    console.log(`   Deposit Required: $${parseFloat(contract.deposit_amount || 0).toFixed(2)}`);
    console.log(`   Total Paid: $${totalPaid.toFixed(2)}`);
    console.log(`   Remaining Balance: $${remainingBalance.toFixed(2)}`);
    
    if (totalPaid >= parseFloat(contract.deposit_amount || 0)) {
      console.log(`\n   ✅ Deposit has been paid!`);
    } else {
      console.log(`\n   ⚠️  Deposit not fully paid yet`);
    }

    // 5. Check contract events
    console.log('\n📝 Step 5: Checking contract events...');
    const { data: events, error: eventsError } = await supabase
      .from('contract_events')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (eventsError) {
      console.error('   ❌ Error fetching events:', eventsError.message);
    } else {
      console.log(`   ✅ Found ${events.length} recent event(s):`);
      events.forEach(event => {
        if (event.event_type === 'payment_completed' || event.event_type === 'paid') {
          console.log(`   - ${event.event_type} at ${event.created_at}`);
        }
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Check complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Get contract ID from command line
const contractId = process.argv[2];

if (!contractId) {
  console.error('❌ Please provide a contract ID');
  console.error('Usage: node scripts/check-deposit-status.js <contractId>');
  process.exit(1);
}

checkDepositStatus(contractId).catch(console.error);
