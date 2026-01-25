# Stripe Environment Variables

## Required Environment Variables

Add these to your `.env.local` file:

### Test Mode (Default)
```bash
# Stripe Mode: "test" or "live" (defaults to "test" if not set)
STRIPE_MODE=test

# Test Mode Keys
STRIPE_TEST_SECRET_KEY=sk_test_your_test_secret_key_here
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_TEST_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here
```

### Live Mode (Production)
```bash
# Stripe Mode: "test" or "live"
STRIPE_MODE=live

# Live Mode Keys
STRIPE_LIVE_SECRET_KEY=sk_live_your_live_secret_key_here
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_LIVE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
```

### Optional: Pre-created Price IDs
```bash
# Optional: Pre-created Stripe Price IDs (if not set, prices created dynamically)
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
```

## How It Works

1. **Mode Selection**: Set `STRIPE_MODE=test` or `STRIPE_MODE=live` to switch between modes
2. **Default**: If `STRIPE_MODE` is not set, it defaults to `test` mode
3. **Automatic Key Selection**: The code automatically uses the correct keys based on the mode

## Getting Your Keys

### Test Keys (for development)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your test keys (they start with `sk_test_` and `pk_test_`)

### Live Keys (for production)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your live keys (they start with `sk_live_` and `pk_live_`)

### Webhook Secrets
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Create a webhook endpoint
3. Copy the signing secret (starts with `whsec_`)
4. Use different webhooks for test and live modes

## Example .env.local

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration - Test Mode
STRIPE_MODE=test
STRIPE_TEST_SECRET_KEY=sk_test_51AbC123...
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_51AbC123...
STRIPE_TEST_WEBHOOK_SECRET=whsec_test_123...

# Optional: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```



