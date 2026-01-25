# Cron Job Alternatives for Pay2Start

Since Vercel Hobby plan limits cron jobs to once per day, here are free/affordable alternatives for running your scheduled tasks.

## Current Cron Jobs

1. **Cleanup old contracts** - Daily at 2 AM (`0 2 * * *`)
2. **Expire trials** - Hourly (`0 * * * *`) ⚠️ **This needs to run more than once per day**

## Recommended Alternatives

### Option 1: External Cron Service (Easiest & Free) ⭐ **RECOMMENDED**

Use a free external cron service to call your API endpoints.

#### A. cron-job.org (Free)

1. **Sign up**: https://cron-job.org (free tier available)
2. **Create cron job**:
   - **URL**: `https://your-domain.vercel.app/api/cron/expire-trials`
   - **Schedule**: `0 * * * *` (hourly)
   - **Method**: GET or POST
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
3. **Repeat for cleanup job**:
   - **URL**: `https://your-domain.vercel.app/api/cron/cleanup`
   - **Schedule**: `0 2 * * *` (daily at 2 AM)
   - **Headers**: Same as above

**Pros**: Free, easy setup, reliable
**Cons**: External dependency

#### B. EasyCron (Free tier: 1 job)

1. **Sign up**: https://www.easycron.com
2. Similar setup to cron-job.org
3. Free tier allows 1 cron job (use for hourly trial expiration)
4. Keep cleanup on Vercel (daily is fine)

#### C. GitHub Actions (Free for public repos)

Create `.github/workflows/cron.yml`:

```yaml
name: Expire Trials Cron

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Manual trigger

jobs:
  expire-trials:
    runs-on: ubuntu-latest
    steps:
      - name: Call Expire Trials API
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.vercel.app/api/cron/expire-trials
```

**Pros**: Free, integrated with GitHub
**Cons**: Requires public repo or GitHub Pro

### Option 2: Supabase Edge Functions + pg_cron ⭐ **BEST FOR DATABASE TASKS**

Use Supabase's built-in pg_cron extension to run database functions directly.

#### Setup pg_cron in Supabase

1. **Enable pg_cron**:
   ```sql
   -- Run in Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. **Schedule trial expiration** (runs in database):
   ```sql
   -- Schedule to run every hour
   SELECT cron.schedule(
     'expire-trials-hourly',
     '0 * * * *',  -- Every hour
     $$SELECT expire_trials()$$
   );
   ```

3. **Schedule cleanup** (daily):
   ```sql
   -- Schedule to run daily at 2 AM
   SELECT cron.schedule(
     'cleanup-contracts-daily',
     '0 2 * * *',  -- Daily at 2 AM
     $$SELECT cleanup_old_contracts()$$
   );
   ```

**Pros**: 
- Free (included with Supabase)
- Runs directly in database (fast)
- No external dependencies
- Reliable

**Cons**: 
- Requires creating database functions
- Less flexible than API calls

#### Create Database Functions

Add to a new migration file:

```sql
-- Function to expire trials (already exists in 008_add_trial_support.sql)
-- Just schedule it with pg_cron

-- Function to cleanup old contracts
CREATE OR REPLACE FUNCTION cleanup_old_contracts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  -- Delete contracts older than 90 days with status 'draft' or 'cancelled'
  cutoff_date := NOW() - INTERVAL '90 days';
  
  WITH deleted AS (
    DELETE FROM contracts
    WHERE (status = 'draft' OR status = 'cancelled')
      AND created_at < cutoff_date
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Option 3: Render Cron Jobs (Free tier available)

1. **Create a Render account**: https://render.com
2. **Create a Cron Job**:
   - **Name**: Expire Trials
   - **Schedule**: `0 * * * *`
   - **Command**: 
     ```bash
     curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/expire-trials
     ```
   - **Environment**: Add `CRON_SECRET`

**Pros**: Free tier available, reliable
**Cons**: Another service to manage

### Option 4: Railway Cron Jobs

1. **Sign up**: https://railway.app
2. **Create a Cron Job** service
3. Similar setup to Render

**Pros**: Simple, good free tier
**Cons**: Another service

### Option 5: Cloudflare Workers + Cron Triggers

If you're using Cloudflare:

1. **Create a Worker**:
   ```javascript
   export default {
     async scheduled(event, env, ctx) {
       await fetch('https://your-domain.vercel.app/api/cron/expire-trials', {
         headers: {
           'Authorization': `Bearer ${env.CRON_SECRET}`
         }
       });
     }
   }
   ```

2. **Add Cron Trigger** in Cloudflare Dashboard

**Pros**: Free tier, fast, global
**Cons**: Requires Cloudflare setup

## Recommended Setup

### For Pay2Start, I recommend:

1. **Use Supabase pg_cron** for trial expiration (hourly) - Free, reliable, runs in database
2. **Keep Vercel cron** for cleanup (daily) - One job per day is fine on Hobby plan
3. **OR use cron-job.org** for both - Free, simple, external

## Implementation Guide

### Quick Setup: cron-job.org (5 minutes)

1. Go to https://cron-job.org
2. Sign up (free)
3. Create cron job:
   - **Title**: Expire Trials
   - **URL**: `https://your-domain.vercel.app/api/cron/expire-trials`
   - **Schedule**: Every hour
   - **Request Method**: GET
   - **HTTP Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
4. Test it
5. Done!

### Quick Setup: Supabase pg_cron (10 minutes)

1. **Enable extension** (run in Supabase SQL Editor):
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;
   ```

2. **Schedule trial expiration**:
   ```sql
   SELECT cron.schedule(
     'expire-trials-hourly',
     '0 * * * *',
     $$SELECT expire_trials()$$
   );
   ```

3. **Verify it's scheduled**:
   ```sql
   SELECT * FROM cron.job;
   ```

4. **Remove from vercel.json** (optional):
   - Remove the expire-trials cron from `vercel.json`
   - Keep only the cleanup job

## Security Notes

All cron endpoints are protected with `CRON_SECRET`. Make sure to:
- Set `CRON_SECRET` in your environment variables
- Use it in the Authorization header when calling from external services
- Never commit the secret to git

## Cost Comparison

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **cron-job.org** | ✅ Unlimited | $2.99/mo (premium features) |
| **Supabase pg_cron** | ✅ Included | Included in all plans |
| **GitHub Actions** | ✅ Public repos | Free for private (limited) |
| **Render** | ✅ Limited | $7/mo |
| **Railway** | ✅ $5 credit | Pay as you go |
| **Vercel Pro** | ❌ | $20/mo (unlimited crons) |

## Migration Steps

1. **Choose your alternative** (recommend cron-job.org or Supabase pg_cron)
2. **Set up the cron job** using the guide above
3. **Test it works** by checking logs
4. **Remove from vercel.json** (optional - you can keep both for redundancy)
5. **Update documentation** with your chosen solution

## Troubleshooting

### Cron job not running?
- Check the URL is correct
- Verify `CRON_SECRET` matches
- Check service logs
- Test the endpoint manually with curl

### Getting 401 Unauthorized?
- Verify `CRON_SECRET` is set in environment
- Check Authorization header format: `Bearer YOUR_SECRET`
- Make sure secret matches in both places

### Database function not found?
- Run the migration that creates `expire_trials()` function
- Check it exists: `SELECT * FROM pg_proc WHERE proname = 'expire_trials';`




