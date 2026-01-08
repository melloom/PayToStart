export type ContractStatus =
  | "draft"
  | "sent"
  | "signed"
  | "paid"
  | "completed"
  | "cancelled";

export interface Contractor {
  id: string;
  email: string;
  name: string;
  companyId: string;
  companyName?: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  email: string;
  name: string;
  phone?: string;
  companyId: string;
  createdAt: Date;
}

export interface ContractTemplate {
  id: string;
  contractorId: string;
  companyId: string;
  name: string;
  content: string;
  fields: ContractField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "textarea";
  required: boolean;
  placeholder?: string;
}

export interface Contract {
  id: string;
  contractorId: string;
  clientId: string;
  templateId: string;
  companyId: string;
  status: ContractStatus;
  title: string;
  content: string;
  fieldValues: Record<string, string>;
  depositAmount: number;
  totalAmount: number;
  signedAt?: Date;
  paidAt?: Date;
  completedAt?: Date;
  signingToken: string; // Deprecated - kept for backwards compatibility
  signingTokenHash?: string; // Secure hash of the token
  signingTokenExpiresAt?: Date; // Token expiry date
  signingTokenUsedAt?: Date; // When token was first used (for one-time use)
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  contractId: string;
  companyId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  paymentIntentId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type SubscriptionTier = "free" | "starter" | "pro" | "premium";

export interface Company {
  id: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStripeSubscriptionId?: string;
  subscriptionStripeCustomerId?: string;
  subscriptionCurrentPeriodStart?: Date;
  subscriptionCurrentPeriodEnd?: Date;
  subscriptionStatus?: string;
  subscriptionCancelAtPeriodEnd?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  trialTier?: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageCounter {
  id: string;
  companyId: string;
  counterType: string;
  periodStart: Date;
  periodEnd: Date;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

// Pricing tier limits and features
export interface TierLimits {
  templates: number | null; // null = unlimited
  contracts: number | null; // null = unlimited
  companies: number | null; // null = unlimited
  features: {
    clickToSign: boolean;
    emailDelivery: boolean;
    smsReminders: boolean;
    attachments: boolean;
    customBranding: boolean;
    downloadAllContracts: boolean;
    dropboxSignIntegration: boolean;
    docusignIntegration: boolean;
    multiUserTeamRoles: boolean;
    stripeConnectPayouts: boolean;
  };
}

// Pricing tier configurations
export const TIER_CONFIG: Record<SubscriptionTier, { name: string; price: number; limits: TierLimits }> = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      templates: 0,
      contracts: 0,
      companies: 1,
      features: {
        clickToSign: false,
        emailDelivery: false,
        smsReminders: false,
        attachments: false,
        customBranding: false,
        downloadAllContracts: false,
        dropboxSignIntegration: false,
        docusignIntegration: false,
        multiUserTeamRoles: false,
        stripeConnectPayouts: false,
      },
    },
  },
  starter: {
    name: "Starter",
    price: 29,
    limits: {
      templates: 2,
      contracts: 20,
      companies: 1,
      features: {
        clickToSign: true,
        emailDelivery: true,
        smsReminders: false,
        attachments: false,
        customBranding: false,
        downloadAllContracts: false,
        dropboxSignIntegration: false,
        docusignIntegration: false,
        multiUserTeamRoles: false,
        stripeConnectPayouts: false,
      },
    },
  },
  pro: {
    name: "Pro",
    price: 79,
    limits: {
      templates: null, // unlimited
      contracts: null, // unlimited
      companies: 1,
      features: {
        clickToSign: true,
        emailDelivery: true,
        smsReminders: true,
        attachments: true,
        customBranding: true,
        downloadAllContracts: true,
        dropboxSignIntegration: false,
        docusignIntegration: false,
        multiUserTeamRoles: false,
        stripeConnectPayouts: false,
      },
    },
  },
  premium: {
    name: "Premium",
    price: 149,
    limits: {
      templates: null, // unlimited
      contracts: null, // unlimited
      companies: 1,
      features: {
        clickToSign: true,
        emailDelivery: true,
        smsReminders: true,
        attachments: true,
        customBranding: true,
        downloadAllContracts: true,
        dropboxSignIntegration: true,
        docusignIntegration: true,
        multiUserTeamRoles: true,
        stripeConnectPayouts: true,
      },
    },
  },
};

