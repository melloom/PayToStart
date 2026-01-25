# Stripe Webhook Events for Production

## Complete List of Required Events

Configure these events in your Stripe Dashboard for **both Test and Live modes**.

### ✅ Currently Implemented (REQUIRED)

#### 1. **checkout.session.completed** ⚠️ CRITICAL
- **Purpose**: Handles both subscription signups and one-time contract payments
- **When it fires**: After successful checkout completion
- **What it does**:
  - Creates/updates subscription for subscription checkouts
  - Processes contract payments for one-time payments
  - Marks `planSelected: true` for subscriptions
- **Status**: ✅ Implemented
- **Required**: YES - Core functionality depends on this

#### 2. **customer.subscription.created** ⚠️ CRITICAL
- **Purpose**: Initial subscription creation
- **When it fires**: When a subscription is first created in Stripe
- **What it does**:
  - Updates company with subscription details
  - Sets subscription tier and status
  - Marks `planSelected: true`
- **Status**: ✅ Implemented
- **Required**: YES - Required for subscription creation

#### 3. **customer.subscription.updated** ⚠️ CRITICAL
- **Purpose**: Subscription changes (upgrade, downgrade, trial ends, etc.)
- **When it fires**: When subscription status or details change
- **What it does**:
  - Updates subscription status and tier
  - Handles trial-to-active transition
  - Updates billing period dates
- **Status**: ✅ Implemented
- **Required**: YES - Required for subscription changes

#### 4. **customer.subscription.deleted** ⚠️ CRITICAL
- **Purpose**: Subscription cancellation
- **When it fires**: When subscription is cancelled/deleted
- **What it does**:
  - Downgrades company to "free" tier
  - Clears subscription data
- **Status**: ✅ Implemented
- **Required**: YES - Required for subscription cancellation

#### 5. **payment_intent.payment_failed** ⚠️ RECOMMENDED
- **Purpose**: Handle failed payment attempts
- **When it fires**: When a payment attempt fails
- **What it does**:
  - Marks payment as failed in database
  - Updates contract payment status
- **Status**: ✅ Implemented
- **Required**: RECOMMENDED - For payment failure handling

#### 6. **charge.refunded** ⚠️ OPTIONAL
- **Purpose**: Track refunds
- **When it fires**: When a charge is refunded
- **What it does**:
  - Logs refund information
  - Can be extended to update contract status
- **Status**: ✅ Implemented
- **Required**: OPTIONAL - For refund tracking

---

### ⚠️ Recommended for Production (NOT YET IMPLEMENTED)

These events are **highly recommended** for production but are not currently handled by the webhook. You should still subscribe to them in Stripe, and they will be acknowledged (but not processed) until implemented.

#### 7. **invoice.payment_succeeded** 🔴 HIGH PRIORITY
- **Purpose**: Confirm recurring subscription payments
- **When it fires**: When a subscription invoice payment succeeds
- **Use case**: 
  - Confirm recurring payment success
  - Send payment receipts
  - Update subscription status
- **Status**: ❌ Not implemented
- **Required**: HIGHLY RECOMMENDED
- **Priority**: HIGH - Important for recurring billing

#### 8. **invoice.payment_failed** 🔴 HIGH PRIORITY
- **Purpose**: Handle failed recurring payments
- **When it fires**: When a subscription invoice payment fails
- **Use case**: 
  - Handle failed recurring payments
  - Send notifications to users
  - Implement retry logic
  - Potentially downgrade subscription
- **Status**: ❌ Not implemented
- **Required**: HIGHLY RECOMMENDED
- **Priority**: HIGH - Critical for subscription retention

#### 9. **customer.subscription.trial_will_end** 🟡 MEDIUM PRIORITY
- **Purpose**: Trial ending reminders
- **When it fires**: 3 days before trial ends
- **Use case**: 
  - Send reminder emails
  - Prompt for payment method
  - Encourage conversion
- **Status**: ❌ Not implemented
- **Required**: RECOMMENDED
- **Priority**: MEDIUM - Improves trial conversion

#### 10. **invoice.upcoming** 🟡 MEDIUM PRIORITY
- **Purpose**: Billing reminders
- **When it fires**: 7 days before next invoice
- **Use case**: 
  - Send billing reminders
  - Notify users of upcoming charges
- **Status**: ❌ Not implemented
- **Required**: RECOMMENDED
- **Priority**: MEDIUM - Improves user experience

