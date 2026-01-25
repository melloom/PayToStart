// AI Model Configuration by Tier
// Different tiers get different AI models optimized for their needs

import type { SubscriptionTier } from "../types";
import { getEffectiveTier } from "../subscriptions";

export interface AIModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * Get AI model configuration based on subscription tier
 */
export function getAIModelConfig(tier: SubscriptionTier): AIModelConfig {
  switch (tier) {
    case "starter":
      // Starter: Fast, cost-effective model for basic contract generation
      return {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 4000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
      };

    case "pro":
      // Pro: GPT-4o - Fast, high-quality model
      return {
        model: "gpt-4o",
        temperature: 0.6,
        maxTokens: 8192, // Good balance of quality and speed
        topP: 0.95,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      };

    case "premium":
      // Premium: GPT-4-turbo - Most advanced model with maximum capabilities
      // This is the premium model with best quality and extended context
      return {
        model: "gpt-4-turbo-preview", // Latest turbo model with best quality
        temperature: 0.5, // Lower temperature for more precise, consistent output
        maxTokens: 128000, // Maximum context window for very complex contracts
        topP: 0.95,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      };

    default:
      // Fallback (shouldn't happen for paid users)
      return {
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 4000,
      };
  }
}

/**
 * Get AI model configuration for a company
 */
export async function getAIModelConfigForCompany(companyId: string): Promise<AIModelConfig> {
  const effectiveTier = await getEffectiveTier(companyId);
  return getAIModelConfig(effectiveTier);
}

/**
 * Get enhanced system prompt based on tier
 * Higher tiers get more sophisticated prompts with better legal guidance
 */
export function getEnhancedSystemPrompt(tier: SubscriptionTier, basePrompt: string): string {
  const tierEnhancements: Record<SubscriptionTier, string> = {
    starter: `
ENHANCED CAPABILITIES FOR STARTER TIER:
- Generate clear, professional contracts with standard legal protections
- Focus on essential contract elements and common use cases
- Optimize for speed and efficiency while maintaining quality
`,
    pro: `
ENHANCED CAPABILITIES FOR PRO TIER (Using GPT-4o Model):
- Generate highly detailed, comprehensive contracts with advanced legal protections
- Include sophisticated clauses: non-compete, non-disclosure, intellectual property rights, liability limitations
- Support complex contract structures: multi-party agreements, milestone-based payments, performance guarantees
- Advanced field extraction and intelligent placeholder generation
- Better understanding of industry-specific requirements
- Enhanced legal compliance checking
- 8K token context window for detailed contracts
- High-quality AI model with excellent reasoning
`,
    premium: `
ENHANCED CAPABILITIES FOR PREMIUM TIER (Using GPT-4 Turbo - Premium Model):
- Generate enterprise-grade contracts with maximum legal sophistication
- Include advanced legal provisions: indemnification, force majeure, dispute resolution (arbitration, mediation), governing law selection
- Support highly complex structures: multi-tiered payment schedules, conditional clauses, cross-references
- Industry-specific expertise: construction, technology, consulting, healthcare, real estate, etc.
- Advanced risk assessment and mitigation clauses
- International contract considerations (if applicable)
- Custom legal language based on jurisdiction requirements
- Enhanced compliance with regulatory requirements
- Extended context window (128K tokens) - handles the most complex, very long contracts
- Premium AI model (GPT-4 Turbo) - best quality available
- Premium temperature settings (0.5) for maximum precision and consistency
- Superior understanding of complex legal language and requirements
`,
    free: basePrompt, // Free tier doesn't have AI access
  };

  return `${basePrompt}\n\n${tierEnhancements[tier]}`;
}

/**
 * Get information check model (lighter model for quick checks)
 */
export function getInfoCheckModelConfig(tier: SubscriptionTier): AIModelConfig {
  // Use a lighter model for information checking across all tiers
  // This is a quick check, so we can use the same model for all
  return {
    model: "gpt-4o-mini",
    temperature: 0.3,
    maxTokens: 500,
  };
}

/**
 * Get model display name for UI
 */
export function getModelDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case "starter":
      return "GPT-4o Mini (Fast & Efficient)";
    case "pro":
      return "GPT-4o (Enhanced Quality)";
    case "premium":
      return "GPT-4 Turbo (Enterprise Grade)";
    default:
      return "Standard AI Model";
  }
}

/**
 * Get model capabilities description for UI
 */
export function getModelCapabilities(tier: SubscriptionTier): string[] {
  switch (tier) {
    case "starter":
      return [
        "Fast contract generation",
        "Standard legal protections",
        "Essential contract elements",
        "Basic field extraction",
      ];
    case "pro":
      return [
        "Latest GPT-4o model (most advanced)",
        "Enhanced contract quality",
        "Advanced legal clauses",
        "Complex contract structures",
        "Intelligent field extraction",
        "Industry-specific knowledge",
        "Better compliance checking",
        "Extended context understanding (16K tokens)",
      ];
    case "premium":
      return [
        "Latest GPT-4o model (most advanced)",
        "Enterprise-grade contracts",
        "Maximum legal sophistication",
        "Highly complex structures",
        "Advanced risk mitigation",
        "Industry expertise",
        "Regulatory compliance",
        "International considerations",
        "Custom legal language",
        "Extended context understanding (16K tokens)",
        "Premium optimization for best results",
      ];
    default:
      return [];
  }
}
