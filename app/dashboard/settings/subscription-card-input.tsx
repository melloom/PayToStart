"use client";

import { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, CheckCircle2, AlertCircle, Trash2, Edit, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isStripeTestMode } from "@/lib/stripe";

// Initialize Stripe
const getStripePromise = () => {
  const isTest = isStripeTestMode();
  const publishableKey = isTest
    ? process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Stripe publishable key not found");
  }

  return loadStripe(publishableKey);
};

interface SubscriptionCardInputProps {
  customerId: string | null | undefined;
  hasActiveSubscription: boolean;
  onCardAdded?: () => void;
}

function CardInputForm({ customerId, hasActiveSubscription, onCardAdded }: SubscriptionCardInputProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  // Load current payment method
  useEffect(() => {
    const loadCurrentCard = async () => {
      if (!customerId) {
        setIsLoadingCard(false);
        return;
      }

      try {
        const response = await fetch("/api/subscriptions/payment-methods");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.paymentMethods && data.paymentMethods.length > 0) {
          // Find the default payment method
          const defaultCard = data.paymentMethods.find((pm: any) => pm.isDefault) || data.paymentMethods[0];
          setCurrentCard(defaultCard);
        }
      } catch (error) {
        // Only log if it's not a network error (which might be expected in some cases)
        if (error instanceof TypeError && error.message.includes("fetch")) {
          // Network error - might be offline or server issue
          console.warn("Network error loading current card - this may be expected if offline");
        } else {
          console.error("Error loading current card:", error);
        }
      } finally {
        setIsLoadingCard(false);
      }
    };

    loadCurrentCard();
  }, [customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe is not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Error",
        description: "Card element not found.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create payment method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (createError) {
        throw new Error(createError.message || "Failed to create payment method");
      }

      if (!paymentMethod) {
        throw new Error("Failed to create payment method");
      }

      console.log("Payment method created:", paymentMethod.id);

      // Attach payment method to customer and set as default
      const response = await fetch("/api/subscriptions/setup-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          setAsDefault: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.message || data.error || "Failed to save payment method");
      }

      console.log("Payment method saved successfully:", data);

      toast({
        title: "Card Added Successfully",
        description: "Your card has been saved and set as the default payment method.",
      });

      // Reload current card
      const cardResponse = await fetch("/api/subscriptions/payment-methods");
      const cardData = await cardResponse.json();
      if (cardResponse.ok && cardData.paymentMethods && cardData.paymentMethods.length > 0) {
        const defaultCard = cardData.paymentMethods.find((pm: any) => pm.isDefault) || cardData.paymentMethods[0];
        setCurrentCard(defaultCard);
      }

      // Clear the card element
      cardElement.clear();

      // Hide update form after successful save
      setShowUpdateForm(false);

      // Callback
      if (onCardAdded) {
        onCardAdded();
      }
    } catch (error: any) {
      console.error("Error adding card:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStripePortal = async () => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "No customer ID found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsPortalLoading(true);
    try {
      const response = await fetch("/api/subscriptions/billing-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No billing portal URL received");
      }
    } catch (error: any) {
      console.error("Error opening billing portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#ffffff",
        "::placeholder": {
          color: "#9ca3af",
        },
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "transparent",
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
      },
      complete: {
        color: "#10b981",
      },
    },
    hidePostalCode: false,
    disabled: false,
  };

  if (isLoadingCard) {
    return (
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-400" />
          Payment Method
        </CardTitle>
        <CardDescription className="text-slate-400 mt-1">
          {hasActiveSubscription
            ? "Update your payment method for subscription renewals"
            : "Add a payment method to subscribe to a plan"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {currentCard ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border-2 border-green-500/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">
                    **** **** **** {currentCard.card?.last4 || "****"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {currentCard.card?.brand ? `${currentCard.card.brand.toUpperCase()} • ` : ""}
                    Expires {currentCard.card?.expMonth || "**"}/{currentCard.card?.expYear || "**"}
                  </p>
                </div>
                <Badge className="bg-green-900/50 text-green-300 border-green-700 whitespace-nowrap flex-shrink-0">
                  Active
                </Badge>
              </div>
              <div className="space-y-2 pt-3 border-t border-green-700/30">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Update
                  </Button>
                  {!hasActiveSubscription && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isLoading}
                      className="px-4"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
                {customerId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenStripePortal}
                    disabled={isPortalLoading}
                    className="w-full border-indigo-600 text-indigo-300 hover:bg-indigo-900/50 hover:border-indigo-500 hover:text-indigo-200"
                  >
                    {isPortalLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Manage in Stripe Portal
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {hasActiveSubscription && (
              <div className="p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-300">
                    This card will be charged automatically for your subscription renewals.
                  </p>
                </div>
              </div>
            )}

            {showUpdateForm && (
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-white mb-3">
                  {hasActiveSubscription ? "Replace Payment Method" : "Update Payment Method"}
                </h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg focus-within:border-indigo-500 transition-colors">
                    <CardElement 
                      options={cardElementOptions}
                      onChange={(e) => {
                        // Only show errors when user has interacted and there's an actual error
                        if (e.error && e.complete === false) {
                          // Error will be shown by Stripe Elements automatically
                        }
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    Use test card: <span className="font-mono text-slate-300">4242 4242 4242 4242</span> (any future date, any CVC)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading || !stripe}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          {hasActiveSubscription ? "Replace Card" : "Update Card"}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowUpdateForm(false);
                        // Clear card element
                        const cardElement = elements?.getElement(CardElement);
                        if (cardElement) {
                          cardElement.clear();
                        }
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                  {hasActiveSubscription && (
                    <p className="text-xs text-slate-500 text-center">
                      You cannot delete your payment method while you have an active subscription. Replace it instead or cancel your subscription first.
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Delete Payment Method?</DialogTitle>
                  </div>
                  <DialogDescription className="text-slate-400 pt-2">
                    Are you sure you want to delete this payment method? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <CreditCard className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">
                          **** **** **** {currentCard?.card?.last4 || "****"}
                        </p>
                        <p className="text-sm text-slate-400 truncate">
                          {currentCard?.card?.brand ? `${currentCard.card.brand.toUpperCase()} • ` : ""}
                          Expires {currentCard?.card?.expMonth || "**"}/{currentCard?.card?.expYear || "**"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    disabled={isLoading}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!currentCard?.id) return;

                      setIsLoading(true);
                      try {
                        const response = await fetch(`/api/subscriptions/payment-methods/${currentCard.id}`, {
                          method: "DELETE",
                        });

                        const data = await response.json();

                        if (!response.ok) {
                          throw new Error(data.message || "Failed to delete payment method");
                        }

                        toast({
                          title: "Card Deleted",
                          description: "Your payment method has been removed.",
                        });

                        // Reload current card (should be null now)
                        setCurrentCard(null);
                        setShowDeleteDialog(false);
                      } catch (error: any) {
                        console.error("Error deleting card:", error);
                        toast({
                          title: "Error",
                          description: error.message || "Failed to delete card. Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Yes, Delete Card
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {hasActiveSubscription && (
              <div className="p-4 bg-amber-900/20 border-2 border-amber-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300 mb-1">
                      Payment Method Required
                    </p>
                    <p className="text-sm text-amber-200">
                      You need to add a payment method to keep your subscription active. Your subscription may be cancelled if no payment method is added.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg focus-within:border-indigo-500 transition-colors">
                <CardElement 
                  options={cardElementOptions}
                  onChange={(e) => {
                    // Only show errors when user has interacted and there's an actual error
                    if (e.error && e.complete === false) {
                      // Error will be shown by Stripe Elements automatically
                    }
                  }}
                />
              </div>
              <div className="text-xs text-slate-400 mb-2">
                Use test card: <span className="font-mono text-slate-300">4242 4242 4242 4242</span> (any future date, any CVC)
              </div>
              <Button
                type="submit"
                disabled={isLoading || !stripe}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Card...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SubscriptionCardInput({ customerId, hasActiveSubscription, onCardAdded }: SubscriptionCardInputProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    try {
      setStripePromise(getStripePromise());
    } catch (error) {
      console.error("Error loading Stripe:", error);
    }
  }, []);

  if (!stripePromise) {
    return (
      <Card className="border-2 border-slate-700 shadow-xl bg-slate-800/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-400">Loading payment form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: "night" as const,
      variables: {
        colorPrimary: "#6366f1",
        colorBackground: "#1e293b",
        colorText: "#ffffff",
        colorDanger: "#ef4444",
        colorSuccess: "#10b981",
        fontFamily: "system-ui, sans-serif",
        spacingUnit: "4px",
        borderRadius: "8px",
      },
      rules: {
        ".Input": {
          border: "1px solid #475569",
          backgroundColor: "transparent",
        },
        ".Input:focus": {
          border: "1px solid #6366f1",
          boxShadow: "0 0 0 1px #6366f1",
        },
        ".Input--invalid": {
          border: "1px solid #ef4444",
        },
        ".Input--complete": {
          border: "1px solid #10b981",
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CardInputForm
        customerId={customerId}
        hasActiveSubscription={hasActiveSubscription}
        onCardAdded={onCardAdded}
      />
    </Elements>
  );
}
