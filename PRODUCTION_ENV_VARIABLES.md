# Production Environment Variables Guide

## 📋 Quick Copy & Paste Reference

### 🔵 VERCEL Environment Variables

Copy these into **Vercel Dashboard → Settings → Environment Variables**:

```bash
# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
SIGNING_TOKEN_SECRET=your_32_character_random_secret_here

# ============================================
# STRIPE CONFIGURATION - PRODUCTION (LIVE MODE)
# ============================================
STRIPE_MODE=live
STRIPE_LIVE_SECRET_KEY=sk_live_your_live_secret_key_here
NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_LIVE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here

# ============================================
# STRIPE CONFIGURATION - TEST MODE (Optional, for preview deployments)
# ============================================
STRIPE_TEST_SECRET_KEY=sk_test_your_test_secret_key_here
NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_TEST_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here

# ============================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ============================================
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_gmail_app_password
SMTP_FROM=your-email@gmail.com

# OR use generic SMTP (if not using Gmail):
# SMTP_USER=your-email@domain.com
# SMTP_PASSWORD=your_smtp_password
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false

# ============================================
# OPTIONAL: CRON JOBS
# ============================================
CRON_SECRET=your_random_secret_for_cron_jobs
```

---

## 📍 Where Each Variable Goes

### ✅ VERCEL (All Environment Variables)

**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

**Set for**:
- ✅ Production
- ✅ Preview (optional - can use test keys)
- ✅ Development (optional - can use test keys)

**All variables listed above go to Vercel**

---

### ✅ SUPABASE (Configuration Only - No Environment Variables)

**Location**: Supabase Dashboard → Your Project → Settings

#### 1. Authentication → URL Configuration

Add these **Redirect URLs**:
```
https://your-domain.vercel.app/auth/callback
https://your-domain.vercel.app/dashboard
https://your-domain.vercel.app
```

Set **Site URL** to:
```
https://your-domain.vercel.app
```

#### 2. Database → Migrations

Run all migrations in order (already done if you set up locally)

#### 3. Storage → Buckets

Ensure these buckets exist:
- `contracts` (public)
- `signatures` (private)

**Note**: Supabase doesn't need environment variables - it's configured via the dashboard. The environment variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.) go to Vercel so your app can connect to Supabase.

---

### ✅ STRIPE (Configuration Only - No Environment Variables)

**Location**: Stripe Dashboard

#### 1. API Keys
- Go to **Developers → API keys**
- Copy **Live** keys for production
- Copy **Test** keys for preview/staging

#### 2. Webhooks
- Go to **Developers → Webhooks**
- Create webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
- Select events (see STRIPE_WEBHOOK_EVENTS_PRODUCTION.md)
- Copy webhook signing secret

**Note**: Stripe doesn't need environment variables - it's configured via the dashboard. The environment variables go to Vercel so your app can connect to Stripe.

---

## 🔑 Getting Your Keys

### Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **KEEP SECRET!**

### Stripe Keys

#### Live Keys (Production)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys) (Live Mode)
2. Copy:
   - **Secret key** → `STRIPE_LIVE_SECRET_KEY` (starts with `sk_live_`)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY` (starts with `pk_live_`)

#### Test Keys (Preview/Staging)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) (Test Mode)
2. Copy:
   - **Secret key** → `STRIPE_TEST_SECRET_KEY` (starts with `sk_test_`)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY` (starts with `pk_test_`)

#### Webhook Secrets
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Create webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events (see STRIPE_WEBHOOK_EVENTS_PRODUCTION.md)
4. Copy **Signing secret** → `STRIPE_LIVE_WEBHOOK_SECRET` (starts with `whsec_`)
5. Repeat for Test Mode → `STRIPE_TEST_WEBHOOK_SECRET`

### Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Go to **Security → 2-Step Verification** (enable if not enabled)
3. Go to **App passwords**
4. Generate new app password for "Mail"
5. Copy the 16-character password → `GMAIL_APP_PASSWORD`

### Signing Token Secret

Generate a secure random string:
```bash
openssl rand -hex 32
```

Or use an online generator (32+ characters)

---

## 📝 Step-by-Step Setup

### Step 1: Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Click **Add New**
5. Copy each variable from the list above
6. Set for **Production** (and optionally Preview/Development)
7. Click **Save**

### Step 2: Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication → URL Configuration**
4. Add redirect URLs (listed above)
5. Set Site URL to your production domain

### Step 3: Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create webhook endpoint (see STRIPE_WEBHOOK_EVENTS_PRODUCTION.md)
3. Copy webhook secret to Vercel

---

## ⚠️ Important Notes

1. **Never commit `.env.local` to git** - it's already in `.gitignore`
2. **`NEXT_PUBLIC_*` variables** are exposed to the browser - only put safe public keys here
3. **Secret keys** (like `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_LIVE_SECRET_KEY`) should NEVER be exposed to the browser
4. **Use Live keys for Production**, Test keys for Preview/Development
5. **Set `STRIPE_MODE=live`** for production deployments
6. **Generate a secure `SIGNING_TOKEN_SECRET`** (32+ characters) for production

---

## 🔍 Variable Reference

| Variable | Goes To | Required | Public? |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | ✅ Yes | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | ✅ Yes | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | ✅ Yes | ❌ No |
| `NEXT_PUBLIC_APP_URL` | Vercel | ✅ Yes | ✅ Yes |
| `SIGNING_TOKEN_SECRET` | Vercel | ✅ Yes | ❌ No |
| `STRIPE_MODE` | Vercel | ✅ Yes | ❌ No |
| `STRIPE_LIVE_SECRET_KEY` | Vercel | ✅ Yes | ❌ No |
| `NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY` | Vercel | ✅ Yes | ✅ Yes |
| `STRIPE_LIVE_WEBHOOK_SECRET` | Vercel | ✅ Yes | ❌ No |
| `STRIPE_TEST_SECRET_KEY` | Vercel | ⚠️ Optional | ❌ No |
| `NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY` | Vercel | ⚠️ Optional | ✅ Yes |
| `STRIPE_TEST_WEBHOOK_SECRET` | Vercel | ⚠️ Optional | ❌ No |
| `GMAIL_USER` | Vercel | ⚠️ Optional | ❌ No |
| `GMAIL_APP_PASSWORD` | Vercel | ⚠️ Optional | ❌ No |
| `SMTP_FROM` | Vercel | ⚠️ Optional | ❌ No |
| `CRON_SECRET` | Vercel | ⚠️ Optional | ❌ No |

---

## ✅ Checklist

- [ ] All Vercel environment variables set
- [ ] Supabase redirect URLs configured
- [ ] Stripe webhook endpoint created
- [ ] Stripe webhook events selected
- [ ] `STRIPE_MODE=live` for production
- [ ] `SIGNING_TOKEN_SECRET` is 32+ characters
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] Test deployment works
- [ ] Webhook deliveries are successful

---

## 🚀 Quick Deploy Checklist

1. ✅ Set all environment variables in Vercel
2. ✅ Configure Supabase redirect URLs
3. ✅ Create Stripe webhook endpoint
4. ✅ Deploy to Vercel
5. ✅ Test webhook deliveries
6. ✅ Verify authentication works
7. ✅ Test payment flow

---

**Last Updated**: Based on current codebase structure
**For Questions**: See STRIPE_WEBHOOK_EVENTS_PRODUCTION.md for webhook configuration

