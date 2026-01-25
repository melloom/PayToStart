import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { checkAPIRateLimit, sanitizeInput } from "@/lib/security/api-security";
import { db } from "@/lib/db";
import { hasFeature, getEffectiveTier } from "@/lib/subscriptions";
import { getAIModelConfigForCompany, getEnhancedSystemPrompt, getInfoCheckModelConfig } from "@/lib/ai/models";
import { retrieveContractContext } from "@/lib/ai/rag";
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
          message: "AI contract generation is only available for paid subscribers. Please upgrade your plan to use this feature.",
        },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(
      request,
      `ai-contract:${contractor.id}`
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { description, contractType, additionalDetails } = body;

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Validation failed", message: "Description is required" },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedContractType = contractType ? sanitizeInput(contractType) : "";
    const sanitizedAdditionalDetails = additionalDetails ? sanitizeInput(additionalDetails) : "";

    // First, check if we have enough information to generate the contract
    const informationCheckPrompt = `You are a contract information analyzer. Your task is to determine if the user has provided enough information to generate a complete, legally sound contract.

Analyze the following contract request and determine if sufficient information is provided. A complete contract needs:
- Type of contract/service being provided (can be inferred from description)
- Basic scope of work or service description
- Payment information (amount, schedule, or terms - can be general)
- Timeline or duration (if applicable - can be estimated)
- Parties involved (contractor and client roles - can be generic)

IMPORTANT GUIDELINES:
- Be LENIENT and helpful. If the user has provided a reasonable description of what they need, proceed with generation.
- If additional details are provided, consider ALL information together.
- Only ask for more information if critical details are COMPLETELY missing.
- You can use placeholders ({{fieldName}}) for specific details that can be filled in later.
- If the user has already provided additional information in response to questions, be more lenient.

If information is missing or unclear, list specific questions you need answered to create a proper contract. Be specific and helpful.

Respond in JSON format:
{
  "hasEnoughInfo": true/false,
  "questions": ["question 1", "question 2", ...] (only if hasEnoughInfo is false),
  "missingInfo": "brief description of what's missing" (only if hasEnoughInfo is false)
}

If hasEnoughInfo is true, respond with: {"hasEnoughInfo": true}`;

    const informationCheckUserPrompt = `Contract Request:
${sanitizedDescription}

${sanitizedContractType ? `Contract Type: ${sanitizedContractType}` : ""}

${sanitizedAdditionalDetails ? `Additional Details: ${sanitizedAdditionalDetails}` : ""}

Analyze if this information is sufficient to generate a complete contract. 

IMPORTANT: If the user has provided additional details in response to previous questions, consider ALL the information together. Be lenient - if the user has provided reasonable information about the contract type, scope, payment terms, timeline, and parties, you should proceed with generation even if some details are not perfectly specified. Only ask for more information if critical details are completely missing.`;

    log.info({ contractorId: contractor.id }, "Checking if enough information provided");

    // Get tier for model selection
    const effectiveTier = await getEffectiveTier(contractor.companyId);
    const infoCheckConfig = getInfoCheckModelConfig(effectiveTier);

    // First call to check information
    const infoCheckCompletion = await openai.chat.completions.create({
      model: infoCheckConfig.model,
      messages: [
        { role: "system", content: informationCheckPrompt },
        { role: "user", content: informationCheckUserPrompt },
      ],
      temperature: infoCheckConfig.temperature,
      max_tokens: infoCheckConfig.maxTokens,
      response_format: { type: "json_object" },
    });

    const infoCheckResponse = infoCheckCompletion.choices[0]?.message?.content;
    let infoCheck: { hasEnoughInfo: boolean; questions?: string[]; missingInfo?: string } | null = null;

    try {
      if (infoCheckResponse) {
        infoCheck = JSON.parse(infoCheckResponse);
        // Ensure questions is an array
        if (infoCheck && infoCheck.questions && !Array.isArray(infoCheck.questions)) {
          infoCheck.questions = [String(infoCheck.questions)];
        }
      }
    } catch (e) {
      log.warn({ error: e, response: infoCheckResponse }, "Failed to parse information check response, proceeding with generation");
    }

    // If not enough information, return questions
    if (infoCheck && !infoCheck.hasEnoughInfo) {
      const questions = Array.isArray(infoCheck.questions) ? infoCheck.questions : 
                       (infoCheck.questions ? [String(infoCheck.questions)] : []);
      
      log.info({ contractorId: contractor.id, questions }, "Insufficient information, returning questions");
      
      return NextResponse.json({
        success: false,
        needsMoreInfo: true,
        questions: questions.length > 0 ? questions : ["Please provide more details about the contract requirements."],
        message: infoCheck.missingInfo || "I need more information to create the contract correctly. Can you please provide the details requested above?",
      });
    }

    // Retrieve relevant context using RAG (Retrieval-Augmented Generation)
    const searchQuery = `${sanitizedDescription} ${sanitizedContractType} ${sanitizedAdditionalDetails}`.trim();
    const ragContext = await retrieveContractContext(searchQuery, sanitizedContractType || undefined, {
      maxContracts: 2,
      maxClauses: 3,
      maxPrinciples: 2,
      minSimilarity: 0.7,
    });

    // Build the prompt for OpenAI
    const systemPrompt = `You are a professional contract drafting assistant with expertise in contract law. Your task is to generate comprehensive, legally sound, and enforceable contract documents based on user requirements.

${ragContext.contextText ? `\n=== TRAINING DATA AND EXAMPLES ===\n${ragContext.contextText}\n` : ""}

CRITICAL LEGAL REQUIREMENTS:
1. Generate contracts that are legally compliant and enforceable
2. Include all essential contract elements: offer, acceptance, consideration, capacity, and legality
3. Include standard legal sections: parties identification, scope of work/services, terms and conditions, payment terms, timeline/delivery dates, termination clauses, dispute resolution, governing law, and signature sections
4. Use formal, professional legal language appropriate for business contracts
5. Include necessary disclaimers and legal protections where appropriate
6. Ensure clarity and specificity to avoid ambiguity
7. Include confidentiality clauses if applicable
8. Include intellectual property clauses if applicable
9. Include liability limitations and indemnification where appropriate
10. Ensure all dates, amounts, and specific details use placeholder format: {{fieldName}}

FIELD PLACEHOLDER FORMAT:
- Use double curly braces for all dynamic fields: {{fieldName}}
- Use descriptive, lowercase field names with underscores: {{contractor_name}}, {{client_name}}, {{contract_date}}, {{total_amount}}, {{payment_terms}}, {{start_date}}, {{end_date}}, {{service_description}}, etc.
- Include ALL necessary fields that must be filled in: names, dates, amounts, addresses, contact information, service descriptions, timelines, payment schedules, etc.
- Make field names clear and descriptive (e.g., {{effective_date}}, {{project_start_date}}, {{hourly_rate}}, {{total_project_cost}})

CONTRACT STRUCTURE:
1. Title/Header with parties
2. Recitals/Background (WHEREAS clauses)
3. Definitions section (if needed)
4. Scope of Work/Services (detailed description)
5. Terms and Conditions
6. Payment Terms and Schedule
7. Timeline/Delivery Schedule
8. Intellectual Property (if applicable)
9. Confidentiality (if applicable)
10. Termination Clause
11. Dispute Resolution
12. Governing Law
13. Signatures Section

Do not include any disclaimers about legal advice - just generate the contract content.`;

    const userPrompt = `Generate a legally sound, comprehensive contract based on the following requirements:

${sanitizedDescription}

${sanitizedContractType ? `Contract Type: ${sanitizedContractType}` : ""}

${sanitizedAdditionalDetails ? `Additional Details: ${sanitizedAdditionalDetails}` : ""}

REQUIREMENTS:
1. Generate a complete, professional, legally compliant contract document
2. Include a clear, descriptive title
3. Use proper legal structure with all necessary sections
4. Include ALL required fields as placeholders using {{fieldName}} format
5. Ensure the contract is enforceable and includes standard legal protections
6. Include fields for: parties' names, dates (effective date, start date, end date), amounts (total amount, payment amounts, rates), addresses, contact information, service descriptions, timelines, payment schedules, and any other relevant details
7. Make sure every piece of information that needs to be customized uses the {{fieldName}} placeholder format
8. Use professional legal language throughout`;

    log.info({ contractorId: contractor.id, tier: effectiveTier }, "Generating AI contract");

    // Get tier-specific AI model configuration
    const modelConfig = await getAIModelConfigForCompany(contractor.companyId);
    const enhancedSystemPrompt = getEnhancedSystemPrompt(effectiveTier, systemPrompt);

    // Call OpenAI API with tier-specific model
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      messages: [
        { role: "system", content: enhancedSystemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
      ...(modelConfig.topP !== undefined && { top_p: modelConfig.topP }),
      ...(modelConfig.frequencyPenalty !== undefined && { frequency_penalty: modelConfig.frequencyPenalty }),
      ...(modelConfig.presencePenalty !== undefined && { presence_penalty: modelConfig.presencePenalty }),
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      log.error({ contractorId: contractor.id }, "OpenAI returned empty response");
      return NextResponse.json(
        { error: "Generation failed", message: "Failed to generate contract. Please try again." },
        { status: 500 }
      );
    }

    // Extract title and content from the generated text
    // Try to extract a title from the first line or heading
    let title = "AI Generated Contract";
    let content = generatedContent;

    // Look for title patterns
    const titleMatch = generatedContent.match(/^(?:#+\s*)?([^\n]+?)(?:\n|$)/);
    if (titleMatch) {
      title = titleMatch[1].replace(/^#+\s*/, "").trim();
      // If title is too long, truncate it
      if (title.length > 100) {
        title = title.substring(0, 97) + "...";
      }
    }

    log.info(
      { contractorId: contractor.id, titleLength: title.length, contentLength: content.length },
      "AI contract generated successfully"
    );

    return NextResponse.json({
      success: true,
      contract: {
        title,
        content,
      },
    });
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Error generating AI contract");

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
        error: "Generation failed",
        message: error.message || "Failed to generate contract. Please try again.",
      },
      { status: 500 }
    );
  }
}
