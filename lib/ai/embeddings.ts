// OpenAI Embeddings Service
// Creates vector embeddings for contract templates and legal documents

import OpenAI from "openai";
import { log } from "@/lib/logger";

// Lazy-load OpenAI client to allow environment variables to be loaded first
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey,
    });
  }
  return openaiClient;
}

// OpenAI text-embedding-3-small produces 1536-dimensional vectors
// This is cost-effective and provides good quality for semantic search
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  embedding: number[];
  tokenCount?: number;
}

/**
 * Generate embedding for a text using OpenAI's embedding API
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    // Truncate text if too long (OpenAI has token limits)
    // text-embedding-3-small supports up to 8191 tokens
    const maxLength = 8000 * 4; // Rough estimate: 4 chars per token
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    const response = await getOpenAIClient().embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedText,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Invalid embedding dimensions: ${embedding?.length || 0}`);
    }

    log.info(
      { 
        textLength: text.length, 
        truncatedLength: truncatedText.length,
        embeddingDimensions: embedding.length 
      },
      "Generated embedding successfully"
    );

    return {
      embedding,
      tokenCount: response.usage?.total_tokens,
    };
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Failed to generate embedding");
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<EmbeddingResult[]> {
  try {
    if (texts.length === 0) {
      return [];
    }

    // Filter out empty texts
    const validTexts = texts.filter((text) => text && text.trim().length > 0);
    if (validTexts.length === 0) {
      return [];
    }

    // Truncate texts if needed
    const maxLength = 8000 * 4;
    const truncatedTexts = validTexts.map((text) =>
      text.length > maxLength ? text.substring(0, maxLength) : text
    );

    const response = await getOpenAIClient().embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedTexts,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const results: EmbeddingResult[] = response.data.map((item) => ({
      embedding: item.embedding,
    }));

    log.info(
      { 
        inputCount: texts.length, 
        validCount: validTexts.length,
        outputCount: results.length,
        totalTokens: response.usage?.total_tokens 
      },
      "Generated batch embeddings successfully"
    );

    return results;
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Failed to generate batch embeddings");
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
