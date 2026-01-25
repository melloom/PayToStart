# Fix: "No such price" Error

## Problem
You're getting an error: `No such price: 'price_1SnBwPIrr8HXR5S3bFK8oaWS'`

This happens when:
- The price ID in your `.env.local` doesn't exist in Stripe
- The price ID is for the wrong mode (test vs live)
- The price was deleted from Stripe

## Solution

The code now automatically handles this by:
1. **Validating the price ID** before using it
2. **Falling back to dynamic price creation** if the price doesn't exist
3. **Logging warnings** so you know when this happens

## Quick Fix Options

### Option 1: Remove Price IDs (Recommended for Testing)
Remove the price ID environment variables from `.env.local`:
```bash
# Comment out or remove these lines:
# STRIPE_STARTER_PRICE_ID=price_1SnBwPIrr8HXR5S3bFK8oaWS
# STRIPE_PRO_PRICE_ID=price_xxxxx
# STRIPE_PREMIUM_PRICE_ID=price_xxxxx
```

The system will automatically create prices dynamically when needed.

### Option 2: Create Correct Price IDs
1. Go to Stripe Dashboard → Products
2. Create products for each tier (or use the script)
3. Copy the correct Price IDs
4. Update `.env.local` with the correct IDs

### Option 3: Use the Create Products Script
```bash
node scripts/create-stripe-products.js
```

This will create products and prices, then output the correct Price IDs to use.

## How It Works Now

1. **If price ID is set**: System validates it exists in Stripe
2. **If price ID is invalid**: System automatically creates a new price
3. **If price ID is not set**: System creates prices dynamically

You'll see warnings in the console if price IDs are invalid, but the system will continue working.

## Verification

After the fix, when you upgrade:
- ✅ No more "No such price" errors
- ✅ Prices are created automatically if needed
- ✅ Subscription creation works smoothly
- ✅ Trial period is still applied correctly

---

**The error is now handled gracefully!** The system will work even with invalid price IDs.
