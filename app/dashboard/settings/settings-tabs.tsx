"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, CreditCard, BarChart3 } from "lucide-react";
import AccountSettings from "./account-settings";
import SubscriptionTab from "./subscription-tab";
import UsageTab from "./usage-tab";

import type { Company, SubscriptionTier } from "@/lib/types";

interface SettingsTabsProps {
  initialName: string;
  initialEmail: string;
  customerId: string | null | undefined;
  effectiveTier: string;
  tierConfig: any;
  tierLimits: any;
  contractsUsage: number;
  templatesUsage: number;
  contractsPercent: number;
  templatesPercent: number;
  canCreateContract: { allowed: boolean; currentCount: number; limit: number | null };
  canCreateTemplate: { allowed: boolean; currentCount: number; limit: number | null };
  company: Company;
  isActive: boolean;
  currentTier: SubscriptionTier;
}

export default function SettingsTabs({
  initialName,
  initialEmail,
  customerId,
  effectiveTier,
  tierConfig,
  tierLimits,
  contractsUsage,
  templatesUsage,
  contractsPercent,
  templatesPercent,
  canCreateContract,
  canCreateTemplate,
  company,
  isActive,
  currentTier,
}: SettingsTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "account");

  // Update active tab when query param changes
  useEffect(() => {
    if (tabParam && ["account", "subscription", "usage"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="account" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Account
        </TabsTrigger>
        <TabsTrigger value="subscription" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Subscription
        </TabsTrigger>
        <TabsTrigger value="usage" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Usage
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <AccountSettings
          initialName={initialName}
          initialEmail={initialEmail}
          company={company}
          currentTier={currentTier}
          isActive={isActive}
        />
      </TabsContent>

      <TabsContent value="subscription">
        <SubscriptionTab
          customerId={customerId}
          effectiveTier={effectiveTier}
          tierConfig={tierConfig}
          company={company}
          isActive={isActive}
          currentTier={currentTier}
          templatesUsed={templatesUsage}
          contractsUsed={contractsUsage}
        />
      </TabsContent>

      <TabsContent value="usage">
        <UsageTab
          tierLimits={tierLimits}
          contractsUsage={contractsUsage}
          templatesUsage={templatesUsage}
          contractsPercent={contractsPercent}
          templatesPercent={templatesPercent}
          canCreateContract={canCreateContract}
          canCreateTemplate={canCreateTemplate}
          effectiveTier={effectiveTier}
        />
      </TabsContent>
    </Tabs>
  );
}

