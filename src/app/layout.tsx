import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "ShopSphere - Discover Amazing Products",
  description:
    "Browse our curated collection of electronics, jewelry, clothing and more. Find the best deals with instant search and category filtering.",
  keywords: ["products", "shop", "ecommerce", "electronics", "clothing", "jewelry"],
  openGraph: {
    title: "ShopSphere - Discover Amazing Products",
    description: "Browse our curated collection of amazing products at unbeatable prices.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
