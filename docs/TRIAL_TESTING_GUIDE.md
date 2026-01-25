# 7-Day Free Trial Testing Guide

This guide explains how the 7-day free trial works and how to test it.

## How the 7-Day Trial Works

### 1. Trial Creation
- When a user subscribes to a paid plan (Starter, Pro, or Premium), a 7-day trial is automatically added if they haven't used one before
- Trial period is calculated as: `7 days * 24 hours * 60 minutes * 60 seconds = 604,800 seconds`
- Stripe automatically handles the trial period and will charge the card when the trial ends

### 2. Trial Period
- During the trial, the subscription status is `"trialing"` in Stripe
- User has full access to all features of their selected tier
- No charge is made during the trial period
- User receives email notification 3 days before trial ends (via `customer.subscription.trial_will_end` webhook)

### 3. Trial End & Charging
- When the 7-day trial ends, Stripe automatically:
  1. Attempts to charge the default payment method
  2. Changes subscription status from `"trialing"` to `"active"`
  3. Sends `customer.subscription.updated` webhook event
  4. If payment succeeds, sends `invoice.payment_succeeded` webhook event
  5. If payment fails, sends `invoice.payment_failed` webhook event

### 4. Webhook Events
The system handles these Stripe webhook events:
- `customer.subscription.created` - Subscription created with trial
- `customer.subscription.updated` - Trial ended, subscription now active
- `invoice.payment_succeeded` - Card charged successfully after trial
- `invoice.payment_failed` - Card charge failed after trial
- `customer.subscription.trial_will_end` - Notification 3 days before trial ends

## Testing the Trial

### Prerequisites
1. Stripe test mode enabled (`STRIPE_MODE=test`)
2. Stripe test keys configured
3. Webhook endpoint configured in Stripe Dashboard
4. Test card numbers available

### Test Scenario 1: Successful Trial → Charge

**Steps:**
1. Create a new account or use an account that hasn't used a trial
2. Add a payment method (use test card: `4242 4242 4242 4242`)
3. Subscribe to a plan (Starter, Pro, or Premium)
4. Verify subscription status is `"trialing"` in Stripe Dashboard
5. Verify trial end date is 7 days from subscription creation
6. Wait for trial to end (or use Stripe CLI to simulate trial end)
7. Verify:
   - Subscription status changes to `"active"`
   - Invoice is created and paid
   - Card is charged
   - Database is updated correctly
   - User receives payment success email

**Expected Results:**
- ✅ Subscription created with `trial_end` set to 7 days from now
- ✅ Subscription status is `"trialing"` during trial
- ✅ After 7 days, subscription becomes `"active"`
- ✅ Card is charged automatically
- ✅ Database `subscriptionTier` is updated to selected tier
- ✅ User receives payment confirmation email

### Test Scenario 2: Trial with Payment Failure

**Steps:**
1. Create subscription with a card that will fail (use test card: `4000 0000 0000 0002`)
2. Wait for trial to end
3. Verify:
   - Payment attempt fails
   - Subscription status may become `"past_due"` or `"unpaid"`
   - User receives payment failed email
   - User can update payment method

**Expected Results:**
- ✅ Trial ends after 7 days
- ✅ Payment attempt fails
- ✅ User receives payment failed notification
- ✅ User can update payment method and retry

### Test Scenario 3: Trial Already Used

**Steps:**
1. Create an account that has already used a trial (has `trialEnd` in past or `subscriptionTier !== "free"`)
2. Try to subscribe to a plan
3. Verify no trial is added

**Expected Results:**
- ✅ No trial period added
- ✅ Subscription starts immediately
- ✅ Card is charged right away

## Using Stripe CLI to Test (Recommended)

Stripe CLI allows you to simulate webhook events and test trial expiration without waiting 7 days.

### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe CLI
```bash
stripe login
```

### Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Simulate Trial End
```bash
# Trigger subscription update (trial ending)
stripe trigger customer.subscription.updated

# Or manually update subscription in Stripe Dashboard:
# 1. Go to subscription
# 2. Click "..." menu
# 3. Select "Update subscription"
# 4. Change trial_end to current time
# 5. Save
```

### Test Payment After Trial
```bash
# Trigger invoice payment succeeded
stripe trigger invoice.payment_succeeded

# Or trigger payment failed
stripe trigger invoice.payment_failed
```

## Manual Testing in Stripe Dashboard

### Method 1: Update Trial End Date
1. Go to Stripe Dashboard → Customers → Select customer
2. Find the subscription
3. Click "..." → "Update subscription"
4. Set `trial_end` to a time in the past (e.g., 1 minute ago)
5. Save
6. Stripe will immediately:
   - End the trial
   - Attempt to charge the card
   - Send webhook events

### Method 2: Use Test Clock (Advanced)
1. Create a test clock in Stripe Dashboard
2. Attach customer to test clock
3. Fast-forward time to trial end date
4. Stripe will automatically process trial end and payment

## Verification Checklist

After testing, verify:

- [ ] Trial period is exactly 7 days (604,800 seconds)
- [ ] Subscription status is `"trialing"` during trial
- [ ] Trial end date is correctly set in database
- [ ] Webhook receives `customer.subscription.updated` when trial ends
- [ ] Subscription status changes to `"active"` after trial
- [ ] Card is charged when trial ends
- [ ] `invoice.payment_succeeded` webhook is received
- [ ] Database `subscriptionTier` is updated correctly
- [ ] Database `subscriptionStatus` is updated to `"active"`
- [ ] User receives payment success email
- [ ] Payment amount is correct for the tier
- [ ] Next billing date is set correctly (1 month from trial end)

## Code Verification

### Trial Period Calculation
```typescript
// In app/api/subscriptions/create-checkout/route.ts
const trialEnd = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days from now
```
✅ This calculates: Current time + 7 days in Unix timestamp

### Trial Check
```typescript
// Check if user has used trial
const hasUsedTrial = company.subscriptionTier !== "free" || 
  (company.trialEnd && new Date(company.trialEnd) < new Date());
```
✅ This correctly identifies if user has used a trial

### Webhook Handling
```typescript
// In app/api/stripe/webhook/route.ts
// When subscription.updated event is received:
const wasTrialing = company.subscriptionStatus === "trialing";
const isNowActive = subscription.status === "active";
const shouldUpdateTier = wasTrialing && isNowActive && tier;
```
✅ This correctly detects when trial ends and subscription becomes active

## Common Issues & Fixes

### Issue: Trial not ending after 7 days
**Fix:** Check webhook is configured correctly in Stripe Dashboard

### Issue: Card not being charged
**Fix:** 
- Verify default payment method is set
- Check payment method is valid
- Verify webhook is receiving `invoice.payment_succeeded` event

### Issue: Database not updating after trial
**Fix:**
- Check webhook endpoint is accessible
- Verify webhook secret is correct
- Check database connection
- Review webhook logs for errors

## Test Cards for Stripe

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Insufficient Funds:** `4000 0000 0000 9995`
- **Expired Card:** `4000 0000 0000 0069`

Use any future expiry date and any 3-digit CVC.

## Monitoring

Monitor these in production:
- Trial creation rate
- Trial-to-paid conversion rate
- Payment success rate after trial
- Payment failure rate after trial
- Average time to first payment

---

**Last Updated:** December 2024
