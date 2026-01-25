# Quick Test: 7-Day Free Trial

## Quick Test Steps

### 1. Test Trial Creation
```bash
# In your browser console or via API:
# 1. Sign up for a new account (or use account that hasn't used trial)
# 2. Add payment method: 4242 4242 4242 4242 (test card)
# 3. Subscribe to Starter/Pro/Premium plan
# 4. Check Stripe Dashboard - subscription should show:
#    - Status: "trialing"
#    - Trial end: 7 days from now
```

### 2. Test Trial End (Using Stripe Dashboard)
1. Go to Stripe Dashboard → Customers
2. Find your test customer
3. Click on the subscription
4. Click "..." → "Update subscription"
5. Set `trial_end` to 1 minute from now (or in the past)
6. Save
7. Wait 1-2 minutes
8. Check:
   - Subscription status should change to "active"
   - Invoice should be created
   - Card should be charged
   - Database should update

### 3. Verify in Database
```sql
-- Check subscription status
SELECT 
  id,
  subscription_tier,
  subscription_status,
  subscription_stripe_subscription_id,
  trial_end,
  subscription_current_period_end
FROM companies
WHERE subscription_stripe_subscription_id = 'sub_xxxxx';
```

### 4. Check Webhook Logs
- Go to Stripe Dashboard → Developers → Webhooks
- Check recent events:
  - `customer.subscription.updated` (trial ended)
  - `invoice.payment_succeeded` (card charged)

## Expected Behavior

✅ **Trial Creation:**
- Trial period: Exactly 7 days (604,800 seconds)
- Subscription status: "trialing"
- No charge during trial

✅ **Trial End:**
- Stripe automatically charges card
- Subscription status: "trialing" → "active"
- Invoice created and paid
- Database updated with correct tier

✅ **After Trial:**
- User has full access to selected tier
- Next billing date set to 1 month from trial end
- User receives payment confirmation email

## Test Cards

- **Success:** `4242 4242 4242 4242` (any future date, any CVC)
- **Decline:** `4000 0000 0000 0002`
- **Insufficient Funds:** `4000 0000 0000 9995`

## Troubleshooting

**Trial not ending?**
- Check webhook is configured: Stripe Dashboard → Webhooks
- Verify webhook secret in `.env.local`
- Check webhook endpoint is accessible

**Card not charged?**
- Verify default payment method is set
- Check payment method is valid
- Review Stripe Dashboard for payment errors

**Database not updating?**
- Check webhook logs in Stripe Dashboard
- Verify webhook secret matches
- Check server logs for errors
