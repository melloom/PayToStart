# AI Training System Documentation

This document explains the AI training system that uses RAG (Retrieval-Augmented Generation) to enhance contract generation with contract templates and legal knowledge.

## Overview

The AI training system uses a knowledge base of contract templates, legal clauses, and legal principles to improve the quality and accuracy of AI-generated contracts. Instead of fine-tuning models (which is expensive and requires retraining), we use RAG to provide relevant examples and legal knowledge to the AI at generation time.

## Architecture

### Components

1. **Knowledge Base** (`lib/ai/knowledge-base.ts`)
   - Stores contract templates, legal clauses, and legal principles
   - Each entry has vector embeddings for semantic search
   - Uses Supabase for storage

2. **Embeddings Service** (`lib/ai/embeddings.ts`)
   - Generates vector embeddings using OpenAI's `text-embedding-3-small` model
   - Creates 1536-dimensional vectors for semantic similarity search

3. **RAG Service** (`lib/ai/rag.ts`)
   - Retrieves relevant contract examples and legal knowledge
   - Builds context from retrieved knowledge
   - Enhances AI prompts with relevant examples

4. **Database Schema** (`supabase/migrations/025_create_knowledge_base.sql`)
   - `ai_knowledge_base` table stores all training data
   - Embeddings stored as JSONB arrays
   - Indexed for efficient retrieval

## How It Works

### 1. Knowledge Base Population

The knowledge base is populated with:
- **Contract Templates**: Full contract examples from `default_contract_templates` table
- **Legal Principles**: 20+ comprehensive legal principles covering contract formation, payment terms, IP rights, termination, liability, scope definition, confidentiality, warranties, indemnification, dispute resolution, contractor status, timelines, change orders, data protection, non-compete, governing law, assignment, severability, and entire agreement
- **Legal Clauses**: 25+ detailed legal clauses including comprehensive versions of confidentiality, IP assignment, liability limitations, termination, indemnification, dispute resolution (arbitration and mediation), force majeure, payment terms, warranties, scope definitions, change orders, contractor status, governing law, assignment, severability, entire agreement, non-solicitation, data protection, timeline management, and acceptance procedures
- **Contract Sections**: Industry-specific contract sections for web development, consulting, photography, software development, SaaS, content creation, construction, and standard sections like recitals, definitions, and notices

Run the population script:
```bash
npx tsx scripts/populate-knowledge-base.ts
```

### 2. Contract Generation with RAG

When a user requests contract generation:

1. **Query Construction**: The user's description is used as a search query
2. **Semantic Search**: The system searches the knowledge base for:
   - Relevant contract templates (2-3 examples)
   - Relevant legal clauses (3-5 clauses)
   - Relevant legal principles (2-3 principles)
   - Relevant contract sections (industry-specific examples)
3. **Context Building**: Retrieved knowledge is formatted into context text
4. **Enhanced Prompt**: The context is added to the AI system prompt
5. **Generation**: The AI generates the contract using the enhanced prompt

### 3. Similarity Search

The system uses cosine similarity to find relevant entries:
- Embeddings are generated for both queries and stored entries
- Cosine similarity calculates how similar two vectors are (0-1 scale)
- Only entries above a similarity threshold (default: 0.7) are included

## Database Setup

### 1. Run Migration

Run the knowledge base migration in Supabase SQL Editor:
```sql
-- File: supabase/migrations/025_create_knowledge_base.sql
```

This creates:
- `ai_knowledge_base` table
- Indexes for efficient queries
- RLS policies (read-only for authenticated users)

### 2. Populate Knowledge Base

Run the population script:
```bash
npx tsx scripts/populate-knowledge-base.ts
```

This will:
- Fetch all default contract templates
- Add them to the knowledge base with embeddings
- Add legal principles and clauses
- Generate embeddings for all entries

## Usage

### Automatic Usage

RAG is automatically used in:
- **Contract Generation** (`app/api/ai/generate-contract/route.ts`)
- **Contract Editing** (`app/api/ai/edit-contract/route.ts`)

The system retrieves relevant knowledge based on the user's query and enhances the AI prompts automatically.

### Manual Knowledge Base Management

You can manually add entries to the knowledge base:

