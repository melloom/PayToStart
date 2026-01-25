# AI Models by Subscription Tier

This document explains the tier-based AI model system for contract generation.

## Overview

Each subscription tier uses a different AI model optimized for their specific needs and capabilities. Higher tiers get more advanced models with better quality, understanding, and features.

## Model Configuration

### Starter Tier - GPT-4o Mini
- **Model**: `gpt-4o-mini`
- **Temperature**: 0.7
- **Max Tokens**: 4,000
- **Optimized For**: Speed and cost-effectiveness
- **Best For**: Standard contracts, quick generation, essential legal protections
- **Capabilities**:
  - Fast contract generation
  - Standard legal protections
  - Essential contract elements
  - Basic field extraction

### Pro Tier - GPT-4o
- **Model**: `gpt-4o` (High-quality model)
- **Temperature**: 0.6
- **Max Tokens**: 8,192 (Good balance of quality and speed)
- **Optimized For**: Quality and comprehensive contracts
- **Best For**: Complex contracts, advanced clauses, industry-specific needs
- **Capabilities**:
  - GPT-4o model (high quality)
  - Enhanced contract quality with good reasoning
  - Advanced legal clauses (non-compete, NDA, IP rights, liability limitations)
  - Complex contract structures (multi-party, milestone payments, performance guarantees)
  - Intelligent field extraction
  - Industry-specific knowledge
  - Better compliance checking
  - 8K token context for detailed contracts

### Premium Tier - GPT-4 Turbo (Premium Model)
- **Model**: `gpt-4-turbo-preview` (Premium model - best available)
- **Temperature**: 0.5 (Optimized for maximum precision)
- **Max Tokens**: 128,000 (Maximum context window - handles very long contracts)
- **Optimized For**: Enterprise-grade quality and maximum sophistication
- **Best For**: Enterprise contracts, highly complex structures, very long contracts, regulatory compliance
- **Capabilities**:
  - GPT-4 Turbo (premium model - best quality available)
  - Enterprise-grade contracts with premium optimization
  - Maximum legal sophistication
  - Advanced legal provisions (indemnification, force majeure, dispute resolution, governing law)
  - Highly complex structures (multi-tiered payments, conditional clauses, cross-references)
  - Industry-specific expertise (construction, technology, consulting, healthcare, real estate)
  - Advanced risk assessment and mitigation
  - International contract considerations
  - Custom legal language based on jurisdiction
  - Enhanced regulatory compliance
  - Premium temperature settings (0.5) for maximum consistency and precision
  - Extended context (128K tokens) - can handle very long, complex contracts
  - Superior understanding of complex legal language

## Implementation Details

### File Structure
- `lib/ai/models.ts` - Model configuration and tier-based selection
- `app/api/ai/generate-contract/route.ts` - Contract generation with tier-based models
- `app/api/ai/edit-contract/route.ts` - Contract editing with tier-based models
- `app/api/subscriptions/current-tier/route.ts` - API endpoint to get user's current tier

### How It Works

1. **Tier Detection**: When a user generates or edits a contract, the system:
   - Gets the user's effective tier (includes trial tier)
   - Selects the appropriate AI model configuration
   - Applies tier-specific prompt enhancements

2. **Model Selection**: The `getAIModelConfigForCompany()` function:
   - Fetches the company's effective tier
   - Returns the appropriate model configuration
   - Includes temperature, max tokens, and other parameters

3. **Prompt Enhancement**: The `getEnhancedSystemPrompt()` function:
   - Takes the base system prompt
   - Adds tier-specific capabilities and instructions
   - Higher tiers get more sophisticated legal guidance

4. **API Calls**: Both generation and editing routes:
   - Use tier-specific models
   - Apply tier-specific parameters
   - Log which tier/model was used for debugging

## Model Parameters Explained

### Temperature
- **Lower (0.5)**: More deterministic, consistent output (Premium)
- **Medium (0.6)**: Balanced creativity and consistency (Pro)
- **Higher (0.7)**: More creative, varied output (Starter)

### Max Tokens
- **4,000**: Standard contracts, sufficient for most use cases (Starter)
- **8,000**: Longer contracts, more detailed clauses (Pro)
- **16,000**: Very long contracts, complex multi-section documents (Premium)

### Top P
- Controls diversity via nucleus sampling
- Higher values (0.95) = more diverse, creative output
- Used in Pro and Premium tiers

### Frequency/Presence Penalty
- Reduces repetition in generated text
- Starter tier uses small penalties to avoid repetition
- Pro/Premium use no penalties for maximum quality

## Benefits of Tier-Based Models

1. **Cost Optimization**: Starter tier uses cheaper, faster models
2. **Quality Scaling**: Higher tiers get better quality and capabilities
3. **Feature Differentiation**: Clear value proposition for upgrades
4. **Performance**: Appropriate model for each tier's needs
5. **Flexibility**: Easy to adjust models per tier as new models become available

## Future Enhancements

- **Fine-tuned Models**: Custom models trained on contract data per tier
- **Model Switching**: Allow users to choose between speed and quality
- **Usage Analytics**: Track which models perform best for different contract types
- **A/B Testing**: Test new models on specific tiers before full rollout

## Testing

To test different models:
1. Sign up for different tier accounts (or use trial)
2. Generate contracts and compare output quality
3. Check logs to verify correct model is being used
4. Test edge cases (complex contracts, long descriptions)

## Monitoring

- Log tier and model used for each generation
- Track generation times per tier
- Monitor token usage and costs
- Track user satisfaction per tier

---

**Last Updated**: December 2024
