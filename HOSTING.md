# Hosting & Deployment Guide

Complete guide for deploying Contract Manager to production.

## Hosting Stack

### Primary Hosting
- **Next.js Application**: Vercel (recommended)
- **Database**: Supabase (hosted PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Payments**: Stripe (hosted)

### Background Workers (Optional)
- **Vercel Cron Jobs**: Scheduled tasks (recommended)
- **Supabase Edge Functions**: Serverless functions near database
- **Render/Fly.io Worker**: Long-running background tasks

## Vercel Deployment

### Quick Deploy

1. **Push to Git**:
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production.example`
   - Set for Production, Preview, and Development

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Access at `https://your-project.vercel.app`

### Vercel CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
cd contract-manager
vercel --prod
```

### Environment Variables in Vercel

Set these in Vercel Dashboard → Settings → Environment Variables:

**Required for Production**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
STRIPE_SECRET_KEY=sk_live_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

**Optional**:
```
CRON_SECRET=random_secret_for_cron_jobs
```

## Supabase Configuration

### Update Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Site URL: `https://your-domain.vercel.app`
3. Add Redirect URLs:
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/dashboard`
   - `https://your-domain.vercel.app`

### Verify Database Migrations

Ensure all migrations are run in production database:
- `001_initial_schema.sql`
- `002_rls_policies.sql`
- `003_storage_buckets.sql`
- `004_trigger_company_creation.sql`
- `005_add_signature_fields.sql` (if needed)

### Verify Storage Buckets

Check that all buckets exist:
- `contract-pdfs`
- `signatures`
- `attachments`

## Stripe Configuration

### Production Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

### Switch to Live Keys

1. Get live API keys from Stripe Dashboard
2. Update environment variables in Vercel:
   - `STRIPE_SECRET_KEY`: Use `sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Use `pk_live_...`

## Custom Domain (Optional)

### Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `contracts.yourdomain.com`)
3. Configure DNS as instructed:
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation
4. Vercel automatically provisions SSL certificate

### Update Environment Variables

After adding custom domain:
```
NEXT_PUBLIC_APP_URL=https://contracts.yourdomain.com
```

### Update Supabase Redirect URLs

Add new domain to Supabase redirect URLs.

## Background Workers

### Option 1: Vercel Cron Jobs (Recommended)

**Configuration**: `vercel.json`

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

**Cron Job**: `app/api/cron/cleanup/route.ts`

- **Schedule**: Daily at 2 AM UTC
- **Security**: Protected with `CRON_SECRET`
- **Purpose**: Clean up old draft/cancelled contracts

**Set Cron Secret**:
```bash
vercel env add CRON_SECRET
# Enter a random secret
```

### Option 2: Supabase Edge Functions

**Function**: `supabase/functions/cleanup-old-contracts/`

**Deploy**:
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link
supabase login
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy cleanup-old-contracts
```

**Invoke**:
```bash
# Via cron or manually
curl -X POST https://your-project.supabase.co/functions/v1/cleanup-old-contracts \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### Option 3: Render/Fly.io Worker

For long-running background tasks:

**Example Render Service**:
```yaml
# render.yaml
services:
  - type: worker
    name: contract-cleanup-worker
    env: docker
    dockerfilePath: ./Dockerfile.worker
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
```

**Worker Code**:
```typescript
// Worker runs continuously, polls for tasks
setInterval(async () => {
  await cleanupOldContracts();
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

## Monitoring

### Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Vercel Analytics
3. Monitor:
   - Page views
   - Function invocations
   - Function execution time
   - Error rates

### Error Tracking

Consider adding:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Vercel Logs**: Built-in logging

### Database Monitoring

**Supabase Dashboard**:
- Monitor query performance
- Check storage usage
- Review authentication metrics
- View error logs

### Payment Monitoring

**Stripe Dashboard**:
- Monitor payment success rates
- Check webhook delivery
- Review payment disputes
- Track revenue

## Performance Optimization

### Vercel

- **Edge Network**: Automatic global CDN
- **Serverless Functions**: Auto-scaling
- **Image Optimization**: Next.js Image component
- **Caching**: Automatic static asset caching

### Database

- **Connection Pooling**: Supabase handles automatically
- **Indexes**: Ensure all indexes are created
- **Query Optimization**: Monitor slow queries

### Storage

- **CDN**: Supabase Storage includes CDN
- **Lifecycle Policies**: Set up cleanup for old files
- **Optimize Images**: Compress signature images

## Security Checklist

### Production Security

- [ ] All environment variables set (no secrets in code)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] RLS policies enabled on all tables
- [ ] Webhook signatures verified
- [ ] API routes protected
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if needed)
- [ ] Database backups enabled
- [ ] SSL certificates active

## Troubleshooting

### Build Failures

1. Check Vercel build logs
2. Verify all dependencies in `package.json`
3. Check for TypeScript errors locally
4. Ensure environment variables are set

### Runtime Errors

1. Check Vercel function logs
2. Check Supabase logs
3. Verify environment variables
4. Test API endpoints manually

### Database Connection

1. Verify Supabase URL and keys
2. Check RLS policies
3. Test queries in Supabase SQL Editor
4. Verify network access

### Webhook Issues

1. Verify webhook URL is correct
2. Check webhook secret matches
3. View webhook logs in Stripe
4. Test with Stripe CLI locally

## Rollback Plan

### Quick Rollback

1. **Via Vercel Dashboard**:
   - Go to Deployments
   - Click "..." on previous deployment
   - Select "Promote to Production"

2. **Via Git**:
```bash
git revert HEAD
git push origin main
```

### Database Rollback

- Supabase provides automatic backups
- Restore via Supabase Dashboard → Database → Backups
- Use point-in-time recovery if needed

## Cost Estimation

### Vercel

- **Hobby**: Free (suitable for testing)
- **Pro**: $20/month (recommended for production)
  - Unlimited bandwidth
  - 100GB bandwidth included
  - Advanced analytics

### Supabase

- **Free Tier**: 500MB database, 1GB storage
- **Pro**: $25/month (recommended)
  - 8GB database
  - 100GB storage
  - Daily backups

### Stripe

- **Pay-as-you-go**: 2.9% + $0.30 per transaction
- **No monthly fees**

### Gmail SMTP

- **Free**: Unlimited emails (subject to Gmail's daily limits)
- **Google Workspace**: $6/user/month for business features
- **Daily Limits**: 500 emails/day for free Gmail, 2,000/day for Workspace

**Estimated Monthly Cost**: ~$65-70/month (Pro tiers + Stripe fees)

## Support

### Vercel

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

### Supabase

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Support](https://supabase.com/support)

### Stripe

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

## Quick Deploy Checklist

1. ✅ Push code to Git repository
2. ✅ Create Vercel account
3. ✅ Import repository to Vercel
4. ✅ Set environment variables in Vercel
5. ✅ Deploy to Vercel
6. ✅ Update Supabase redirect URLs
7. ✅ Configure Stripe webhook
8. ✅ Test application in production
9. ✅ Set up custom domain (optional)
10. ✅ Configure monitoring (optional)
11. ✅ Set up backups (automatic with Supabase)