```typescript
import { addKnowledgeBaseEntry } from "@/lib/ai/knowledge-base";

await addKnowledgeBaseEntry({
  title: "My Custom Contract Template",
  category: "contract_template",
  contentType: "full_contract",
  content: "Contract content here...",
  metadata: {
    contractType: "custom",
    industry: "technology",
  },
  source: "user_template",
  sourceId: "template-id",
});
```

### Searching the Knowledge Base

```typescript
import { searchKnowledgeBase } from "@/lib/ai/knowledge-base";

const results = await searchKnowledgeBase("web development contract", {
  category: "contract_template",
  limit: 5,
  minSimilarity: 0.7,
});
```

## Knowledge Base Categories

- **contract_template**: Full contract examples
- **legal_clause**: Individual legal clauses
- **legal_principle**: Legal principles and best practices

## Content Types

- **full_contract**: Complete contract documents
- **clause**: Individual contract clauses
- **section**: Contract sections
- **principle**: Legal principles and guidelines

## Adding New Training Data

### 1. Add Contract Templates

Contract templates are automatically added from the `default_contract_templates` table when you run the population script.

To add manually:
```typescript
await addKnowledgeBaseEntry({
  title: "New Template Name",
  category: "contract_template",
  contentType: "full_contract",
  content: "Full contract text...",
  source: "default_template",
  sourceId: templateId,
});
```

### 2. Add Legal Clauses

Add common legal clauses to `scripts/populate-knowledge-base.ts`:

```typescript
const legalClauses = [
  {
    title: "Your Clause Name",
    category: "legal_clause",
    contentType: "clause",
    content: "Clause text...",
    metadata: {
      clauseType: "your_type",
    },
  },
  // ... more clauses
];
```

### 3. Add Legal Principles

Add legal principles to `scripts/populate-knowledge-base.ts`:

```typescript
const legalPrinciples = [
  {
    title: "Your Principle Name",
    category: "legal_principle",
    contentType: "principle",
    content: "Principle explanation...",
    metadata: {
      principleType: "your_type",
    },
  },
  // ... more principles
];
```

## Performance Considerations

### Embedding Generation

- Embeddings are generated once when entries are added
- OpenAI's `text-embedding-3-small` is cost-effective ($0.02 per 1M tokens)
- Embeddings are cached in the database

### Search Performance

- Similarity calculation happens in JavaScript (can be optimized with pgvector)
- Results are limited (default: 10) to maintain performance
- Similarity threshold filters out irrelevant results

### Token Usage

- RAG context adds tokens to each request
- Higher tier models have larger context windows
- Context is truncated if too long

## Future Enhancements

1. **pgvector Integration**: Use PostgreSQL's pgvector extension for faster similarity search
2. **Fine-tuning**: Optionally fine-tune models on contract data (expensive, requires retraining)
3. **User-Specific Training**: Allow users to add their own templates to the knowledge base
4. **Automatic Updates**: Automatically update knowledge base when templates are added
5. **Analytics**: Track which training data is most effective

## Troubleshooting

### Knowledge Base Empty

If the knowledge base is empty:
1. Check that the migration has been run
2. Run the population script: `npx tsx scripts/populate-knowledge-base.ts`
3. Verify entries exist: Check `ai_knowledge_base` table in Supabase

### No Relevant Results

If RAG doesn't find relevant results:
1. Lower the similarity threshold (default: 0.7)
2. Add more training data to the knowledge base
3. Check that embeddings were generated correctly

### Embedding Generation Fails

If embedding generation fails:
1. Check `OPENAI_API_KEY` is set correctly
2. Verify API key has sufficient credits
3. Check network connectivity to OpenAI API

## Security

- Knowledge base is read-only for authenticated users (RLS policy)
- Writes require service role key (server-side only)
- Embeddings don't expose sensitive information
- User queries are sanitized before embedding generation

## Cost Estimation

### Embedding Costs
- `text-embedding-3-small`: $0.02 per 1M tokens
- Average contract template: ~2000 tokens
- 100 templates: ~$0.004 (negligible)

### API Costs
- Embedding generation: One-time cost when adding entries
- Search: No additional cost (uses stored embeddings)
- Generation: Same as before (RAG adds context but doesn't increase API calls)

## Summary

The AI training system enhances contract generation by:
- Providing relevant examples from the knowledge base
- Including legal clauses and principles
- Improving consistency and legal accuracy
- Maintaining cost-effectiveness (no fine-tuning required)

The system is automatic, transparent to users, and continuously improves as more training data is added.
