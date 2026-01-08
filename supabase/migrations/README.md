# Database Migrations

These migrations set up the complete database schema for the Contract Manager system.

## Migration Order

Run these migrations in order in your Supabase SQL Editor:

### 1. `001_initial_schema.sql`
Creates all database tables with multi-tenant support:
- `companies` - Top-level tenant isolation
- `contractors` - Users linked to companies via auth.users
- `clients` - Client records scoped to companies
- `contract_templates` - Reusable contract templates
- `contracts` - Contracts with status tracking
- `payments` - Payment records
- `signatures` - Signature images metadata
- `attachments` - File attachments metadata

**Important**: This migration must run first.

### 2. `002_rls_policies.sql`
Enables Row Level Security (RLS) and creates security policies:
- Enables RLS on all tables
- Creates helper functions for tenant isolation
- Defines policies that restrict access by company_id
- Ensures contractors can only access their own company's data

**Important**: Run this after the schema migration.

### 3. `003_storage_buckets.sql`
Creates Supabase Storage buckets and policies:
- `contract-pdfs` - For generated PDF files
- `signatures` - For signature images
- `attachments` - For photos, proposals, etc.
- RLS policies for secure file access

**Important**: Run this after RLS policies are set up.

### 4. `004_trigger_company_creation.sql`
Creates a trigger to automatically create companies when contractors sign up:
- Trigger fires on `auth.users` insert
- Automatically creates a company
- Creates contractor record linked to the company

**Important**: Run this after RLS policies are set up.

### 5. `005_add_signature_fields.sql`
Adds signature metadata fields to the signatures table:
- `full_name`, `ip_address`, `user_agent`, `contract_hash`

**Important**: Run this if you've already run the initial schema without these fields.

### 6. `006_secure_signing_tokens.sql` ⭐ NEW
Implements secure signing token management:
- Token hashing (never store raw tokens)
- Token expiration
- One-time token usage
- Rate limiting table for signing attempts

### 7. `007_contract_events_audit.sql` ⭐ NEW
Implements audit logging for contract events:
- `contract_events` table tracks all important state changes
- Events: created, sent, signed, paid, completed, voided, etc.
- Actor tracking (contractor, client, system, webhook)
- Metadata storage for debugging and audit trails
- Helper function `log_contract_event()` for easy logging
- Adds `signing_token_hash`, `signing_token_expires_at`, `signing_token_used_at` columns to contracts
- Creates `signing_attempts` table for rate limiting
- Migrates from plain text tokens to hashed tokens

**Important**: Run this migration to enable secure token handling. After migration, set the `SIGNING_TOKEN_SECRET` environment variable in your `.env.local` file.

**Security Note**: This migration keeps the old `signing_token` column for backwards compatibility. You can drop it later after verifying all new contracts use hashed tokens.

## Running Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of each migration file
5. Run the query
6. Verify no errors occurred

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Direct SQL

You can also run these migrations via any PostgreSQL client connected to your Supabase database.

## Verifying Migrations

After running all migrations, verify:

1. **Tables Exist**: Check Table Editor shows all 8 tables
2. **RLS Enabled**: Each table should show a shield icon (RLS enabled)
3. **Storage Buckets**: Check Storage shows 3 buckets
4. **Triggers**: Check that trigger is created (optional, verify manually)

## Testing RLS

To test RLS is working:

1. Create a test contractor account
2. Create some test data (contracts, clients, etc.)
3. Log in as another contractor
4. Verify you cannot see the first contractor's data

## Rollback

If you need to rollback migrations:

**⚠️ Warning**: This will delete all data. Use with caution in development only.

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_company_for_contractor();

-- Drop storage buckets (requires Supabase dashboard)
-- Manually delete buckets via Storage UI

-- Drop RLS policies
-- Policies are dropped automatically when tables are dropped

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS signatures CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS contract_templates CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_contractor_company_id();
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Customization

You can customize these migrations for your needs:

- Add additional tables
- Modify field types
- Add indexes for performance
- Adjust RLS policies for your security requirements
- Add additional storage buckets

## Notes

- All timestamps use `TIMESTAMPTZ` (timezone-aware)
- All IDs use UUID v4
- Foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- RLS policies use `SECURITY DEFINER` functions for secure access
- Storage buckets are private by default with RLS policies

