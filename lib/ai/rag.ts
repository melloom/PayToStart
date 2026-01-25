// RAG (Retrieval-Augmented Generation) Service
// Retrieves relevant contract examples and legal knowledge to enhance AI prompts

import { searchKnowledgeBase, KnowledgeBaseSearchResult } from "./knowledge-base";
import { log } from "@/lib/logger";

export interface RAGContext {
  relevantContracts: KnowledgeBaseSearchResult[];
  relevantClauses: KnowledgeBaseSearchResult[];
  legalPrinciples: KnowledgeBaseSearchResult[];
  contextText: string;
}

/**
 * Retrieve relevant context for contract generation using RAG
 */
export async function retrieveContractContext(
  userQuery: string,
  contractType?: string,
  options?: {
    maxContracts?: number;
    maxClauses?: number;
    maxPrinciples?: number;
    minSimilarity?: number;
  }
): Promise<RAGContext> {
  try {
    const maxContracts = options?.maxContracts || 3;
    const maxClauses = options?.maxClauses || 5;
    const maxPrinciples = options?.maxPrinciples || 3;
    const minSimilarity = options?.minSimilarity || 0.7;

    // Search for relevant contract templates
    const relevantContracts = await searchKnowledgeBase(userQuery, {
      category: "contract_template",
      contentType: "full_contract",
      limit: maxContracts,
      minSimilarity,
    });

    // Search for relevant legal clauses
    const relevantClauses = await searchKnowledgeBase(userQuery, {
      category: "legal_clause",
      contentType: "clause",
      limit: maxClauses,
      minSimilarity,
    });

    // Search for relevant legal principles
    const relevantPrinciples = await searchKnowledgeBase(userQuery, {
      category: "legal_principle",
      contentType: "principle",
      limit: maxPrinciples,
      minSimilarity: minSimilarity - 0.1, // Slightly lower threshold for principles
    });

    // Build context text
    const contextText = buildContextText({
      relevantContracts,
      relevantClauses,
      relevantPrinciples,
      userQuery,
      contractType,
    });

    log.info(
      {
        contractsFound: relevantContracts.length,
        clausesFound: relevantClauses.length,
        principlesFound: relevantPrinciples.length,
        contextLength: contextText.length,
      },
      "RAG context retrieved"
    );

    return {
      relevantContracts,
      relevantClauses,
      legalPrinciples: relevantPrinciples,
      contextText,
    };
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Error retrieving RAG context");
    // Return empty context on error rather than failing
    return {
      relevantContracts: [],
      relevantClauses: [],
      legalPrinciples: [],
      contextText: "",
    };
  }
}

/**
 * Build formatted context text from retrieved knowledge
 */
function buildContextText(
  context: {
    relevantContracts: KnowledgeBaseSearchResult[];
    relevantClauses: KnowledgeBaseSearchResult[];
    relevantPrinciples: KnowledgeBaseSearchResult[];
    userQuery: string;
    contractType?: string;
  }
): string {
  const parts: string[] = [];

  // Add relevant contract examples
  if (context.relevantContracts.length > 0) {
    parts.push("=== RELEVANT CONTRACT EXAMPLES ===");
    context.relevantContracts.forEach((contract, index) => {
      parts.push(`\nExample Contract ${index + 1}: ${contract.title}`);
      parts.push(`Category: ${contract.category}`);
      if (contract.metadata?.contractType) {
        parts.push(`Type: ${contract.metadata.contractType}`);
      }
      parts.push(`Content:\n${contract.content.substring(0, 2000)}...`); // Limit length
      parts.push(`\n---\n`);
    });
  }

  // Add relevant legal clauses
  if (context.relevantClauses.length > 0) {
    parts.push("\n=== RELEVANT LEGAL CLAUSES ===");
    context.relevantClauses.forEach((clause, index) => {
      parts.push(`\nClause ${index + 1}: ${clause.title}`);
      parts.push(`Content: ${clause.content}`);
      parts.push(`\n---\n`);
    });
  }

  // Add relevant legal principles
  if (context.relevantPrinciples.length > 0) {
    parts.push("\n=== RELEVANT LEGAL PRINCIPLES ===");
    context.relevantPrinciples.forEach((principle, index) => {
      parts.push(`\nPrinciple ${index + 1}: ${principle.title}`);
      parts.push(`Content: ${principle.content}`);
      parts.push(`\n---\n`);
    });
  }

  // Add guidance on using the context
  if (parts.length > 0) {
    parts.push(
      "\n=== INSTRUCTIONS ===",
      "Use the above examples, clauses, and principles as reference when generating the contract.",
      "Follow the structure and legal language patterns from the examples.",
      "Incorporate relevant clauses and principles where appropriate.",
      "Ensure consistency with legal best practices shown in the examples.",
      "Maintain the same level of legal sophistication and completeness."
    );
  }

  return parts.join("\n");
}

/**
 * Retrieve context for contract editing/fixing
 */
export async function retrieveEditContext(
  currentContent: string,
  userMessage: string,
  options?: {
    maxClauses?: number;
    minSimilarity?: number;
  }
): Promise<string> {
  try {
    const maxClauses = options?.maxClauses || 3;
    const minSimilarity = options?.minSimilarity || 0.7;

    // Combine current content and user message for better context
    const searchQuery = `${currentContent.substring(0, 500)} ${userMessage}`;

    // Search for relevant clauses that might help with the edit
    const relevantClauses = await searchKnowledgeBase(searchQuery, {
      category: "legal_clause",
      limit: maxClauses,
      minSimilarity,
    });

    if (relevantClauses.length === 0) {
      return "";
    }

    const parts: string[] = [
      "=== RELEVANT LEGAL CLAUSES FOR REFERENCE ===",
    ];

    relevantClauses.forEach((clause, index) => {
      parts.push(`\nClause ${index + 1}: ${clause.title}`);
      parts.push(`Content: ${clause.content}`);
      parts.push(`\n---\n`);
    });

    parts.push(
      "\nUse these clauses as reference when making edits. Ensure your edits maintain legal consistency and follow best practices."
    );

    return parts.join("\n");
  } catch (error: any) {
    log.error({ error: error.message }, "Error retrieving edit context");
    return "";
  }
}
