// Stripe server-side client
import Stripe from "stripe";

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

export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20",
  typescript: true,
});

// Export mode info for use in other files
export const STRIPE_MODE = stripeMode;
export const IS_STRIPE_TEST_MODE = isTestMode;

// Stripe client-side helper
import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

let stripePromise: Promise<StripeJS | null>;

export function getStripe() {
  if (!stripePromise) {
    // Get the appropriate publishable key based on mode
    const publishableKey = isTestMode
      ? process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
      : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      const keyName = isTestMode 
        ? "NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY" 
        : "NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY";
      throw new Error(`${keyName} is not set in environment variables`);
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
