# Price ID Reuse - How It Works

## Your Question: "Will multiple people buying the same thing create different price IDs?"

### Short Answer:
**Not anymore!** The system now reuses the same price ID for all subscriptions of the same tier.

## How It Works Now

### Before (Old Behavior):
- ❌ Each subscription created a NEW product and price
- ❌ Result: Many duplicate prices in Stripe Dashboard
- ❌ Hard to track and manage

### After (New Behavior):
- ✅ System searches for existing price first
- ✅ Reuses the same price ID if found
- ✅ Only creates new price if none exists
- ✅ All users of the same tier share the same price ID

## The Process

1. **Check Environment Variable First**
   - Looks for `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, etc.
   - If found and valid → uses that price ID

2. **Search for Existing Price**
   - If no price ID in env, searches Stripe for existing product
   - Looks for product named "Starter Plan", "Pro Plan", etc.
   - Finds matching price (same amount, currency, interval)
   - If found → reuses that price ID

3. **Create New Price Only If Needed**
   - Only creates new product/price if nothing found
   - Adds metadata with tier for future searches

## Best Practice: Use the Script

**Recommended approach:**
```bash
node scripts/create-stripe-products.js
```

This creates:
- ✅ One product per tier
- ✅ One price per tier
- ✅ Outputs price IDs to add to `.env.local`

Then all subscriptions use the same shared price IDs!

## Benefits

1. **Clean Stripe Dashboard** - No duplicate products/prices
2. **Easy Tracking** - All subscriptions of same tier grouped together
3. **Better Analytics** - Can see all Starter subscriptions in one place
4. **Efficient** - No unnecessary API calls to create duplicates

## Example

**Scenario:** 10 people subscribe to Starter plan

**Old way:**
- Creates 10 different products
- Creates 10 different prices
- Messy Stripe Dashboard

**New way:**
- Creates 1 product (first time)
- Creates 1 price (first time)
- Reuses same price for all 10 subscriptions
- Clean and organized!

---

**TL;DR:** The system now reuses price IDs automatically. All users buying the same tier share the same price ID. This is normal and correct! 🎉
