import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ProgressBar } from "@/components/progress-bar";
import { ScrollToTop } from "@/components/scroll-to-top";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Pay2Start - Professional Contract Management",
    template: "%s | Pay2Start",
  },
  description: "Streamline your contract workflow. Send, sign, and manage contracts effortlessly. Get paid faster with integrated payment processing.",
  keywords: ["contract management", "digital signatures", "contract signing", "payment processing", "contractor tools", "business contracts"],
  authors: [{ name: "Pay2Start" }],
  creator: "Pay2Start",
  publisher: "Pay2Start",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Pay2Start",
    title: "Pay2Start - Professional Contract Management",
    description: "Streamline your contract workflow. Send, sign, and manage contracts effortlessly. Get paid faster with integrated payment processing.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Pay2Start Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pay2Start - Professional Contract Management",
    description: "Streamline your contract workflow. Send, sign, and manage contracts effortlessly.",
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ScrollToTop />
        <ProgressBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

