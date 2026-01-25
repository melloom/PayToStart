# Setup Verification Checklist

Use this checklist to verify that all components are properly set up and configured.

## ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Supabase account created
- [ ] Stripe account created
- [ ] Gmail account configured with App Password (optional, for emails)

## ✅ Environment Variables

- [ ] `.env.local` file created from `.env.local.example`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (optional, for admin operations)
- [ ] `NEXT_PUBLIC_APP_URL` set to `http://localhost:3000` (dev) or production URL
- [ ] `STRIPE_SECRET_KEY` set (starts with `sk_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set (starts with `pk_`)
- [ ] `STRIPE_WEBHOOK_SECRET` set (starts with `whsec_`)
- [ ] `GMAIL_USER` set (optional, for email)
- [ ] `GMAIL_APP_PASSWORD` set (optional, for email)
- [ ] `SMTP_FROM` set (optional, for email)

## ✅ Dependencies

- [ ] Ran `npm install` successfully
- [ ] No dependency errors in terminal
- [ ] All packages listed in `package.json` are installed

## ✅ Supabase Database

### Tables
- [ ] `companies` table exists
- [ ] `contractors` table exists
- [ ] `clients` table exists
- [ ] `contract_templates` table exists
- [ ] `contracts` table exists
- [ ] `payments` table exists
- [ ] `signatures` table exists
- [ ] `attachments` table exists

### Row Level Security (RLS)
- [ ] RLS enabled on `companies` table
- [ ] RLS enabled on `contractors` table
- [ ] RLS enabled on `clients` table
- [ ] RLS enabled on `contract_templates` table
- [ ] RLS enabled on `contracts` table
- [ ] RLS enabled on `payments` table
- [ ] RLS enabled on `signatures` table
- [ ] RLS enabled on `attachments` table

### Policies
- [ ] Policies exist for `companies` table
- [ ] Policies exist for `contractors` table
- [ ] Policies exist for `clients` table
- [ ] Policies exist for `contract_templates` table
- [ ] Policies exist for `contracts` table
- [ ] Policies exist for `payments` table
- [ ] Policies exist for `signatures` table
- [ ] Policies exist for `attachments` table

### Functions & Triggers
- [ ] `get_contractor_company_id()` function exists
- [ ] `update_updated_at_column()` function exists
- [ ] `create_company_for_contractor()` function exists
- [ ] `on_auth_user_created` trigger exists

## ✅ Supabase Storage

### Buckets
- [ ] `contract-pdfs` bucket exists
- [ ] `signatures` bucket exists
- [ ] `attachments` bucket exists

### Storage Policies
- [ ] Policies exist for `contract-pdfs` bucket
- [ ] Policies exist for `signatures` bucket
- [ ] Policies exist for `attachments` bucket

## ✅ Supabase Authentication

- [ ] Email/password authentication enabled
- [ ] Magic link authentication enabled
- [ ] Site URL configured (for development: `http://localhost:3000`)
- [ ] Redirect URLs configured:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `http://localhost:3000/dashboard`

## ✅ Stripe Configuration

### API Keys
- [ ] Test mode secret key set in environment
- [ ] Test mode publishable key set in environment
- [ ] Keys match your Stripe account

### Webhooks
- [ ] Webhook endpoint configured:
  - Production: `https://yourdomain.com/api/stripe/webhook`
  - Development: Using Stripe CLI (`stripe listen --forward-to localhost:3000/api/stripe/webhook`)
- [ ] Event `checkout.session.completed` is selected
- [ ] Webhook secret is set in environment variables

### Stripe CLI (Development)
- [ ] Stripe CLI installed
- [ ] Stripe CLI logged in (`stripe login`)
- [ ] Webhook forwarding running (`stripe listen --forward-to localhost:3000/api/stripe/webhook`)

## ✅ Email Configuration

- [ ] Gmail account configured with App Password (or other email provider configured)
- [ ] `GMAIL_USER` set in environment
- [ ] `GMAIL_APP_PASSWORD` set in environment
- [ ] `SMTP_FROM` email address configured

**Note**: If `GMAIL_USER` and `GMAIL_APP_PASSWORD` are not set, emails will be logged to console (development mode).

## ✅ Code Configuration

### Supabase Clients
- [ ] `lib/supabase/client.ts` exists (browser client)
- [ ] `lib/supabase/server.ts` exists (server client)
- [ ] `lib/supabase/middleware.ts` exists (middleware helper)

### Database Layer
- [ ] `lib/db.ts` exists and uses Supabase
- [ ] All database operations use Supabase client
- [ ] RLS policies are respected in queries

### Authentication
- [ ] `lib/auth.ts` exists and uses Supabase Auth
- [ ] Login page supports email/password and magic link
- [ ] Session management working

### Storage
- [ ] `lib/storage.ts` exists and uses Supabase Storage
- [ ] All storage operations use Supabase Storage client

### Email
- [ ] `lib/email/index.ts` exists and uses Gmail SMTP (or configured provider)
- [ ] Email functions are callable from finalization

### PDF Generation
- [ ] `lib/pdf.ts` exists and uses jsPDF
- [ ] PDF generation function is callable from finalization

### Finalization
- [ ] `lib/finalization.ts` exists
- [ ] Finalization function calls PDF generation
- [ ] Finalization function calls storage upload
- [ ] Finalization function sends emails

## ✅ API Routes

- [ ] `/api/auth/login` - Uses Supabase Auth
- [ ] `/api/auth/logout` - Uses Supabase Auth
- [ ] `/api/contracts` - Uses Supabase database
- [ ] `/api/contracts/sign/[token]` - Uses Supabase database
- [ ] `/api/contracts/finalize/[token]` - Uses Supabase database
- [ ] `/api/stripe/create-checkout` - Uses Stripe API
- [ ] `/api/stripe/webhook` - Uses Stripe API and Supabase
- [ ] `/api/stripe/verify-session` - Uses Stripe API

## ✅ Pages & Routes

### Contractor Portal (Auth Required)
- [ ] `/login` - Login page works
- [ ] `/dashboard` - Dashboard loads and shows contracts
- [ ] `/dashboard/contracts/new` - Create contract form works
- [ ] `/dashboard/contracts/[id]` - Contract details page works

### Client Signing (Token-Based, No Auth)
- [ ] `/sign/[token]` - Client signing page loads
- [ ] `/pay/[token]` - Payment page loads
- [ ] `/sign/[token]/complete` - Completion page loads

## ✅ Functionality Tests

### Authentication
- [ ] Can sign up with email/password
- [ ] Can sign up with magic link
- [ ] Can sign in with email/password
- [ ] Can sign in with magic link
- [ ] Can sign out
- [ ] Session persists across page refreshes
- [ ] Company automatically created on signup
- [ ] Contractor record automatically created on signup

### Contract Management
- [ ] Can create a contract
- [ ] Contract is linked to contractor's company
- [ ] Client is created/found correctly
- [ ] Signing token is generated
- [ ] Contract shows in dashboard

### Client Signing Flow
- [ ] Can access signing page via token
- [ ] Can view contract details on signing page
- [ ] Can sign contract
- [ ] Contract status updates to "signed"
- [ ] Redirects to payment if deposit required
- [ ] Redirects to completion if no deposit

### Payment Flow
- [ ] Payment page loads for signed contracts
- [ ] Stripe Checkout session is created
- [ ] Can redirect to Stripe Checkout
- [ ] Can complete payment
- [ ] Redirects back to completion page

### Webhook & Finalization
- [ ] Stripe webhook receives `checkout.session.completed`
- [ ] Webhook verifies contract is signed
- [ ] Webhook verifies payment amount
- [ ] Payment record is updated
- [ ] Contract status updates to "paid"
- [ ] PDF is generated
- [ ] PDF is uploaded to storage
- [ ] Contract status updates to "completed"
- [ ] Emails are sent to both parties

### Dashboard
- [ ] Shows all contracts for contractor's company
- [ ] Shows correct statuses
- [ ] Shows client information
- [ ] Can view contract details
- [ ] Can download final PDF (if completed)
- [ ] Cannot see other companies' contracts (RLS test)

## ✅ Security Tests

### Row Level Security (RLS)
- [ ] Contractor A cannot see Contractor B's contracts
- [ ] Contractor A cannot see Contractor B's clients
- [ ] Contractor A cannot access Contractor B's company data
- [ ] All queries are filtered by company_id

### Authentication
- [ ] Unauthenticated users cannot access `/dashboard`
- [ ] Unauthenticated users are redirected to `/login`
- [ ] Token-based signing pages don't require auth
- [ ] Webhook endpoint is protected (Stripe signature verification)

### Storage
- [ ] Contractors can only access their own company's files
- [ ] Storage RLS policies are working
- [ ] Files are organized by company_id

## ✅ Error Handling

- [ ] Invalid tokens show appropriate error
- [ ] Missing authentication shows appropriate error
- [ ] Database errors are logged and handled
- [ ] Stripe errors are logged and handled
- [ ] Email errors don't block finalization (logged only)
- [ ] PDF generation errors prevent completion (as expected)

## ✅ Development Server

- [ ] Server starts without errors (`npm run dev`)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Can access application at `http://localhost:3000`
- [ ] Hot reload works
- [ ] Console shows no critical errors

## Quick Verification Commands

```bash
# Check dependencies
npm list --depth=0

# Check environment variables are set
node -e "require('dotenv').config({ path: '.env.local' }); console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');"

# Run linter
npm run lint

# Build project
npm run build
```

## Troubleshooting

If any item is unchecked:

1. Review the relevant section in `SETUP.md`
2. Check error logs in terminal/browser console
3. Verify environment variables are set correctly
4. Ensure all migrations have been run
5. Check Supabase dashboard for any errors
6. Verify Stripe webhook is configured correctly
7. Test individual components in isolation

## Next Steps After Verification

Once all items are checked:

1. Customize email templates in `lib/finalization.ts`
2. Customize PDF layout in `lib/pdf.ts`
3. Add contract templates functionality
4. Set up production deployment
5. Configure custom domain
6. Set up monitoring and error tracking
7. Add additional features as needed

