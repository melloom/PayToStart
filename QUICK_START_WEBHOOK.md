# Quick Start: Webhook Forwarding

## Step-by-Step Instructions

### 1. Open a Terminal Window

Open a new terminal window (keep it separate from your dev server).

### 2. Navigate to Your Project (Optional)

```bash
cd /Users/melvinperalta/Desktop/PayToStart-main
```

### 3. Add Homebrew to PATH (if needed)

```bash
export PATH="/opt/homebrew/bin:$PATH"
```

### 4. Start Webhook Forwarding

Run this command:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. What You'll See

You should see output like:

```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

### 6. Copy the Webhook Secret

Copy the `whsec_xxxxx` part (the whole thing starting with `whsec_`).

### 7. Update `.env.local`

Open `.env.local` and find this line:
```env
STRIPE_TEST_WEBHOOK_SECRET=whsec_NHPDZvW0gtQGfvdxaxUxjkfUw6NvVsXz
```

Replace it with the new secret from step 6:
```env
STRIPE_TEST_WEBHOOK_SECRET=whsec_xxxxx
```

### 8. Restart Your Dev Server

After updating `.env.local`, restart your Next.js server:
```bash
npm run dev
```

### 9. Keep It Running!

**IMPORTANT**: Keep the `stripe listen` terminal window open while you develop. If you close it, webhooks won't work!

### 10. Test It

1. Make a test payment in your app
2. Watch the `stripe listen` terminal - you should see:
   ```
   --> checkout.session.completed [evt_xxx]
   <-- [200] POST http://localhost:3000/api/stripe/webhook [evt_xxx]
   ```
3. Your payment should process automatically! 🎉

## Quick Reference

**Start webhook forwarding:**
```bash
export PATH="/opt/homebrew/bin:$PATH"
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Stop webhook forwarding:**
Press `Ctrl+C` in the terminal

**Check if it's working:**
- Look for webhook events in the `stripe listen` terminal
- Check your server logs for "Webhook received" messages

## Troubleshooting

**"Command not found: stripe"**
- Make sure you added Homebrew to PATH: `export PATH="/opt/homebrew/bin:$PATH"`
- Or use the full path: `/opt/homebrew/bin/stripe listen --forward-to localhost:3000/api/stripe/webhook`

**Webhooks not firing?**
- Make sure `stripe listen` is still running
- Make sure `STRIPE_TEST_WEBHOOK_SECRET` matches the secret from `stripe listen`
- Restart your dev server after updating `.env.local`

**Need to restart `stripe listen`?**
- You'll get a NEW webhook secret each time
- Update `.env.local` with the new secret
- Restart your dev server
