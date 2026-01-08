import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Authentication",
    template: "%s | Pay2Start",
  },
  description: "Sign in or sign up to access your Pay2Start account and start managing your contracts",
  robots: {
    index: false,
    follow: false,
    nofollow: true,
    noindex: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

