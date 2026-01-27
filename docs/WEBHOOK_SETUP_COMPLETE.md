# Webhook Setup - Quick Reference

## ✅ You're All Set!

Your Stripe CLI is authenticated and ready to forward webhooks.

## Current Status

- ✅ Stripe CLI installed
- ✅ Authenticated with Stripe (Account: acct_1RZvauIrr8HXR5S3)
- ⏳ Webhook forwarding should be running

## What You Should See

In your terminal where you ran `stripe listen`, you should see:

```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

## Next Steps

### 1. Copy the Webhook Secret

Look for the line that says:
```
> Ready! Your webhook signing secret is whsec_xxxxx
```

Copy the `whsec_xxxxx` part.

### 2. Update `.env.local`

Open `.env.local` and update or add:
```env
STRIPE_TEST_WEBHOOK_SECRET=whsec_xxxxx
```

Replace `whsec_xxxxx` with the actual secret from the terminal.

### 3. Restart Your Dev Server

After updating `.env.local`, restart your Next.js server:
```bash
npm run dev
```

### 4. Test It!

1. Make a test payment in your app
2. Watch the `stripe listen` terminal - you should see:
   ```
   --> checkout.session.completed [evt_xxx]
   <-- [200] POST http://localhost:3000/api/stripe/webhook [evt_xxx]
   ```
3. Your payment should process automatically!

## Important Notes

- **Keep the `stripe listen` terminal open** - webhooks won't work if you close it
- The webhook secret changes each time you restart `stripe listen`
- If you restart `stripe listen`, update `.env.local` with the new secret

## Troubleshooting

### Webhook not firing?
- Make sure `stripe listen` is still running
- Check that `STRIPE_TEST_WEBHOOK_SECRET` matches the secret from `stripe listen`
- Restart your dev server after updating `.env.local`

### Payment succeeded but not processed?
- Check the `stripe listen` terminal for webhook events
- Check your server logs for errors
- Use the fix script: `node scripts/fix-pending-payment.js <session_id>`

## Quick Commands

```bash
# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Check webhook setup
node scripts/check-webhook-setup.js

# Fix a pending payment
node scripts/fix-pending-payment.js <session_id>
```
