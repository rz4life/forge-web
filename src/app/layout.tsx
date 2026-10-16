import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { INTEGRATIONS_GA } from "@/lib/constants";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.forge.equipment'),
  title: 'Forge | Walk the Job. Leave with the Estimate.',
  description: 'Forge turns a recorded walkthrough into a structured, trade-by-trade scope and a priced estimate in minutes. Built for general contractors. 14-day free trial.',
  // The last two join on the day integrations open (INTEGRATIONS_GA, F-515).
  keywords: [
    'general contractor', 'AI estimating', 'construction estimates', 'job walk', 'scope of work', 'Buildertrend', 'JobTread',
    ...(INTEGRATIONS_GA ? ['MCP server', 'construction API'] : []),
  ],
  openGraph: {
    title: 'Forge | AI Estimating for General Contractors',
    description: 'Walk the job. Leave with the estimate. A recorded walkthrough becomes a trade-by-trade scope and priced estimate in minutes.',
    type: 'website',
    url: 'https://www.forge.equipment',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forge | Walk the Job. Leave with the Estimate.',
    description: 'AI estimating for general contractors. 14-day free trial.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
