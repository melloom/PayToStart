import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the perfect plan for your business. All plans include a 7-day free trial. Cancel anytime.",
  openGraph: {
    title: "Pricing - Pay2Start",
    description: "Choose the perfect plan for your business. All plans include a 7-day free trial.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

