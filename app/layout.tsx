import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Header } from "@/components/Header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CoinPulse | Live Cryptocurrency Prices & Market Data",
    template: "%s | CoinPulse",
  },
  description:
    "Track live cryptocurrency prices, market trends, and trading data. Explore top coins, compare performance, and convert digital assets with CoinPulse.",
  applicationName: "CoinPulse",
  keywords: [
    "cryptocurrency prices",
    "crypto market data",
    "Bitcoin price",
    "Ethereum price",
    "crypto charts",
    "cryptocurrency converter",
  ],
  category: "finance",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "CoinPulse",
    title: "CoinPulse | Live Cryptocurrency Prices & Market Data",
    description:
      "Track live cryptocurrency prices, market trends, and trading data with CoinPulse.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "CoinPulse | Live Cryptocurrency Prices & Market Data",
    description:
      "Track live cryptocurrency prices, market trends, and trading data with CoinPulse.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
