# Stripe Subscription Setup Guide

This guide walks you through setting up Stripe subscriptions for Pay2Start.

## Prerequisites

1. Stripe account (sign up at https://stripe.com)
2. Stripe API keys (found in Stripe Dashboard → Developers → API keys)
3. Webhook endpoint configured

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_`) → Add to `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (starts with `sk_`) → Add to `.env.local` as `STRIPE_SECRET_KEY`

## Step 2: Create Products in Stripe Dashboard

### Option A: Create via Stripe Dashboard (Recommended for Testing)

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**

#### Starter Plan ($29/month)
- **Name**: `Starter Plan`
- **Description**: `7 days free, then $29.00 per month. Pay2Start Starter subscription - 2 templates, 20 contracts/month, Click to Sign, Email Delivery, Basic Support`
- **Pricing**: 
  - **Price**: `$29.00`
  - **Billing period**: `Monthly`
  - **Recurring**: ✅ Yes
  - **Trial period**: `7 days` (configure in Stripe Dashboard)
- Click **Save product**
- **Copy the Price ID** (starts with `price_`) - you'll need this

#### Pro Plan ($79/month)
- **Name**: `Pro Plan`
- **Description**: `7 days free, then $79.00 per month. Pay2Start Pro subscription - Unlimited templates, Unlimited contracts, SMS Reminders, File Attachments, Custom Branding, Download All Contracts, Priority Support`
- **Pricing**:
  - **Price**: `$79.00`
  - **Billing period**: `Monthly`
  - **Recurring**: ✅ Yes
  - **Trial period**: `7 days` (configure in Stripe Dashboard)
- Click **Save product**
- **Copy the Price ID**

#### Premium Plan ($149/month)
- **Name**: `Premium Plan`
- **Description**: `7 days free, then $149.00 per month. Pay2Start Premium subscription - Everything in Pro, plus: Dropbox Sign Integration, DocuSign Integration, Multi-user Team Roles, Stripe Connect Payouts, Dedicated Support, Custom Integrations`
- **Pricing**:
  - **Price**: `$149.00`
  - **Billing period**: `Monthly`
  - **Recurring**: ✅ Yes
  - **Trial period**: `7 days` (configure in Stripe Dashboard)
- Click **Save product**
- **Copy the Price ID**

### Option B: Create via Script (Recommended)

We've created a script to automatically create products and prices in Stripe:

1. **Make sure your `.env.local` has `STRIPE_SECRET_KEY` set**

2. **Run the script**:
   ```bash
   node scripts/create-stripe-products.js
   ```

3. **Copy the Price IDs** it outputs and add to `.env.local`:
   ```env
   STRIPE_STARTER_PRICE_ID=price_xxxxx
   STRIPE_PRO_PRICE_ID=price_xxxxx
   STRIPE_PREMIUM_PRICE_ID=price_xxxxx
   ```

4. **Restart your server** - The code will now use pre-created prices instead of creating them dynamically.

**Note**: 
- The script automatically reads from `.env.local` (no extra dependencies needed)
- If you run it multiple times, it will create duplicate products (Stripe allows this). You can delete duplicates from the Stripe Dashboard
- The script works in both test and live mode depending on your `STRIPE_SECRET_KEY`

### Option C: Create via API (Fallback)

The current code can also create prices dynamically using `price_data` in the checkout session if Price IDs are not set. This works but pre-creating products is better for management.

## Step 3: Set Up Webhook Endpoint

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - For local development: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks
4. **Events to send**: Select these events (recommended for full subscription management):
   
   **Required Events** (currently handled):
   - `checkout.session.completed` - When checkout completes (subscriptions & payments)
   - `customer.subscription.created` - When subscription is first created
   - `customer.subscription.updated` - When subscription changes (upgrade/downgrade)
   - `customer.subscription.deleted` - When subscription is cancelled
   - `payment_intent.payment_failed` - When payment fails
   - `charge.refunded` - When a charge is refunded
   
   **Recommended Additional Events** (for better subscription management):
   - `invoice.payment_succeeded` - When subscription payment succeeds
   - `invoice.payment_failed` - When subscription payment fails (retry logic)
   - `customer.subscription.trial_will_end` - 3 days before trial ends (send reminder)
   - `invoice.upcoming` - 7 days before next invoice (send notification)
   - `customer.subscription.paused` - When subscription is paused
   - `customer.subscription.resumed` - When subscription is resumed
   - `invoice.created` - When invoice is created (for tracking)
   
   **Optional Events** (for advanced features):
   - `customer.updated` - When customer info changes
   - `payment_method.attached` - When payment method is added
   - `payment_method.detached` - When payment method is removed

5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_`) → Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**Note**: The webhook handler currently processes the "Required Events" above. Additional events can be added to the handler as needed for enhanced features like trial reminders, payment retry logic, etc.

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Test the Integration

### Using Stripe Test Mode

1. Make sure you're in **Test mode** (toggle in Stripe Dashboard)
2. Use test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`
   - Any future expiry date (e.g., `12/34`)
   - Any 3-digit CVC

### Testing Locally with Webhooks

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copy the webhook signing secret it provides
5. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`

## Step 6: Verify the Setup

1. Go to `/signup` on your app
2. Select a paid plan (Starter, Pro, or Premium)
3. Fill out the form
4. You should be redirected to Stripe Checkout
5. Use test card `4242 4242 4242 4242`
6. Complete the payment
7. Check Stripe Dashboard → **Customers** to see the new customer
8. Check **Subscriptions** to see the active subscription
9. Check your database to verify the subscription was saved

## Step 7: Production Setup

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your **live** API keys
3. Update environment variables with live keys
4. Update webhook endpoint to production URL
5. Test with real card (use your own card with small amount)
6. Monitor webhook events in Stripe Dashboard

## Current Implementation Details

The code currently uses **dynamic price creation** in checkout sessions. This means:
- Prices are created on-the-fly when checkout sessions are created
- No need to pre-create products in Stripe Dashboard
- Prices are defined in `lib/types.ts` in `TIER_CONFIG`

### To Switch to Pre-created Products (Optional)

If you want to use pre-created products instead:

1. Create products in Stripe Dashboard (Step 2)
2. Update `app/api/auth/signup-with-subscription/route.ts`:
   - Replace `price_data` with `price: 'price_xxxxx'` (use your Price IDs)
3. Update `app/api/subscriptions/create-checkout/route.ts` similarly

## Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is correct
- Verify webhook secret matches
- Check Stripe Dashboard → Webhooks → Recent events for errors
- Use Stripe CLI for local testing

### Subscription Not Activating
- Check webhook handler logs
- Verify `checkout.session.completed` event is being processed
- Check database to see if subscription fields are being updated
- Verify company ID and metadata are correct

### Payment Failing
- Check card number is valid test card
- Verify Stripe keys are correct (test vs live)
- Check Stripe Dashboard → Payments for error details

## Additional Resources

- [Stripe Subscriptions Documentation](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

