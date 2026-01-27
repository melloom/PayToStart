# Payment Processing Timing Guide

## Typical Payment Processing Times

### Normal Flow (Most Common)
1. **Customer completes payment in Stripe Checkout**: 0 seconds
2. **Stripe processes payment**: Instant (card payments are immediate)
3. **Stripe sends webhook** (`checkout.session.completed`): **1-3 seconds** after payment
4. **Webhook processes payment**: **< 1 second**
5. **Payment status updated in database**: **< 1 second**

**Total Time: 2-5 seconds** from payment completion to status update

### With Polling (If Webhook is Delayed)
- **Initial check**: Immediate when page loads
- **Polling starts**: After 2 seconds (gives webhook time)
- **Poll interval**: Every 3 seconds
- **Max polling time**: 2 minutes (40 attempts)
- **Typical detection**: Usually within first 1-2 polls (3-6 seconds)

## How Payment Status is Checked

### 1. Initial Verification
- When user lands on completion page with `session_id`
- Immediately checks `/api/stripe/verify-session?session_id=xxx`
- This queries Stripe directly for payment status

### 2. Automatic Polling (If Still Pending)
- Starts 2 seconds after initial check
- Polls every 3 seconds
- Checks same endpoint: `/api/stripe/verify-session`
- Stops when payment is confirmed or after 2 minutes

### 3. Webhook Processing (Background)
- Stripe sends webhook to `/api/stripe/webhook`
- Updates payment status in database
- Updates contract status
- Generates PDF and sends emails

## Testing Payment Status

### Check Browser Console
When payment is pending, you'll see logs like:
```
[Payment Verify] Initial verification starting...
[Payment Verify] Initial check completed in 150ms - Paid: false, Status: open
[Payment Poll] Attempt 1/40 - Checking payment status...
[Payment Poll] Response received in 120ms - Status: open, Paid: false
[Payment Poll] Attempt 2/40 - Checking payment status...
[Payment Poll] Response received in 110ms - Status: paid, Paid: true
[Payment Poll] ✅ Payment confirmed on attempt 2! (took ~6.0s)
```

### Visual Indicators
- **"Payment Processing" card**: Shows when payment is pending
- **Poll count**: Displays number of status checks
- **Time elapsed**: Shows approximate time since payment
- **Status messages**: 
  - "⏱️ Normal processing time" (0-5 polls)
  - "⏳ Webhook may be delayed" (5-15 polls)
  - "🔍 Still checking..." (15+ polls)

### Testing Scenarios

#### Scenario 1: Normal Payment (Webhook Works)
- Payment completes → Webhook fires in 2 seconds → Status updates immediately
- Polling may catch it on first check (3 seconds) or not needed at all
- **Expected time**: 2-5 seconds

#### Scenario 2: Delayed Webhook
- Payment completes → Webhook delayed → Polling detects it
- First poll (3s): Still pending
- Second poll (6s): Payment confirmed ✅
- **Expected time**: 3-9 seconds

#### Scenario 3: Webhook Fails (Rare)
- Payment completes → Webhook fails → Polling catches it
- Polling continues until payment is detected
- **Expected time**: Up to 2 minutes (but usually within 10-15 seconds)

## Troubleshooting

### Payment Stuck in Pending
1. **Check browser console** for polling logs
2. **Check Stripe Dashboard** → Payments → Verify payment status
3. **Check webhook logs** in Stripe Dashboard → Developers → Webhooks
4. **Verify webhook endpoint** is accessible and responding

### Payment Never Confirms
- Check if webhook is configured correctly
- Verify webhook secret is set in environment variables
- Check if webhook endpoint is publicly accessible
- Review Stripe webhook logs for errors

### Polling Stops Too Early
- Check if `paymentStatus` state is being set incorrectly
- Verify `sessionId` is present in URL
- Check browser console for errors

## Performance Metrics

### Expected Response Times
- **Stripe API call**: 100-300ms
- **Database query**: 50-150ms
- **Total verification**: 150-450ms per check

### Polling Efficiency
- **40 polls over 2 minutes**: Minimal server load
- **3-second interval**: Balances responsiveness vs. server load
- **Auto-stop on success**: Prevents unnecessary polling

## Best Practices

1. **Always show pending state**: Users should know payment is processing
2. **Provide visual feedback**: Spinner, progress indicator, or status message
3. **Log polling activity**: Helps debug issues
4. **Set reasonable timeouts**: 2 minutes is sufficient for most cases
5. **Handle errors gracefully**: Continue polling on errors, don't fail silently
