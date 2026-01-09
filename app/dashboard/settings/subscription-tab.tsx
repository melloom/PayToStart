"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import ManageSubscription from "../subscription/manage-subscription";

interface SubscriptionTabProps {
  customerId: string | null | undefined;
  effectiveTier: string;
  tierConfig: any;
}

export default function SubscriptionTab({ customerId, effectiveTier, tierConfig }: SubscriptionTabProps) {
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "free": return "bg-slate-700 text-slate-300";
      case "starter": return "bg-indigo-900/50 text-indigo-300 border-indigo-700";
      case "pro": return "bg-purple-900/50 text-purple-300 border-purple-700";
      case "premium": return "bg-amber-900/50 text-amber-300 border-amber-700";
      default: return "bg-slate-700 text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="h-6 w-6 text-indigo-400" />
                Current Plan
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Your active subscription tier
              </CardDescription>
            </div>
            <Badge className={getTierBadgeColor(effectiveTier)}>
              {tierConfig.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Plan Name</p>
              <p className="text-lg font-semibold text-white">{tierConfig.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Monthly Price</p>
              <p className="text-lg font-semibold text-white">
                ${tierConfig.price === 0 ? "Free" : `${tierConfig.price}/month`}
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                View All Plans
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Manage Subscription - Full Stripe Integration */}
      <ManageSubscription customerId={customerId} />
    </div>
  );
}

