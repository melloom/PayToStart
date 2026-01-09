// Stripe server-side client
import Stripe from "stripe";

// Lazy initialization to avoid errors during build time
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  // Determine which mode to use (test or live)
  const stripeMode = process.env.STRIPE_MODE || "test"; // Default to test mode
  const isTestMode = stripeMode === "test";

  // Get the appropriate secret key based on mode
  const secretKey = isTestMode 
    ? process.env.STRIPE_TEST_SECRET_KEY 
    : process.env.STRIPE_LIVE_SECRET_KEY;

  if (!secretKey) {
    const keyName = isTestMode ? "STRIPE_TEST_SECRET_KEY" : "STRIPE_LIVE_SECRET_KEY";
    throw new Error(`${keyName} is not set in environment variables`);
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2023-10-16",
    typescript: true,
  });

  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripeInstance()[prop as keyof Stripe];
  },
});

// Export mode info for use in other files
export function getStripeMode(): string {
  return process.env.STRIPE_MODE || "test";
}

export function isStripeTestMode(): boolean {
  return getStripeMode() === "test";
}

export const STRIPE_MODE = getStripeMode();
export const IS_STRIPE_TEST_MODE = isStripeTestMode();

// Stripe client-side helper
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

let stripePromise: Promise<StripeJS | null>;

export function getStripe() {
  if (!stripePromise) {
    // Get the appropriate publishable key based on mode
    const isTest = isStripeTestMode();
    const publishableKey = isTest
      ? process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
      : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      const keyName = isTest 
        ? "NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY" 
        : "NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY";
      throw new Error(`${keyName} is not set in environment variables`);
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
