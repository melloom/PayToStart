# Setup Guide

Complete setup guide for the Contract Manager system.

## Prerequisites

1. **Supabase Account** - Create at [supabase.com](https://supabase.com)
2. **Stripe Account** - Create at [stripe.com](https://stripe.com)
3. **Gmail Account** (Optional) - Your Gmail account for sending emails via SMTP
4. **Node.js** - Version 18+ required

## Step 1: Install Dependencies

```bash
cd contract-manager
npm install
```

## Step 2: Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com

# Secure Token Secret (for signing links)
# Generate a random 32+ character string for production
# Example: openssl rand -hex 32
SIGNING_TOKEN_SECRET=your-secret-key-change-in-production
```

### Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Getting Your Stripe Credentials

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

For webhook secret, see Step 6 below.

### Getting Gmail App Password

1. Go to your [Google Account](https://myaccount.google.com)
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Scroll down and click **App passwords**
4. Select **Mail** as the app and **Other (Custom name)** as the device
5. Enter a name (e.g., "Contract Manager")
6. Copy the 16-character password → `GMAIL_APP_PASSWORD`
7. Use your Gmail address → `GMAIL_USER`

**Note**: If you don't have 2-Step Verification enabled, you'll need to enable it first to generate an App Password.

## Step 3: Set Up Supabase Database

### Run Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:

#### Migration 1: Initial Schema
```sql
-- Copy and paste contents of supabase/migrations/001_initial_schema.sql
-- This creates all tables with multi-tenant support
```

#### Migration 2: RLS Policies
```sql
-- Copy and paste contents of supabase/migrations/002_rls_policies.sql
-- This enables Row Level Security and creates tenant isolation policies
```

#### Migration 3: Storage Buckets
```sql
-- Copy and paste contents of supabase/migrations/003_storage_buckets.sql
-- This creates storage buckets for PDFs, signatures, and attachments
```

#### Migration 4: Company Creation Trigger
```sql
-- Copy and paste contents of supabase/migrations/004_trigger_company_creation.sql
-- This automatically creates a company when a contractor signs up
```

#### Migration 5: Signature Fields (Optional)
```sql
-- Copy and paste contents of supabase/migrations/005_add_signature_fields.sql
-- Adds signature metadata fields (only if you ran 001 without these fields)
```

#### Migration 6: Secure Signing Tokens ⭐ NEW
```sql
-- Copy and paste contents of supabase/migrations/006_secure_signing_tokens.sql
-- Implements secure token hashing, expiry, and rate limiting
```

**Important**: After running migration 6, set `SIGNING_TOKEN_SECRET` in your `.env.local` file. Generate a secure random string:
```bash
# Linux/Mac
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Verify Setup

After running migrations, verify:

1. **Tables Created**: Go to **Table Editor** and verify these tables exist:
   - `companies`
   - `contractors`
   - `clients`
   - `contract_templates`
   - `contracts`
   - `payments`
   - `signatures`
   - `attachments`

2. **RLS Enabled**: Check that RLS is enabled on all tables (should show a shield icon)

3. **Storage Buckets**: Go to **Storage** and verify these buckets exist:
   - `contract-pdfs`
   - `signatures`
   - `attachments`

## Step 4: Configure Supabase Auth

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
4. **Email Auth**: Ensure email/password and magic links are enabled

## Step 5: Set Up Stripe

### Create Products (Optional)

You can skip this if using dynamic checkout sessions (which we do).

### Configure Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   - **Production**: `https://yourdomain.com/api/stripe/webhook`
   - **Development**: Use Stripe CLI (see below)
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

### Local Development with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows (using Scoop)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will output a webhook secret. Use this as your `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Step 6: Configure Email (Optional)

### Option 1: Gmail SMTP (Recommended for MVP)

1. Enable 2-Step Verification on your [Google Account](https://myaccount.google.com/security)
2. Generate an App Password:
   - Go to **Security** → **2-Step Verification** → **App passwords**
   - Select **Mail** as the app and **Other (Custom name)** as the device
   - Enter a name (e.g., "Contract Manager")
   - Copy the 16-character password
3. Add to `.env.local`:
   - `GMAIL_USER=your-email@gmail.com`
   - `GMAIL_APP_PASSWORD=your-16-char-app-password`

**Note**: 
- Gmail has daily sending limits (500 emails/day for free accounts)
- App passwords are required if 2FA is enabled
- For production, consider a dedicated email service for better deliverability

### Option 2: Development Mode

If `GMAIL_USER` and `GMAIL_APP_PASSWORD` are not set, emails will be logged to console instead.

### Option 3: Other Email Providers

You can modify `lib/email/index.ts` to use:
- SendGrid
- AWS SES
- Mailgun
- Other SMTP providers

## Step 7: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 8: Create Your First User

1. Go to `/login`
2. Click **Sign in with Magic Link** or use email/password
3. If signing up:
   - Enter your email
   - For password: Enter password and confirm
   - For magic link: Check your email and click the link
4. The system will automatically:
   - Create a company for you
   - Create your contractor record
   - Link you to that company

## Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set (`.env.local`)
- [ ] Database migrations run (all 6 migrations, or 5 if 005 is not needed)
- [ ] `SIGNING_TOKEN_SECRET` environment variable set (required for secure signing links)
- [ ] Tables created and visible in Supabase
- [ ] RLS enabled on all tables
- [ ] Storage buckets created
- [ ] Stripe webhook configured
- [ ] Development server running (`npm run dev`)
- [ ] Can login/create account
- [ ] Can create a contract
- [ ] Can sign a contract (via token link)
- [ ] Can process payment (Stripe checkout)
- [ ] Webhook receives `checkout.session.completed`
- [ ] PDF generated and stored
- [ ] Emails sent (or logged in dev mode)

## Troubleshooting

### "Invalid API key" error

- Check that all environment variables are set correctly
- Verify keys are copied completely (no extra spaces)
- Restart dev server after changing `.env.local`

### RLS blocking queries

- Verify RLS policies are installed (migration 2)
- Check that user is authenticated
- Verify contractor record exists and is linked to company

### Webhook not receiving events

- Check Stripe CLI is running (for local dev)
- Verify webhook endpoint URL is correct
- Check webhook secret matches `STRIPE_WEBHOOK_SECRET`
- Verify event type is `checkout.session.completed`

### Emails not sending

- Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set
- Verify domain is verified (if using custom sender)
- In dev mode, emails are logged to console (check terminal)

### Storage upload fails

- Verify storage buckets exist
- Check RLS policies on storage buckets
- Verify file size is within limits
- Check file type is allowed

## Next Steps

1. **Customize Email Templates**: Edit `lib/finalization.ts` email functions
2. **Customize PDF**: Edit `lib/pdf.ts` to change PDF format
3. **Add Contract Templates**: Create reusable templates in dashboard
4. **Configure Domain**: Set up custom domain for production
5. **Set Up Production**: Deploy to Vercel, Netlify, or your hosting

## Production Deployment

Before deploying to production:

1. Update environment variables with production values
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Configure production Stripe webhook endpoint
4. Set up production email (consider dedicated email service for better deliverability)
5. Configure production Supabase redirect URLs
6. Set up monitoring and error tracking
7. Enable SSL/TLS certificates
8. Set up backups for database

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error logs in browser console and terminal
3. Check Supabase logs in dashboard
4. Check Stripe webhook logs in dashboard
5. Verify all migrations ran successfully

