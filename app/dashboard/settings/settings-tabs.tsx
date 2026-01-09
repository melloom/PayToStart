"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, CreditCard, BarChart3 } from "lucide-react";
import AccountSettings from "./account-settings";
import SubscriptionTab from "./subscription-tab";
import UsageTab from "./usage-tab";

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
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState("account");

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
        <AccountSettings initialName={initialName} initialEmail={initialEmail} />
      </TabsContent>

      <TabsContent value="subscription">
        <SubscriptionTab customerId={customerId} effectiveTier={effectiveTier} tierConfig={tierConfig} />
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

