# Payment Processing Test Script

## Quick Start

Test if a payment gets processed correctly by monitoring its status:

```bash
node scripts/test-payment-processing.js <session_id>
```

## How to Get a Session ID

1. **Complete a test payment** in your app:
   - Sign a contract with a deposit
   - Complete payment in Stripe Checkout
   - You'll be redirected to: `/sign/[token]/complete?session_id=cs_test_...`

2. **Copy the session_id** from the URL

3. **Run the test script**:
   ```bash
   node scripts/test-payment-processing.js cs_test_a1b2c3d4e5f6...
   ```

## What the Script Does

1. ✅ **Checks Stripe directly** - Verifies payment status in Stripe
2. 🔄 **Polls payment status** - Simulates browser polling (every 3 seconds)
3. ⏱️ **Tracks timing** - Shows how long it takes to process
4. 📊 **Reports results** - Shows if payment was confirmed and when

## Example Output

```
🧪 Payment Processing Test Script
=====================================

📋 Checking Stripe session directly...
ℹ️  Stripe Status: paid
ℹ️  Mode: payment
ℹ️  Amount: $100.00

📋 Starting payment status polling
ℹ️  Session ID: cs_test_...
ℹ️  Max polls: 40 (120s)
ℹ️  Poll interval: 3s
ℹ️  Initial delay: 2s

📋 Initial verification...
  [Poll 0] Status: open | Time: 150ms
ℹ️  Payment status: open

  [Poll 1] Status: open | Time: 120ms
  [Poll 2] Status: paid | Time: 110ms

🎉 Payment confirmed on attempt 2!
ℹ️  Total time: 6.0s
ℹ️  Average response time: 110ms

📊 Test Summary
================
✅ Payment confirmed successfully!
ℹ️  Attempts: 2
ℹ️  Time: 6.0s
ℹ️  Contract ID: abc-123...
ℹ️  Contract Status: paid
```

## Typical Results

- **Normal (webhook works)**: Confirmed in 2-5 seconds
- **Delayed webhook**: Confirmed in 3-9 seconds (polling catches it)
- **Webhook fails**: May take up to 2 minutes (polling continues)

## Troubleshooting

### Payment Never Confirms
- Check if payment was actually completed in Stripe
- Verify webhook is configured correctly
- Check Stripe Dashboard → Webhooks for errors

### Script Can't Connect
- Make sure your app is running (`npm run dev`)
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check if API endpoint is accessible

### Session Not Found
- Verify session ID is correct (starts with `cs_test_` or `cs_live_`)
- Check if session exists in Stripe Dashboard
- Make sure you're using the correct Stripe mode (test vs live)
