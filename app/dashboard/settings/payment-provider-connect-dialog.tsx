"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, Mail, Phone, Building2, Hash, DollarSign, Wallet, Banknote } from "lucide-react";
import type { PaymentProvider } from "@/lib/types";

interface PaymentProviderConnectDialogProps {
  provider: PaymentProvider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export default function PaymentProviderConnectDialog({
  provider,
  open,
  onOpenChange,
  onConnected,
}: PaymentProviderConnectDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/payment-providers/${provider.id}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionData: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to connect payment provider");
      }

      toast({
        title: "Provider Connected",
        description: `${provider.providerName} has been successfully connected.`,
      });

      onConnected();
      onOpenChange(false);
      setFormData({});
    } catch (error: any) {
      console.error("Error connecting provider:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect payment provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderTheme = () => {
    switch (provider.providerType) {
      case "stripe":
        return {
          gradient: "from-purple-600 via-indigo-600 to-purple-700",
          border: "border-purple-500/50",
          bg: "bg-purple-900/20",
          icon: "💳",
          name: "Stripe",
        };
      case "venmo":
        return {
          gradient: "from-green-500 via-emerald-500 to-teal-500",
          border: "border-green-500/50",
          bg: "bg-green-900/20",
          icon: "💚",
          name: "Venmo",
        };
      case "cashapp":
        return {
          gradient: "from-green-400 via-lime-400 to-green-500",
          border: "border-green-400/50",
          bg: "bg-green-900/20",
          icon: "💵",
          name: "Cash App",
        };
      case "paypal":
        return {
          gradient: "from-blue-500 via-cyan-500 to-blue-600",
          border: "border-blue-500/50",
          bg: "bg-blue-900/20",
          icon: "🔵",
          name: "PayPal",
        };
      case "zelle":
        return {
          gradient: "from-blue-600 via-indigo-600 to-blue-700",
          border: "border-blue-500/50",
          bg: "bg-blue-900/20",
          icon: "🏦",
          name: "Zelle",
        };
      case "bank_transfer":
        return {
          gradient: "from-slate-600 via-gray-600 to-slate-700",
          border: "border-slate-500/50",
          bg: "bg-slate-900/20",
          icon: "🏛️",
          name: "Bank Transfer",
        };
      default:
        return {
          gradient: "from-slate-600 to-gray-600",
          border: "border-slate-500/50",
          bg: "bg-slate-900/20",
          icon: "💳",
          name: "Payment Provider",
        };
    }
  };

  const theme = getProviderTheme();

  const renderFormFields = () => {
    switch (provider.providerType) {
      case "stripe":
        return (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{theme.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">Connect Stripe</h3>
                  <p className="text-xs text-slate-400">Secure payment processing</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">
                Stripe will be connected automatically. If you have an existing Stripe customer ID, you can enter it below.
              </p>
              <div>
                <Label htmlFor="customerId" className="text-slate-300">Stripe Customer ID (Optional)</Label>
                <Input
                  id="customerId"
                  value={formData.customerId || ""}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  placeholder="cus_..."
                  className="bg-slate-700/50 border-slate-600 text-white mt-1"
                />
              </div>
            </div>
          </div>
        );

      case "venmo":
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-lg border-2 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{theme.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">Connect Venmo</h3>
                  <p className="text-xs text-slate-400">Send and receive money instantly</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountId" className="text-slate-300 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Venmo Username or Account ID *
                  </Label>
                  <Input
                    id="accountId"
                    value={formData.accountId || ""}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    placeholder="@username"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="accountName" className="text-slate-300">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName || ""}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Your name on Venmo"
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-green-400">ℹ️</span>
              Note: In production, this would use Venmo OAuth for secure authentication.
            </p>
          </div>
        );

      case "cashapp":
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-lg border-2 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{theme.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">Connect Cash App</h3>
                  <p className="text-xs text-slate-400">Fast, simple payments</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cashtag" className="text-slate-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    Cash App Cashtag *
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-l-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg">
                      $
                    </div>
                    <Input
                      id="cashtag"
                      value={formData.cashtag || ""}
                      onChange={(e) => setFormData({ ...formData, cashtag: e.target.value.replace("$", "") })}
                      placeholder="yourcashtag"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Your unique Cash App identifier</p>
                </div>
                <div>
                  <Label htmlFor="accountName" className="text-slate-300">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName || ""}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Your name on Cash App"
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "paypal":
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-lg border-2 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{theme.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">Connect PayPal</h3>
                  <p className="text-xs text-slate-400">Global payment platform</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountEmail" className="text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    PayPal Email Address *
                  </Label>
                  <Input
                    id="accountEmail"
                    type="email"
                    value={formData.accountEmail || ""}
                    onChange={(e) => setFormData({ ...formData, accountEmail: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="accountId" className="text-slate-300">PayPal Account ID</Label>
                  <Input
                    id="accountId"
                    value={formData.accountId || ""}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    placeholder="Account ID (optional)"
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-blue-400">ℹ️</span>
              Note: In production, this would use PayPal OAuth for secure authentication.
            </p>
          </div>
        );

      case "zelle":
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-lg border-2 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{theme.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">Connect Zelle</h3>
                  <p className="text-xs text-slate-400">Bank-to-bank transfers</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-slate-300 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-400" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName" className="text-slate-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankName || ""}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Your bank name"
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "bank_transfer":
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-lg border-2 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{theme.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">Connect Bank Account</h3>
                  <p className="text-xs text-slate-400">Direct bank transfers</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountHolderName" className="text-slate-300 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-slate-400" />
                    Account Holder Name *
                  </Label>
                  <Input
                    id="accountHolderName"
                    value={formData.accountHolderName || ""}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName" className="text-slate-300 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    Bank Name
                  </Label>
                  <Input
                    id="bankName"
                    value={formData.bankName || ""}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Bank of America"
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="accountType" className="text-slate-300">Account Type *</Label>
                  <select
                    id="accountType"
                    value={formData.accountType || "checking"}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full mt-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                    required
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="accountNumber" className="text-slate-300 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-400" />
                    Account Number *
                  </Label>
                  <Input
                    id="accountNumber"
                    type="password"
                    value={formData.accountNumber || ""}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="123456789"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="routingNumber" className="text-slate-300 flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-slate-400" />
                    Routing Number *
                  </Label>
                  <Input
                    id="routingNumber"
                    value={formData.routingNumber || ""}
                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                    placeholder="123456789"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "other":
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-lg border-2 ${theme.border} ${theme.bg} backdrop-blur-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{theme.icon}</div>
                <div>
                  <h3 className="font-semibold text-white">Connect {provider.providerName}</h3>
                  <p className="text-xs text-slate-400">Custom payment provider</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="accountId" className="text-slate-300 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-400" />
                    Account ID *
                  </Label>
                  <Input
                    id="accountId"
                    value={formData.accountId || ""}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    placeholder="Your account identifier"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="accountName" className="text-slate-300">Account Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName || ""}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Account name"
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-slate-400">Unknown provider type</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-slate-800 border-2 ${theme.border} text-white max-w-lg`}>
        <DialogHeader className={`pb-4 border-b ${theme.border}`}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{theme.icon}</div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                Connect {provider.providerName}
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">
                Enter your {provider.providerName} account details to receive payments
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {renderFormFields()}
          <DialogFooter className="pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFormData({});
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white shadow-lg font-semibold`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect {provider.providerName}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
