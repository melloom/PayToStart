# Contract Manager

A professional contract management system for contractors and clients built with Next.js, Supabase, and Stripe.

## Pipeline

1. Contractor logs in → creates contract from template → sends client link → client signs → client pays deposit → system generates "final signed+paid" PDF → emails both + stores it → contractor dashboard shows status.

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** + shadcn/ui
- **React Hook Form** + Zod for form validation
- **TanStack Table** for data tables
- **Framer Motion** for animations
- **@react-pdf/renderer** for PDF generation

### Backend
- **Supabase** for:
  - PostgreSQL database (multi-tenant architecture)
  - Authentication (email magic link + password)
  - Storage (PDFs, signatures, attachments)
  - Row Level Security (RLS) for tenant isolation
- **Stripe** for payment processing (Checkout Sessions)
- **Gmail SMTP** (or your email provider) for email notifications

### Hosting
- **Vercel** for Next.js deployment
- **Supabase** for database and storage (hosted)
- **Stripe** for payments (hosted)
- **Vercel Cron** or Supabase Edge Functions for background workers

## Quick Start

### Development

1. **Clone and install**:
```bash
git clone <your-repo>
cd contract-manager
npm install
```

2. **Set up environment variables**:
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

3. **Run database migrations**:
   - Go to Supabase SQL Editor
   - Run migrations in `supabase/migrations/` in order

4. **Start development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel**:
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Features

### Contractor Portal (Auth Required)
- ✅ Email + Password or Magic Link authentication
- ✅ Create contracts from templates or scratch
- ✅ Send signing links to clients
- ✅ Track contract statuses (draft, sent, signed, paid, completed)
- ✅ Download final PDFs
- ✅ Multi-tenant data isolation (RLS)

### Client Signing Page (Token-Based, No Auth)
- ✅ Access via secure tokenized link
- ✅ Review contract content
- ✅ Type full name (required)
- ✅ Draw signature on canvas (optional)
- ✅ Check "I agree" checkbox
- ✅ Pay deposit via Stripe Checkout

### Payment Processing
- ✅ Stripe Checkout Sessions for fast deposits
- ✅ Webhook-based finalization
- ✅ Automatic payment verification
- ✅ Secure payment handling

### PDF Generation
- ✅ React-based PDF generation (@react-pdf/renderer)
- ✅ Professional layout with consistent styling
- ✅ Includes signatures, metadata, and payment confirmation
- ✅ Stored in Supabase Storage

### Email Notifications
- ✅ Automated emails on contract finalization
- ✅ Client receives final PDF link
- ✅ Contractor receives completion notification
- ✅ Professional HTML email templates

## Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment to Vercel
- **[PAYMENTS.md](./PAYMENTS.md)** - Payment system documentation
- **[SIGNATURES.md](./SIGNATURES.md)** - Signature system documentation
- **[PDF.md](./PDF.md)** - PDF generation documentation
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Architecture overview
- **[CHECKLIST.md](./CHECKLIST.md)** - Setup verification checklist

## Project Structure

```
contract-manager/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Contractor portal (auth required)
│   ├── sign/              # Client signing (token-based)
│   └── pay/               # Payment page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── pdf/              # PDF components
│   └── signature/        # Signature components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   ├── db.ts             # Database queries
│   ├── auth.ts           # Authentication
│   ├── pdf.ts            # PDF generation
│   ├── payments.ts       # Payment utilities
│   └── signature.ts      # Signature utilities
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge Functions (optional)
└── vercel.json           # Vercel configuration
```

## Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Multi-tenant data isolation
- ✅ Secure token-based signing links
- ✅ Webhook signature verification
- ✅ Environment variable security
- ✅ HTTPS enforced in production

## License

Private - All rights reserved
