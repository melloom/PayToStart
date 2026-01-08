# Implementation Guide

This document provides a detailed overview of the two-app architecture and the finalization brain.

## Architecture Overview

### Two "Apps"

#### 1. Contractor Portal (`/dashboard/*`)
- **Authentication**: Required (Supabase Auth)
- **Access**: Login with email/password or magic link
- **Features**:
  - Create contract templates
  - Create contracts from templates or scratch
  - View all contracts with status tracking
  - Monitor contract progress
  - Download final PDFs
  - Manage clients

#### 2. Client Signing Page (`/sign/[token]`)
- **Authentication**: None (token-based access)
- **Access**: Secure tokenized link (e.g., `/sign/abc123def456...`)
- **Features**:
  - View contract details
  - Sign contract (one-click)
  - Pay deposit via Stripe Checkout
  - View completion status

## The Finalization Brain

The finalization brain is a Stripe webhook handler that processes completed payments and finalizes contracts.

### Flow

```
1. Client signs contract → Status: "signed"
   ↓
2. Client redirected to /pay/[token]
   ↓
3. Client completes Stripe Checkout
   ↓
4. Stripe sends webhook: checkout.session.completed
   ↓
5. Webhook handler verifies:
   - Contract is signed ✓
   - Payment amount matches deposit ✓
   - Payment status is completed ✓
   ↓
6. Update payment record → Status: "completed"
   ↓
7. Update contract → Status: "paid", paidAt: now
   ↓
8. Generate final PDF (jsPDF)
   ↓
9. Upload PDF to Supabase Storage
   ↓
10. Update contract → Status: "completed", pdfUrl: url, completedAt: now
   ↓
11. Send emails:
    - Client: Receipt + final PDF link
    - Contractor: Notification + final PDF link
```

### Webhook Handler

**Location**: `/app/api/stripe/webhook/route.ts`

**Security**:
- Verifies Stripe webhook signature
- Validates contract state before processing
- Idempotent (safe to retry)

**Process**:
1. Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
2. Extract contract ID and signing token from metadata
3. Verify contract is in "signed" status
4. Verify payment amount matches deposit
5. Update payment record
6. Update contract to "paid" status
7. Call `finalizeContract()` which:
   - Generates PDF
   - Uploads to storage
   - Updates contract to "completed"
   - Sends emails

### Finalization Function

**Location**: `/lib/finalization.ts`

**Function**: `finalizeContract(contractId: string)`

**Steps**:
1. Fetch contract with all related data (client, contractor)
2. Verify contract is signed and paid
3. Generate PDF using `generateContractPDF()`
4. Upload PDF to Supabase Storage
5. Update contract with PDF URL and "completed" status
6. Send emails to both parties using `sendEmail()`

## Key Files

### Authentication & Routes
- `/app/login/page.tsx` - Contractor login (magic link + password)
- `/app/dashboard/page.tsx` - Contractor dashboard
- `/app/dashboard/contracts/new/page.tsx` - Create contract
- `/app/dashboard/contracts/[id]/page.tsx` - View contract details

### Client Flow
- `/app/sign/[token]/page.tsx` - Client signing page (no auth)
- `/app/pay/[token]/page.tsx` - Payment page (Stripe Checkout)
- `/app/sign/[token]/complete/page.tsx` - Completion confirmation

### Payment & Finalization
- `/app/api/stripe/create-checkout/route.ts` - Create Stripe checkout session
- `/app/api/stripe/webhook/route.ts` - Webhook handler (finalization brain)
- `/app/api/stripe/verify-session/route.ts` - Verify payment status
- `/lib/finalization.ts` - Finalization logic
- `/lib/pdf.ts` - PDF generation
- `/lib/email/index.ts` - Email sending

### Database
- `/lib/db.ts` - Database queries (Supabase)
- `/lib/types.ts` - TypeScript types
- `/lib/storage.ts` - File storage utilities

## Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (Gmail SMTP)
GMAIL_USER=
GMAIL_APP_PASSWORD=
SMTP_FROM=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing the Flow

### 1. Create Contract (Contractor)
1. Login at `/login`
2. Go to `/dashboard/contracts/new`
3. Fill in client details and contract content
4. Set deposit amount
5. Create contract
6. Copy signing link

### 2. Sign Contract (Client)
1. Open signing link: `/sign/[token]`
2. Review contract
3. Click "Sign Contract"
4. Redirected to `/pay/[token]` if deposit required

### 3. Pay Deposit (Client)
1. Review payment details
2. Click "Pay $X.XX Deposit"
3. Complete Stripe Checkout
4. Redirected to `/sign/[token]/complete`

### 4. Finalization (Automatic)
1. Stripe webhook receives `checkout.session.completed`
2. Webhook handler processes payment
3. PDF generated and uploaded
4. Emails sent to both parties
5. Contract status: "completed"

### 5. View Final Contract (Contractor)
1. Go to `/dashboard`
2. Find completed contract
3. Click to view details
4. Download final PDF

## Local Development

### Stripe Webhook Testing

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will output a webhook secret starting with `whsec_`. Use this as your `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### Testing Without Stripe (Development)

You can test the finalization flow manually:

```typescript
// In a test script or API route
import { finalizeContract } from "@/lib/finalization";

await finalizeContract("contract-id");
```

## Security Considerations

1. **Token-Based Access**: Signing tokens are cryptographically secure (32-byte random hex)
2. **Webhook Verification**: All Stripe webhooks are verified using signatures
3. **RLS**: All database queries are scoped by company_id via Row Level Security
4. **Storage**: PDFs are stored privately, accessible only via signed URLs or RLS
5. **Payment Verification**: Payment amounts are verified before finalization

## Error Handling

- Webhook failures are logged but return 200 to prevent retries
- Email failures don't block finalization (contract is still completed)
- PDF generation failures throw errors and prevent completion
- All errors are logged for investigation

## Scaling Considerations

- Webhook handler is stateless and can scale horizontally
- PDF generation can be moved to background jobs (e.g., Bull, BullMQ)
- Email sending can use a queue system
- Storage is handled by Supabase (scales automatically)

