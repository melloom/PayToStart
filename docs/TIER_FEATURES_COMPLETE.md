# Complete Tier Features & Access Guide

This document provides a comprehensive overview of what each subscription tier includes and how features are controlled in the system.

## Tier Overview

### 🆓 Free Tier
- **Price**: $0/month
- **Contracts**: 3 Contracts (lifetime total, not per month)
- **Templates**: 0 (No templates)
- **Companies**: 1
- **Trial**: No trial available

### 🚀 Starter Tier
- **Price**: $29/month
- **Contracts**: 20 per month
- **Templates**: 2 templates
- **Companies**: 1
- **Trial**: 7-day free trial included

### ⭐ Pro Tier
- **Price**: $79/month
- **Contracts**: Unlimited
- **Templates**: Unlimited
- **Companies**: 1
- **Trial**: 7-day free trial included

### 💎 Premium Tier
- **Price**: $149/month
- **Contracts**: Unlimited
- **Templates**: Unlimited
- **Companies**: 1
- **Trial**: 7-day free trial included

---

## Complete Feature Matrix

| Feature | Free | Starter | Pro | Premium | Implementation Status |
|---------|------|---------|-----|---------|----------------------|
| **Contract Creation** | ✅ (3 lifetime) | ✅ (20/month) | ✅ (Unlimited) | ✅ (Unlimited) | ✅ Fully Implemented |
| **Contract Templates** | ❌ | ✅ (2) | ✅ (Unlimited) | ✅ (Unlimited) | ✅ Fully Implemented |
| **AI Contract Generation** | ❌ | ✅ (GPT-4o Mini) | ✅ (GPT-4o) | ✅ (GPT-4 Turbo) | ✅ Fully Implemented |
| **Click to Sign** | ❌ | ✅ | ✅ | ✅ | ✅ Fully Implemented |
| **Email Delivery** | ❌ | ✅ | ✅ | ✅ | ✅ Fully Implemented |
| **SMS Reminders** | ❌ | ❌ | ✅ | ✅ | ⚠️ Not Yet Built |
| **File Attachments** | ❌ | ❌ | ✅ | ✅ | ⚠️ Not Yet Built |
| **Custom Branding** | ❌ | ❌ | ✅ | ✅ | ⚠️ Not Yet Built |
| **Download All Contracts** | ❌ | ❌ | ✅ | ✅ | ⚠️ Not Yet Built |
| **Dropbox Sign Integration** | ❌ | ❌ | ❌ | ✅ | ⚠️ Not Yet Built |
| **DocuSign Integration** | ❌ | ❌ | ❌ | ✅ | ⚠️ Not Yet Built |
| **Multi-user Team Roles** | ❌ | ❌ | ❌ | ✅ | ⚠️ Not Yet Built |
| **Stripe Connect Payouts** | ❌ | ❌ | ❌ | ✅ | ⚠️ Not Yet Built |
| **Custom Integrations** | ❌ | ❌ | ❌ | ✅ | ⚠️ Not Yet Built |

---

## Detailed Feature Breakdown

### ✅ Contract Creation
**Available to**: All tiers (with different limits)
- **Free**: 3 contracts lifetime (total, not per month)
- **Starter**: 20 contracts per month
- **Pro**: Unlimited contracts
- **Premium**: Unlimited contracts

**How it's enforced**: 
- Checked in `app/api/contracts/route.ts` using `canPerformAction()`
- Usage counter tracks contract creation
- Free tier uses lifetime counter, paid tiers use monthly counter

---

### ✅ Contract Templates
**Available to**: Starter, Pro, Premium
- **Free**: 0 templates (feature disabled)
- **Starter**: 2 templates
- **Pro**: Unlimited templates
- **Premium**: Unlimited templates

**How it's enforced**:
- Checked in `app/api/templates/route.ts` using `canPerformAction()`
- Usage counter tracks template creation
- UI disables template creation for free tier

---

### ✅ AI Contract Generation
**Available to**: Starter, Pro, Premium
- **Free**: Feature disabled
- **Starter**: GPT-4o Mini model
- **Pro**: GPT-4o model
- **Premium**: GPT-4 Turbo model

**How it's enforced**:
- Checked in `app/api/ai/generate-contract/route.ts` using `hasFeature()`
- Returns 403 error if feature not available
- UI disables AI tab for free tier users

**Model Selection**:
- Tier-specific models configured in `lib/ai/models.ts`
- Better models for higher tiers

---

### ✅ Click to Sign
**Available to**: Starter, Pro, Premium
- **Free**: Feature disabled
- **Starter**: ✅ Enabled
- **Pro**: ✅ Enabled
- **Premium**: ✅ Enabled

**How it's enforced**:
- Feature flag in `TIER_CONFIG`
- Should be checked before allowing signature capture
- Currently implemented but may need additional gating

---

### ✅ Email Delivery
**Available to**: Starter, Pro, Premium
- **Free**: Feature disabled
- **Starter**: ✅ Enabled
- **Pro**: ✅ Enabled
- **Premium**: ✅ Enabled

**How it's enforced**:
- Feature flag in `TIER_CONFIG`
- Should be checked before sending contracts via email
- Email sending functionality in `lib/email/`

---

