# Stripe Live Mode Configuration

## Important: Test Cards Cannot Be Used in Live Mode

When `STRIPE_MODE=live`, you **must** use real credit cards. Test cards (like `4242 4242 4242 4242`) will be declined with the error:

> "Your card was declined. Your request was in live mode, but used a known test card."

## Production Setup

### 1. Set Environment Variables

In your production environment (Vercel), set:

```env
STRIPE_MODE=live
STRIPE_LIVE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...
```

### 2. Verify Keys Are Live Keys

- **Secret Key**: Must start with `sk_live_`
- **Publishable Key**: Must start with `pk_live_`
- **Webhook Secret**: Must be from Live Mode webhook endpoint

### 3. Test Mode vs Live Mode

| Mode | Use Case | Cards Accepted |
|------|----------|----------------|
| **Test** (`STRIPE_MODE=test`) | Development, Testing | Test cards (4242 4242 4242 4242) |
| **Live** (`STRIPE_MODE=live`) | Production | Real credit cards only |

## Common Issues

### Issue: "Test card used in live mode"

**Cause**: `STRIPE_MODE=live` but trying to use test card `4242 4242 4242 4242`

**Solution**: 
- For testing: Set `STRIPE_MODE=test` and use test cards
- For production: Set `STRIPE_MODE=live` and use real credit cards

### Issue: Wrong keys for mode

**Cause**: `STRIPE_MODE=live` but using `STRIPE_TEST_SECRET_KEY` (starts with `sk_test_`)

**Solution**: Make sure you're using the correct keys:
- Test mode: `STRIPE_TEST_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY`
- Live mode: `STRIPE_LIVE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY`

## Testing in Production

If you need to test payments in production:

1. **Use Stripe's test mode** by setting `STRIPE_MODE=test` temporarily
2. **Use real cards with small amounts** (Stripe will charge but you can refund)
3. **Use Stripe's test mode toggle** in the Stripe Dashboard

## Verification

To verify your setup is correct:

1. Check environment variables in Vercel:
   - `STRIPE_MODE` should be `live` for production
   - Keys should match the mode (live keys for live mode)

2. Check Stripe Dashboard:
   - Go to [API Keys](https://dashboard.stripe.com/apikeys)
   - Make sure you're viewing **Live mode** keys
   - Copy the correct keys to your environment variables

3. Test with a real card:
   - Use a real credit card (your own card with a small amount)
   - Verify the payment goes through
   - Check Stripe Dashboard to see the payment

## Security Notes

- **Never commit live keys to git**
- **Use environment variables** for all keys
- **Rotate keys** if they're ever exposed
- **Use separate webhooks** for test and live modes