#### 11. **customer.subscription.paused** 🟢 LOW PRIORITY
- **Purpose**: Handle subscription pauses
- **When it fires**: When subscription is paused
- **Use case**: 
  - Update subscription status in database
  - Potentially restrict access
- **Status**: ❌ Not implemented
- **Required**: OPTIONAL
- **Priority**: LOW - Nice to have

#### 12. **customer.subscription.resumed** 🟢 LOW PRIORITY
- **Purpose**: Handle subscription resumption
- **When it fires**: When subscription is resumed
- **Use case**: 
  - Update subscription status in database
  - Restore access
- **Status**: ❌ Not implemented
- **Required**: OPTIONAL
- **Priority**: LOW - Nice to have

---

## Production Configuration Checklist

### Step 1: Configure Test Mode Webhooks

1. Go to [Stripe Dashboard → Webhooks (Test Mode)](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
4. **Select ALL events** (use "Select all events" or manually select):

   **Required Events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`

   **Recommended Events:**
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.trial_will_end`
   - ✅ `invoice.upcoming`
   - ✅ `customer.subscription.paused` (optional)
   - ✅ `customer.subscription.resumed` (optional)

5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your environment variables as `STRIPE_TEST_WEBHOOK_SECRET`

### Step 2: Configure Live Mode Webhooks

1. Go to [Stripe Dashboard → Webhooks (Live Mode)](https://dashboard.stripe.com/webhooks)
2. Follow the same steps as Test Mode
3. Add the signing secret as `STRIPE_LIVE_WEBHOOK_SECRET`

### Step 3: Environment Variables

Make sure you have these in your production environment:

```env
# Stripe Mode (test or live)
STRIPE_MODE=live

# Test Mode Keys (for testing)
STRIPE_TEST_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_TEST_WEBHOOK_SECRET=whsec_...

# Live Mode Keys (for production)
STRIPE_LIVE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...
```

---

## Quick Reference: Event Summary

| Event | Status | Priority | Required |
|-------|--------|----------|----------|
| `checkout.session.completed` | ✅ Implemented | CRITICAL | YES |
| `customer.subscription.created` | ✅ Implemented | CRITICAL | YES |
| `customer.subscription.updated` | ✅ Implemented | CRITICAL | YES |
| `customer.subscription.deleted` | ✅ Implemented | CRITICAL | YES |
| `payment_intent.payment_failed` | ✅ Implemented | RECOMMENDED | RECOMMENDED |
| `charge.refunded` | ✅ Implemented | OPTIONAL | OPTIONAL |
| `invoice.payment_succeeded` | ❌ Not implemented | HIGH | HIGHLY RECOMMENDED |
| `invoice.payment_failed` | ❌ Not implemented | HIGH | HIGHLY RECOMMENDED |
| `customer.subscription.trial_will_end` | ❌ Not implemented | MEDIUM | RECOMMENDED |
| `invoice.upcoming` | ❌ Not implemented | MEDIUM | RECOMMENDED |
| `customer.subscription.paused` | ❌ Not implemented | LOW | OPTIONAL |
| `customer.subscription.resumed` | ❌ Not implemented | LOW | OPTIONAL |

---

## Testing in Production

### Using Stripe Dashboard:
1. Go to Webhooks → Your endpoint
2. Click "Send test webhook"
3. Select event type
4. Click "Send test webhook"
5. Check your logs to verify it was received

### Monitor Webhook Delivery:
- Go to Webhooks → Your endpoint → "Recent deliveries"
- Check for failed deliveries
- Review response codes and error messages

---

## Important Notes

1. **Always use separate webhook endpoints for Test and Live modes**
2. **Keep webhook secrets secure** - Never commit them to git
3. **Monitor webhook failures** - Set up alerts for failed deliveries
4. **Test thoroughly** - Use Stripe's test mode before going live
5. **Handle idempotency** - Your webhook handler should be idempotent (safe to retry)

---

## Next Steps

1. ✅ Configure all required events in Stripe Dashboard
2. ✅ Add webhook secrets to environment variables
3. ⚠️ Consider implementing `invoice.payment_succeeded` and `invoice.payment_failed` handlers
4. ⚠️ Consider implementing `customer.subscription.trial_will_end` for better trial conversion
5. ⚠️ Set up monitoring/alerts for webhook failures



