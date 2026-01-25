import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { checkAPIRateLimit, sanitizeInput } from "@/lib/security/api-security";
import { hasFeature, getEffectiveTier } from "@/lib/subscriptions";
import { getAIModelConfigForCompany, getEnhancedSystemPrompt } from "@/lib/ai/models";
import { retrieveEditContext } from "@/lib/ai/rag";
import OpenAI from "openai";
import { log } from "@/lib/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const contractor = await getCurrentContractor();
    if (!contractor) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has AI feature access (paid subscription required)
    const hasAIAccess = await hasFeature(contractor.companyId, "aiContractGeneration");
    if (!hasAIAccess) {
      return NextResponse.json(
        {
          error: "Subscription required",
          message: "AI contract editing is only available for paid subscribers. Please upgrade your plan to use this feature.",
        },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(
      request,
      `ai-edit-contract:${contractor.id}`
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { currentContent, userMessage, conversationHistory } = body;

    if (!currentContent || typeof currentContent !== "string") {
      return NextResponse.json(
        { error: "Validation failed", message: "Current contract content is required" },
        { status: 400 }
      );
    }

    if (!userMessage || typeof userMessage !== "string" || userMessage.trim().length === 0) {
      return NextResponse.json(
        { error: "Validation failed", message: "Message is required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedContent = sanitizeInput(currentContent);
    const sanitizedMessage = sanitizeInput(userMessage);

    // Retrieve relevant context using RAG
    const editContext = await retrieveEditContext(sanitizedContent, sanitizedMessage, {
      maxClauses: 3,
      minSimilarity: 0.7,
    });

    // Get tier for model selection
    const effectiveTier = await getEffectiveTier(contractor.companyId);
    const baseSystemPrompt = `You are a professional contract editing assistant. Your task is to help users modify contracts based on their requests.

${editContext ? `\n=== RELEVANT LEGAL REFERENCE ===\n${editContext}\n` : ""}

CRITICAL RULES:
1. You must maintain legal compliance and enforceability of the contract
2. Preserve all existing field placeholders in the format {{fieldName}}
3. Only modify the parts of the contract that the user specifically requests
4. Keep the contract structure, formatting, and legal language intact
5. If adding new sections, ensure they are legally appropriate
6. If modifying existing sections, maintain legal validity
7. Always return the COMPLETE modified contract content, not just the changes
8. Preserve all existing placeholders - do not remove or modify {{fieldName}} format
9. If the user asks to add something, integrate it naturally into the contract
10. If the user asks to remove something, remove it cleanly while maintaining contract flow
11. If the user asks to change wording, update it while keeping legal meaning

When responding:
- Return ONLY the complete modified contract content
- Do not include explanations, comments, or markdown formatting
- Do not wrap the content in code blocks
- Preserve all {{fieldName}} placeholders exactly as they appear
- Maintain the contract's professional formatting`;

    const enhancedSystemPrompt = getEnhancedSystemPrompt(effectiveTier, baseSystemPrompt);

    // Build conversation history for context
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: enhancedSystemPrompt
      },
      {
        role: "user",
        content: `Here is the current contract content:

${sanitizedContent}

User's request: ${sanitizedMessage}

Please modify the contract according to the user's request and return the complete modified contract content.`
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Insert history before the current request (but after system message)
      const historyMessages = conversationHistory.slice(-6); // Keep last 6 messages for context
      messages.splice(1, 0, ...historyMessages);
    }

    log.info({ contractorId: contractor.id, tier: effectiveTier, messageLength: sanitizedMessage.length }, "Processing contract edit request");

    // Get tier-specific AI model configuration
    const modelConfig = await getAIModelConfigForCompany(contractor.companyId);

    // Call OpenAI API with tier-specific model
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      messages: messages as any,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
      ...(modelConfig.topP !== undefined && { top_p: modelConfig.topP }),
      ...(modelConfig.frequencyPenalty !== undefined && { frequency_penalty: modelConfig.frequencyPenalty }),
      ...(modelConfig.presencePenalty !== undefined && { presence_penalty: modelConfig.presencePenalty }),
    });

    const modifiedContent = completion.choices[0]?.message?.content;

    if (!modifiedContent) {
      log.error({ contractorId: contractor.id }, "OpenAI returned empty response");
      return NextResponse.json(
        { error: "Edit failed", message: "Failed to process your request. Please try again." },
        { status: 500 }
      );
    }

    // Clean up the response (remove markdown code blocks if present)
    let cleanedContent = modifiedContent.trim();
    if (cleanedContent.startsWith("```")) {
      // Remove markdown code blocks
      cleanedContent = cleanedContent.replace(/^```[\w]*\n?/g, "").replace(/\n?```$/g, "");
    }

    log.info(
      { contractorId: contractor.id, originalLength: sanitizedContent.length, newLength: cleanedContent.length },
      "Contract edited successfully"
    );

    return NextResponse.json({
      success: true,
      modifiedContent: cleanedContent,
      message: "Contract has been updated based on your request.",
    });
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Error editing contract via chat");

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Configuration error", message: "AI service is not properly configured" },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded", message: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Edit failed",
        message: error.message || "Failed to process your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
