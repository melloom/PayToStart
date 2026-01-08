// Supabase database client
import { createClient } from "./supabase-server";
import type {
  Contractor,
  Client,
  Contract,
  ContractTemplate,
  Payment,
  Company,
  UsageCounter,
  SubscriptionTier,
} from "./types";

export const db = {
  contractors: {
    async findById(id: string): Promise<Contractor | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return mapContractorFromDb(data);
    },

    async findByEmail(email: string): Promise<Contractor | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) return null;
      return mapContractorFromDb(data);
    },

    async getCurrent(): Promise<Contractor | null> {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;
      return this.findById(user.id);
    },

    async create(data: {
      id: string;
      companyId: string;
      name: string;
      email: string;
      companyName?: string;
    }): Promise<Contractor> {
      const supabase = await createClient();
      const { data: contractor, error } = await supabase
        .from("contractors")
        .insert({
          id: data.id,
          company_id: data.companyId,
          name: data.name,
          email: data.email,
          company_name: data.companyName,
        })
        .select()
        .single();

      if (error) throw error;
      return mapContractorFromDb(contractor);
    },
  },

  clients: {
    async findById(id: string): Promise<Client | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return mapClientFromDb(data);
    },

    async findByEmail(email: string, companyId: string): Promise<Client | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("email", email)
        .eq("company_id", companyId)
        .single();

      if (error || !data) return null;
      return mapClientFromDb(data);
    },

    async findByCompanyId(companyId: string): Promise<Client[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data.map(mapClientFromDb);
    },

    async create(data: {
      companyId: string;
      email: string;
      name: string;
      phone?: string;
    }): Promise<Client> {
      const supabase = await createClient();
      const { data: client, error } = await supabase
        .from("clients")
        .insert({
          company_id: data.companyId,
          email: data.email,
          name: data.name,
          phone: data.phone,
        })
        .select()
        .single();

      if (error) throw error;
      return mapClientFromDb(client);
    },
  },

  contracts: {
    async findById(id: string): Promise<Contract | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return mapContractFromDb(data);
    },

    async findBySigningToken(token: string): Promise<Contract | null> {
      const supabase = await createClient();
      // This method is deprecated - use findBySigningTokenHash instead
      // Keeping for backwards compatibility during migration
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("signing_token", token)
        .single();

      if (error || !data) return null;
      return mapContractFromDb(data);
    },

    async findBySigningTokenHash(tokenHash: string): Promise<Contract | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("signing_token_hash", tokenHash)
        .single();

      if (error || !data) return null;
      return mapContractFromDb(data);
    },

    async findByContractorId(contractorId: string): Promise<Contract[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("contractor_id", contractorId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data.map(mapContractFromDb);
    },

    async create(data: Omit<Contract, "id" | "createdAt" | "updatedAt"> & {
      signingTokenHash?: string;
      signingTokenExpiresAt?: Date;
    }): Promise<Contract> {
      const supabase = await createClient();
      const { data: contract, error } = await supabase
        .from("contracts")
        .insert({
          company_id: data.companyId,
          contractor_id: data.contractorId,
          client_id: data.clientId,
          template_id: data.templateId || null,
          status: data.status,
          title: data.title,
          content: data.content,
          field_values: data.fieldValues,
          deposit_amount: data.depositAmount,
          total_amount: data.totalAmount,
          signing_token: data.signingToken, // Keep for backwards compatibility
          signing_token_hash: data.signingTokenHash || null,
          signing_token_expires_at: data.signingTokenExpiresAt || null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapContractFromDb(contract);
    },

    async update(id: string, data: Partial<Contract>): Promise<Contract | null> {
      const supabase = await createClient();
      
      // Get current contract to check status
      const currentContract = await this.findById(id);
      if (!currentContract) {
        throw new Error("Contract not found");
      }

      // Prevent editing after signed (lock contract variables)
      if (currentContract.status === "signed" || 
          currentContract.status === "paid" || 
          currentContract.status === "completed") {
        // Allow status changes, but lock content and field values
        if (data.content !== undefined || data.fieldValues !== undefined || 
            data.title !== undefined || data.depositAmount !== undefined || 
            data.totalAmount !== undefined) {
          throw new Error("Cannot edit contract content, fields, title, or amounts after signing");
        }
      }

      // Prevent editing after paid (final lock - no edits allowed except status to completed)
      if (currentContract.status === "paid" || currentContract.status === "completed") {
        // Only allow status change to "completed" if currently "paid"
        if (currentContract.status === "paid" && data.status === "completed") {
          // Allow status change to completed
        } else if (data.status !== "completed" || data.status !== undefined) {
          throw new Error("Cannot edit contract after payment is received");
        }
      }

      const updateData: any = {};

      if (data.status !== undefined) updateData.status = data.status;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.fieldValues !== undefined) updateData.field_values = data.fieldValues;
      if (data.depositAmount !== undefined) updateData.deposit_amount = data.depositAmount;
      if (data.totalAmount !== undefined) updateData.total_amount = data.totalAmount;
      if (data.signedAt !== undefined) updateData.signed_at = data.signedAt;
      if (data.paidAt !== undefined) updateData.paid_at = data.paidAt;
      if (data.completedAt !== undefined) updateData.completed_at = data.completedAt;
      if (data.pdfUrl !== undefined) updateData.pdf_url = data.pdfUrl;
      if (data.signingTokenUsedAt !== undefined) updateData.signing_token_used_at = data.signingTokenUsedAt;

      const { data: contract, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return contract ? mapContractFromDb(contract) : null;
    },
  },

  templates: {
    async findById(id: string): Promise<ContractTemplate | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return mapTemplateFromDb(data);
    },

    async findByContractorId(contractorId: string): Promise<ContractTemplate[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("contract_templates")
        .select("*")
        .eq("contractor_id", contractorId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data.map(mapTemplateFromDb);
    },

    async create(data: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">): Promise<ContractTemplate> {
      const supabase = await createClient();
      const { data: template, error } = await supabase
        .from("contract_templates")
        .insert({
          company_id: data.companyId,
          contractor_id: data.contractorId,
          name: data.name,
          content: data.content,
          fields: data.fields,
        })
        .select()
        .single();

      if (error) throw error;
      return mapTemplateFromDb(template);
    },

    async update(id: string, data: Partial<Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">>): Promise<ContractTemplate | null> {
      const supabase = await createClient();
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.fields !== undefined) updateData.fields = data.fields;

      const { data: template, error } = await supabase
        .from("contract_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return template ? mapTemplateFromDb(template) : null;
    },

    async delete(id: string): Promise<boolean> {
      const supabase = await createClient();
      const { error } = await supabase
        .from("contract_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    },
  },

  signingAttempts: {
    async recordAttempt(data: {
      ipAddress: string;
      contractId?: string;
      success: boolean;
    }): Promise<void> {
      const supabase = await createClient();
      await supabase.from("signing_attempts").insert({
        ip_address: data.ipAddress,
        contract_id: data.contractId || null,
        success: data.success,
      });
    },

    async getRecentAttempts(
      ipAddress: string,
      windowMinutes: number = 15
    ): Promise<number> {
      const supabase = await createClient();
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

      const { count, error } = await supabase
        .from("signing_attempts")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ipAddress)
        .gte("attempted_at", windowStart.toISOString());

      if (error || count === null) return 0;
      return count;
    },

    async cleanupOldAttempts(daysToKeep: number = 7): Promise<void> {
      const supabase = await createClient();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await supabase
        .from("signing_attempts")
        .delete()
        .lt("attempted_at", cutoffDate.toISOString());
    },
  },

  payments: {
    async findByContractId(contractId: string): Promise<Payment[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("contract_id", contractId)
        .order("created_at", { ascending: false });

      if (error) return [];
      return data.map(mapPaymentFromDb);
    },

    async create(data: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
      const supabase = await createClient();
      const { data: payment, error } = await supabase
        .from("payments")
        .insert({
          company_id: data.companyId,
          contract_id: data.contractId,
          amount: data.amount,
          status: data.status,
          payment_intent_id: data.paymentIntentId,
          completed_at: data.completedAt,
        })
        .select()
        .single();

      if (error) throw error;
      return mapPaymentFromDb(payment);
    },

    async update(id: string, data: Partial<Payment>): Promise<Payment | null> {
      const supabase = await createClient();
      const updateData: any = {};

      if (data.status !== undefined) updateData.status = data.status;
      if (data.paymentIntentId !== undefined) updateData.payment_intent_id = data.paymentIntentId;
      if (data.completedAt !== undefined) updateData.completed_at = data.completedAt;

      const { data: payment, error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return payment ? mapPaymentFromDb(payment) : null;
    },
  },

  // Contract events audit logging
  contractEvents: {
    async logEvent(data: {
      contractId: string;
      eventType: "created" | "sent" | "signed" | "payment_initiated" | "payment_completed" | "paid" | "finalized" | "completed" | "voided" | "content_updated" | "status_changed";
      actorType: "contractor" | "client" | "system" | "webhook";
      actorId?: string;
      metadata?: Record<string, any>;
    }): Promise<void> {
      // Use service role client to bypass RLS for audit logging
      const { createServiceClient } = await import("./supabase/service");
      const supabase = createServiceClient();

      const { error } = await supabase.rpc("log_contract_event", {
        p_contract_id: data.contractId,
        p_event_type: data.eventType,
        p_actor_type: data.actorType,
        p_actor_id: data.actorId || null,
        p_metadata: data.metadata || {},
      });

      if (error) {
        // Log error but don't throw - audit logging shouldn't break the operation
        console.error("Failed to log contract event:", error);
      }
    },
  },

  companies: {
    async findById(id: string): Promise<Company | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) return null;
      return mapCompanyFromDb(data);
    },

    async findByStripeSubscriptionId(subscriptionId: string): Promise<Company | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("subscription_stripe_subscription_id", subscriptionId)
        .single();

      if (error || !data) return null;
      return mapCompanyFromDb(data);
    },

    async update(id: string, data: Partial<Company>): Promise<Company | null> {
      const supabase = await createClient();
      const updateData: any = {};

      if (data.subscriptionTier !== undefined) updateData.subscription_tier = data.subscriptionTier;
      if (data.subscriptionStripeSubscriptionId !== undefined) updateData.subscription_stripe_subscription_id = data.subscriptionStripeSubscriptionId;
      if (data.subscriptionStripeCustomerId !== undefined) updateData.subscription_stripe_customer_id = data.subscriptionStripeCustomerId;
      if (data.subscriptionCurrentPeriodStart !== undefined) updateData.subscription_current_period_start = data.subscriptionCurrentPeriodStart;
      if (data.subscriptionCurrentPeriodEnd !== undefined) updateData.subscription_current_period_end = data.subscriptionCurrentPeriodEnd;
      if (data.subscriptionStatus !== undefined) updateData.subscription_status = data.subscriptionStatus;
      if (data.subscriptionCancelAtPeriodEnd !== undefined) updateData.subscription_cancel_at_period_end = data.subscriptionCancelAtPeriodEnd;
      if (data.trialStart !== undefined) updateData.trial_start = data.trialStart;
      if (data.trialEnd !== undefined) updateData.trial_end = data.trialEnd;
      if (data.trialTier !== undefined) updateData.trial_tier = data.trialTier;

      const { data: company, error } = await supabase
        .from("companies")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return company ? mapCompanyFromDb(company) : null;
    },
  },

  subscriptions: {
    async checkTierLimit(
      companyId: string,
      limitType: "templates" | "contracts" | "companies",
      requiredCount: number = 1
    ): Promise<boolean> {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("check_tier_limit", {
        company_uuid: companyId,
        limit_type: limitType,
        required_count: requiredCount,
      });

      if (error) {
        console.error("Error checking tier limit:", error);
        return false;
      }

      return data === true;
    },
  },

  usageCounters: {
    async increment(companyId: string, counterType: string): Promise<number> {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("increment_usage_counter", {
        company_uuid: companyId,
        counter_type_val: counterType,
      });

      if (error) {
        console.error("Error incrementing usage counter:", error);
        throw error;
      }

      return data || 0;
    },

    async getCurrentCount(companyId: string, counterType: string): Promise<number> {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("get_usage_count", {
        company_uuid: companyId,
        counter_type_val: counterType,
      });

      if (error) {
        console.error("Error getting usage count:", error);
        return 0;
      }

      return data || 0;
    },

    async findByCompanyId(companyId: string): Promise<UsageCounter[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("usage_counters")
        .select("*")
        .eq("company_id", companyId)
        .order("period_start", { ascending: false });

      if (error) return [];
      return data.map(mapUsageCounterFromDb);
    },
  },
};

