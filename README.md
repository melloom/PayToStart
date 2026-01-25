# 🚀 PayToStart - Professional Contract Management Platform

<div align="center">

![PayToStart Logo](https://img.shields.io/badge/PayToStart-Contract%20Management-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe)

**Create, manage, and sign professional contracts with AI-powered assistance**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Key Features Deep Dive](#-key-features-deep-dive)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Development](#-development)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**PayToStart** is a comprehensive, production-ready contract management platform that enables businesses to create, manage, and sign professional contracts with ease. Built with modern web technologies, it offers AI-powered contract generation, digital signatures, payment processing, and subscription management.

### Why PayToStart?

- ✨ **AI-Powered**: Generate professional contracts from simple descriptions using OpenAI GPT models
- 📝 **Rich Editor**: Full-featured rich text editor with spell checking and formatting
- ✍️ **Digital Signatures**: Click-to-sign functionality with secure signature capture
- 💳 **Payment Integration**: Multiple payment methods (Stripe, Venmo, PayPal, Zelle, Bank Transfer)
- 📧 **Email Delivery**: Automated contract delivery and notifications
- 🎨 **Professional PDFs**: Generate branded PDF contracts
- 🔒 **Secure**: Enterprise-grade security with Row-Level Security (RLS)
- 💰 **Subscription Tiers**: Flexible pricing with Free, Starter, Pro, and Premium tiers

---

## ✨ Features

### Core Features

#### 🤖 AI Contract Generation
- **Smart Contract Creation**: Describe your contract needs in plain English, and AI generates a professional contract
- **Multi-Model Support**: Different AI models based on subscription tier (GPT-4o Mini, GPT-4o, GPT-4 Turbo)
- **Intelligent Field Extraction**: Automatically detects and extracts client information, dates, and contract terms
- **AI Contract Review**: Review and edit AI-generated contracts with a chat interface
- **Auto-Fix Contracts**: AI-powered contract enhancement that removes unnecessary content and improves layout

#### 📄 Contract Management
- **Rich Text Editor**: Full-featured editor with formatting, tables, and spell checking
- **Contract Templates**: Create and reuse contract templates
- **Draft Saving**: Auto-save drafts locally and to database
- **Field Placeholders**: Dynamic fields with `{{fieldName}}` syntax
- **Contract Status Tracking**: Track contracts through their lifecycle (draft, sent, signed, completed, cancelled)
- **Payment Auto-Detection**: Automatically enables payment sections when money/currency phrases are detected

#### ✍️ Digital Signatures
- **Click-to-Sign**: Secure digital signature capture
- **Signature Canvas**: Draw or type signatures
- **Multi-Party Signing**: Support for multiple signers
- **Signature Verification**: Secure token-based signing process

#### 💳 Payment Processing
- **Multiple Payment Methods**: 
  - Stripe (Credit/Debit Cards)
  - Venmo
  - PayPal
  - Zelle
  - Cash App
  - Bank Transfer (ACH/Wire)
- **Payment Scheduling**: Upfront, partial, milestone-based, or incremental payments
- **Payment Terms**: Automatic payment section generation and insertion
- **Stripe Integration**: Full Stripe payment processing with webhooks

#### 📧 Email & Notifications
- **Contract Delivery**: Send contracts via email with secure signing links
- **Email Templates**: Professional email templates for contract delivery
- **Notifications**: Email notifications for contract events (sent, signed, payment received)
- **Resend Functionality**: Resend contracts to clients

#### 📊 Subscription Management
- **Tier-Based Features**: Free, Starter ($29/mo), Pro ($79/mo), Premium ($149/mo)
- **7-Day Free Trial**: All paid plans include a free trial
- **Subscription Management**: Upgrade, downgrade, cancel, or resume subscriptions
- **Usage Tracking**: Track contract and template usage per tier
- **Feature Gating**: Automatic feature access control based on subscription tier

### Advanced Features

- **PDF Generation**: Professional PDF contracts with branding support
- **Client Management**: Manage multiple clients with contact information
- **Contract Analytics**: Track contract status and completion rates
- **Search & Filter**: Search and filter contracts by status, client, or date
- **Export Options**: Export contracts as PDF, Word, or text
- **Spell Checking**: Built-in spell checker with suggestions
- **Legal Clauses Library**: Quick-insert legal clauses and sections
- **Contract Checklist**: Ensure all essential contract elements are included

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 14.2](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom design system
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Rich Text Editor**: [TipTap](https://tiptap.dev/) with extensions
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with Zod validation
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with Next.js API Routes
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth with Row-Level Security (RLS)
- **File Storage**: Supabase Storage
- **Email**: [Nodemailer](https://nodemailer.com/)

### Third-Party Services
- **AI**: [OpenAI API](https://openai.com/) (GPT-4o, GPT-4o Mini, GPT-4 Turbo)
- **Payments**: [Stripe](https://stripe.com/)
- **Logging**: [Pino](https://getpino.io/) with pretty printing

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript
- **Deployment**: Vercel (recommended)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** (free tier works)
- **Stripe Account** (for payments)
- **OpenAI API Key** (for AI features)
- **Email Service** (SMTP credentials or service like SendGrid)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PayToStart.git
   cd PayToStart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.local.template .env.local
   ```
   
   Edit `.env.local` with your credentials (see [Configuration](#-configuration))

4. **Set up Supabase**
   - Create a new Supabase project
   - Run migrations from `supabase/migrations/` in order
   - Enable Row-Level Security (RLS) policies
   - Set up storage buckets if needed

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup Checklist

- [ ] Create Supabase project and get API keys
- [ ] Set up Stripe account and get API keys
- [ ] Get OpenAI API key
- [ ] Configure email service (SMTP)
- [ ] Run database migrations
- [ ] Set up environment variables
- [ ] Create first admin user
- [ ] Test contract creation flow
- [ ] Test payment processing
- [ ] Configure webhooks (Stripe, Supabase)

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_MODE=test  # or 'live' for production
STRIPE_TEST_SECRET_KEY=sk_test_...
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_LIVE_SECRET_KEY=sk_live_...
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create via Stripe Dashboard or scripts)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=localhost:3000

# Security
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

1. **Run Migrations**
   ```bash
   # Migrations are in supabase/migrations/
   # Run them in order (001, 002, 003, etc.)
   # Use Supabase Dashboard SQL Editor or CLI
   ```

2. **Enable RLS Policies**
   - All tables have Row-Level Security enabled
   - Policies are defined in migration files
   - Test RLS policies after setup

3. **Set up Storage**
   - Create storage buckets for file uploads
   - Configure bucket policies
   - Set up CORS if needed

### Stripe Setup

1. **Create Products and Prices**
   ```bash
   # Use the provided script
   node scripts/create-stripe-products.js
   ```

2. **Configure Webhooks**
   - Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Subscribe to events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `checkout.session.completed`

3. **Get Webhook Secret**
   - Copy webhook signing secret
   - Add to `STRIPE_WEBHOOK_SECRET` in `.env.local`

---

## 📁 Project Structure

```
PayToStart/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/             # Dashboard routes (protected)
│   │   ├── contracts/          # Contract management
│   │   ├── templates/          # Template management
│   │   ├── settings/           # User settings
│   │   └── subscription/       # Subscription management
│   ├── api/                     # API routes
│   │   ├── ai/                 # AI endpoints
│   │   ├── contracts/          # Contract CRUD
│   │   ├── subscriptions/     # Subscription management
│   │   ├── stripe/             # Stripe webhooks
│   │   └── ...
│   ├── sign/                    # Public signing pages
│   └── pay/                     # Payment pages
├── components/                   # React components
│   ├── ui/                     # Reusable UI components
│   ├── editor/                 # Rich text editor
│   ├── signature/              # Signature components
│   └── pdf/                    # PDF components
├── lib/                         # Utility libraries
│   ├── ai/                     # AI integration
│   ├── auth.ts                 # Authentication helpers
│   ├── db.ts                   # Database helpers
│   ├── payments.ts             # Payment processing
│   ├── subscriptions.ts        # Subscription logic
│   ├── security/               # Security utilities
│   └── ...
├── supabase/
│   ├── migrations/             # Database migrations
│   └── functions/              # Edge functions
├── docs/                        # Documentation
│   ├── SETUP.md               # Detailed setup guide
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── TIER_FEATURES.md       # Feature matrix
│   └── ...
├── scripts/                     # Utility scripts
│   ├── create-stripe-products.js
│   └── test-trial.js
└── public/                      # Static assets
```

---

## 🔍 Key Features Deep Dive

### AI Contract Generation

The AI contract generation feature uses OpenAI's GPT models to create professional contracts from natural language descriptions.

**How it works:**
1. User provides a contract description
2. System sends description to OpenAI API with context
3. AI generates a structured contract
4. System extracts fields and client information
5. User can review, edit, or regenerate

**Supported Models:**
- **Free Tier**: No AI access
- **Starter**: GPT-4o Mini (fast, cost-effective)
- **Pro**: GPT-4o (balanced performance)
- **Premium**: GPT-4 Turbo (best quality)

**Example:**
```
Input: "Web development contract for $5000, 50% upfront, 
        completion in 4 weeks, includes 5 pages"

Output: Professional contract with:
- Payment terms ($5000 total, $2500 deposit)
- Timeline (4 weeks)
- Scope (5 web pages)
- All standard legal clauses
```

### Payment Auto-Detection

The system automatically detects money-related phrases in contracts and enables payment features.

**Detection Patterns:**
- Currency symbols: $, €, £, ¥, etc.
- Money keywords: payment, fee, salary, invoice, etc.
- Amount patterns: $100, 100 USD, per hour, etc.

**When detected:**
- Automatically enables "Payment & Compensation" checkbox
- Enables "Insert Payment Details into Contract"
- Sets default compensation type to "fixed_amount"

### Contract Templates

Create reusable contract templates with dynamic fields.

**Template Features:**
- Custom fields with `{{fieldName}}` syntax
- Template categories
- Template library
- Quick insert into contracts

**Example Template:**
```
SERVICE AGREEMENT

Client: {{clientName}}
Service: {{serviceDescription}}
Amount: ${{totalAmount}}
Due Date: {{dueDate}}
```

### Digital Signatures

Secure, token-based signature system.

**Security Features:**
- Unique signing tokens
- Token expiration
- Signature verification
- Audit trail
- PDF signature embedding

---

## 📚 API Documentation

### Contract Endpoints

#### Create Contract
```http
POST /api/contracts
Content-Type: application/json

{
  "title": "Service Agreement",
  "content": "Contract content...",
  "clientId": "client-uuid",
  "hasCompensation": true,
  "totalAmount": "5000.00"
}
```

#### Get Contract
```http
GET /api/contracts/[id]
```

#### Sign Contract
```http
POST /api/contracts/sign/[token]
Content-Type: application/json

{
  "signature": "data:image/png;base64,...",
  "signerName": "John Doe"
}
```

### AI Endpoints

#### Generate Contract
```http
POST /api/ai/generate-contract
Content-Type: application/json

{
  "description": "Web development contract...",
  "contractType": "service",
  "additionalDetails": "..."
}
```

#### Fix Contract
```http
POST /api/ai/fix-contract
Content-Type: application/json

{
  "contractContent": "Contract text...",
  "compensationData": {
    "hasCompensation": true,
    "totalAmount": "5000.00",
    "depositAmount": "2500.00"
  }
}
```

### Subscription Endpoints

#### Create Checkout Session
```http
POST /api/subscriptions/create-checkout
Content-Type: application/json

{
  "tier": "pro",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/cancel"
}
```

#### Cancel Subscription
```http
POST /api/subscriptions/cancel
```

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Configure Domains**
   - Add custom domain in Vercel
   - Update `NEXT_PUBLIC_APP_URL` in environment variables

### Environment Variables for Production

Ensure all environment variables are set in Vercel:
- Supabase keys
- Stripe keys (use live keys)
- OpenAI API key
- Email SMTP credentials
- App URLs

### Database Migrations

Run migrations on production database:
```bash
# Use Supabase CLI or Dashboard
supabase db push
```

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Test contract creation
- [ ] Test payment processing
- [ ] Configure webhooks (Stripe, Supabase)
- [ ] Set up monitoring and logging
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Test email delivery
- [ ] Verify RLS policies

---

## 💻 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Test trial subscription
npm run test:trial
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code
   - Add tests if applicable
   - Update documentation

3. **Test locally**
   ```bash
   npm run dev
   # Test your changes
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Open PR on GitHub
   - Request review
   - Address feedback
   - Merge when approved

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Formatting**: Prettier (if configured)
- **Components**: Functional components with TypeScript
- **Naming**: camelCase for variables, PascalCase for components

### Testing

```bash
# Run tests (if configured)
npm test

# Test specific feature
npm test -- contracts
```

---

## 🔒 Security

### Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **Authentication**: Supabase Auth with secure sessions
- **API Security**: Rate limiting, input sanitization
- **Payment Security**: PCI-compliant Stripe integration
- **Signature Security**: Token-based, time-limited signing links
- **Data Encryption**: Encrypted at rest and in transit

### Security Best Practices

- Never commit `.env.local` files
- Use environment variables for secrets
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use HTTPS in production
- Implement rate limiting
- Sanitize user inputs
- Validate all API requests

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
5. **Push to the branch** (`git push origin feature/amazing-feature`)
6. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Request review before merging

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Stripe](https://stripe.com/) for payment processing
- [OpenAI](https://openai.com/) for AI capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [TipTap](https://tiptap.dev/) for the rich text editor

---

## 📞 Support

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Open an issue on GitHub
- **Email**: support@paytostart.com (if configured)

---

## 🗺 Roadmap

### Upcoming Features

- [ ] SMS Reminders (Pro/Premium)
- [ ] File Attachments (Pro/Premium)
- [ ] Custom Branding (Pro/Premium)
- [ ] Bulk Contract Download (Pro/Premium)
- [ ] Dropbox Sign Integration (Premium)
- [ ] DocuSign Integration (Premium)
- [ ] Multi-user Team Roles (Premium)
- [ ] Stripe Connect Payouts (Premium)
- [ ] Custom Integrations (Premium)

---

<div align="center">

**Made with ❤️ by the PayToStart Team**

[⭐ Star us on GitHub](https://github.com/yourusername/PayToStart) • [📖 Documentation](./docs/) • [🐛 Report Bug](https://github.com/yourusername/PayToStart/issues)

</div>
