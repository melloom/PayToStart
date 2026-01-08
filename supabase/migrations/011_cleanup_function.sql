-- Function to cleanup old contracts
-- This can be called by pg_cron or API endpoints

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

-- Grant execute permission to authenticated users (for API calls)
GRANT EXECUTE ON FUNCTION cleanup_old_contracts() TO authenticated;

