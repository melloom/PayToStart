# Cron Job Setup Guide

This guide explains how to set up cron jobs for Pay2Start subscription notifications.

## Available Cron Jobs

### 1. Subscription Ending Notifications
**Endpoint:** `/api/cron/notify-subscription-ending`  
**Schedule:** Daily at 9:00 AM UTC  
**Purpose:** Sends email notifications to users whose subscriptions end tomorrow

### 2. Trial Expiration (if needed)
**Endpoint:** `/api/cron/expire-trials`  
**Schedule:** Daily (recommended)  
**Purpose:** Expires trials that have ended

## Setup Instructions

### Option 1: Vercel Cron Jobs (Recommended)

Vercel Cron Jobs are automatically configured in `vercel.json`. After deploying to Vercel:

1. **Set Environment Variable:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `CRON_SECRET` = `[generate a random secret string]`
   - Example: `CRON_SECRET=your-super-secret-random-string-here-12345`

2. **Deploy to Vercel:**
   ```bash
   git add vercel.json
   git commit -m "Add cron job configuration"
   git push
   ```

3. **Verify Cron Job:**
   - Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
   - You should see the cron job listed
   - It will run automatically at the scheduled time

### Option 2: External Cron Service (Alternative)

If you're not using Vercel or want more control, use an external service:

1. **Generate a Secret:**
   ```bash
   # Generate a random secret
   openssl rand -hex 32
   ```

2. **Set Environment Variable:**
   - Add `CRON_SECRET` to your environment variables (Vercel, Railway, etc.)

3. **Configure External Cron Service:**
   - Use services like:
     - [cron-job.org](https://cron-job.org)
     - [EasyCron](https://www.easycron.com)
     - [UptimeRobot](https://uptimerobot.com)
   
   **Settings:**
   - **URL:** `https://your-domain.com/api/cron/notify-subscription-ending`
   - **Method:** GET or POST
   - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
   - **Schedule:** Daily at 9:00 AM UTC (or your preferred time)

### Option 3: Manual Testing

Test the cron endpoint manually:

```bash
# Replace YOUR_CRON_SECRET with your actual secret
curl -X GET https://your-domain.com/api/cron/notify-subscription-ending \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Security

- **Always set `CRON_SECRET`** to prevent unauthorized access
- Use a strong, random secret (at least 32 characters)
- Never commit `CRON_SECRET` to git
- The endpoint will return 401 Unauthorized if the secret doesn't match

## Monitoring

Check Vercel logs or your cron service logs to verify:
- Cron job is running successfully
- Emails are being sent
- Any errors are logged

## Troubleshooting

### Cron job not running
- Verify `vercel.json` is committed and deployed
- Check Vercel Dashboard → Cron Jobs section
- Ensure `CRON_SECRET` is set in environment variables

### 401 Unauthorized
- Verify `CRON_SECRET` matches in both:
  - Environment variables
  - Authorization header (if using external service)

### No emails sent
- Check that subscriptions exist with `subscription_cancel_at_period_end = true`
- Verify `subscription_current_period_end` is set correctly
- Check email service configuration
- Review application logs for errors

## Schedule Format

The cron schedule uses standard cron syntax:
- `0 9 * * *` = Daily at 9:00 AM UTC
- `0 0 * * *` = Daily at midnight UTC
- `0 */6 * * *` = Every 6 hours

Adjust the schedule in `vercel.json` if needed.
