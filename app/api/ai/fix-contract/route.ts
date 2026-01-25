import { NextResponse } from "next/server";
import { getCurrentContractor } from "@/lib/auth";
import { checkAPIRateLimit, sanitizeInput } from "@/lib/security/api-security";
import { hasFeature, getEffectiveTier } from "@/lib/subscriptions";
import { getAIModelConfigForCompany, getEnhancedSystemPrompt } from "@/lib/ai/models";
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
          message: "AI contract fixing is only available for paid subscribers. Please upgrade your plan to use this feature.",
        },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResponse = checkAPIRateLimit(
      request,
      `ai-fix-contract:${contractor.id}`
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { 
      contractContent, 
      compensationData 
    } = body;

    if (!contractContent || typeof contractContent !== "string") {
      return NextResponse.json(
        { error: "Validation failed", message: "Contract content is required" },
        { status: 400 }
      );
    }

    if (!compensationData) {
      return NextResponse.json(
        { error: "Validation failed", message: "Compensation data is required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedContent = sanitizeInput(contractContent);

    // Get tier for model selection
    const effectiveTier = await getEffectiveTier(contractor.companyId);
    
    // Build comprehensive system prompt for fixing contracts
    const baseSystemPrompt = `You are a professional contract enhancement assistant. Your task is to improve contracts by:
1. Inserting compensation and payment information into the contract where it belongs
2. Cleaning up formatting and structure
3. Removing unnecessary, redundant, or irrelevant content
4. Ensuring payment terms are clearly stated in appropriate sections
5. Improving overall layout and readability
6. Maintaining legal compliance and enforceability
7. Preserving all existing field placeholders in the format {{fieldName}}

CRITICAL RULES:
1. Maintain legal compliance and enforceability of the contract
2. Preserve ALL existing field placeholders in the format {{fieldName}} - DO NOT remove or modify them
3. Insert payment and compensation details into appropriate sections (Payment Terms, Compensation, etc.)
4. If payment sections don't exist, create them in a logical location
5. DELETE unnecessary content: remove redundant sections, duplicate information, filler text, placeholder text that's not a {{fieldName}}, and any content that doesn't add value
6. Clean up formatting: fix spacing, ensure consistent structure, improve readability, proper section headers
7. Improve layout: ensure proper section ordering, consistent formatting, clear hierarchy
8. Ensure payment amounts, schedules, and methods are clearly stated
9. Maintain professional legal language
10. Keep the contract structure intact and well-organized
11. Always return the COMPLETE fixed contract content, not just changes
12. Make sure payment information is integrated naturally into the contract flow
13. Remove any test content, example text, or placeholder instructions that aren't {{fieldName}} placeholders

When fixing the contract:
- Insert compensation details into a "Payment Terms" or "Compensation" section
- Include deposit amounts, total amounts, payment schedules, and payment methods
- Format payment information clearly and professionally
- DELETE redundant sections, duplicate clauses, unnecessary explanations, and filler content
- Clean up formatting: fix spacing, ensure consistent structure, improve readability
- Improve layout: proper section headers, consistent numbering, clear hierarchy
- Ensure all sections flow logically and are well-organized
- Preserve all {{fieldName}} placeholders exactly as they appear
- Remove any test/example content that's not needed`;

    const enhancedSystemPrompt = getEnhancedSystemPrompt(effectiveTier, baseSystemPrompt);

    // Build compensation data summary for the AI
    let compensationSummary = "";
    
    if (compensationData.hasCompensation) {
      compensationSummary += "COMPENSATION INFORMATION:\n";
      compensationSummary += `- Type: ${compensationData.compensationType || "Fixed Amount"}\n`;
      
      if (compensationData.totalAmount && parseFloat(compensationData.totalAmount) > 0) {
        compensationSummary += `- Total Amount: $${parseFloat(compensationData.totalAmount).toFixed(2)}\n`;
      }
      
      if (compensationData.depositAmount && parseFloat(compensationData.depositAmount) > 0) {
        compensationSummary += `- Deposit Amount: $${parseFloat(compensationData.depositAmount).toFixed(2)}\n`;
        if (compensationData.totalAmount && parseFloat(compensationData.totalAmount) > 0) {
          const balance = parseFloat(compensationData.totalAmount) - parseFloat(compensationData.depositAmount);
          compensationSummary += `- Balance Due: $${balance.toFixed(2)}\n`;
        }
      }
      
      if (compensationData.hourlyRate) {
        compensationSummary += `- Hourly Rate: $${compensationData.hourlyRate}\n`;
      }
      
      if (compensationData.paymentSchedule) {
        const scheduleNames: Record<string, string> = {
          upfront: "Pay Upfront - Full payment upon signing",
          partial: "Partial Payment - Deposit + balance later",
          full: "Pay in Full - Payment upon completion",
          split: "Split Payments - Multiple installments",
          incremental: "Incremental - Pay as you go"
        };
        compensationSummary += `- Payment Schedule: ${scheduleNames[compensationData.paymentSchedule] || compensationData.paymentSchedule}\n`;
        
        // Add payment schedule config details
        if (compensationData.paymentScheduleConfig) {
          const config = compensationData.paymentScheduleConfig;
          if (config.depositPercentage) {
            compensationSummary += `- Deposit Percentage: ${config.depositPercentage}%\n`;
          }
          if (config.balanceDueDate) {
            compensationSummary += `- Balance Due Date: ${config.balanceDueDate}\n`;
          }
          if (config.numberOfPayments) {
            compensationSummary += `- Number of Payments: ${config.numberOfPayments}\n`;
          }
          if (config.paymentFrequency) {
            compensationSummary += `- Payment Frequency: ${config.paymentFrequency}\n`;
          }
          if (config.paymentAfterSigning) {
            compensationSummary += `- Payment After Signing: $${config.paymentAfterSigning.amount || "0"} due ${config.paymentAfterSigning.dueDate || "upon signing"}\n`;
          }
        }
      }
      
      if (compensationData.paymentMethods && compensationData.paymentMethods.length > 0) {
        compensationSummary += `- Accepted Payment Methods: ${compensationData.paymentMethods.join(", ")}\n`;
      }
      
      if (compensationData.paymentTerms) {
        compensationSummary += `- Additional Payment Terms: ${compensationData.paymentTerms}\n`;
      }
    } else {
      compensationSummary = "No compensation specified for this contract.";
    }

    const userPrompt = `Here is the current contract content:

${sanitizedContent}

${compensationSummary}

Please fix this contract by:
1. Inserting the compensation and payment information into the appropriate sections of the contract
2. Creating a clear "Payment Terms" or "Compensation" section if one doesn't exist
3. DELETING unnecessary content: remove redundant sections, duplicate information, filler text, placeholder instructions (except {{fieldName}} placeholders), test content, and anything that doesn't add value
4. Improving layout: ensure proper section ordering, consistent formatting, clear hierarchy, proper spacing
5. Cleaning up formatting issues: fix spacing, ensure consistent structure, improve readability
6. Ensuring all payment details are clearly and professionally stated
7. Maintaining all existing {{fieldName}} placeholders exactly as they are
8. Keeping the contract legally sound and enforceable
9. Organizing sections in a logical flow: Parties → Services → Payment Terms → Terms & Conditions → Signatures

Return the complete fixed contract content with unnecessary content removed and improved layout.`;

    log.info({ contractorId: contractor.id, tier: effectiveTier }, "Processing contract fix request");

    // Get tier-specific AI model configuration
    const modelConfig = await getAIModelConfigForCompany(contractor.companyId);

    // Call OpenAI API with tier-specific model
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      messages: [
        {
          role: "system",
          content: enhancedSystemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
      ...(modelConfig.topP !== undefined && { top_p: modelConfig.topP }),
      ...(modelConfig.frequencyPenalty !== undefined && { frequency_penalty: modelConfig.frequencyPenalty }),
      ...(modelConfig.presencePenalty !== undefined && { presence_penalty: modelConfig.presencePenalty }),
    });

    const fixedContent = completion.choices[0]?.message?.content;

    if (!fixedContent) {
      log.error({ contractorId: contractor.id }, "OpenAI returned empty response");
      return NextResponse.json(
        { error: "Fix failed", message: "Failed to process your request. Please try again." },
        { status: 500 }
      );
    }

    // Clean up the response (remove markdown code blocks if present)
    let cleanedContent = fixedContent.trim();
    if (cleanedContent.startsWith("```")) {
      // Remove markdown code blocks
      cleanedContent = cleanedContent.replace(/^```[\w]*\n?/g, "").replace(/\n?```$/g, "");
    }

    log.info(
      { contractorId: contractor.id, originalLength: sanitizedContent.length, newLength: cleanedContent.length },
      "Contract fixed successfully"
    );

    return NextResponse.json({
      success: true,
      fixedContent: cleanedContent,
      message: "Contract has been fixed and enhanced with payment information.",
    });
  } catch (error: any) {
    log.error({ error: error.message, stack: error.stack }, "Error fixing contract via AI");

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
        error: "Fix failed",
        message: error.message || "Failed to process your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
