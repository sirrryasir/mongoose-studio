import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";

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
    default: "Mongoose Studio",
    template: "%s | Mongoose Studio",
  },
  description: "A modern, zero-config GUI for your Mongoose models. Inspect schemas, view data, and debug queries instantly without leaving your terminal.",
  keywords: ["mongoose", "mongodb", "gui", "admin", "dashboard", "developer tools", "cli", "typescript"],
  authors: [{ name: "Yasir", url: "https://yaasir.dev" }],
  creator: "Yasir",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mongoose-studio.yaasir.dev",
    siteName: "Mongoose Studio",
    title: "Mongoose Studio - Your Mongoose Data, Visualized",
    description: "Inspect schemas, view data, and debug queries instantly without leaving your terminal. Zero config required.",
    images: [
      {
        url: "/logo.png",
        width: 819,
        height: 819,
        alt: "Mongoose Studio Logo",
      },
      {
        url: "/hero-screenshot.png",
        width: 1200,
        height: 630,
        alt: "Mongoose Studio Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mongoose Studio",
    description: "A modern, zero-config GUI for your Mongoose models.",
    images: ["/logo.png"],
    creator: "@sirrryasir",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground selection:bg-emerald-500/30 selection:text-emerald-400`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
