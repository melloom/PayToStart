# Supabase Edge Functions

Edge Functions run in Deno, close to your database for low latency.

## Deploying Edge Functions

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

### Deploy Function

```bash
# Deploy cleanup function
supabase functions deploy cleanup-old-contracts
```

### Invoke Function

```bash
# Invoke locally
supabase functions serve cleanup-old-contracts

# Invoke remotely
curl -X POST https://your-project.supabase.co/functions/v1/cleanup-old-contracts \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## Available Functions

### cleanup-old-contracts

Cleans up old draft and cancelled contracts older than 90 days.

**Schedule**: Can be called via cron job or manually

**Endpoint**: `https://your-project.supabase.co/functions/v1/cleanup-old-contracts`

**Authentication**: Requires Supabase service role key or anon key

## Security

- Edge Functions use Deno's security model
- Set environment variables in Supabase Dashboard
- Use service role key only in secure contexts
- Verify requests with Supabase auth

## Environment Variables

Set in Supabase Dashboard → Edge Functions → Settings:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (for admin operations)