// Helper functions to map database rows to types
function mapContractorFromDb(row: any): Contractor {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    companyName: row.company_name,
    companyId: row.company_id,
    createdAt: new Date(row.created_at),
  };
}

function mapClientFromDb(row: any): Client {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone || undefined,
    companyId: row.company_id,
    createdAt: new Date(row.created_at),
  };
}

function mapContractFromDb(row: any): Contract {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    clientId: row.client_id,
    templateId: row.template_id || "",
    status: row.status,
    title: row.title,
    content: row.content,
    fieldValues: row.field_values || {},
    depositAmount: Number(row.deposit_amount),
    totalAmount: Number(row.total_amount),
    signedAt: row.signed_at ? new Date(row.signed_at) : undefined,
    paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    signingToken: row.signing_token || "", // Keep for backwards compatibility
    pdfUrl: row.pdf_url || undefined,
    companyId: row.company_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    // Include secure token fields (for internal use)
    signingTokenHash: row.signing_token_hash,
    signingTokenExpiresAt: row.signing_token_expires_at ? new Date(row.signing_token_expires_at) : undefined,
    signingTokenUsedAt: row.signing_token_used_at ? new Date(row.signing_token_used_at) : undefined,
  };
}

function mapTemplateFromDb(row: any): ContractTemplate {
  return {
    id: row.id,
    contractorId: row.contractor_id,
    companyId: row.company_id,
    name: row.name,
    content: row.content,
    fields: row.fields || [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    contractId: row.contract_id,
    amount: Number(row.amount),
    status: row.status,
    paymentIntentId: row.payment_intent_id || undefined,
    companyId: row.company_id,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

function mapCompanyFromDb(row: any): Company {
  return {
    id: row.id,
    name: row.name,
    subscriptionTier: row.subscription_tier || "free",
    subscriptionStripeSubscriptionId: row.subscription_stripe_subscription_id || undefined,
    subscriptionStripeCustomerId: row.subscription_stripe_customer_id || undefined,
    subscriptionCurrentPeriodStart: row.subscription_current_period_start ? new Date(row.subscription_current_period_start) : undefined,
    subscriptionCurrentPeriodEnd: row.subscription_current_period_end ? new Date(row.subscription_current_period_end) : undefined,
    subscriptionStatus: row.subscription_status || undefined,
    subscriptionCancelAtPeriodEnd: row.subscription_cancel_at_period_end || false,
    trialStart: row.trial_start ? new Date(row.trial_start) : undefined,
    trialEnd: row.trial_end ? new Date(row.trial_end) : undefined,
    trialTier: row.trial_tier || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapUsageCounterFromDb(row: any): UsageCounter {
  return {
    id: row.id,
    companyId: row.company_id,
    counterType: row.counter_type,
    periodStart: new Date(row.period_start),
    periodEnd: new Date(row.period_end),
    count: row.count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
