/**
 * Script to create Stripe products and prices
 * Run this once to set up your subscription products in Stripe
 * 
 * Usage:
 *   node scripts/create-stripe-products.js
 * 
 * Make sure STRIPE_SECRET_KEY is set in your environment or .env.local file
 */

const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = [
  {
    name: 'Starter Plan',
    description: '7 days free, then $29.00 per month. Pay2Start Starter subscription - 2 templates, 20 contracts/month, Click to Sign, Email Delivery, Basic Support',
    price: 2900, // $29.00 in cents
    tier: 'starter',
  },
  {
    name: 'Pro Plan',
    description: '7 days free, then $79.00 per month. Pay2Start Pro subscription - Unlimited templates, Unlimited contracts, SMS Reminders, File Attachments, Custom Branding, Download All Contracts, Priority Support',
    price: 7900, // $79.00 in cents
    tier: 'pro',
  },
  {
    name: 'Premium Plan',
    description: '7 days free, then $149.00 per month. Pay2Start Premium subscription - Everything in Pro, plus: Dropbox Sign Integration, DocuSign Integration, Multi-user Team Roles, Stripe Connect Payouts, Dedicated Support, Custom Integrations',
    price: 14900, // $149.00 in cents
    tier: 'premium',
  },
];

async function createProducts() {
  console.log('🚀 Creating Stripe products and prices...\n');

  const results = {};

  for (const product of PRODUCTS) {
    try {
      // Create product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          tier: product.tier,
        },
      });

      console.log(`✅ Created product: ${product.name} (${stripeProduct.id})`);

      // Create price for the product
      const price = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          tier: product.tier,
        },
      });

      console.log(`✅ Created price: $${product.price / 100}/month (${price.id})\n`);

      results[product.tier] = {
        productId: stripeProduct.id,
        priceId: price.id,
        name: product.name,
        price: product.price / 100,
      };
    } catch (error) {
      console.error(`❌ Error creating ${product.name}:`, error.message);
    }
  }

  console.log('\n📋 Summary:');
  console.log('='.repeat(60));
  console.log('\nAdd these to your .env.local file:\n');
  
  for (const [tier, data] of Object.entries(results)) {
    console.log(`STRIPE_${tier.toUpperCase()}_PRICE_ID=${data.priceId}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Done! Products and prices created successfully.');
  console.log('\nNext steps:');
  console.log('1. Copy the Price IDs above to your .env.local file');
  console.log('2. Restart your development server');
  console.log('3. Test the signup flow with a paid plan');

  return results;
}

// Run the script
if (require.main === module) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Error: STRIPE_SECRET_KEY not found in environment');
    console.error('Make sure you have .env.local file with STRIPE_SECRET_KEY set');
    process.exit(1);
  }

  createProducts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createProducts };

