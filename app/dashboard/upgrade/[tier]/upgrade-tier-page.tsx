"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, Zap, Loader2, AlertCircle, Calendar, Clock, CreditCard, Mail, X } from "lucide-react";
import { format } from "date-fns";
import { TIER_CONFIG } from "@/lib/types";
import type { SubscriptionTier, Company } from "@/lib/types";

interface UpgradeTierPageProps {
  tier: SubscriptionTier;
  company: Company;
  customerId: string | null | undefined;
  trialEnd: Date | null | undefined;
}

export default function UpgradeTierPage({
  tier,
  company,
  customerId,
  trialEnd,
}: UpgradeTierPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showInfoDialog, setShowInfoDialog] = useState(true);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startNow, setStartNow] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean; message: string } | null>(null);

  const tierConfig = TIER_CONFIG[tier];
  const tierNames: Record<SubscriptionTier, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    premium: "Premium",
  };

  const tierName = tierNames[tier];
  const trialEndDate = trialEnd ? new Date(trialEnd) : null;

  const getTierFeatures = (tier: SubscriptionTier): string[] => {
    const features: Record<SubscriptionTier, string[]> = {
      free: ["3 Contracts only", "No templates", "Basic features"],
      starter: [
        "2 Contract Templates",
        "20 Contracts per month",
        "AI Contract Generation",
        "Click to Sign",
        "Email Delivery",
        "Basic Support",
      ],
      pro: [
        "Unlimited Templates",
        "Unlimited Contracts",
        "AI Contract Generation",
        "Click to Sign",
        "Email Delivery",
        "SMS Reminders",
        "File Attachments",
        "Custom Branding",
        "Download All Contracts",
        "Priority Support",
      ],
      premium: [
        "Everything in Pro, plus:",
        "Dropbox Sign Integration",
        "DocuSign Integration",
        "Multi-user Team Roles",
        "Stripe Connect Payouts",
        "Dedicated Support",
        "Custom Integrations",
      ],
    };
    return features[tier] || [];
  };

  const handleContinue = () => {
    setShowInfoDialog(false);
    setShowConfirmationDialog(true);
  };

  const handleConfirmUpgrade = async () => {
    setIsLoading(true);
    setShowConfirmationDialog(false);

    try {
      // Check if user has an existing subscription - if so, use upgrade endpoint
      // Otherwise use create-checkout for new subscriptions
      const hasExistingSubscription = !!company.subscriptionStripeSubscriptionId;
      const endpoint = hasExistingSubscription 
        ? "/api/subscriptions/upgrade"
        : "/api/subscriptions/create-checkout";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          startNow: startNow,
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Authentication required",
          description: "Please log in to upgrade your plan.",
          variant: "destructive",
        });
        router.push("/login");
        setIsLoading(false);
        return;
      }

      const responseText = await response.text();
      let data: any = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          throw new Error("Invalid response from server. Please try again.");
        }
      }

      if (!response.ok) {
        const errorMessage = data.message || `Failed to create checkout session (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      // Handle upgrade success (when using upgrade endpoint)
      if (hasExistingSubscription && data.success) {
        setUpgradeResult({
          success: true,
          message: data.message || `Successfully upgraded to ${tierName}! Your subscription is now active.`,
        });
        setShowResultDialog(true);
        return;
      }

      // Handle direct subscription creation (when payment method exists)
      if (data.direct && data.success) {
        setUpgradeResult({
          success: true,
          message: `Successfully upgraded to ${tierName}! Your subscription is now active.`,
        });
        setShowResultDialog(true);
        return;
      }

      const { url } = data;
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error: any) {
      console.error("Error upgrading subscription:", error);
      setUpgradeResult({
        success: false,
        message: error.message || "Failed to upgrade subscription. Please try again.",
      });
      setShowResultDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClose = () => {
    setShowResultDialog(false);
    if (upgradeResult?.success) {
      router.push("/dashboard/settings?tab=subscription");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 text-sm font-semibold">
              Upgrade Available
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Upgrade to {tierName}
          </h1>
          <p className="text-slate-300 text-xl">
            Complete your subscription upgrade to unlock all {tierName} features
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-2 border-indigo-500/50 shadow-2xl bg-gradient-to-br from-slate-800/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 border-b-2 border-indigo-500/50 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  {tierName} Plan
                </CardTitle>
                <CardDescription className="text-slate-200 text-lg">
                  <span className="text-2xl font-bold text-indigo-400">${tierConfig.price}</span>
                  <span className="text-slate-400">/month</span>
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 text-sm font-semibold shadow-lg">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Now
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Trial Info */}
              {trialEndDate && (
                <div className="p-5 bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-2 border-amber-500/50 rounded-xl backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-amber-300 mb-2">
                        Your free trial ends on {format(trialEndDate, "MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-amber-200">
                        Choose when to start your paid subscription below. You can start immediately or wait until your trial ends.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  What&apos;s Included:
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {getTierFeatures(tier).map((feature, index) => {
                    const isUpgradeHeader = feature.startsWith("Everything in");
                    return (
                      <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                        isUpgradeHeader 
                          ? "bg-indigo-900/20 border border-indigo-500/30" 
                          : "bg-slate-700/30 border border-slate-600/50"
                      }`}>
                        {!isUpgradeHeader ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                            </div>
                            <span className="text-sm text-slate-200 pt-0.5">{feature}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span className="text-indigo-300 font-semibold italic text-sm pt-0.5">{feature}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start Options */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  When to Start:
                </h3>
                
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    !startNow
                      ? "border-2 border-indigo-500 bg-gradient-to-br from-indigo-900/30 to-indigo-800/20 shadow-lg shadow-indigo-500/20"
                      : "border border-slate-700 bg-slate-700/30 hover:border-slate-600"
                  }`}
                  onClick={() => setStartNow(false)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !startNow ? "bg-indigo-500/20" : "bg-slate-600/50"
                      }`}>
                        <Calendar className={`h-5 w-5 ${!startNow ? "text-indigo-400" : "text-slate-400"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white mb-2 text-lg">
                          Start at End of Trial
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          Your subscription will begin automatically when your trial ends on{" "}
                          <strong className="text-indigo-300">
                            {trialEndDate ? format(trialEndDate, "MMMM d, yyyy") : "trial end"}
                          </strong>.
                          You&apos;ll continue to enjoy your trial benefits until then.
                        </p>
                      </div>
                      {!startNow && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    startNow
                      ? "border-2 border-purple-500 bg-gradient-to-br from-purple-900/30 to-pink-900/20 shadow-lg shadow-purple-500/20"
                      : "border border-slate-700 bg-slate-700/30 hover:border-slate-600"
                  }`}
                  onClick={() => setStartNow(true)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        startNow ? "bg-purple-500/20" : "bg-slate-600/50"
                      }`}>
                        <Clock className={`h-5 w-5 ${startNow ? "text-purple-400" : "text-slate-400"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white mb-2 text-lg">
                          Start Now (End Trial Immediately)
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          Your subscription will start immediately, and your trial will end.
                          You will be charged <strong className="text-purple-300">${tierConfig.price}/month</strong> starting today.
                        </p>
                      </div>
                      {startNow && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Continue Button */}
              <div className="pt-6 border-t border-slate-700">
                <Button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold py-6 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Continue to Confirm
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-2 border-indigo-500/30 text-white max-w-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-indigo-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-white">
                  Upgrade to {tierName}
                </DialogTitle>
                <DialogDescription className="text-slate-300 mt-1 text-base">
                  Complete your subscription upgrade to unlock all {tierName} features
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {/* What happens next */}
            <div className="p-5 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-2 border-indigo-500/50 rounded-xl backdrop-blur-sm">
              <p className="text-base font-bold text-indigo-300 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                What happens next:
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="pt-0.5">Choose when to start your subscription (now or at trial end)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="pt-0.5">Confirm your payment method</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="pt-0.5">Get instant access to all {tierName} features</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="pt-0.5">Receive email confirmation with subscription details</span>
                </li>
              </ul>
            </div>

            {/* Price and Trial Info */}
            <div className="p-5 bg-slate-700/50 border-2 border-slate-600 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">Price:</span>
                <span className="text-2xl font-bold text-white">${tierConfig.price}<span className="text-base text-slate-400">/month</span></span>
              </div>
              {trialEndDate && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-600">
                  <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    Trial ends:
                  </span>
                  <span className="text-base font-semibold text-amber-300">{format(trialEndDate, "MMMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/settings?tab=subscription")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg font-semibold flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className={`bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-2 text-white max-w-lg shadow-2xl ${
          startNow ? "border-red-500/50" : "border-indigo-500/50"
        }`}>
          <DialogHeader className="pb-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                startNow ? "bg-red-500/20" : "bg-indigo-500/20"
              }`}>
                {startNow ? (
                  <AlertCircle className="h-6 w-6 text-red-400" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-indigo-400" />
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Confirm Upgrade to {tierName}
                </DialogTitle>
                <DialogDescription className="text-slate-300 mt-1">
                  Please review your upgrade details
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Plan and Price */}
            <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-300">Plan:</span>
                <span className="text-lg font-bold text-white">{tierName}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                <span className="text-sm font-semibold text-slate-300">Price:</span>
                <span className="text-xl font-bold text-indigo-400">${tierConfig.price}<span className="text-sm text-slate-400">/month</span></span>
              </div>
            </div>

            {/* Start Now Warning */}
            {startNow && trialEndDate && (
              <div className="p-4 bg-red-900/30 border-2 border-red-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-300 mb-1">
                      ⚠️ Your trial will end immediately
                    </p>
                    <p className="text-sm text-red-200">
                      Your subscription will start now and you will be charged <strong className="text-white">${tierConfig.price}</strong> today. Your current trial benefits will end immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Start at Trial End */}
            {!startNow && trialEndDate && (
              <div className="p-4 bg-amber-900/20 border-2 border-amber-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-300 mb-1">
                      Subscription starts at trial end
                    </p>
                    <p className="text-sm text-amber-200">
                      Your subscription will begin automatically on <strong className="text-white">{format(trialEndDate, "MMMM d, yyyy")}</strong>. You&apos;ll continue to enjoy your trial benefits until then.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={() => setShowConfirmationDialog(false)}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={isLoading}
              className={`flex-1 shadow-lg font-semibold ${
                startNow
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {startNow ? "Confirm & Start Now" : "Confirm & Upgrade"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={handleResultClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              {upgradeResult?.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Upgrade Successful!
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-red-400" />
                  Upgrade Failed
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400 pt-2">
              {upgradeResult?.success
                ? "Your subscription has been upgraded successfully."
                : "There was an error processing your upgrade."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div
              className={`p-4 rounded-lg ${
                upgradeResult?.success
                  ? "bg-green-900/20 border border-green-700/50"
                  : "bg-red-900/20 border border-red-700/50"
              }`}
            >
              <p className="text-sm text-slate-300">{upgradeResult?.message}</p>
              {upgradeResult?.success && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-300">
                  <Mail className="h-4 w-4" />
                  <span>Confirmation email has been sent to your email address.</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleResultClose}
              className={`w-full ${
                upgradeResult?.success
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-slate-600 hover:bg-slate-700 text-white"
              }`}
            >
              {upgradeResult?.success ? "Go to Dashboard" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
