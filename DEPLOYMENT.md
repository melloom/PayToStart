# Deployment Guide

This guide covers deploying the Contract Manager application to Vercel with Supabase and Stripe integration.

## Architecture

### Hosting Stack

- **Frontend & API**: Vercel (Next.js)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Storage**: Supabase Storage
- **Payments**: Stripe (hosted)
- **Email**: Gmail SMTP (or your email provider)
- **Background Workers**: Vercel Cron (optional) or Supabase Edge Functions

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Already set up (see SETUP.md)
3. **Stripe Account**: Already set up (see PAYMENTS.md)
4. **Gmail Account**: For email via SMTP (optional)

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
# From project root
cd contract-manager
vercel
```

4. **Set Environment Variables**:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD
vercel env add SMTP_FROM
```

5. **Deploy to Production**:
```bash
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. **Import Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository (GitHub, GitLab, or Bitbucket)

2. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `contract-manager` (if not at root)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local.example`
   - Set for Production, Preview, and Development

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

## Step 2: Configure Environment Variables

### Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (keep secret!)
```

#### Application
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

#### Stripe
```
STRIPE_SECRET_KEY=sk_live_your_secret_key (production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Email (Optional)
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

### Environment-Specific Variables

- **Production**: Use production API keys
- **Preview**: Use test/staging keys
- **Development**: Use local development keys

## Step 3: Configure Supabase

### Update Redirect URLs

1. Go to Supabase Dashboard → Authentication → Settings
2. Add Redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/dashboard`
   - `https://your-domain.vercel.app` (Site URL)

3. Update Site URL to production domain

### Verify RLS Policies

Ensure all RLS policies are active in production database.

### Verify Storage Buckets

Ensure all storage buckets exist and have correct policies.

## Step 4: Configure Stripe Webhook

### Production Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Test Webhook Locally (Optional)

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Step 5: Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `contracts.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update environment variables:
   - `NEXT_PUBLIC_APP_URL=https://contracts.yourdomain.com`
5. Update Supabase redirect URLs to match new domain

### SSL/HTTPS

Vercel automatically provisions SSL certificates via Let's Encrypt.

## Step 6: Background Workers (Optional)

### Option A: Vercel Cron Jobs

Create `vercel.json` with cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Example Cron Job**: `app/api/cron/cleanup/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret (security)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Your cleanup logic here
  // e.g., Delete old draft contracts, cleanup temp files, etc.

  return NextResponse.json({ success: true });
}
```

### Option B: Supabase Edge Functions

For serverless functions close to your database:

1. **Install Supabase CLI**:
```bash
npm install -g supabase
```

2. **Create Edge Function**:
```bash
supabase functions new cleanup-old-contracts
```

3. **Deploy**:
```bash
supabase functions deploy cleanup-old-contracts
```

### Option C: Render/Fly.io Worker

For long-running background tasks:

1. **Create worker service** (e.g., on Render)
2. **Use service**: Process payment reconciliations, generate reports, etc.
3. **Connect via API**: Worker calls your Vercel API endpoints

## Step 7: Verify Deployment

### Checklist

- [ ] Application deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Stripe webhook configured
- [ ] Custom domain configured (if using)
- [ ] SSL certificate active
- [ ] Can access application at production URL
- [ ] Can login/create account
- [ ] Can create contracts
- [ ] Can sign contracts
- [ ] Payments work (test mode first!)
- [ ] Webhooks receive events
- [ ] PDFs generate correctly
- [ ] Emails send (or log in dev mode)

### Testing

1. **Create Test Contract**:
   - Login to production
   - Create a test contract
   - Verify signing link works

2. **Test Payment Flow**:
   - Sign contract
   - Complete payment with Stripe test card
   - Verify webhook receives event
   - Verify contract finalizes
   - Verify PDF generates

3. **Test Email**:
   - Check email inboxes (or console logs)
   - Verify both parties receive emails
   - Verify PDF links work

## Production Best Practices

### Security

1. **Environment Variables**: Never commit secrets to Git
2. **API Keys**: Use production keys only in production
3. **Webhook Secrets**: Always verify webhook signatures
4. **RLS**: Ensure Row Level Security is enabled
5. **HTTPS**: Always use HTTPS in production

### Monitoring

1. **Vercel Analytics**: Enable Vercel Analytics for performance monitoring
2. **Error Tracking**: Set up error tracking (Sentry, LogRocket, etc.)
3. **Stripe Dashboard**: Monitor payments and webhooks
4. **Supabase Dashboard**: Monitor database performance
5. **Email Logs**: Monitor email delivery rates

### Performance

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatically handled by Next.js
3. **Caching**: Vercel Edge Network provides caching
4. **Database Indexes**: Ensure all indexes are created
5. **PDF Generation**: Consider background jobs for heavy PDFs

### Backup & Recovery

1. **Database Backups**: Supabase provides automatic backups
2. **Manual Backups**: Use Supabase Dashboard → Database → Backups
3. **File Backups**: Supabase Storage includes redundancy
4. **Version Control**: Keep code in Git for easy rollback

## Troubleshooting

### Build Failures

1. **Check Build Logs**: Vercel Dashboard → Deployments → Build Logs
2. **Verify Dependencies**: Ensure all packages are in `package.json`
3. **TypeScript Errors**: Run `npm run build` locally first
4. **Environment Variables**: Ensure all required vars are set

### Runtime Errors

1. **Check Function Logs**: Vercel Dashboard → Functions
2. **Check Supabase Logs**: Supabase Dashboard → Logs
3. **Check Stripe Logs**: Stripe Dashboard → Webhooks
4. **Check Browser Console**: For client-side errors

### Webhook Issues

1. **Verify Webhook Secret**: Must match Stripe dashboard
2. **Check Endpoint URL**: Must be correct in Stripe
3. **Verify Events**: Ensure `checkout.session.completed` is selected
4. **Check Logs**: View webhook logs in Stripe dashboard

### Database Connection Issues

1. **Verify Supabase URL**: Check environment variable
2. **Check API Key**: Verify anon key is correct
3. **Check RLS**: Ensure policies allow access
4. **Check Network**: Verify Supabase project is accessible

## Scaling Considerations

### Database Scaling

- Supabase scales automatically
- Monitor query performance
- Add indexes as needed
- Consider connection pooling for high traffic

### API Scaling

- Vercel scales automatically
- Edge Network for global distribution
- Serverless functions scale on demand
- Monitor function execution time

### Storage Scaling

- Supabase Storage scales automatically
- Monitor storage usage
- Set up lifecycle policies for old files
- Consider CDN for PDF delivery

## Maintenance

### Regular Tasks

1. **Monitor Errors**: Check error logs weekly
2. **Update Dependencies**: Keep packages up to date
3. **Review Logs**: Check Supabase, Stripe, and Vercel logs
4. **Backup Verification**: Verify backups monthly
5. **Security Updates**: Keep Next.js and dependencies updated

### Updates

1. **Deploy Updates**: Use Vercel Git integration
2. **Database Migrations**: Run migrations in Supabase SQL Editor
3. **Test Before Deploy**: Use Preview deployments
4. **Rollback Plan**: Keep previous versions tagged in Git

## Support

### Vercel

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

### Supabase

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Support](https://supabase.com/support)

### Stripe

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

## Cost Estimates

### Vercel

- **Hobby**: Free (suitable for small projects)
- **Pro**: $20/month (recommended for production)
- **Enterprise**: Custom pricing

### Supabase

- **Free Tier**: Up to 500MB database, 1GB storage
- **Pro**: $25/month (recommended for production)
- **Team**: Custom pricing

### Stripe

- **Pay-as-you-go**: 2.9% + $0.30 per transaction
- **No monthly fees**

### Gmail SMTP

- **Free**: Unlimited emails (subject to Gmail's daily limits)
- **Google Workspace**: $6/user/month for business features
- **Daily Limits**: 500 emails/day for free Gmail, 2,000/day for Workspace

## Quick Deploy Checklist

1. ✅ Push code to Git repository
2. ✅ Connect repository to Vercel
3. ✅ Set environment variables in Vercel
4. ✅ Deploy to Vercel
5. ✅ Update Supabase redirect URLs
6. ✅ Configure Stripe webhook
7. ✅ Test application in production
8. ✅ Set up custom domain (optional)
9. ✅ Configure monitoring (optional)
10. ✅ Set up backups (automatic with Supabase)

