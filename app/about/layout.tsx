import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Pay2Start",
  description: "Meet Melvin Peralta, the creator behind Pay2Start. Learn about the story, mission, and values that drive our platform.",
  openGraph: {
    title: "About Pay2Start | Melvin Peralta",
    description: "The story behind Pay2Start and the mission to help contractors streamline their workflow.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

