// Knowledge Base Service
// Manages storage and retrieval of contract templates and legal documents for AI training

import { createClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateEmbedding } from "./embeddings";
import { log } from "@/lib/logger";

export interface KnowledgeBaseEntry {
  id?: string;
  title: string;
  category: string; // e.g., 'contract_template', 'legal_clause', 'legal_principle'
  contentType: string; // e.g., 'full_contract', 'clause', 'section', 'principle'
  content: string;
  metadata?: Record<string, any>;
  source?: string; // e.g., 'default_template', 'user_template', 'legal_database'
  sourceId?: string;
}

export interface KnowledgeBaseSearchResult {
  id: string;
  title: string;
  category: string;
  contentType: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

/**
 * Add an entry to the knowledge base with automatic embedding generation
 */
export async function addKnowledgeBaseEntry(entry: KnowledgeBaseEntry): Promise<string> {
  try {
    // Generate embedding for the content
    const embeddingResult = await generateEmbedding(entry.content);
    
    // Use service role client for knowledge base operations
    // This bypasses RLS since knowledge base is system-managed
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("ai_knowledge_base")
      .insert({
        title: entry.title,
        category: entry.category,
        content_type: entry.contentType,
        content: entry.content,
        metadata: entry.metadata || {},
        embedding: embeddingResult.embedding, // Store as JSONB array
        source: entry.source || "system",
        source_id: entry.sourceId || null,
      })
      .select("id")
      .single();

    if (error) {
      log.error({ error: error.message, entry: entry.title }, "Failed to add knowledge base entry");
      throw new Error(`Failed to add knowledge base entry: ${error.message}`);
    }

    log.info({ id: data.id, title: entry.title, category: entry.category }, "Added knowledge base entry");
    return data.id;
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Error adding knowledge base entry");
    throw error;
  }
}

/**
 * Search the knowledge base for relevant entries using semantic similarity
 * Note: This requires pgvector extension in Supabase
 */
export async function searchKnowledgeBase(
  query: string,
  options?: {
    category?: string;
    contentType?: string;
    limit?: number;
    minSimilarity?: number;
  }
): Promise<KnowledgeBaseSearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    const supabase = await createClient();
    
    // Build the query
    let queryBuilder = supabase
      .from("ai_knowledge_base")
      .select("id, title, category, content_type, content, metadata");

    // Add filters
    if (options?.category) {
      queryBuilder = queryBuilder.eq("category", options.category);
    }
    if (options?.contentType) {
      queryBuilder = queryBuilder.eq("content_type", options.contentType);
    }

    // Execute query and get all results
    const { data, error } = await queryBuilder;

    if (error) {
      log.error({ error: error.message }, "Failed to search knowledge base");
      throw new Error(`Failed to search knowledge base: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Calculate cosine similarity for each result
    // Note: If pgvector is available, we can use it for better performance
    // For now, we'll calculate similarity in JavaScript
    const results: KnowledgeBaseSearchResult[] = data
      .map((entry) => {
        try {
          // Embedding is stored as JSONB array
          const embedding = Array.isArray(entry.embedding) 
            ? entry.embedding 
            : (typeof entry.embedding === "string" ? JSON.parse(entry.embedding) : []);

          if (!Array.isArray(embedding) || embedding.length !== queryEmbedding.embedding.length) {
            return null;
          }

          // Calculate cosine similarity
          const similarity = cosineSimilarity(queryEmbedding.embedding, embedding);

          return {
            id: entry.id,
            title: entry.title,
            category: entry.category,
            contentType: entry.content_type,
            content: entry.content,
            metadata: entry.metadata || {},
            similarity,
          };
        } catch (e) {
          log.warn({ error: e, entryId: entry.id }, "Failed to calculate similarity for entry");
          return null;
        }
      })
      .filter((result): result is KnowledgeBaseSearchResult => {
        if (!result) return false;
        if (options?.minSimilarity && result.similarity < options.minSimilarity) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
      .slice(0, options?.limit || 10); // Limit results

    log.info(
      { 
        queryLength: query.length, 
        resultsCount: results.length,
        topSimilarity: results[0]?.similarity 
      },
      "Knowledge base search completed"
    );

    return results;
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Error searching knowledge base");
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * Get all entries in a category
 */
export async function getKnowledgeBaseEntriesByCategory(
  category: string
): Promise<KnowledgeBaseEntry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_knowledge_base")
      .select("id, title, category, content_type, content, metadata, source, source_id")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      log.error({ error: error.message, category }, "Failed to get knowledge base entries");
      throw new Error(`Failed to get knowledge base entries: ${error.message}`);
    }

    return (data || []).map((entry) => ({
      id: entry.id,
      title: entry.title,
      category: entry.category,
      contentType: entry.content_type,
      content: entry.content,
      metadata: entry.metadata || {},
      source: entry.source,
      sourceId: entry.source_id,
    }));
  } catch (error: any) {
    log.error({ error: error.message }, "Error getting knowledge base entries");
    throw error;
  }
}

/**
 * Delete an entry from the knowledge base
 */
export async function deleteKnowledgeBaseEntry(id: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("ai_knowledge_base")
      .delete()
      .eq("id", id);

    if (error) {
      log.error({ error: error.message, id }, "Failed to delete knowledge base entry");
      throw new Error(`Failed to delete knowledge base entry: ${error.message}`);
    }

    log.info({ id }, "Deleted knowledge base entry");
  } catch (error: any) {
    log.error({ error: error.message }, "Error deleting knowledge base entry");
    throw error;
  }
}
