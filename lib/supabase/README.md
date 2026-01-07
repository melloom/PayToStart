# Supabase Client Configuration

This directory contains the Supabase client configuration for both browser and server-side usage.

## Files

### `client.ts`
Browser-side Supabase client. Use in client components ("use client").

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

### `server.ts`
Server-side Supabase client. Use in Server Components, API routes, and Server Actions.

```typescript
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
```

### `middleware.ts`
Middleware helper for session management. Used in `middleware.ts` at root.

## Configuration

The clients are configured with:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

These are loaded from environment variables in `.env.local`.

## Usage Examples

### Client Component (Browser)

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";

export function ClientComponent() {
  const supabase = createClient();
  
  // Use supabase client...
}
```

### Server Component

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function ServerComponent() {
  const supabase = await createClient();
  
  // Use supabase client...
}
```

### API Route

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  // Use supabase client...
  return NextResponse.json({ data });
}
```

## Session Management

The server client automatically manages sessions via cookies:
- Reads session from cookies
- Updates session on auth events
- Handles cookie security settings

The middleware (`/middleware.ts`) refreshes sessions automatically.

## Security

- Server client uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe to expose)
- For admin operations, use `SUPABASE_SERVICE_ROLE_KEY` in a secure server-side context
- RLS policies ensure data isolation
- Cookies are httpOnly and secure in production

