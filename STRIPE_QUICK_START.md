# Stripe Subscription Quick Start

## 🚀 Quick Setup (5 Minutes)

### 1. Get Stripe API Keys
1. Go to https://dashboard.stripe.com
2. **Developers** → **API keys**
3. Copy:
   - **Publishable key** (`pk_test_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`

### 2. Add to `.env.local`
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_... (get from step 3)
```

### 3. Set Up Webhook (Local Development)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` secret it shows and add to `.env.local`

### 4. Test It!
1. Go to `/signup`
2. Select a paid plan (Starter, Pro, or Premium)
3. Fill out the form
4. Use test card: `4242 4242 4242 4242`
5. Expiry: Any future date (e.g., `12/34`)
6. CVC: Any 3 digits (e.g., `123`)

## 📋 Products Are Created Automatically

The current code creates subscription products **dynamically** when checkout sessions are created. You don't need to pre-create products in Stripe Dashboard!

**Prices are defined in**: `lib/types.ts` → `TIER_CONFIG`
- Starter: $29/month
- Pro: $79/month  
- Premium: $149/month

## 🔔 Production Webhook Setup

When deploying to production:

1. Go to Stripe Dashboard → **Webhooks**
2. Click **+ Add endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the signing secret → Add to production env vars

## ✅ Verify It Works

After signup with a paid plan:
1. Check Stripe Dashboard → **Customers** (should see new customer)
2. Check **Subscriptions** (should see active subscription)
3. Check your database `companies` table (subscription fields should be updated)

## 🐛 Troubleshooting

**Webhook not working?**
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook secret matches in `.env.local`
- Check Stripe Dashboard → Webhooks → Recent events

**Payment failing?**
- Make sure you're using test card numbers
- Check you're in **Test mode** (toggle in Stripe Dashboard)
- Verify API keys are test keys (`sk_test_` and `pk_test_`)

**Subscription not activating?**
- Check server logs for webhook errors
- Verify webhook events are being received
- Check database to see if subscription fields are being updated

## 📚 Full Documentation

See `STRIPE_SETUP.md` for detailed instructions.


