#!/usr/bin/env node

/**
 * Verify Payment Intent Processing
 * 
 * This script checks if a payment intent has been processed in the database.
 * 
 * Usage:
 *   node scripts/verify-payment-intent.js <payment_intent_id>
 */

// Try to load .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.warn('⚠️  dotenv not found. Make sure environment variables are set manually.');
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPaymentIntent(paymentIntentId) {
  console.log(`\n🔍 Verifying payment intent: ${paymentIntentId}\n`);
  
  try {
    // Check if payment exists in database
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_intent_id', paymentIntentId);
    
    if (error) {
      console.error(`❌ Database error: ${error.message}`);
      return;
    }
    
    if (payments && payments.length > 0) {
      console.log(`✅ Payment found in database!`);
      console.log(`\nPayment Details:`);
      payments.forEach((payment, index) => {
        console.log(`\n  Payment ${index + 1}:`);
        console.log(`    ID: ${payment.id}`);
        console.log(`    Contract ID: ${payment.contract_id}`);
        console.log(`    Amount: $${parseFloat(payment.amount).toFixed(2)}`);
        console.log(`    Status: ${payment.status}`);
        console.log(`    Created: ${new Date(payment.created_at).toLocaleString()}`);
        if (payment.completed_at) {
          console.log(`    Completed: ${new Date(payment.completed_at).toLocaleString()}`);
        }
      });
      
      // Get contract info
      if (payments[0].contract_id) {
        const { data: contract } = await supabase
          .from('contracts')
          .select('id, title, status, total_amount, deposit_amount')
          .eq('id', payments[0].contract_id)
          .single();
        
        if (contract) {
          console.log(`\n  Contract Details:`);
          console.log(`    ID: ${contract.id}`);
          console.log(`    Title: ${contract.title || 'N/A'}`);
          console.log(`    Status: ${contract.status}`);
          console.log(`    Total Amount: $${parseFloat(contract.total_amount || 0).toFixed(2)}`);
          console.log(`    Deposit Amount: $${parseFloat(contract.deposit_amount || 0).toFixed(2)}`);
        }
      }
    } else {
      console.log(`❌ Payment NOT found in database.`);
      console.log(`\n💡 This payment needs to be processed.`);
      console.log(`\nTo process it:`);
      console.log(`1. Go to Stripe Dashboard → Developers → Webhooks`);
      console.log(`2. Find your webhook endpoint`);
      console.log(`3. Click "Send test webhook"`);
      console.log(`4. Select "payment_intent.succeeded"`);
      console.log(`5. Enter payment intent ID: ${paymentIntentId}`);
      console.log(`6. Click "Send test webhook"`);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error);
  }
}

async function main() {
  const paymentIntentId = process.argv[2];
  
  if (!paymentIntentId) {
    console.error('❌ Please provide a payment intent ID');
    console.log('Usage: node scripts/verify-payment-intent.js <payment_intent_id>');
    console.log('\nExample:');
    console.log('  node scripts/verify-payment-intent.js pi_3Stw0lIHbb4sBpOc0binUDvp');
    process.exit(1);
  }
  
  await verifyPaymentIntent(paymentIntentId);
  console.log('\n');
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
