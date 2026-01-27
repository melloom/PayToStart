# How to Fix Webhook Not Firing

If payments succeed in Stripe but aren't being processed in your system, the webhook likely isn't configured correctly. Here's how to fix it:

## 🔍 Quick Diagnosis

Run this diagnostic script:
```bash
node scripts/check-webhook-setup.js
```

## The Problem

**For Local Development**: Stripe webhooks are configured to send to your production URL (`https://pay2start.vercel.app/`), but you're running locally (`http://localhost:3000`). Stripe can't reach localhost, so webhooks never fire.

**Solution**: Use Stripe CLI to forward webhooks to your local server.

## Step 1: Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (using Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
# Download from: https://github.com/stripe/stripe-cli/releases
```

## Step 2: Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate.

## Step 3: Forward Webhooks to Local Server

**IMPORTANT**: Run this command and keep it running while developing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**Copy this secret** and update your `.env.local`:
```env
STRIPE_TEST_WEBHOOK_SECRET=whsec_xxxxx
```

**Keep this terminal window open** - webhooks won't work if you close it!

## Step 4: Restart Your Dev Server

After updating `.env.local`, restart your Next.js dev server:
```bash
npm run dev
```

## Step 5: Test It

1. Make a test payment in your app
2. You should see webhook events in the Stripe CLI terminal:
   ```
   --> checkout.session.completed [evt_xxx]
   <-- [200] POST http://localhost:3000/api/stripe/webhook [evt_xxx]
   ```
3. Check your server logs - you should see:
   ```
   Webhook received: checkout.session.completed
   Payment processed for contract <id>
   ```

## For Production (Vercel/Deployed)

Your production webhook is already configured at `https://pay2start.vercel.app/api/stripe/webhook`. 

**To verify it's working:**
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your endpoint
3. Check the "Events" tab - you should see recent webhook deliveries
4. Look for `checkout.session.completed` events
5. Check the status:
   - ✅ **200** = Success
   - ❌ **400/500** = Error (check the error message)

## Common Issues

### Issue 1: "Webhook signature verification failed"

**Fix**: Make sure `STRIPE_TEST_WEBHOOK_SECRET` matches the secret from Stripe CLI output.

### Issue 2: Webhook never fires locally

**Fix**: 
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Keep that terminal window open
- Make sure your dev server is running: `npm run dev`

### Issue 3: Webhook fires but payment not processed

**Fix**: Check your server logs for errors. Common issues:
- Missing contract metadata
- Database connection issues
- Use the fix script: `node scripts/fix-pending-payment.js <session_id>`

### Issue 4: Production webhooks not working

**Fix**:
1. Check Stripe Dashboard → Webhooks → Events for delivery status
2. Make sure `STRIPE_LIVE_WEBHOOK_SECRET` is set in production environment variables
3. Verify the webhook URL in Stripe matches your production URL exactly

## Quick Reference

### Local Development Setup:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks (keep this running!)
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the whsec_ secret to .env.local
```

### Check Webhook Status:
```bash
# Run diagnostic
node scripts/check-webhook-setup.js

# Check if payment was processed
node scripts/verify-payment-processed.js <session_id>

# Fix a pending payment manually
node scripts/fix-pending-payment.js <session_id>
```

## Summary

**For Local Development:**
1. ✅ Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. ✅ Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. ✅ Copy webhook secret to `.env.local` as `STRIPE_TEST_WEBHOOK_SECRET`
4. ✅ Keep Stripe CLI running while developing
5. ✅ Restart your dev server

**For Production:**
- ✅ Webhook is already configured at `https://pay2start.vercel.app/api/stripe/webhook`
- ✅ Check Stripe Dashboard → Webhooks → Events to see delivery status
- ✅ Make sure `STRIPE_LIVE_WEBHOOK_SECRET` is set in Vercel environment variables

## Need More Help?

1. **Check Stripe Dashboard** → Webhooks → Events for error messages
2. **Check server logs** for webhook processing errors  
3. **Test manually** with Stripe Dashboard → Send test webhook
4. **Use fix script** for payments that already succeeded:
   ```bash
   node scripts/fix-pending-payment.js <session_id>
   ```
