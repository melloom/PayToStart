# Quick Start Guide

Get Contract Manager up and running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account ([supabase.com](https://supabase.com))
- Stripe account ([stripe.com](https://stripe.com))
- Git repository (optional, for deployment)

## Step 1: Install Dependencies (2 minutes)

```bash
cd contract-manager
npm install
```

## Step 2: Configure Environment (3 minutes)

1. Copy environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add:
   - Supabase URL and keys (from Supabase Dashboard → Settings → API)
   - Stripe keys (from Stripe Dashboard → API Keys)
   - App URL: `http://localhost:3000`

## Step 3: Set Up Database (3 minutes)

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage_buckets.sql`
   - `supabase/migrations/004_trigger_company_creation.sql`
   - `supabase/migrations/005_add_signature_fields.sql` (if needed)
   - `supabase/migrations/006_secure_signing_tokens.sql` ⭐ NEW
3. Add `SIGNING_TOKEN_SECRET` to `.env.local` (generate with: `openssl rand -hex 32`)

## Step 4: Configure Stripe (1 minute)

1. Get test API keys from Stripe Dashboard
2. For local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
3. Copy webhook secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 5: Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Create Your First Contract

1. Go to `/login`
2. Sign up with email/password or magic link
3. Go to `/dashboard`
4. Click "New Contract"
5. Fill in contract details
6. Create contract
7. Copy signing link
8. Open signing link in incognito window
9. Sign contract
10. Complete payment (use Stripe test card: 4242 4242 4242 4242)
11. Verify contract finalizes and PDF generates

## That's It!

You now have a working contract management system. See [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production.

## Need Help?

- See [SETUP.md](./SETUP.md) for detailed setup
- See [TROUBLESHOOTING.md](./DEPLOYMENT.md#troubleshooting) for common issues
- Check browser console and terminal for errors

