# AI Training Setup Guide

Quick guide to set up the AI training system with contract and legal knowledge.

## Prerequisites

- Supabase project set up
- OpenAI API key configured
- Database migrations run

## Step 1: Run Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/025_create_knowledge_base.sql`
3. Verify the `ai_knowledge_base` table was created

## Step 2: Install Dependencies (if needed)

The script uses TypeScript. Install tsx if you don't have it:

```bash
npm install -g tsx
```

Or use npx (no installation needed):
```bash
npx tsx scripts/populate-knowledge-base.ts
```

## Step 3: Set Environment Variables

Make sure these are set in your `.env.local`:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Required for knowledge base writes
```

**Note**: The script automatically loads environment variables from `.env.local` using dotenv. If you get an error about missing environment variables, make sure:
1. Your `.env.local` file exists in the project root
2. All required variables are set
3. The file is not in `.gitignore` (it shouldn't be committed, but should exist locally)

## Step 4: Populate Knowledge Base

Run the population script:

```bash
npx tsx scripts/populate-knowledge-base.ts
```

This will:
- Fetch all default contract templates
- Generate embeddings for each template
- Add legal principles and clauses
- Store everything in the knowledge base

Expected output:
```
Starting knowledge base population...

1. Fetching default contract templates...
Found X default templates

2. Adding contract templates to knowledge base...
  ✓ Added: Website Development Agreement
  ✓ Added: Freelance Services Agreement
  ...

3. Adding legal principles...
  ✓ Added: Essential Contract Elements
  ...

4. Adding legal clauses...
  ✓ Added: Confidentiality Clause
  ...

✅ Knowledge base population completed!
```

## Step 5: Verify Setup

Check the knowledge base in Supabase:

```sql
SELECT 
  category,
  content_type,
  COUNT(*) as count
FROM ai_knowledge_base
GROUP BY category, content_type;
```

You should see entries for:
- `contract_template` / `full_contract`
- `legal_principle` / `principle`
- `legal_clause` / `clause`

## Step 6: Test AI Generation

1. Go to your app and try generating a contract
2. The AI should now use the knowledge base automatically
3. Check logs to see RAG context being retrieved

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"

Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`. This is required for writing to the knowledge base.

### "Failed to generate embedding"

- Check `OPENAI_API_KEY` is valid
- Verify you have API credits
- Check network connectivity

### "No results found" in RAG

- Verify knowledge base has entries (run SQL query above)
- Check that embeddings were generated (should be JSONB arrays)
- Try lowering similarity threshold in `lib/ai/rag.ts`

### Script fails with TypeScript errors

Use tsx or compile first:
```bash
# Option 1: Use tsx
npx tsx scripts/populate-knowledge-base.ts

# Option 2: Compile and run
npx tsc scripts/populate-knowledge-base.ts --module commonjs --target es2020
node scripts/populate-knowledge-base.js
```

## Next Steps

- Add more contract templates to improve training
- Add industry-specific legal clauses
- Monitor which training data is most effective
- Consider adding user-specific templates to knowledge base

## Maintenance

### Adding New Templates

When you add new default templates to the database, re-run the population script. It will:
- Skip existing entries (based on source_id)
- Add new templates automatically

### Updating Legal Clauses

Edit `scripts/populate-knowledge-base.ts` to add/update legal clauses, then re-run the script.

### Cleaning Up

To remove all knowledge base entries:
```sql
DELETE FROM ai_knowledge_base;
```

Then re-run the population script.

## Cost Notes

- Embedding generation: ~$0.02 per 1M tokens (one-time cost)
- Average template: ~2000 tokens
- 100 templates: ~$0.004 total
- Very cost-effective compared to fine-tuning

## Support

See `AI_TRAINING.md` for detailed documentation on the training system.
