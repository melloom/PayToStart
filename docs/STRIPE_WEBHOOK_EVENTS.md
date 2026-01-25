# Stripe Webhook Events Configuration

## Required Events (Currently Handled)

These events are **required** and are already handled by the webhook handler:

### 1. **checkout.session.completed** ✅
- **When**: After a successful checkout (subscriptions or one-time payments)
- **What it does**: 
  - Creates/updates subscription for subscription checkouts
  - Processes contract payments for one-time payments
  - Marks `planSelected: true` for subscriptions
- **Critical**: Yes - Required for subscriptions and payments to work

### 2. **customer.subscription.created** ✅
- **When**: When a subscription is first created in Stripe
- **What it does**: 
  - Updates company with subscription details
  - Sets subscription tier and status
  - Marks `planSelected: true`
- **Critical**: Yes - Required for subscription creation

### 3. **customer.subscription.updated** ✅
- **When**: When subscription changes (upgrade, downgrade, trial ends, etc.)
- **What it does**: 
  - Updates subscription status and tier
  - Handles trial-to-active transition
  - Updates billing period dates
- **Critical**: Yes - Required for subscription changes

### 4. **customer.subscription.deleted** ✅
- **When**: When subscription is cancelled/deleted
- **What it does**: 
  - Downgrades company to "free" tier
  - Clears subscription data
- **Critical**: Yes - Required for subscription cancellation

### 5. **payment_intent.payment_failed** ✅
- **When**: When a payment attempt fails
- **What it does**: 
  - Marks payment as failed in database
  - Updates contract payment status
- **Critical**: Recommended - For payment failure handling

### 6. **charge.refunded** ✅
- **When**: When a charge is refunded
- **What it does**: 
  - Logs refund information
  - Can be extended to update contract status
- **Critical**: Optional - For refund tracking

## Recommended Additional Events

These events are **recommended** for better subscription management (not currently handled, but can be added):

### 7. **invoice.payment_succeeded**
- **When**: When subscription payment succeeds
- **Use case**: Confirm recurring payment success, send receipts
- **Priority**: High

### 8. **invoice.payment_failed**
- **When**: When subscription payment fails
- **Use case**: Handle failed recurring payments, send notifications, retry logic
- **Priority**: High

### 9. **customer.subscription.trial_will_end**
- **When**: 3 days before trial ends
- **Use case**: Send reminder emails, prompt for payment method
- **Priority**: Medium

### 10. **invoice.upcoming**
- **When**: 7 days before next invoice
- **Use case**: Send billing reminders
- **Priority**: Medium

### 11. **customer.subscription.paused**
- **When**: Subscription is paused
- **Use case**: Update subscription status
- **Priority**: Low

### 12. **customer.subscription.resumed**
- **When**: Subscription is resumed
- **Use case**: Update subscription status
- **Priority**: Low

## How to Configure in Stripe Dashboard

### For Test Mode:
1. Go to [Stripe Dashboard → Webhooks (Test Mode)](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. **Select events to listen to** - Choose:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
   - (Optional) `invoice.payment_succeeded`
   - (Optional) `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to `.env.local` as `STRIPE_TEST_WEBHOOK_SECRET`

### For Live Mode:
1. Go to [Stripe Dashboard → Webhooks (Live Mode)](https://dashboard.stripe.com/webhooks)
2. Follow the same steps as above
3. Add to `.env.local` as `STRIPE_LIVE_WEBHOOK_SECRET`

## Local Development

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret that starts with `whsec_` - use this for `STRIPE_TEST_WEBHOOK_SECRET` in development.

## Event Flow

### Subscription Flow:
1. User clicks "Upgrade" → Creates checkout session
2. User completes payment → `checkout.session.completed` fires
3. Stripe creates subscription → `customer.subscription.created` fires
4. Trial ends → `customer.subscription.updated` fires (status: trialing → active)
5. User cancels → `customer.subscription.deleted` fires

### Payment Flow:
1. User pays for contract → `checkout.session.completed` fires
2. Payment fails → `payment_intent.payment_failed` fires
3. Refund issued → `charge.refunded` fires

## Testing Webhooks

### Using Stripe CLI:
```bash
# Test checkout.session.completed
stripe trigger checkout.session.completed

# Test customer.subscription.created
stripe trigger customer.subscription.created

# Test customer.subscription.updated
stripe trigger customer.subscription.updated
```

### Using Stripe Dashboard:
1. Go to Webhooks → Your endpoint
2. Click "Send test webhook"
3. Select event type
4. Click "Send test webhook"

## Summary

**Minimum Required Events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Recommended for Production:**
- Add `invoice.payment_succeeded`
- Add `invoice.payment_failed`
- Add `customer.subscription.trial_will_end`



