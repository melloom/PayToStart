-- Setup pg_cron for scheduled tasks
-- This allows running database functions on a schedule without external cron services

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule trial expiration to run every hour
-- This replaces the need for Vercel cron jobs for trial expiration
SELECT cron.schedule(
  'expire-trials-hourly',
  '0 * * * *',  -- Every hour at minute 0
  $$SELECT expire_trials()$$
);

-- Optional: Schedule cleanup of old contracts daily at 2 AM
-- You can keep this in Vercel or move it here
-- Uncomment if you want to use pg_cron for cleanup too:
-- SELECT cron.schedule(
--   'cleanup-contracts-daily',
--   '0 2 * * *',  -- Daily at 2 AM UTC
--   $$SELECT cleanup_old_contracts()$$
-- );

-- View scheduled jobs
-- SELECT * FROM cron.job;

-- To unschedule a job later:
-- SELECT cron.unschedule('expire-trials-hourly');




