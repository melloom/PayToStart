# Complete Setup Checklist

Use this checklist to verify all components are properly configured.

## ✅ Prerequisites Installed

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Supabase account created
- [ ] Stripe account created
- [ ] Gmail account configured with App Password (optional)

## ✅ Project Setup

- [ ] Repository cloned/downloaded
- [ ] `cd contract-manager`
- [ ] `npm install` completed successfully
- [ ] All dependencies installed without errors

## ✅ Environment Variables

- [ ] `.env.local` file created
- [ ] Copied from `.env.local.example`
- [ ] All variables filled in:

### Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your service role key (optional)

### App
- [ ] `NEXT_PUBLIC_APP_URL` = `http://localhost:3000` (dev) or production URL

### Stripe
- [ ] `STRIPE_SECRET_KEY` = Your Stripe secret key (starts with `sk_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Your publishable key (starts with `pk_`)
- [ ] `STRIPE_WEBHOOK_SECRET` = Your webhook secret (starts with `whsec_`)

### Email (Optional)
- [ ] `GMAIL_USER` = Your Gmail address
- [ ] `GMAIL_APP_PASSWORD` = Your Gmail App Password (16 characters)
- [ ] `SMTP_FROM` = Your sender email address

## ✅ Supabase Database Setup

### Run Migrations (in order)
- [ ] Migration 1: `001_initial_schema.sql` - Creates all tables
- [ ] Migration 2: `002_rls_policies.sql` - Enables RLS and creates policies
- [ ] Migration 3: `003_storage_buckets.sql` - Creates storage buckets
- [ ] Migration 4: `004_trigger_company_creation.sql` - Creates signup trigger

### Verify Tables
- [ ] `companies` table exists
- [ ] `contractors` table exists
- [ ] `clients` table exists
- [ ] `contract_templates` table exists
- [ ] `contracts` table exists
- [ ] `payments` table exists
- [ ] `signatures` table exists
- [ ] `attachments` table exists

### Verify RLS
- [ ] RLS enabled on all 8 tables (check shield icon in Supabase dashboard)

### Verify Storage
- [ ] `contract-pdfs` bucket exists
- [ ] `signatures` bucket exists
- [ ] `attachments` bucket exists

## ✅ Supabase Auth Configuration

- [ ] Go to Authentication → Settings
- [ ] Site URL set to: `http://localhost:3000`
- [ ] Redirect URLs include:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/dashboard`
- [ ] Email provider enabled
- [ ] Magic links enabled

## ✅ Stripe Configuration

### API Keys
- [ ] Test mode keys obtained from Stripe Dashboard
- [ ] Keys set in `.env.local`

### Webhook Setup
- [ ] Stripe CLI installed (`brew install stripe/stripe-cli/stripe`)
- [ ] Stripe CLI logged in (`stripe login`)
- [ ] Webhook forwarding running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Webhook secret copied to `.env.local` as `STRIPE_WEBHOOK_SECRET`

**OR for production:**
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] URL set to: `https://yourdomain.com/api/stripe/webhook`
- [ ] Event `checkout.session.completed` selected
- [ ] Webhook secret copied to environment variables

## ✅ Email Configuration (Optional)

- [ ] Gmail account configured with App Password
- [ ] API key obtained
- [ ] Domain verified (if using custom sender)
- [ ] API key set in `.env.local`

**Note:** If not set, emails will be logged to console (dev mode).

## ✅ Start Development Server

- [ ] Run `npm run dev`
- [ ] Server starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] Login page loads

## ✅ Test Authentication

### Sign Up
- [ ] Go to `/login`
- [ ] Try email/password signup
- [ ] OR try magic link signup
- [ ] Company automatically created
- [ ] Contractor record automatically created
- [ ] Redirected to dashboard after signup

### Sign In
- [ ] Can sign in with email/password
- [ ] Can sign in with magic link
- [ ] Session persists
- [ ] Can sign out

## ✅ Test Contract Creation

- [ ] Go to `/dashboard`
- [ ] Click "New Contract"
- [ ] Fill in contract form:
  - Client name
  - Client email
  - Contract title
  - Contract content
  - Deposit amount
  - Total amount
- [ ] Submit form
- [ ] Contract created successfully
- [ ] Signing link displayed
- [ ] Contract appears in dashboard

## ✅ Test Client Signing Flow

- [ ] Copy signing link from contract details
- [ ] Open in incognito/private window (to test no auth)
- [ ] Signing page loads (`/sign/[token]`)
- [ ] Contract content visible
- [ ] Can click "Sign Contract"
- [ ] Contract status updates to "signed"
- [ ] Redirects appropriately:
  - To payment if deposit required
  - To completion if no deposit

## ✅ Test Payment Flow (if deposit required)

- [ ] Payment page loads (`/pay/[token]`)
- [ ] Shows deposit amount
- [ ] Click "Pay Deposit"
- [ ] Stripe Checkout opens
- [ ] Complete test payment
- [ ] Redirects to completion page

## ✅ Test Webhook & Finalization

- [ ] After payment, webhook receives event
- [ ] Check Stripe CLI output (or Stripe Dashboard → Webhooks)
- [ ] Webhook processes successfully
- [ ] Contract status updates to "completed"
- [ ] PDF generated
- [ ] PDF uploaded to Supabase Storage
- [ ] Emails sent (or logged in dev mode)

## ✅ Verify Final Contract

### Contractor View
- [ ] Go to `/dashboard`
- [ ] Find completed contract
- [ ] Status shows "completed"
- [ ] PDF download available
- [ ] Can view full contract details

### Email Verification
- [ ] Check email inbox (or console logs in dev mode)
- [ ] Client receives email with PDF link
- [ ] Contractor receives email with PDF link

## ✅ Security Verification

### RLS Test
- [ ] Create two contractor accounts
- [ ] Contractor A creates a contract
- [ ] Log in as Contractor B
- [ ] Verify Contractor B cannot see Contractor A's contracts
- [ ] Verify Contractor B cannot access Contractor A's data

### Authentication Test
- [ ] Try accessing `/dashboard` without login
- [ ] Verify redirect to `/login`
- [ ] Try accessing signing page with invalid token
- [ ] Verify appropriate error message

## ✅ Code Quality

- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - builds successfully
- [ ] No TypeScript errors
- [ ] No console errors (in browser)

## ✅ Documentation Review

- [ ] Read `README.md`
- [ ] Read `SETUP.md`
- [ ] Read `IMPLEMENTATION.md`
- [ ] Read `VERIFICATION.md`
- [ ] Understand the architecture

## 🎉 Completion

Once all items are checked:

- [ ] All features working end-to-end
- [ ] No critical errors
- [ ] Ready for development/testing
- [ ] Ready for production deployment (after production configuration)

---

## Troubleshooting

If any step fails:

1. **Environment Variables**: Double-check all variables are set correctly in `.env.local`
2. **Database**: Verify all migrations ran successfully in Supabase SQL Editor
3. **Auth**: Check Supabase Auth settings match your configuration
4. **Stripe**: Verify API keys and webhook setup
5. **Dependencies**: Run `npm install` again if packages are missing
6. **Errors**: Check terminal output and browser console for specific errors

## Next Steps

After completing the checklist:

1. Customize email templates
2. Customize PDF layout
3. Add contract templates
4. Set up production deployment
5. Configure monitoring
6. Add additional features

