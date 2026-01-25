"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Layout, Shield } from "lucide-react";

interface UsageTabProps {
  tierLimits: any;
  contractsUsage: number;
  templatesUsage: number;
  contractsPercent: number;
  templatesPercent: number;
  canCreateContract: { allowed: boolean; currentCount: number; limit: number | null };
  canCreateTemplate: { allowed: boolean; currentCount: number; limit: number | null };
  effectiveTier: string;
}

export default function UsageTab({
  tierLimits,
  contractsUsage,
  templatesUsage,
  contractsPercent,
  templatesPercent,
  canCreateContract,
  canCreateTemplate,
  effectiveTier,
}: UsageTabProps) {
  return (
    <div className="space-y-6">
      {/* Usage Limits */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-400" />
            Usage & Limits
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Track your usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Contracts Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                <span className="font-semibold text-white">Contracts</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">
                  {contractsUsage}
                </span>
                <span className="text-slate-400 ml-1">
                  / {tierLimits.contracts === null ? "∞" : tierLimits.contracts}
                  {effectiveTier === "free" ? " (lifetime)" : " (this month)"}
                </span>
              </div>
            </div>
            {tierLimits.contracts !== null && (
              <>
                <Progress value={contractsPercent} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className={`${canCreateContract.allowed ? "text-green-400" : "text-red-400"}`}>
                    {canCreateContract.allowed ? "✓ Can create more" : "✗ Limit reached"}
                  </span>
                  <span className="text-slate-400">
                    {Math.round(contractsPercent)}% used
                  </span>
                </div>
              </>
            )}
            {tierLimits.contracts === null && (
              <p className="text-sm text-green-400">Unlimited contracts</p>
            )}
          </div>

          {/* Templates Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-slate-400" />
                <span className="font-semibold text-white">Templates</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">
                  {templatesUsage}
                </span>
                <span className="text-slate-400 ml-1">
                  / {tierLimits.templates === null ? "∞" : tierLimits.templates}
                </span>
              </div>
            </div>
            {tierLimits.templates !== null && (
              <>
                <Progress value={templatesPercent} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className={`${canCreateTemplate.allowed ? "text-green-400" : "text-red-400"}`}>
                    {canCreateTemplate.allowed ? "✓ Can create more" : "✗ Limit reached"}
                  </span>
                  <span className="text-slate-400">
                    {Math.round(templatesPercent)}% used
                  </span>
                </div>
              </>
            )}
            {tierLimits.templates === null && (
              <p className="text-sm text-green-400">Unlimited templates</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            Plan Features
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Object.entries(tierLimits.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm text-slate-300 capitalize">
                  {feature.replace(/([A-Z])/g, " $1").trim()}
                </span>
                {enabled ? (
                  <Badge className="bg-green-900/50 text-green-300 border-green-700 text-xs">
                    ✓ Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-500 border-slate-600 text-xs">
                    ✗ Disabled
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