### ⚠️ SMS Reminders
**Available to**: Pro, Premium
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: ✅ Enabled (not yet built)
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires SMS provider integration (Twilio, AWS SNS, etc.)
- Should check `hasFeature(companyId, "smsReminders")` when implemented

---

### ⚠️ File Attachments
**Available to**: Pro, Premium
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: ✅ Enabled (not yet built)
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires file storage (Supabase Storage or S3)
- Should check `hasFeature(companyId, "attachments")` when implemented

---

### ⚠️ Custom Branding
**Available to**: Pro, Premium
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: ✅ Enabled (not yet built)
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires logo upload and color customization
- Should check `hasFeature(companyId, "customBranding")` when implemented
- API route exists: `app/api/contracts/[id]/branding/route.ts`

---

### ⚠️ Download All Contracts
**Available to**: Pro, Premium
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: ✅ Enabled (not yet built)
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires bulk PDF generation and ZIP creation
- Should check `hasFeature(companyId, "downloadAllContracts")` when implemented

---

### ⚠️ Dropbox Sign Integration
**Available to**: Premium only
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: Feature disabled
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires Dropbox Sign API integration
- Should check `hasFeature(companyId, "dropboxSignIntegration")` when implemented

---

### ⚠️ DocuSign Integration
**Available to**: Premium only
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: Feature disabled
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires DocuSign API integration
- Should check `hasFeature(companyId, "docusignIntegration")` when implemented

---

### ⚠️ Multi-user Team Roles
**Available to**: Premium only
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: Feature disabled
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires user invitation system and role management
- Should check `hasFeature(companyId, "multiUserTeamRoles")` when implemented

---

### ⚠️ Stripe Connect Payouts
**Available to**: Premium only
- **Free**: Feature disabled
- **Starter**: Feature disabled
- **Pro**: Feature disabled
- **Premium**: ✅ Enabled (not yet built)

**Status**: Not yet implemented
- Requires Stripe Connect account setup
- Should check `hasFeature(companyId, "stripeConnectPayouts")` when implemented

---

## How Feature Access is Controlled

### 1. Tier Configuration
All tier limits and features are defined in `lib/types.ts` in the `TIER_CONFIG` object:

```typescript
export const TIER_CONFIG: Record<SubscriptionTier, { 
  name: string; 
  price: number; 
  limits: TierLimits 
}> = {
  free: { ... },
  starter: { ... },
  pro: { ... },
  premium: { ... }
}
```

### 2. Feature Access Functions
Located in `lib/subscriptions.ts`:

- **`hasFeature(companyId, feature)`**: Returns boolean if company has access
- **`checkFeatureAccess(companyId, feature)`**: Returns detailed access info with reason
- **`canPerformAction(companyId, action, count)`**: Checks if action is within limits
- **`getEffectiveTier(companyId)`**: Gets current tier (includes trial tier)

### 3. Usage Counters
Tracks usage for:
- Templates
- Contracts
- SMS sent (when implemented)

Counters are stored in database and checked before allowing actions.

### 4. Enforcement Points

**API Routes**: Check feature access before processing requests
```typescript
const { hasAccess, reason } = await checkFeatureAccess(companyId, "aiContractGeneration");
if (!hasAccess) {
  return NextResponse.json({ error: reason }, { status: 403 });
}
```

**UI Components**: Disable/hide features based on tier
```typescript
const hasAIAccess = await hasFeature(companyId, "aiContractGeneration");
// Hide AI tab if no access
```

---

## Feature Access Checklist

When implementing a new feature, ensure:

- [ ] Feature flag added to `TIER_CONFIG` in `lib/types.ts`
- [ ] Feature access checked in API route using `checkFeatureAccess()` or `hasFeature()`
- [ ] UI components check access and disable/hide feature for unauthorized tiers
- [ ] Error messages guide users to upgrade if needed
- [ ] Usage counters updated if feature has limits
- [ ] Documentation updated with feature status

---

## Current Implementation Status

### ✅ Fully Implemented & Gated
1. Contract Creation (with tier limits)
2. Contract Templates (with tier limits)
3. AI Contract Generation (tier-gated, tier-specific models)
4. Click to Sign (tier-gated)
5. Email Delivery (tier-gated)

### ⚠️ Partially Implemented
1. Custom Branding (API route exists, but feature not fully built)

### ❌ Not Yet Implemented
1. SMS Reminders
2. File Attachments
3. Download All Contracts
4. Dropbox Sign Integration
5. DocuSign Integration
6. Multi-user Team Roles
7. Stripe Connect Payouts
8. Custom Integrations

---

## Testing Feature Access

To test if features are properly gated:

1. **Create test accounts** for each tier
2. **Verify limits** are enforced (e.g., free tier can only create 3 contracts)
3. **Verify features** are disabled for unauthorized tiers
4. **Test upgrade flow** to ensure features unlock after upgrade
5. **Test trial period** to ensure trial tier features work correctly

---

## Notes

- **Free Tier**: Limited to 3 contracts lifetime (not per month). Once created, contracts count toward the limit even if deleted.
- **Trial Period**: All paid tiers include a 7-day free trial. Trial usage is tracked and cannot be reused.
- **Effective Tier**: System uses "effective tier" which includes trial tier. If user is in trial, they get trial tier features.
- **Subscription Status**: Features are only available if subscription is active (or user is on free tier).

---

## Last Updated
December 2024
