-- Create knowledge base table for AI training with contract templates and legal documents
-- This table stores contract examples, legal clauses, and legal knowledge with embeddings for RAG

CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'contract_template', 'legal_clause', 'legal_principle', 'contract_section'
  content_type TEXT NOT NULL, -- e.g., 'full_contract', 'clause', 'section', 'principle'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store additional info like contract type, industry, etc.
  embedding JSONB, -- Store embeddings as JSONB array (1536 dimensions for text-embedding-3-small)
  source TEXT, -- e.g., 'default_template', 'user_template', 'legal_database'
  source_id UUID, -- Reference to original template/document if applicable
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_type ON ai_knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_source ON ai_knowledge_base(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON ai_knowledge_base(created_at DESC);

-- Note: Vector similarity search will use the embedding column
-- We'll need pgvector extension for this to work properly
-- Run this in Supabase SQL editor: CREATE EXTENSION IF NOT EXISTS vector;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_ai_knowledge_base_updated_at
  BEFORE UPDATE ON ai_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_knowledge_base_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Knowledge base is read-only for all authenticated users
-- Only system/admin can insert/update (we'll handle this server-side)
CREATE POLICY "Knowledge base is readable by all authenticated users"
  ON ai_knowledge_base
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: INSERT/UPDATE/DELETE will be handled server-side with service role key
-- This ensures only authorized processes can modify the knowledge base
