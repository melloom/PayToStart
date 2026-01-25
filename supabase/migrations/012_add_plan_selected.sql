-- Add plan_selected field to track if user has explicitly selected a plan
-- This ensures new users are prompted to select a plan after sign-in

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS plan_selected BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_plan_selected ON companies(plan_selected);

-- Add comment for documentation
COMMENT ON COLUMN companies.plan_selected IS 'Tracks if user has explicitly selected a subscription plan (not just defaulted to free)';



