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
  title: "ComfyWizardUI",
  description: "Browse-first UI MVP for Comfy workflows and dependencies.",
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
