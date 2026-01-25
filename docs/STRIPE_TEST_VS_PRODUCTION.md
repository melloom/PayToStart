# Stripe Test vs Production Price IDs

## Current Setup

**Your current price IDs are for TEST mode only:**
- `STRIPE_STARTER_PRICE_ID=price_1StOxgIHbb4sBpOcNrxZhpPW`
- `STRIPE_PRO_PRICE_ID=price_1StOxgIHbb4sBpOcGd75GEKu`
- `STRIPE_PREMIUM_PRICE_ID=price_1StOxhIHbb4sBpOcrlcZATEP`

These were created with `STRIPE_MODE=test` and only work in Stripe's test environment.

## Test vs Production

### Test Mode (Current)
- ✅ Safe for development and testing
- ✅ Uses test cards (4242 4242 4242 4242)
- ✅ No real charges
- ✅ Price IDs start with `price_1St...` (test mode)

### Production Mode
- ⚠️ Real charges to real cards
- ⚠️ Requires live Stripe keys
- ⚠️ Different price IDs (will start with `price_1...` but different IDs)

## How to Create Production Price IDs

When you're ready for production:

### Option 1: Create Production Price IDs (Recommended)

1. **Temporarily set production mode:**
   ```bash
   # In .env.local, change:
   STRIPE_MODE=live
   ```

2. **Make sure you have live keys:**
   ```env
   STRIPE_LIVE_SECRET_KEY=sk_live_...
   ```

3. **Run the script again:**
   ```bash
   node scripts/create-stripe-products.js
   ```

4. **Save the production price IDs:**
   - Copy the new price IDs
   - Add them to your production environment (Vercel, etc.)
   - **DO NOT** replace test price IDs in `.env.local` (keep both!)

5. **Switch back to test mode for local dev:**
   ```env
   STRIPE_MODE=test
   ```

### Option 2: Use Different Environment Variables

You can use different variable names for production:

**For Test (.env.local):**
```env
STRIPE_MODE=test
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_STARTER_PRICE_ID=price_1StOxgIHbb4sBpOcNrxZhpPW  # Test price ID
```

**For Production (Vercel/Production env):**
```env
STRIPE_MODE=live
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_STARTER_PRICE_ID=price_1XXXXX...  # Production price ID (different!)
```

## Important Notes

1. **Test and Production are separate:**
   - Test price IDs only work with test keys
   - Production price IDs only work with live keys
   - They are completely separate in Stripe

2. **Keep both sets:**
   - Keep test price IDs for local development
   - Use production price IDs in production environment
   - The system automatically uses the correct ones based on `STRIPE_MODE`

3. **Never mix:**
   - ❌ Don't use test price IDs with live keys
   - ❌ Don't use production price IDs with test keys
   - ✅ Always match: test keys → test prices, live keys → live prices

## Current Status

✅ **You're all set for TEST mode!**
- Test price IDs created
- Test keys configured
- Ready for development and testing

⚠️ **For production:**
- You'll need to create production price IDs when ready
- Use the steps above when deploying to production

---

**TL;DR:** Your current price IDs are for TEST mode only. For production, you'll need to create separate production price IDs using live Stripe keys.
