import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { GoogleAnalytics } from "@/components/shared/google-analytics";
import { MicrosoftClarity } from "@/components/shared/microsoft-clarity";
import "./globals.css";

const fontSans = Space_Grotesk({
  variable: "--font-sans-app",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono-app",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ComfyWizard",
  description: "Browse-first UI MVP for Comfy workflows and dependencies.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <GoogleAnalytics />
        <MicrosoftClarity />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
