-- Add notification preferences to contractors table
-- This allows users to control which email notifications they receive

ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "contractSigned": true,
  "contractPaid": true,
  "contractSent": true,
  "paymentReceived": true,
  "invoiceUpcoming": true,
  "subscriptionUpdates": true,
  "marketingEmails": false
}'::jsonb;

-- Add comment explaining the notification preferences
COMMENT ON COLUMN contractors.notification_preferences IS 'User preferences for email notifications. Each key is a boolean indicating if the user wants to receive that type of notification.';

